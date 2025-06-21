import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../src/components/Navbar';
import { AuthProvider } from '../src/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

function renderNavbar() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Navbar integration', () => {
  it('shows Login button when logged out and opens modal', async () => {
    renderNavbar();
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).toBeInTheDocument();
    userEvent.click(loginBtn);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
  });

  it('shows Logout button when logged in', async () => {
    // Simulate login by setting localStorage
    window.localStorage.setItem('id_token', 'mock');
    window.localStorage.setItem('user', JSON.stringify({ isInvited: true, fullName: 'Test', email: 'test@example.com' }));
    renderNavbar();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
    // Clean up
    window.localStorage.clear();
  });
});
