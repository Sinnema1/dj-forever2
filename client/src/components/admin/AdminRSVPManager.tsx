import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  ADMIN_UPDATE_RSVP,
  ADMIN_UPDATE_USER,
  ADMIN_DELETE_RSVP,
  ADMIN_CREATE_USER,
  ADMIN_DELETE_USER,
} from '../../api/adminQueries';
import './AdminRSVPManager.css';

interface Guest {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

interface RSVP {
  _id: string;
  userId: string;
  attending: 'YES' | 'NO' | 'MAYBE';
  guestCount?: number;
  guests: Guest[];
  additionalNotes?: string;
}

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  isAdmin: boolean;
  hasRSVPed: boolean;
  qrToken: string;
  rsvp?: RSVP;
}

interface EditRSVPForm {
  attending: 'YES' | 'NO' | 'MAYBE';
  guestCount: number;
  guests: Guest[];
  additionalNotes: string;
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
  const [editForm, setEditForm] = useState<EditRSVPForm | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'invited' | 'rsvped' | 'attending' | 'pending'
  >('all');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestForm, setNewGuestForm] = useState({
    fullName: '',
    email: '',
    isInvited: true,
  });

  const [updateRSVP] = useMutation(ADMIN_UPDATE_RSVP);
  const [updateUser] = useMutation(ADMIN_UPDATE_USER);
  const [deleteRSVP] = useMutation(ADMIN_DELETE_RSVP);
  const [createUser] = useMutation(ADMIN_CREATE_USER);
  const [deleteUser] = useMutation(ADMIN_DELETE_USER);

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

  const handleEditGuest = (guest: AdminUser) => {
    setEditingGuest(guest._id);
    if (guest.rsvp) {
      setEditForm({
        attending: guest.rsvp.attending,
        guestCount: guest.rsvp.guestCount || guest.rsvp.guests.length,
        guests:
          guest.rsvp.guests.length > 0
            ? guest.rsvp.guests
            : [{ fullName: '', mealPreference: '', allergies: '' }],
        additionalNotes: guest.rsvp.additionalNotes || '',
      });
    } else {
      setEditForm({
        attending: 'MAYBE',
        guestCount: 1,
        guests: [
          { fullName: guest.fullName, mealPreference: '', allergies: '' },
        ],
        additionalNotes: '',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingGuest(null);
    setEditForm(null);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      setIsSaving(true);
      await updateUser({
        variables: { userId, updates },
      });
      await onUpdate();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRSVP = async (userId: string) => {
    if (!editForm) return;

    try {
      setIsSaving(true);
      await updateRSVP({
        variables: {
          userId,
          input: {
            attending: editForm.attending,
            guestCount: editForm.guestCount,
            guests: editForm.guests.filter(g => g.fullName.trim()),
            additionalNotes: editForm.additionalNotes,
          },
        },
      });
      await onUpdate();
      handleCancelEdit();
    } catch (error: any) {
      console.error('Failed to update RSVP:', error);
      alert(`Failed to update RSVP: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRSVP = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this RSVP? This cannot be undone.'
      )
    )
      return;

    try {
      setIsSaving(true);
      await deleteRSVP({
        variables: { userId },
      });
      await onUpdate();
      handleCancelEdit();
    } catch (error: any) {
      console.error('Failed to delete RSVP:', error);
      alert(`Failed to delete RSVP: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGuest = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      guests: [
        ...editForm.guests,
        { fullName: '', mealPreference: '', allergies: '' },
      ],
      guestCount: editForm.guests.length + 1,
    });
  };

  const handleRemoveGuest = (index: number) => {
    if (!editForm || editForm.guests.length <= 1) return;
    const newGuests = editForm.guests.filter((_, i) => i !== index);
    setEditForm({
      ...editForm,
      guests: newGuests,
      guestCount: newGuests.length,
    });
  };

  const handleGuestChange = (
    index: number,
    field: keyof Guest,
    value: string
  ) => {
    if (!editForm) return;
    const newGuests = [...editForm.guests];
    newGuests[index] = { ...newGuests[index], [field]: value } as Guest;
    setEditForm({ ...editForm, guests: newGuests });
  };

  const handleAddNewGuest = async () => {
    if (!newGuestForm.fullName.trim() || !newGuestForm.email.trim()) {
      alert('Please provide both name and email for the new guest.');
      return;
    }

    try {
      setIsSaving(true);
      await createUser({
        variables: {
          input: {
            fullName: newGuestForm.fullName,
            email: newGuestForm.email,
            isInvited: newGuestForm.isInvited,
          },
        },
      });
      await onUpdate();
      setShowAddModal(false);
      setNewGuestForm({ fullName: '', email: '', isInvited: true });
      alert('Guest added successfully!');
    } catch (error: any) {
      console.error('Failed to add guest:', error);
      alert(`Failed to add guest: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGuest = async (userId: string, guestName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${guestName}? This will permanently remove the guest and their RSVP. This cannot be undone.`
      )
    )
      return;

    try {
      setIsSaving(true);
      await deleteUser({
        variables: { userId },
      });
      await onUpdate();
      alert('Guest deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete guest:', error);
      alert(`Failed to delete guest: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-rsvp-manager">
      <div className="manager-header">
        <h2>Guest Management</h2>
        <div className="manager-controls">
          <button
            onClick={() => setShowAddModal(true)}
            className="add-guest-button"
            disabled={isSaving}
          >
            + Add New Guest
          </button>
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
                    editingGuest === guest._id
                      ? handleCancelEdit()
                      : handleEditGuest(guest)
                  }
                  className="edit-button"
                  disabled={isSaving || guest.isAdmin}
                >
                  {editingGuest === guest._id ? 'Cancel' : 'Edit RSVP'}
                </button>
                {!guest.isAdmin && (
                  <button
                    onClick={() => handleDeleteGuest(guest._id, guest.fullName)}
                    className="delete-guest-button"
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {guest.rsvp && editingGuest !== guest._id && (
              <div className="rsvp-details">
                <div className="rsvp-summary">
                  <span
                    className={`status status-${guest.rsvp.attending.toLowerCase()}`}
                  >
                    {guest.rsvp.attending === 'YES' &&
                      `✓ Attending (${guest.rsvp.guests.length} ${guest.rsvp.guests.length === 1 ? 'guest' : 'guests'})`}
                    {guest.rsvp.attending === 'NO' && '✗ Not Attending'}
                    {guest.rsvp.attending === 'MAYBE' && '? Maybe Attending'}
                  </span>
                </div>

                {guest.rsvp.guests && guest.rsvp.guests.length > 0 && (
                  <div className="guest-details">
                    <h4>Guest Details:</h4>
                    {guest.rsvp.guests.map((g, index) => (
                      <div key={index} className="guest-detail">
                        <span className="guest-name">{g.fullName}</span>
                        {g.mealPreference && (
                          <span className="meal-badge">{g.mealPreference}</span>
                        )}
                        {g.allergies && (
                          <span className="allergy-badge">
                            ⚠️ {g.allergies}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {guest.rsvp.additionalNotes && (
                  <div className="additional-notes">
                    <strong>Notes:</strong> {guest.rsvp.additionalNotes}
                  </div>
                )}
              </div>
            )}

            {!guest.hasRSVPed && editingGuest !== guest._id && (
              <div className="no-rsvp">
                <p>No RSVP submitted yet</p>
              </div>
            )}

            {editingGuest === guest._id && editForm && (
              <div className="edit-panel">
                <h3>Edit RSVP for {guest.fullName}</h3>

                <div className="edit-section">
                  <label className="form-label">
                    <strong>Attendance Status:</strong>
                    <select
                      value={editForm.attending}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          attending: e.target.value as any,
                        })
                      }
                      className="form-select"
                    >
                      <option value="YES">✓ Attending</option>
                      <option value="NO">✗ Not Attending</option>
                      <option value="MAYBE">? Maybe</option>
                    </select>
                  </label>
                </div>

                {editForm.attending !== 'NO' && (
                  <>
                    <div className="edit-section">
                      <div className="section-header">
                        <h4>Guest Information</h4>
                        <button
                          onClick={handleAddGuest}
                          className="add-guest-button"
                          type="button"
                        >
                          + Add Guest
                        </button>
                      </div>

                      {editForm.guests.map((guest, index) => (
                        <div key={index} className="guest-form-group">
                          <div className="guest-form-header">
                            <span>Guest {index + 1}</span>
                            {editForm.guests.length > 1 && (
                              <button
                                onClick={() => handleRemoveGuest(index)}
                                className="remove-guest-button"
                                type="button"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={guest.fullName}
                              onChange={e =>
                                handleGuestChange(
                                  index,
                                  'fullName',
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Meal Preference (e.g., Chicken, Vegetarian, Fish)"
                              value={guest.mealPreference}
                              onChange={e =>
                                handleGuestChange(
                                  index,
                                  'mealPreference',
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>

                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Allergies/Dietary Restrictions (optional)"
                              value={guest.allergies || ''}
                              onChange={e =>
                                handleGuestChange(
                                  index,
                                  'allergies',
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="edit-section">
                      <label className="form-label">
                        <strong>Additional Notes:</strong>
                        <textarea
                          value={editForm.additionalNotes}
                          onChange={e =>
                            setEditForm({
                              ...editForm,
                              additionalNotes: e.target.value,
                            })
                          }
                          placeholder="Any special requests or notes..."
                          className="form-textarea"
                          rows={3}
                        />
                      </label>
                    </div>
                  </>
                )}

                <div className="edit-actions">
                  <button
                    onClick={() => handleSaveRSVP(guest._id)}
                    disabled={isSaving}
                    className="save-button"
                  >
                    {isSaving ? 'Saving...' : 'Save RSVP'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  {guest.hasRSVPed && (
                    <button
                      onClick={() => handleDeleteRSVP(guest._id)}
                      disabled={isSaving}
                      className="delete-button"
                    >
                      Delete RSVP
                    </button>
                  )}
                </div>

                <div className="edit-section user-settings">
                  <h4>User Settings</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={guest.isInvited}
                      onChange={e =>
                        handleUpdateUser(guest._id, {
                          isInvited: e.target.checked,
                        })
                      }
                      disabled={isSaving}
                    />
                    <span>Invited to Wedding</span>
                  </label>
                </div>
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

      {/* Add New Guest Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Guest</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="new-guest-name">Full Name *</label>
                <input
                  id="new-guest-name"
                  type="text"
                  value={newGuestForm.fullName}
                  onChange={e =>
                    setNewGuestForm({
                      ...newGuestForm,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  className="form-input"
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-guest-email">Email *</label>
                <input
                  id="new-guest-email"
                  type="email"
                  value={newGuestForm.email}
                  onChange={e =>
                    setNewGuestForm({ ...newGuestForm, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="form-input"
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newGuestForm.isInvited}
                    onChange={e =>
                      setNewGuestForm({
                        ...newGuestForm,
                        isInvited: e.target.checked,
                      })
                    }
                    disabled={isSaving}
                  />
                  <span>Invited to Wedding</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAddModal(false)}
                className="cancel-button"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewGuest}
                className="save-button"
                disabled={isSaving}
              >
                {isSaving ? 'Adding...' : 'Add Guest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRSVPManager;
