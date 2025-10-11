import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  ADMIN_UPDATE_RSVP,
  ADMIN_UPDATE_USER,
  ADMIN_DELETE_RSVP,
} from '../../api/adminQueries';
import './AdminRSVPManager.css';

interface Guest {
  fullName: string;
  mealPreference: string;
}

interface RSVP {
  _id: string;
  attending: boolean;
  guestCount: number;
  guests: Guest[];
  dietaryRestrictions?: string;
  songRequests?: string;
  specialAccommodations?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  isAdmin: boolean;
  hasRSVPed: boolean;
  rsvp?: RSVP;
}

interface AdminRSVPManagerProps {
  guests: AdminUser[];
  onUpdate: () => void;
}

/**
 * Admin RSVP Manager - Guest management interface for administrators.
 * Allows viewing, editing, and managing all guest RSVPs and user information.
 */
const AdminRSVPManager: React.FC<AdminRSVPManagerProps> = ({
  guests,
  onUpdate,
}) => {
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'invited' | 'rsvped' | 'attending' | 'pending'
  >('all');

  const [updateRSVP] = useMutation(ADMIN_UPDATE_RSVP);
  const [updateUser] = useMutation(ADMIN_UPDATE_USER);
  const [deleteRSVP] = useMutation(ADMIN_DELETE_RSVP);

  const filteredGuests = guests.filter(guest => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !guest.fullName.toLowerCase().includes(searchLower) &&
        !guest.email.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    switch (filterStatus) {
      case 'invited':
        return guest.isInvited;
      case 'rsvped':
        return guest.hasRSVPed;
      case 'attending':
        return guest.hasRSVPed && guest.rsvp?.attending;
      case 'pending':
        return guest.isInvited && !guest.hasRSVPed;
      default:
        return true;
    }
  });

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await updateUser({
        variables: { userId, updates },
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleUpdateRSVP = async (rsvpId: string, updates: any) => {
    try {
      await updateRSVP({
        variables: { rsvpId, updates },
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      alert('Failed to update RSVP. Please try again.');
    }
  };

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to delete this RSVP?')) return;

    try {
      await deleteRSVP({
        variables: { rsvpId },
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete RSVP:', error);
      alert('Failed to delete RSVP. Please try again.');
    }
  };

  return (
    <div className="admin-rsvp-manager">
      <div className="manager-header">
        <h2>Guest Management</h2>
        <div className="manager-controls">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Guests</option>
            <option value="invited">Invited Only</option>
            <option value="rsvped">RSVP Received</option>
            <option value="attending">Attending</option>
            <option value="pending">Pending RSVP</option>
          </select>
        </div>
      </div>

      <div className="guest-list">
        {filteredGuests.map(guest => (
          <div
            key={guest._id}
            className={`guest-card ${guest.hasRSVPed ? 'rsvped' : 'pending'}`}
          >
            <div className="guest-header">
              <div className="guest-info">
                <h3>{guest.fullName}</h3>
                <p className="guest-email">{guest.email}</p>
                <div className="guest-badges">
                  {guest.isAdmin && <span className="badge admin">Admin</span>}
                  {guest.isInvited && (
                    <span className="badge invited">Invited</span>
                  )}
                  {guest.hasRSVPed && (
                    <span className="badge rsvped">RSVP'd</span>
                  )}
                  {guest.rsvp?.attending && (
                    <span className="badge attending">Attending</span>
                  )}
                </div>
              </div>
              <div className="guest-actions">
                <button
                  onClick={() =>
                    setEditingGuest(
                      editingGuest === guest._id ? null : guest._id
                    )
                  }
                  className="edit-button"
                >
                  {editingGuest === guest._id ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {guest.rsvp && (
              <div className="rsvp-details">
                <div className="rsvp-summary">
                  <span
                    className={`status ${guest.rsvp.attending ? 'attending' : 'not-attending'}`}
                  >
                    {guest.rsvp.attending
                      ? `Attending (${guest.rsvp.guestCount} guests)`
                      : 'Not Attending'}
                  </span>
                </div>

                {guest.rsvp.guests && guest.rsvp.guests.length > 0 && (
                  <div className="guest-details">
                    <h4>Guest Details:</h4>
                    {guest.rsvp.guests.map((g, index) => (
                      <div key={index} className="guest-detail">
                        <span>{g.fullName}</span>
                        {g.mealPreference && (
                          <span className="meal">({g.mealPreference})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(guest.rsvp.dietaryRestrictions ||
                  guest.rsvp.songRequests ||
                  guest.rsvp.specialAccommodations) && (
                  <div className="additional-info">
                    {guest.rsvp.dietaryRestrictions && (
                      <div>
                        <strong>Dietary:</strong>{' '}
                        {guest.rsvp.dietaryRestrictions}
                      </div>
                    )}
                    {guest.rsvp.songRequests && (
                      <div>
                        <strong>Songs:</strong> {guest.rsvp.songRequests}
                      </div>
                    )}
                    {guest.rsvp.specialAccommodations && (
                      <div>
                        <strong>Accommodations:</strong>{' '}
                        {guest.rsvp.specialAccommodations}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {editingGuest === guest._id && (
              <div className="edit-panel">
                <div className="edit-section">
                  <h4>User Settings</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={guest.isInvited}
                      onChange={e =>
                        handleUpdateUser(guest._id, {
                          isInvited: e.target.checked,
                        })
                      }
                    />
                    Invited
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={guest.isAdmin}
                      onChange={e =>
                        handleUpdateUser(guest._id, {
                          isAdmin: e.target.checked,
                        })
                      }
                    />
                    Admin
                  </label>
                </div>

                {guest.rsvp && (
                  <div className="edit-section">
                    <h4>RSVP Settings</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={guest.rsvp.attending}
                        onChange={e =>
                          handleUpdateRSVP(guest.rsvp!._id, {
                            attending: e.target.checked,
                          })
                        }
                      />
                      Attending
                    </label>
                    <button
                      onClick={() => handleDeleteRSVP(guest.rsvp!._id)}
                      className="delete-rsvp-button"
                    >
                      Delete RSVP
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="no-guests">
          <p>No guests match the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRSVPManager;
