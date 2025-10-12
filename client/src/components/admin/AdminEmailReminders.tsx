import React, { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import {
  ADMIN_SEND_REMINDER_EMAIL,
  ADMIN_SEND_BULK_REMINDER_EMAILS,
  ADMIN_SEND_REMINDER_TO_ALL_PENDING,
} from '../../api/adminQueries';
import './AdminEmailReminders.css';

interface Guest {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  hasRSVPed: boolean;
  isAdmin: boolean;
}

interface AdminEmailRemindersProps {
  guests: Guest[];
}

interface EmailResult {
  success: boolean;
  email: string;
  error?: string;
}

/**
 * Admin Email Reminders - Email management interface for sending RSVP reminders.
 * Allows admins to send individual or bulk reminder emails to guests who haven't RSVP'd.
 */
const AdminEmailReminders: React.FC<AdminEmailRemindersProps> = ({
  guests,
}) => {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastResults, setLastResults] = useState<EmailResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [sendSingleReminder] = useMutation(ADMIN_SEND_REMINDER_EMAIL);
  const [sendBulkReminders] = useMutation(ADMIN_SEND_BULK_REMINDER_EMAILS);
  const [sendAllPendingReminders] = useMutation(
    ADMIN_SEND_REMINDER_TO_ALL_PENDING
  );

  // Filter to show only pending RSVP guests (invited, not responded, not admin)
  const pendingGuests = useMemo(() => {
    return guests.filter(
      guest => guest.isInvited && !guest.hasRSVPed && !guest.isAdmin
    );
  }, [guests]);

  // Filter guests based on search term
  const filteredGuests = useMemo(() => {
    if (!searchTerm) return pendingGuests;

    const searchLower = searchTerm.toLowerCase();
    return pendingGuests.filter(
      guest =>
        guest.fullName.toLowerCase().includes(searchLower) ||
        guest.email.toLowerCase().includes(searchLower)
    );
  }, [pendingGuests, searchTerm]);

  // Toggle guest selection
  const handleToggleGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedGuests(newSelected);
  };

  // Select all filtered guests
  const handleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g._id)));
    }
  };

  // Send reminder to single guest
  const handleSendSingle = async (guestId: string) => {
    const guest = guests.find(g => g._id === guestId);
    if (!guest) return;

    if (
      !confirm(
        `Send RSVP reminder email to ${guest.fullName} (${guest.email})?`
      )
    )
      return;

    try {
      setIsSending(true);
      const { data } = await sendSingleReminder({
        variables: { userId: guestId },
      });

      if (data.adminSendReminderEmail.success) {
        alert(`✅ Reminder email sent successfully to ${guest.email}!`);
        setLastResults([data.adminSendReminderEmail]);
        setShowResults(true);
      } else {
        alert(
          `❌ Failed to send email: ${data.adminSendReminderEmail.error || 'Unknown error'}`
        );
      }
    } catch (error: any) {
      console.error('Failed to send reminder:', error);
      alert(
        `❌ Failed to send reminder: ${error.message || 'Please try again.'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  // Send reminders to selected guests
  const handleSendToSelected = async () => {
    if (selectedGuests.size === 0) {
      alert('Please select at least one guest to send reminders to.');
      return;
    }

    if (
      !confirm(
        `Send RSVP reminder emails to ${selectedGuests.size} selected guest${selectedGuests.size === 1 ? '' : 's'}?`
      )
    )
      return;

    try {
      setIsSending(true);
      const { data } = await sendBulkReminders({
        variables: { userIds: Array.from(selectedGuests) },
      });

      const result = data.adminSendBulkReminderEmails;
      setLastResults(result.results);
      setShowResults(true);

      alert(
        `📧 Bulk email send complete!\n✅ ${result.successCount} successful\n❌ ${result.failureCount} failed`
      );

      setSelectedGuests(new Set());
    } catch (error: any) {
      console.error('Failed to send bulk reminders:', error);
      alert(
        `❌ Failed to send reminders: ${error.message || 'Please try again.'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  // Send reminders to all pending guests
  const handleSendToAll = async () => {
    if (pendingGuests.length === 0) {
      alert('No pending RSVPs found.');
      return;
    }

    if (
      !confirm(
        `Send RSVP reminder emails to ALL ${pendingGuests.length} pending guest${pendingGuests.length === 1 ? '' : 's'}?\n\nThis action cannot be undone.`
      )
    )
      return;

    try {
      setIsSending(true);
      const { data } = await sendAllPendingReminders();

      const result = data.adminSendReminderToAllPending;
      setLastResults(result.results);
      setShowResults(true);

      alert(
        `📧 Bulk email send complete!\n✅ ${result.successCount} successful\n❌ ${result.failureCount} failed`
      );

      setSelectedGuests(new Set());
    } catch (error: any) {
      console.error('Failed to send all reminders:', error);
      alert(
        `❌ Failed to send reminders: ${error.message || 'Please try again.'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-email-reminders">
      <div className="email-header">
        <h2>RSVP Email Reminders</h2>
        <p className="header-description">
          Send reminder emails to guests who haven't responded yet
        </p>
      </div>

      {/* Statistics Bar */}
      <div className="email-stats">
        <div className="stat-card">
          <div className="stat-number">{pendingGuests.length}</div>
          <div className="stat-label">Pending RSVPs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{selectedGuests.size}</div>
          <div className="stat-label">Selected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {lastResults ? lastResults.filter(r => r.success).length : 0}
          </div>
          <div className="stat-label">Sent Today</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="email-actions">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="button-group">
          <button
            onClick={handleSelectAll}
            className="action-button secondary"
            disabled={filteredGuests.length === 0 || isSending}
          >
            {selectedGuests.size === filteredGuests.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
          <button
            onClick={handleSendToSelected}
            className="action-button primary"
            disabled={selectedGuests.size === 0 || isSending}
          >
            {isSending
              ? 'Sending...'
              : `Send to Selected (${selectedGuests.size})`}
          </button>
          <button
            onClick={handleSendToAll}
            className="action-button warning"
            disabled={pendingGuests.length === 0 || isSending}
          >
            Send to All Pending
          </button>
        </div>
      </div>

      {/* Guest List */}
      <div className="guest-list-container">
        {filteredGuests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Pending RSVPs</h3>
            <p>
              {pendingGuests.length === 0
                ? 'All invited guests have already responded!'
                : 'No guests match your search.'}
            </p>
          </div>
        ) : (
          <div className="guest-list">
            {filteredGuests.map(guest => (
              <div key={guest._id} className="guest-item">
                <div className="guest-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGuests.has(guest._id)}
                    onChange={() => handleToggleGuest(guest._id)}
                    disabled={isSending}
                  />
                </div>
                <div className="guest-details">
                  <div className="guest-name">{guest.fullName}</div>
                  <div className="guest-email">{guest.email}</div>
                </div>
                <button
                  onClick={() => handleSendSingle(guest._id)}
                  className="send-single-button"
                  disabled={isSending}
                >
                  📧 Send Reminder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResults && lastResults && (
        <div
          className="results-modal-overlay"
          onClick={() => setShowResults(false)}
        >
          <div className="results-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Email Send Results</h3>
              <button
                className="modal-close"
                onClick={() => setShowResults(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="results-summary">
                <div className="summary-stat success">
                  <span className="summary-number">
                    {lastResults.filter(r => r.success).length}
                  </span>
                  <span className="summary-label">Successful</span>
                </div>
                <div className="summary-stat failure">
                  <span className="summary-number">
                    {lastResults.filter(r => !r.success).length}
                  </span>
                  <span className="summary-label">Failed</span>
                </div>
              </div>
              <div className="results-list">
                {lastResults.map((result, index) => (
                  <div
                    key={index}
                    className={`result-item ${result.success ? 'success' : 'failure'}`}
                  >
                    <span className="result-icon">
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="result-email">{result.email}</span>
                    {result.error && (
                      <span className="result-error">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowResults(false)}
                className="action-button primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="email-info">
        <h3>📧 About Email Reminders</h3>
        <ul>
          <li>
            Reminders are sent to guests who are invited but haven't RSVP'd yet
          </li>
          <li>
            Each email includes a personalized QR login link for easy access
          </li>
          <li>
            Emails are sent sequentially to avoid rate limiting (small delay
            between each)
          </li>
          <li>
            In development mode, emails are logged to the console instead of
            being sent
          </li>
          <li>
            Configure SMTP settings in environment variables to enable actual
            email sending
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminEmailReminders;
