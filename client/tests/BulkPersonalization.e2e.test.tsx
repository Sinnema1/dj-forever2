import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import BulkPersonalization from '../src/components/admin/BulkPersonalization';
import { ADMIN_BULK_UPDATE_PERSONALIZATION } from '../src/api/adminQueries';

/**
 * BulkPersonalization E2E Test Suite (Phase 3)
 *
 * Tests the complete bulk upload workflow:
 * - CSV template download
 * - CSV file upload and parsing
 * - Validation (email format, enums, character limits)
 * - Preview display
 * - Import execution with success/error handling
 * - GraphQL mutation integration
 */

describe('BulkPersonalization - Bulk Upload Workflow', () => {
  beforeEach(() => {
    // Reset any previous state
    vi.clearAllMocks();
  });

  describe('CSV Template Download', () => {
    it('should download CSV template when download button is clicked', () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement to track click
      const mockClick = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = mockClick;
        }
        return element;
      });

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const downloadButton = screen.getByText(/download csv template/i);
      fireEvent.click(downloadButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });

  describe('CSV File Upload and Parsing', () => {
    it('should parse valid CSV file and display preview', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const validCSV = `fullName,email,relationshipToBride,guestGroup,plusOneAllowed
John Doe,john@example.com,College Friend,friends,true
Jane Smith,jane@example.com,Sister,brides_family,false`;

      const file = new File([validCSV], 'guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      // Wait for preview to appear
      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container).toBeInTheDocument();
        expect(container?.textContent).toMatch(/Preview.*2.*records/i);
      });

      // Verify parsed data is displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should handle CSV with quoted fields containing commas', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const csvWithQuotes = `fullName,email,customWelcomeMessage
"John Doe",john@example.com,"Welcome, we're so excited to see you!"`;

      const file = new File([csvWithQuotes], 'guests.csv', {
        type: 'text/csv',
      });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*1.*record/i);
      });

      // customWelcomeMessage shows as 📝 emoji in preview table (actual text is in title attribute)
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should show error for empty CSV file', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const emptyCSV = '';
      const file = new File([emptyCSV], 'empty.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(
          screen.getByText(/csv file is empty or invalid/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('CSV Validation', () => {
    it('should validate required fields (fullName, email)', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const invalidCSV = `fullName,email,guestGroup
,john@example.com,friends
Jane Smith,,friends`;

      const file = new File([invalidCSV], 'invalid.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(
          screen.getByText(/missing required field fullName/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/missing required field email/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const invalidEmailCSV = `fullName,email
John Doe,invalid-email
Jane Smith,also-invalid@`;

      const file = new File([invalidEmailCSV], 'invalid-email.csv', {
        type: 'text/csv',
      });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/invalid email format/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should validate guestGroup enum values', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const invalidGuestGroupCSV = `fullName,email,guestGroup
John Doe,john@example.com,invalid_group`;

      const file = new File([invalidGuestGroupCSV], 'invalid-group.csv', {
        type: 'text/csv',
      });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/invalid guestGroup/i)).toBeInTheDocument();
        expect(screen.getByText(/must be one of/i)).toBeInTheDocument();
      });
    });

    it('should validate plusOneAllowed boolean values', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const invalidPlusOneCSV = `fullName,email,plusOneAllowed
John Doe,john@example.com,maybe`;

      const file = new File([invalidPlusOneCSV], 'invalid-plusone.csv', {
        type: 'text/csv',
      });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(
          screen.getByText(/plusOneAllowed must be 'true' or 'false'/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate character limits', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const longString = 'a'.repeat(600);
      const exceedsLimitCSV = `fullName,email,customWelcomeMessage
John Doe,john@example.com,${longString}`;

      const file = new File([exceedsLimitCSV], 'exceeds-limit.csv', {
        type: 'text/csv',
      });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(
          screen.getByText(/customWelcomeMessage exceeds 500 characters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Preview Display', () => {
    it('should display first 10 rows in preview table', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      // Create CSV with 15 rows
      let csv = 'fullName,email\n';
      for (let i = 1; i <= 15; i++) {
        csv += `Guest ${i},guest${i}@example.com\n`;
      }

      const file = new File([csv], 'many-guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*15.*records/i);
        expect(screen.getByText(/showing first 10/i)).toBeInTheDocument();
      });

      // Verify first 10 are displayed
      expect(screen.getByText('Guest 1')).toBeInTheDocument();
      expect(screen.getByText('Guest 10')).toBeInTheDocument();

      // Verify 11th is not displayed
      expect(screen.queryByText('Guest 11')).not.toBeInTheDocument();
    });

    it('should display all fields in preview table', async () => {
      const user = userEvent.setup();

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const fullCSV = `fullName,email,relationshipToBride,relationshipToGroom,guestGroup,plusOneAllowed,customWelcomeMessage,specialInstructions,dietaryRestrictions
John Doe,john@example.com,Friend,Coworker,friends,true,Welcome!,Hotel info,Vegetarian`;

      const file = new File([fullCSV], 'full.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check that all fields are displayed (note: some show as emojis)
      expect(screen.getByText('Friend')).toBeInTheDocument();
      expect(screen.getByText('Coworker')).toBeInTheDocument();
      expect(screen.getByText('friends')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument(); // plusOneAllowed=true
      expect(screen.getByText('📝')).toBeInTheDocument(); // customWelcomeMessage
      expect(screen.getByText('📋')).toBeInTheDocument(); // specialInstructions
      expect(screen.getByText('🍽️')).toBeInTheDocument(); // dietaryRestrictions
    });
  });

  describe('Import Execution', () => {
    it('should execute GraphQL mutation on import and show success results', async () => {
      const user = userEvent.setup();

      const bulkUpdateMock = {
        request: {
          query: ADMIN_BULK_UPDATE_PERSONALIZATION,
          variables: {
            updates: [
              {
                email: 'john@example.com',
                fullName: 'John Doe',
                personalization: {
                  relationshipToBride: 'Friend',
                  guestGroup: 'friends',
                },
              },
              {
                email: 'jane@example.com',
                fullName: 'Jane Smith',
                personalization: {
                  relationshipToBride: 'Sister',
                  guestGroup: 'brides_family',
                },
              },
            ],
          },
        },
        result: {
          data: {
            adminBulkUpdatePersonalization: {
              success: 2,
              created: 0,
              updated: 2,
              failed: 0,
              errors: [],
            },
          },
        },
      };

      render(
        <MockedProvider mocks={[bulkUpdateMock]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const csv = `fullName,email,relationshipToBride,guestGroup
John Doe,john@example.com,Friend,friends
Jane Smith,jane@example.com,Sister,brides_family`;

      const file = new File([csv], 'guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*2.*records/i);
      });

      const importButton = screen.getByRole('button', {
        name: /import.*records/i,
      });
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('Import Results')).toBeInTheDocument();
        expect(screen.getByText('Total Processed')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });

    it('should display error details when import fails', async () => {
      const user = userEvent.setup();

      const bulkUpdateMockWithErrors = {
        request: {
          query: ADMIN_BULK_UPDATE_PERSONALIZATION,
          variables: {
            updates: [
              {
                email: 'john@example.com',
                fullName: 'John Doe',
                personalization: {
                  relationshipToBride: 'Friend',
                },
              },
              {
                email: 'notfound@example.com',
                fullName: 'Jane Smith',
                personalization: {
                  relationshipToBride: 'Sister',
                },
              },
            ],
          },
        },
        result: {
          data: {
            adminBulkUpdatePersonalization: {
              success: 1,
              created: 0,
              updated: 1,
              failed: 1,
              errors: [
                {
                  email: 'notfound@example.com',
                  error: 'User not found',
                },
              ],
            },
          },
        },
      };

      render(
        <MockedProvider mocks={[bulkUpdateMockWithErrors]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const csv = `fullName,email,relationshipToBride
John Doe,john@example.com,Friend
Jane Smith,notfound@example.com,Sister`;

      const file = new File([csv], 'guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*2.*records/i);
      });

      const importButton = screen.getByRole('button', {
        name: /import.*records/i,
      });
      await user.click(importButton);

      await waitFor(() => {
        // Check for import results section
        expect(screen.getByText('Import Results')).toBeInTheDocument();
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
        expect(screen.getByText('notfound@example.com')).toBeInTheDocument();
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('should disable import button during processing', async () => {
      const user = userEvent.setup();

      const slowMock = {
        request: {
          query: ADMIN_BULK_UPDATE_PERSONALIZATION,
          variables: {
            updates: [
              {
                email: 'john@example.com',
                fullName: 'John Doe',
                personalization: {},
              },
            ],
          },
        },
        result: {
          data: {
            adminBulkUpdatePersonalization: {
              success: 1,
              created: 0,
              updated: 1,
              failed: 0,
              errors: [],
            },
          },
        },
        delay: 1000, // Simulate slow network
      };

      render(
        <MockedProvider mocks={[slowMock]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const csv = `fullName,email
John Doe,john@example.com`;

      const file = new File([csv], 'guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*1.*record/i);
      });

      const importButton = screen.getByRole('button', {
        name: /import.*records/i,
      }) as HTMLButtonElement;

      // Click and check disabled state immediately during async operation
      user.click(importButton);

      await waitFor(() => {
        expect(importButton).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle GraphQL mutation errors gracefully', async () => {
      const user = userEvent.setup();

      const errorMock = {
        request: {
          query: ADMIN_BULK_UPDATE_PERSONALIZATION,
          variables: {
            updates: [
              {
                email: 'john@example.com',
                fullName: 'John Doe',
                personalization: {},
              },
            ],
          },
        },
        error: new Error('Network error'),
      };

      render(
        <MockedProvider mocks={[errorMock]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      const csv = `fullName,email
John Doe,john@example.com`;

      const file = new File([csv], 'guests.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*1.*record/i);
      });

      const importButton = screen.getByRole('button', {
        name: /import.*records/i,
      });
      await user.click(importButton);

      await waitFor(() => {
        // Check for error message in console or error display
        const errorText = document.body.textContent || '';
        expect(errorText.toLowerCase()).toMatch(/error|network/);
      });
    });

    it('should clear previous results when uploading new file', async () => {
      const user = userEvent.setup();

      const successMock = {
        request: {
          query: ADMIN_BULK_UPDATE_PERSONALIZATION,
          variables: {
            updates: [
              {
                email: 'john@example.com',
                fullName: 'John Doe',
                personalization: {},
              },
            ],
          },
        },
        result: {
          data: {
            adminBulkUpdatePersonalization: {
              success: 1,
              created: 0,
              updated: 1,
              failed: 0,
              errors: [],
            },
          },
        },
      };

      render(
        <MockedProvider mocks={[successMock]} addTypename={false}>
          <BulkPersonalization />
        </MockedProvider>
      );

      // Upload first file
      const csv1 = `fullName,email
John Doe,john@example.com`;

      const file1 = new File([csv1], 'guests1.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(
        /upload csv file/i
      ) as HTMLInputElement;

      await user.upload(input, file1);

      await waitFor(() => {
        const container = document.querySelector('.preview-section');
        expect(container?.textContent).toMatch(/Preview.*1.*record/i);
      });

      const importButton = screen.getByRole('button', {
        name: /import.*records/i,
      });
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('Import Results')).toBeInTheDocument();
        expect(screen.getByText('Total Processed')).toBeInTheDocument();
      });

      // Upload second file
      const csv2 = `fullName,email
Jane Smith,jane@example.com`;

      const file2 = new File([csv2], 'guests2.csv', { type: 'text/csv' });
      await user.upload(input, file2);

      // Previous import results should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Import Results')).not.toBeInTheDocument();
      });
    });
  });
});
