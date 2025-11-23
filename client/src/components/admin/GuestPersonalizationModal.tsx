import React, { useState, useEffect } from 'react';
import { User, GuestGroup } from '../../models/userTypes';
import './GuestPersonalizationModal.css';

interface GuestPersonalizationModalProps {
  user: User;
  onClose: () => void;
  onSave: (
    userId: string,
    personalization: {
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: GuestGroup;
      plusOneAllowed?: boolean;
    }
  ) => Promise<void>;
  isSaving: boolean;
}

/**
 * Guest Personalization Modal - Edit personalization fields for a specific guest.
 */
const GuestPersonalizationModal: React.FC<GuestPersonalizationModalProps> = ({
  user,
  onClose,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    relationshipToBride: user.relationshipToBride || '',
    relationshipToGroom: user.relationshipToGroom || '',
    customWelcomeMessage: user.customWelcomeMessage || '',
    guestGroup: user.guestGroup || ('' as GuestGroup | ''),
    plusOneAllowed: user.plusOneAllowed || false,
  });

  const [charCount, setCharCount] = useState({
    relationshipToBride: user.relationshipToBride?.length || 0,
    relationshipToGroom: user.relationshipToGroom?.length || 0,
    customWelcomeMessage: user.customWelcomeMessage?.length || 0,
  });

  useEffect(() => {
    // Update character counts
    setCharCount({
      relationshipToBride: formData.relationshipToBride.length,
      relationshipToGroom: formData.relationshipToGroom.length,
      customWelcomeMessage: formData.customWelcomeMessage.length,
    });
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build personalization object with only defined values
    const personalization: {
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: GuestGroup;
      plusOneAllowed?: boolean;
    } = {
      plusOneAllowed: formData.plusOneAllowed,
    };

    if (formData.relationshipToBride) {
      personalization.relationshipToBride = formData.relationshipToBride;
    }
    if (formData.relationshipToGroom) {
      personalization.relationshipToGroom = formData.relationshipToGroom;
    }
    if (formData.customWelcomeMessage) {
      personalization.customWelcomeMessage = formData.customWelcomeMessage;
    }
    if (formData.guestGroup) {
      personalization.guestGroup = formData.guestGroup as GuestGroup;
    }

    await onSave(user._id, personalization);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Personalization</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-guest-info">
          <p className="guest-name">{user.fullName}</p>
          <p className="guest-email">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="personalization-form">
          <div className="form-section">
            <h3>Relationships</h3>

            <div className="form-group">
              <label htmlFor="relationshipToBride">
                Relationship to Bride
                <span className="char-count">
                  {charCount.relationshipToBride}/100
                </span>
              </label>
              <input
                type="text"
                id="relationshipToBride"
                value={formData.relationshipToBride}
                onChange={e =>
                  handleInputChange('relationshipToBride', e.target.value)
                }
                maxLength={100}
                placeholder="e.g., Sister, Best friend, College roommate"
                className="form-input"
              />
              <small className="form-hint">
                This will be used for personalized greetings
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="relationshipToGroom">
                Relationship to Groom
                <span className="char-count">
                  {charCount.relationshipToGroom}/100
                </span>
              </label>
              <input
                type="text"
                id="relationshipToGroom"
                value={formData.relationshipToGroom}
                onChange={e =>
                  handleInputChange('relationshipToGroom', e.target.value)
                }
                maxLength={100}
                placeholder="e.g., Brother, Cousin, Work colleague"
                className="form-input"
              />
              <small className="form-hint">
                This will be used for personalized greetings
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Guest Category</h3>

            <div className="form-group">
              <label htmlFor="guestGroup">Guest Group</label>
              <select
                id="guestGroup"
                value={formData.guestGroup}
                onChange={e => handleInputChange('guestGroup', e.target.value)}
                className="form-select"
              >
                <option value="">Not categorized</option>
                <option value="grooms_family">Groom's Family</option>
                <option value="brides_family">Bride's Family</option>
                <option value="friends">Friends</option>
                <option value="extended_family">Extended Family</option>
                <option value="other">Other</option>
              </select>
              <small className="form-hint">
                Used for group-based welcome messages and analytics
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.plusOneAllowed}
                  onChange={e =>
                    handleInputChange('plusOneAllowed', e.target.checked)
                  }
                  className="form-checkbox"
                />
                <span>Allow Plus-One</span>
              </label>
              <small className="form-hint">
                Guest will see a notification they can bring a guest
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Custom Welcome Message</h3>

            <div className="form-group">
              <label htmlFor="customWelcomeMessage">
                Personalized Message
                <span className="char-count">
                  {charCount.customWelcomeMessage}/500
                </span>
              </label>
              <textarea
                id="customWelcomeMessage"
                value={formData.customWelcomeMessage}
                onChange={e =>
                  handleInputChange('customWelcomeMessage', e.target.value)
                }
                maxLength={500}
                rows={4}
                placeholder="e.g., We're so excited to have you celebrate with us! Your friendship has meant the world to us over the years."
                className="form-textarea"
              />
              <small className="form-hint">
                <strong>Priority:</strong> Custom message overrides relationship
                and group-based greetings
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestPersonalizationModal;
