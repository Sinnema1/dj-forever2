import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_STATS, GET_ADMIN_RSVPS } from '../../api/adminQueries';
import AdminStatsCard from './AdminStatsCard';
import AdminRSVPManager from './AdminRSVPManager';
import AdminGuestExport from './AdminGuestExport';
import './AdminDashboard.css';

/**
 * Admin Dashboard - Main administrative interface for wedding management.
 * Provides visual representation of invited guests and their RSVP status,
 * wedding statistics, guest management, and data export functionality.
 */
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'export'>(
    'overview'
  );

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
          <div className="admin-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError || rsvpError) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
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
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveTab('guests')}
        >
          Guest Management
        </button>
        <button
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
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
                          : guest.rsvp?.attending
                            ? 'attending'
                            : 'not-attending'
                    }`}
                  >
                    <div className="guest-name">{guest.fullName}</div>
                    <div className="guest-status">
                      {!guest.isInvited
                        ? 'Not Invited'
                        : !guest.hasRSVPed
                          ? 'Pending RSVP'
                          : guest.rsvp?.attending
                            ? `Attending (${guest.rsvp.guestCount})`
                            : 'Not Attending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guests' && (
          <AdminRSVPManager guests={guests} onUpdate={refetchRSVPs} />
        )}

        {activeTab === 'export' && <AdminGuestExport />}
      </div>
    </div>
  );
};

export default AdminDashboard;
