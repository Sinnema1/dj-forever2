import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RSVPForm from '../src/components/RSVP/RSVPForm';
import { AuthProvider } from '../src/context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import { GET_RSVP } from '../src/features/rsvp/graphql/queries';

const getRSVPMock = {
  request: { query: GET_RSVP },
  result: { data: { getRSVP: null } },
};

function renderRSVPForm() {
  return render(
    <MockedProvider mocks={[getRSVPMock]} addTypename={false}>
      <AuthProvider>
        <RSVPForm />
      </AuthProvider>
    </MockedProvider>
  );
}

describe('RSVPForm integration', () => {
  it('renders and submits RSVP form', async () => {
    renderRSVPForm();
    userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    userEvent.selectOptions(screen.getByLabelText(/will you attend/i), 'YES');
    userEvent.type(screen.getByLabelText(/meal preference/i), 'Vegetarian');
    userEvent.type(screen.getByLabelText(/allergies/i), 'None');
    userEvent.type(screen.getByLabelText(/additional notes/i), 'No notes');
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/submitted|updated/i)).toBeInTheDocument();
    });
  });
});
