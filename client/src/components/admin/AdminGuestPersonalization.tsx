import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ADMIN_RSVPS,
  UPDATE_USER_PERSONALIZATION,
} from '../../api/adminQueries';
import GuestPersonalizationModal from './GuestPersonalizationModal';
import { User, GuestGroup } from '../../models/userTypes';
import './AdminGuestPersonalization.css';

interface AdminUser extends User {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  hasRSVPed?: boolean;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  customWelcomeMessage?: string;
  guestGroup?: GuestGroup;
  plusOneAllowed?: boolean;
  personalPhoto?: string;
  specialInstructions?: string;
}

/**
 * Admin Guest Personalization - Manage personalized greetings and guest categorization.
 * Allows admins to set relationships, custom messages, guest groups, and plus-one status.
 */
const AdminGuestPersonalization: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_RSVPS, {
    errorPolicy: 'all',
  });

  const [updatePersonalization, { loading: updating }] = useMutation(
    UPDATE_USER_PERSONALIZATION,
    {
      onCompleted: () => {
        refetch();
        setSelectedUser(null);
      },
      onError: error => {
        console.error('Failed to update personalization:', error);
        alert(`Error: ${error.message}`);
      },
    }
  );

  if (loading) {
    return (
      <div className="admin-personalization-loading">
        <div className="spinner" />
        <p>Loading guests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-personalization-error">
        <p>Error loading guests: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  const users: AdminUser[] = data?.adminGetAllRSVPs || [];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup =
      filterGroup === 'all' ||
      (filterGroup === 'has-personalization' &&
        (user.relationshipToBride ||
          user.relationshipToGroom ||
          user.customWelcomeMessage ||
          user.guestGroup ||
          user.plusOneAllowed)) ||
      (filterGroup === 'no-personalization' &&
        !user.relationshipToBride &&
        !user.relationshipToGroom &&
        !user.customWelcomeMessage &&
        !user.guestGroup &&
        !user.plusOneAllowed) ||
      user.guestGroup === filterGroup;

    return matchesSearch && matchesGroup;
  });

  const handleSavePersonalization = async (
    userId: string,
    personalization: {
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: GuestGroup;
      plusOneAllowed?: boolean;
      personalPhoto?: string;
      specialInstructions?: string;
    }
  ) => {
    await updatePersonalization({
      variables: {
        userId,
        input: personalization,
      },
    });
  };

  const getGuestGroupLabel = (group?: GuestGroup): string => {
    if (!group) {
      return 'Not set';
    }
    const labels: Record<GuestGroup, string> = {
      grooms_family: "Groom's Family",
      brides_family: "Bride's Family",
      friends: 'Friends',
      extended_family: 'Extended Family',
      other: 'Other',
    };
    return labels[group] || group;
  };

  return (
    <div className="admin-guest-personalization">
      <div className="personalization-header">
        <h2>Guest Personalization</h2>
        <p>
          Manage personalized welcome messages, relationships, and guest groups
        </p>
      </div>

      <div className="personalization-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <label htmlFor="group-filter">Filter by group:</label>
          <select
            id="group-filter"
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Guests ({users.length})</option>
            <option value="has-personalization">Has Personalization</option>
            <option value="no-personalization">No Personalization</option>
            <option value="grooms_family">Groom's Family</option>
            <option value="brides_family">Bride's Family</option>
            <option value="friends">Friends</option>
            <option value="extended_family">Extended Family</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="personalization-stats">
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.customWelcomeMessage).length}
          </span>
          <span className="stat-label">Custom Messages</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.guestGroup).length}
          </span>
          <span className="stat-label">Categorized</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.plusOneAllowed).length}
          </span>
          <span className="stat-label">Plus-Ones Allowed</span>
        </div>
      </div>

      <div className="guests-table-container">
        <table className="guests-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>RSVP Status</th>
              <th>Guest Group</th>
              <th>Relationship</th>
              <th>Plus-One</th>
              <th>Custom Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-results">
                  No guests found matching your filters
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id}>
                  <td className="guest-name">{user.fullName}</td>
                  <td className="guest-email">{user.email}</td>
                  <td>
                    <span
                      className={`rsvp-badge ${
                        user.hasRSVPed ? 'responded' : 'pending'
                      }`}
                    >
                      {user.hasRSVPed ? 'Responded' : 'Pending'}
                    </span>
                  </td>
                  <td>{getGuestGroupLabel(user.guestGroup)}</td>
                  <td className="relationship-cell">
                    {user.relationshipToBride && (
                      <div className="relationship-item">
                        👰 {user.relationshipToBride}
                      </div>
                    )}
                    {user.relationshipToGroom && (
                      <div className="relationship-item">
                        🤵 {user.relationshipToGroom}
                      </div>
                    )}
                    {!user.relationshipToBride && !user.relationshipToGroom && (
                      <span className="not-set">Not set</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`plus-one-badge ${
                        user.plusOneAllowed ? 'allowed' : 'not-allowed'
                      }`}
                    >
                      {user.plusOneAllowed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="custom-message-cell">
                    {user.customWelcomeMessage ? (
                      <span
                        className="has-message"
                        title={user.customWelcomeMessage}
                      >
                        ✓ Set
                      </span>
                    ) : (
                      <span className="not-set">None</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => setSelectedUser(user)}
                      disabled={updating}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <GuestPersonalizationModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSavePersonalization}
          isSaving={updating}
        />
      )}
    </div>
  );
};

export default AdminGuestPersonalization;
