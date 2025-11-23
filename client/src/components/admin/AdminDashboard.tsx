import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_STATS, GET_ADMIN_RSVPS } from '../../api/adminQueries';
import AdminStatsCard from './AdminStatsCard';
import AdminRSVPManager from './AdminRSVPManager';
import AdminGuestExport from './AdminGuestExport';
import AdminAnalytics from './AdminAnalytics';
import AdminEmailReminders from './AdminEmailReminders';
import AdminGuestPersonalization from './AdminGuestPersonalization';
import './AdminDashboard.css';

/**
 * Admin Dashboard - Main administrative interface for wedding management.
 * Provides visual representation of invited guests and their RSVP status,
 * wedding statistics, guest management, and data export functionality.
 */
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'analytics'
    | 'guests'
    | 'personalization'
    | 'reminders'
    | 'export'
  >('overview');

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_ADMIN_STATS, {
    errorPolicy: 'all',
  });

  const {
    data: rsvpData,
    loading: rsvpLoading,
    error: rsvpError,
    refetch: refetchRSVPs,
  } = useQuery(GET_ADMIN_RSVPS, {
    errorPolicy: 'all',
  });

  if (statsLoading && rsvpLoading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-spinner" aria-hidden />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError || rsvpError) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error" role="alert">
          <h2>Admin Access Error</h2>
          <p>
            {statsError?.message ||
              rsvpError?.message ||
              'Failed to load admin data'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = statsData?.adminGetUserStats;
  const guests = rsvpData?.adminGetAllRSVPs || [];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Wedding Administration</h1>
        <p>Manage guest invitations, RSVPs, and wedding statistics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          aria-pressed={activeTab === 'overview'}
          aria-label="Overview tab"
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          aria-pressed={activeTab === 'analytics'}
          aria-label="Analytics tab"
        >
          Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveTab('guests')}
          aria-pressed={activeTab === 'guests'}
          aria-label="Guest management tab"
        >
          Guest Management
        </button>
        <button
          className={`tab-button ${activeTab === 'personalization' ? 'active' : ''}`}
          onClick={() => setActiveTab('personalization')}
          aria-pressed={activeTab === 'personalization'}
          aria-label="Personalization tab"
        >
          Personalization
        </button>
        <button
          className={`tab-button ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
          aria-pressed={activeTab === 'reminders'}
          aria-label="Email reminders tab"
        >
          Email Reminders
        </button>
        <button
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
          aria-pressed={activeTab === 'export'}
          aria-label="Export data tab"
        >
          Export Data
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {stats && <AdminStatsCard stats={stats} />}

            <div className="rsvp-visual-summary">
              <h2>RSVP Status Overview</h2>
              <div className="rsvp-status-grid">
                {guests.map((guest: any) => (
                  <div
                    key={guest._id}
                    className={`guest-status-card ${
                      !guest.isInvited
                        ? 'not-invited'
                        : !guest.hasRSVPed
                          ? 'pending'
                          : guest.rsvp?.attending === 'YES'
                            ? 'attending'
                            : guest.rsvp?.attending === 'MAYBE'
                              ? 'maybe'
                              : 'not-attending'
                    }`}
                  >
                    <div className="guest-name">{guest.fullName}</div>
                    <div className="guest-status">
                      {!guest.isInvited
                        ? 'Not Invited'
                        : !guest.hasRSVPed
                          ? 'Pending RSVP'
                          : guest.rsvp?.attending === 'YES'
                            ? `Attending (${guest.rsvp.guestCount})`
                            : guest.rsvp?.attending === 'MAYBE'
                              ? `Maybe (${guest.rsvp.guestCount})`
                              : 'Not Attending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <AdminAnalytics stats={stats} guests={guests} />
        )}

        {activeTab === 'guests' && (
          <AdminRSVPManager guests={guests} onUpdate={refetchRSVPs} />
        )}

        {activeTab === 'personalization' && <AdminGuestPersonalization />}

        {activeTab === 'reminders' && <AdminEmailReminders guests={guests} />}

        {activeTab === 'export' && <AdminGuestExport />}
      </div>
    </div>
  );
};

export default AdminDashboard;
