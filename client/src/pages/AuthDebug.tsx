import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Auth Debug Page - Shows current authentication state for debugging
 */
const AuthDebug: React.FC = () => {
  const { user, isLoggedIn, isLoading, token } = useAuth();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Debug Information</h1>

      <div
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
        }}
      >
        <h2>Current State</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Loading:</td>
              <td style={{ padding: '10px' }}>
                {isLoading ? '✅ Yes' : '❌ No'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>
                Logged In:
              </td>
              <td style={{ padding: '10px' }}>
                {isLoggedIn ? '✅ Yes' : '❌ No'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>
                Has Token:
              </td>
              <td style={{ padding: '10px' }}>{token ? '✅ Yes' : '❌ No'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Has User:</td>
              <td style={{ padding: '10px' }}>{user ? '✅ Yes' : '❌ No'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {user && (
        <div
          style={{
            background: '#e8f5e9',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
          }}
        >
          <h2>User Information</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  Full Name:
                </td>
                <td style={{ padding: '10px' }}>{user.fullName}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Email:</td>
                <td style={{ padding: '10px' }}>{user.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  User ID:
                </td>
                <td
                  style={{
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                >
                  {user._id}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  Is Admin:
                </td>
                <td style={{ padding: '10px', fontSize: '20px' }}>
                  {user.isAdmin
                    ? '✅ YES - ADMIN USER'
                    : '❌ No - Regular User'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  Is Invited:
                </td>
                <td style={{ padding: '10px' }}>
                  {user.isInvited ? '✅ Yes' : '❌ No'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  Has RSVP&apos;d:
                </td>
                <td style={{ padding: '10px' }}>
                  {user.hasRSVPed ? '✅ Yes' : '❌ No'}
                </td>
              </tr>
              {user.rsvpId && (
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    RSVP ID:
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  >
                    {user.rsvpId}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {token && (
        <div
          style={{
            background: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
          }}
        >
          <h2>Token Information</h2>
          <div
            style={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: 'white',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            {token}
          </div>
        </div>
      )}

      <div
        style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
        }}
      >
        <h2>LocalStorage Data</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>id_token:</td>
              <td
                style={{
                  padding: '10px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                }}
              >
                {localStorage.getItem('id_token') || 'Not set'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>user:</td>
              <td
                style={{
                  padding: '10px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                }}
              >
                {localStorage.getItem('user') || 'Not set'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>
                auth_version:
              </td>
              <td style={{ padding: '10px' }}>
                {localStorage.getItem('auth_version') || 'Not set'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isLoggedIn && (
        <div
          style={{
            background: '#ffebee',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
          }}
        >
          <h2>⚠️ Not Logged In</h2>
          <p>
            To test admin features, you need to log in with the admin QR token.
          </p>
          <h3>Quick Login Options:</h3>
          <ul>
            <li>
              <strong>Direct URL:</strong>{' '}
              <a href="http://localhost:3002/login/qr/obnzixyen8f6fzr5xwznda">
                http://localhost:3002/login/qr/obnzixyen8f6fzr5xwznda
              </a>
            </li>
            <li>
              <strong>Manual Entry:</strong> Click QR icon in navbar and enter
              token: <code>obnzixyen8f6fzr5xwznda</code>
            </li>
            <li>
              <strong>QR Code:</strong> Scan the QR code image at{' '}
              <code>
                /server/qr-codes/development/Admin_User_admin_djforever2_com_*.png
              </code>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
