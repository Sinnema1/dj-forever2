import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuestPersonalizationModal from '../src/components/admin/GuestPersonalizationModal';
import type { User, GuestGroup } from '../src/models/userTypes';

/**
 * Returns a minimal valid User object for the modal.
 * householdMembers include Apollo's __typename to simulate real cache data.
 */
function makeUser(overrides: Partial<User> = {}): User {
  return {
    _id: 'user-1',
    fullName: 'Dianne Manning',
    email: 'dianne@example.com',
    isInvited: true,
    isAdmin: false,
    hasRSVPed: false,
    qrAlias: 'manning-family-2',
    qrAliasLocked: false,
    guestGroup: 'Family' as GuestGroup,
    plusOneAllowed: false,
    householdMembers: [
      // Simulate Apollo cache injecting __typename onto nested objects
      {
        __typename: 'HouseholdMember',
        firstName: 'Tim',
        lastName: 'Manning',
        relationshipToBride: 'father-in-law',
        relationshipToGroom: 'father',
      } as any,
    ],
    ...overrides,
  };
}

describe('GuestPersonalizationModal', () => {
  describe('__typename stripping', () => {
    it('strips __typename from householdMembers in the onSave payload', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <GuestPersonalizationModal
          user={makeUser()}
          onClose={onClose}
          onSave={onSave}
          isSaving={false}
        />
      );

      // Submit the form without any changes to verify initial state is clean
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledOnce();
      });

      const [, personalization] = onSave.mock.calls[0];
      expect(personalization.householdMembers).toBeDefined();
      personalization.householdMembers!.forEach(
        (member: Record<string, unknown>) => {
          expect(member).not.toHaveProperty('__typename');
        }
      );
    });

    it('preserves householdMember field values after stripping __typename', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <GuestPersonalizationModal
          user={makeUser()}
          onClose={onClose}
          onSave={onSave}
          isSaving={false}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledOnce();
      });

      const [, personalization] = onSave.mock.calls[0];
      expect(personalization.householdMembers![0]).toMatchObject({
        firstName: 'Tim',
        lastName: 'Manning',
        relationshipToBride: 'father-in-law',
        relationshipToGroom: 'father',
      });
    });
  });
});
