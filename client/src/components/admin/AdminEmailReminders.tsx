import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import {
  ADMIN_SEND_REMINDER_EMAIL,
  ADMIN_SEND_BULK_REMINDER_EMAILS,
  ADMIN_SEND_REMINDER_TO_ALL_PENDING,
  ADMIN_EMAIL_PREVIEW,
  ADMIN_EMAIL_SEND_HISTORY,
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

interface EmailPreview {
  subject: string;
  htmlContent: string;
  to: string;
  template: string;
}

interface EmailJobHistory {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  template: string;
  status: string;
  attempts: number;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
}

interface SMTPHealthStatus {
  healthy: boolean;
  message: string;
  lastChecked?: string;
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<EmailPreview | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false); // Toggle for showing all users
  const [smtpHealth, setSMTPHealth] = useState<SMTPHealthStatus>({
    healthy: false,
    message: 'Checking...',
  });

  const [sendSingleReminder] = useMutation(ADMIN_SEND_REMINDER_EMAIL);
  const [sendBulkReminders] = useMutation(ADMIN_SEND_BULK_REMINDER_EMAILS);
  const [sendAllPendingReminders] = useMutation(
    ADMIN_SEND_REMINDER_TO_ALL_PENDING
  );

  const [getEmailPreview, { loading: previewLoading }] = useLazyQuery(
    ADMIN_EMAIL_PREVIEW,
    {
      fetchPolicy: 'network-only',
    }
  );

  const { data: historyData, refetch: refetchHistory } = useQuery(
    ADMIN_EMAIL_SEND_HISTORY,
    {
      variables: { limit: 50 },
      fetchPolicy: 'network-only',
    }
  );

  // Check SMTP health on mount and every 5 minutes
  useEffect(() => {
    const checkSMTPHealth = async () => {
      try {
        // Determine the correct base URL for API calls
        // In development: explicit server URL (localhost:3001)
        // In production: same origin (server serves client)
        const graphqlEndpoint =
          import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

        let baseUrl: string;
        if (graphqlEndpoint.startsWith('http')) {
          // Full URL provided (development)
          baseUrl = graphqlEndpoint.replace('/graphql', '');
        } else {
          // Relative URL - need to use server port in dev
          baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
        }

        const response = await fetch(`${baseUrl}/health/smtp`);
        const data = await response.json();

        setSMTPHealth({
          healthy: data.healthy,
          message:
            data.message || (data.healthy ? 'SMTP is healthy' : 'SMTP is down'),
          lastChecked: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to check SMTP health:', error);
        setSMTPHealth({
          healthy: false,
          message: 'Failed to check SMTP status',
          lastChecked: new Date().toISOString(),
        });
      }
    };

    checkSMTPHealth();
    const interval = setInterval(checkSMTPHealth, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Filter to show pending RSVP guests or all users based on toggle
  const pendingGuests = useMemo(() => {
    if (showAllUsers) {
      // Show all invited users (excluding admins for safety)
      return guests.filter(guest => guest.isInvited && !guest.isAdmin);
    }
    // Show only pending RSVP guests (invited, not responded, not admin)
    return guests.filter(
      guest => guest.isInvited && !guest.hasRSVPed && !guest.isAdmin
    );
  }, [guests, showAllUsers]);

  // Filter guests based on search term
  const filteredGuests = useMemo(() => {
    if (!searchTerm) {
      return pendingGuests;
    }

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
    if (!guest) {
      return;
    }

    if (
      !confirm(
        `Send RSVP reminder email to ${guest.fullName} (${guest.email})?`
      )
    ) {
      return;
    }

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
    ) {
      return;
    }

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
    ) {
      return;
    }

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
      refetchHistory(); // Refresh history after sending
    } catch (error: any) {
      console.error('Failed to send all reminders:', error);
      alert(
        `❌ Failed to send reminders: ${error.message || 'Please try again.'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  // Show email preview for a guest
  const handleShowPreview = async (guestId: string) => {
    try {
      const { data } = await getEmailPreview({
        variables: { userId: guestId, template: 'rsvp_reminder' },
      });

      if (data?.emailPreview) {
        setPreviewData(data.emailPreview);
        setShowPreview(true);
      }
    } catch (error: any) {
      console.error('Failed to generate preview:', error);
      alert(
        `❌ Failed to generate preview: ${error.message || 'Please try again.'}`
      );
    }
  };

  // Show email send history
  const handleShowHistory = () => {
    refetchHistory();
    setShowHistory(true);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'status-success';
      case 'failed':
        return 'status-error';
      case 'retrying':
        return 'status-warning';
      case 'pending':
        return 'status-info';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="admin-email-reminders">
      <div className="email-header">
        <div className="header-title-section">
          <h2>RSVP Email Reminders</h2>
          <div
            className={`smtp-health-badge ${smtpHealth.healthy ? 'healthy' : 'unhealthy'}`}
          >
            <span className="health-icon">
              {smtpHealth.healthy ? '✓' : '✕'}
            </span>
            <span className="health-text">{smtpHealth.message}</span>
          </div>
        </div>
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
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className={`toggle-button ${showAllUsers ? 'active' : ''}`}
            title={showAllUsers ? 'Show pending RSVPs only' : 'Show all users'}
            aria-pressed={showAllUsers}
          >
            {showAllUsers ? '📋 All Users' : '⏳ Pending Only'}
          </button>
        </div>
        <div className="button-group">
          <button
            onClick={handleShowHistory}
            className="action-button info"
            disabled={isSending}
          >
            📊 View History
          </button>
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
            disabled={
              selectedGuests.size === 0 || isSending || !smtpHealth.healthy
            }
          >
            {isSending
              ? 'Sending...'
              : `Send to Selected (${selectedGuests.size})`}
          </button>
          <button
            onClick={handleSendToAll}
            className="action-button warning"
            disabled={
              pendingGuests.length === 0 || isSending || !smtpHealth.healthy
            }
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
            <h3>{showAllUsers ? 'No Users Found' : 'No Pending RSVPs'}</h3>
            <p>
              {pendingGuests.length === 0 && !showAllUsers
                ? 'All invited guests have already responded!'
                : pendingGuests.length === 0 && showAllUsers
                  ? 'No invited users found.'
                  : 'No guests match your search.'}
            </p>
            {!showAllUsers && pendingGuests.length === 0 && (
              <button
                onClick={() => setShowAllUsers(true)}
                className="action-button info"
                style={{ marginTop: '1rem' }}
              >
                📋 Show All Users (for testing)
              </button>
            )}
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
                    aria-label={`Select ${guest.fullName}`}
                  />
                </div>
                <div className="guest-details">
                  <div className="guest-name">{guest.fullName}</div>
                  <div className="guest-email">{guest.email}</div>
                </div>
                <div className="guest-actions">
                  <button
                    onClick={() => handleShowPreview(guest._id)}
                    className="preview-button"
                    disabled={isSending || previewLoading}
                    title="Preview email"
                    aria-label={`Preview email for ${guest.fullName}`}
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => handleSendSingle(guest._id)}
                    className="send-single-button"
                    disabled={isSending || !smtpHealth.healthy}
                    aria-label={`Send reminder to ${guest.fullName}`}
                  >
                    📧 Send Reminder
                  </button>
                </div>
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
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowResults(false);
            }
          }}
        >
          <div
            className="results-modal"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
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
                    key={`${result.email || 'unknown'}-${index}`}
                    className={`result-item ${result.success ? 'success' : 'failure'}`}
                  >
                    <span className="result-icon" aria-hidden>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="result-email">{result.email}</span>
                    {result.error && (
                      <span className="result-error" title={result.error}>
                        {result.error}
                      </span>
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

      {/* Email Preview Modal */}
      {showPreview && previewData && (
        <div
          className="results-modal-overlay"
          onClick={() => setShowPreview(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowPreview(false);
            }
          }}
        >
          <div
            className="preview-modal"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Email Preview</h3>
              <button
                className="modal-close"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-info">
                <div className="preview-field">
                  <strong>To:</strong> {previewData.to}
                </div>
                <div className="preview-field">
                  <strong>Subject:</strong> {previewData.subject}
                </div>
                <div className="preview-field">
                  <strong>Template:</strong> {previewData.template}
                </div>
              </div>
              <div className="preview-content">
                <h4>Email Content:</h4>
                <div
                  className="preview-html"
                  dangerouslySetInnerHTML={{ __html: previewData.htmlContent }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowPreview(false)}
                className="action-button secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Send History Modal */}
      {showHistory && (
        <div
          className="results-modal-overlay"
          onClick={() => setShowHistory(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowHistory(false);
            }
          }}
        >
          <div
            className="history-modal"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Email Send History</h3>
              <button
                className="modal-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {historyData?.emailSendHistory &&
              historyData.emailSendHistory.length > 0 ? (
                <div className="history-table-container">
                  <table
                    className="history-table"
                    aria-label="Email send history"
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Recipient</th>
                        <th>Status</th>
                        <th>Attempts</th>
                        <th>Sent At</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.emailSendHistory.map(
                        (job: EmailJobHistory) => (
                          <tr key={job._id}>
                            <td>{formatDate(job.createdAt)}</td>
                            <td>
                              <div className="history-recipient">
                                <div className="recipient-name">
                                  {job.userName}
                                </div>
                                <div className="recipient-email">
                                  {job.userEmail}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${getStatusColor(job.status)}`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="attempts-cell">{job.attempts}</td>
                            <td>{formatDate(job.sentAt)}</td>
                            <td className="error-cell">
                              {job.lastError && (
                                <span
                                  className="error-text"
                                  title={job.lastError}
                                >
                                  {job.lastError.substring(0, 50)}
                                  {job.lastError.length > 50 ? '...' : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Email History</h3>
                  <p>No emails have been sent yet.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  refetchHistory();
                }}
                className="action-button secondary"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowHistory(false)}
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
