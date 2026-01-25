import React, { useState, useEffect } from 'react';
import { User, GuestGroup } from '../../models/userTypes';
import './GuestPersonalizationModal.css';

interface GuestPersonalizationModalProps {
  user: User;
  onClose: () => void;
  onSave: (
    userId: string,
    personalization: {
      email?: string;
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: GuestGroup;
      plusOneAllowed?: boolean;
      personalPhoto?: string;
      specialInstructions?: string;
      dietaryRestrictions?: string;
      streetAddress?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
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
    email: user.email || '',
    relationshipToBride: user.relationshipToBride || '',
    relationshipToGroom: user.relationshipToGroom || '',
    customWelcomeMessage: user.customWelcomeMessage || '',
    guestGroup: user.guestGroup || ('' as GuestGroup | ''),
    plusOneAllowed: user.plusOneAllowed || false,
    plusOneName: user.plusOneName || '',
    personalPhoto: user.personalPhoto || '',
    specialInstructions: user.specialInstructions || '',
    dietaryRestrictions: user.dietaryRestrictions || '',
    streetAddress: user.streetAddress || '',
    addressLine2: user.addressLine2 || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    country: user.country || '',
  });

  const [charCount, setCharCount] = useState({
    email: user.email?.length || 0,
    relationshipToBride: user.relationshipToBride?.length || 0,
    relationshipToGroom: user.relationshipToGroom?.length || 0,
    customWelcomeMessage: user.customWelcomeMessage?.length || 0,
    plusOneName: user.plusOneName?.length || 0,
    personalPhoto: user.personalPhoto?.length || 0,
    specialInstructions: user.specialInstructions?.length || 0,
    dietaryRestrictions: user.dietaryRestrictions?.length || 0,
    streetAddress: user.streetAddress?.length || 0,
    addressLine2: user.addressLine2?.length || 0,
    city: user.city?.length || 0,
    state: user.state?.length || 0,
    zipCode: user.zipCode?.length || 0,
    country: user.country?.length || 0,
  });

  useEffect(() => {
    // Update character counts
    setCharCount({
      email: formData.email.length,
      relationshipToBride: formData.relationshipToBride.length,
      relationshipToGroom: formData.relationshipToGroom.length,
      customWelcomeMessage: formData.customWelcomeMessage.length,
      plusOneName: formData.plusOneName.length,
      personalPhoto: formData.personalPhoto.length,
      specialInstructions: formData.specialInstructions.length,
      dietaryRestrictions: formData.dietaryRestrictions.length,
      streetAddress: formData.streetAddress.length,
      addressLine2: formData.addressLine2.length,
      city: formData.city.length,
      state: formData.state.length,
      zipCode: formData.zipCode.length,
      country: formData.country.length,
    });
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build personalization object with only defined values
    const personalization: {
      email?: string;
      relationshipToBride?: string;
      relationshipToGroom?: string;
      customWelcomeMessage?: string;
      guestGroup?: GuestGroup;
      plusOneAllowed?: boolean;
      plusOneName?: string;
      personalPhoto?: string;
      specialInstructions?: string;
      dietaryRestrictions?: string;
      streetAddress?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    } = {
      plusOneAllowed: formData.plusOneAllowed,
    };

    if (formData.email) {
      personalization.email = formData.email;
    }
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
    if (formData.plusOneName) {
      personalization.plusOneName = formData.plusOneName;
    }
    if (formData.personalPhoto) {
      personalization.personalPhoto = formData.personalPhoto;
    }
    if (formData.specialInstructions) {
      personalization.specialInstructions = formData.specialInstructions;
    }
    if (formData.dietaryRestrictions !== undefined) {
      personalization.dietaryRestrictions = formData.dietaryRestrictions;
    }
    // Address fields - use !== undefined to allow clearing
    if (formData.streetAddress !== undefined) {
      personalization.streetAddress = formData.streetAddress;
    }
    if (formData.addressLine2 !== undefined) {
      personalization.addressLine2 = formData.addressLine2;
    }
    if (formData.city !== undefined) {
      personalization.city = formData.city;
    }
    if (formData.state !== undefined) {
      personalization.state = formData.state;
    }
    if (formData.zipCode !== undefined) {
      personalization.zipCode = formData.zipCode;
    }
    if (formData.country !== undefined) {
      personalization.country = formData.country;
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

  // Handle keyboard events at document level to prevent space bar from closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape key
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Prevent space bar from closing modal when typing in input/textarea
      const target = e.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === ' ' && !isInputElement) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
            <h3>Contact Information</h3>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
                <span className="char-count">{charCount.email}/200</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                maxLength={200}
                placeholder="guest@example.com"
                className="form-input"
              />
              <small className="form-hint">
                Primary email address for QR code login and notifications
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Mailing Address</h3>

            <div className="form-group">
              <label htmlFor="streetAddress">
                Street Address
                <span className="char-count">
                  {charCount.streetAddress}/200
                </span>
              </label>
              <input
                type="text"
                id="streetAddress"
                value={formData.streetAddress}
                onChange={e =>
                  handleInputChange('streetAddress', e.target.value)
                }
                maxLength={200}
                placeholder="123 Main St"
                className="form-input"
              />
              <small className="form-hint">
                Physical mailing address for sending invitations
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="addressLine2">
                Address Line 2 (Optional)
                <span className="char-count">{charCount.addressLine2}/100</span>
              </label>
              <input
                type="text"
                id="addressLine2"
                value={formData.addressLine2}
                onChange={e =>
                  handleInputChange('addressLine2', e.target.value)
                }
                maxLength={100}
                placeholder="Apt, Suite, Unit"
                className="form-input"
              />
            </div>

            <div
              className="form-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label htmlFor="city">
                  City
                  <span className="char-count">{charCount.city}/100</span>
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  maxLength={100}
                  placeholder="City"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State/Province
                  <span className="char-count">{charCount.state}/50</span>
                </label>
                <input
                  type="text"
                  id="state"
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  maxLength={50}
                  placeholder="State"
                  className="form-input"
                />
              </div>
            </div>

            <div
              className="form-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label htmlFor="zipCode">
                  Zip/Postal Code
                  <span className="char-count">{charCount.zipCode}/20</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={e => handleInputChange('zipCode', e.target.value)}
                  maxLength={20}
                  placeholder="Zip Code"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  Country
                  <span className="char-count">{charCount.country}/100</span>
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={e => handleInputChange('country', e.target.value)}
                  maxLength={100}
                  placeholder="Country"
                  className="form-input"
                />
              </div>
            </div>
          </div>

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

            {formData.plusOneAllowed && (
              <div className="form-group">
                <label htmlFor="plusOneName">
                  Plus-One Guest Name (Optional)
                  <span className="char-count">
                    {charCount.plusOneName}/100
                  </span>
                </label>
                <input
                  type="text"
                  id="plusOneName"
                  value={formData.plusOneName}
                  onChange={e =>
                    handleInputChange('plusOneName', e.target.value)
                  }
                  maxLength={100}
                  placeholder="e.g., Jane Smith"
                  className="form-input"
                />
                <small className="form-hint">
                  If you know the plus-one's name in advance, it will be
                  pre-filled in the RSVP form
                </small>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Custom Welcome Message</h3>

            <div className="form-group">
              <label htmlFor="customWelcomeMessage">
                Personalized Message
                <span className="char-count">
                  {charCount.customWelcomeMessage}/1000
                </span>
              </label>
              <textarea
                id="customWelcomeMessage"
                value={formData.customWelcomeMessage}
                onChange={e =>
                  handleInputChange('customWelcomeMessage', e.target.value)
                }
                maxLength={1000}
                rows={4}
                placeholder="e.g., We're so excited to have you celebrate with us! Your friendship has meant the world to us over the years."
                className="form-textarea"
              />
              <small className="form-hint">
                <strong>Priority:</strong> Custom message overrides relationship
                and group-based greetings
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="personalPhoto">
                Personal Photo URL
                <span className="char-count">
                  {charCount.personalPhoto}/500
                </span>
              </label>
              <input
                type="url"
                id="personalPhoto"
                value={formData.personalPhoto}
                onChange={e =>
                  handleInputChange('personalPhoto', e.target.value)
                }
                maxLength={500}
                placeholder="https://example.com/photo.jpg"
                className="form-input"
              />
              <small className="form-hint">
                Optional: Guest's personal photo URL to display in welcome modal
                (defaults to couple photo if not set)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="specialInstructions">
                Special Instructions
                <span className="char-count">
                  {charCount.specialInstructions}/500
                </span>
              </label>
              <textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={e =>
                  handleInputChange('specialInstructions', e.target.value)
                }
                maxLength={500}
                rows={4}
                placeholder="e.g., Hotel block at Marriott downtown. Shuttle service available from hotel to venue. Check-in starts at 3pm."
                className="form-textarea"
              />
              <small className="form-hint">
                Travel info, accommodation details, parking, or other important
                guest-specific information
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="dietaryRestrictions">
                Dietary Restrictions
                <span className="char-count">
                  {charCount.dietaryRestrictions}/500
                </span>
              </label>
              <textarea
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={e =>
                  handleInputChange('dietaryRestrictions', e.target.value)
                }
                maxLength={500}
                rows={3}
                placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
                className="form-textarea"
              />
              <small className="form-hint">
                Known dietary restrictions or preferences to pre-populate in
                RSVP form
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
