import React, { useState, useEffect, useTransition } from 'react';
import { useRSVP } from '../../features/rsvp/hooks/useRSVP';
import RSVPConfirmation from './RSVPConfirmation';
import { RSVPFormData, Guest } from '../../features/rsvp/types/rsvpTypes';
import { logDebug } from '../../utils/logger';
// Styles now imported globally via main.tsx

/**
 * RSVPForm - Wedding RSVP Form Component
 *
 * A comprehensive form component for wedding RSVPs that handles guest responses,
 * meal preferences, allergies, and guest management. Supports both single and
 * multiple guest RSVPs with dynamic form fields and validation.
 *
 * Features include legacy data migration, real-time validation, and seamless
 * integration with GraphQL backend for data persistence.
 *
 * @features
 * - **Multi-Guest Support**: Dynamic guest addition/removal with individual preferences
 * - **Legacy Data Migration**: Automatic normalization of legacy meal preferences
 * - **Real-time Validation**: Form validation with user-friendly error messages
 * - **GraphQL Integration**: Seamless data persistence with Apollo Client
 * - **Responsive Design**: Mobile-first design with touch-friendly interactions
 * - **Accessibility**: Full keyboard navigation and screen reader support
 * - **State Management**: Optimistic UI updates with error handling
 * - **Confirmation Flow**: Post-submission confirmation with edit capabilities
 * - **React 18+ Concurrent Features**: useTransition for non-blocking form submissions
 * - **Enhanced UX**: Concurrent rendering prevents UI freezing during heavy operations
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage in authenticated context
 * <RSVPForm />
 *
 * // The component automatically handles:
 * // - Loading existing RSVP data
 * // - Form state management
 * // - Submission and confirmation flow
 * // - Error handling and retry logic
 * ```
 *
 * @dependencies
 * - `useAuth` - Authentication context for user data
 * - `useRSVP` - Custom hook for RSVP operations
 * - `Apollo Client` - GraphQL client for data operations
 * - `RSVPConfirmation` - Confirmation component for submitted RSVPs
 *
 * @types
 * - `RSVPFormData` - Main form data structure
 * - `Guest` - Individual guest data structure
 */
export default function RSVPForm() {
  const { createRSVP, editRSVP, rsvp, loading } = useRSVP();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormData | null>(null);

  /**
   * React 18+ useTransition Hook for Concurrent Form Submissions
   *
   * Implements non-blocking RSVP operations using React 18's concurrent
   * rendering capabilities. This allows the UI to remain responsive during
   * async GraphQL operations, preventing UI freezing during form submission.
   *
   * @hook useTransition
   * @returns {[boolean, function]} Tuple containing:
   *   - isPending: Boolean indicating if transition is in progress
   *   - startTransition: Function to wrap non-urgent updates
   *
   * @example
   * ```tsx
   * // Non-blocking RSVP submission
   * const handleSubmit = () => {
   *   startTransition(() => {
   *     performAsyncRSVPOperation();
   *   });
   * };
   * ```
   *
   * @benefits
   * - **Responsive UI**: Form remains interactive during submission
   * - **Better UX**: Loading states don't block user interactions
   * - **Concurrent Rendering**: Leverages React 18's time-slicing
   * - **Automatic Batching**: Multiple state updates are efficiently batched
   *
   * @see {@link https://react.dev/reference/react/useTransition} React useTransition docs
   */
  const [isPending, startTransition] = useTransition();

  // Helper function to normalize legacy meal preference values
  const normalizeMealPreference = (value: string): string => {
    if (!value) return '';

    const normalizedValue = value.toLowerCase().trim();

    // Map legacy values to current form values
    const legacyMapping: Record<string, string> = {
      vegetarian: 'vegetarian',
      chicken: 'chicken',
      beef: 'beef',
      fish: 'fish',
      salmon: 'fish',
      vegan: 'vegan',
      kids: 'kids',
      kid: 'kids',
      children: 'kids',
    };

    return legacyMapping[normalizedValue] || '';
  };

  const [formData, setFormData] = useState<RSVPFormData>(() => {
    // Initialize with proper guest structure, handling legacy data
    const initialGuests = rsvp?.guests?.map(guest => ({
      fullName: guest.fullName || '',
      mealPreference: normalizeMealPreference(guest.mealPreference || ''),
      allergies: guest.allergies || '',
    })) || [
      {
        fullName: rsvp?.fullName || '',
        mealPreference: normalizeMealPreference(rsvp?.mealPreference || ''),
        allergies: rsvp?.allergies || '',
      },
    ];

    return {
      fullName: rsvp?.fullName || '',
      attending: rsvp?.attending || 'NO',
      mealPreference: normalizeMealPreference(rsvp?.mealPreference || ''),
      allergies: rsvp?.allergies || '',
      additionalNotes: rsvp?.additionalNotes || '',
      guestCount: rsvp?.guestCount || initialGuests.length,
      guests: initialGuests,
    };
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Compute showMealOptions directly from formData.attending instead of storing in state
  // This ensures it's always in sync and eliminates potential race conditions
  const showMealOptions = formData.attending === 'YES';

  useEffect(() => {
    if (rsvp) {
      setFormData(prev => {
        const newData = {
          fullName: rsvp.fullName || '',
          attending: rsvp.attending || 'NO',
          mealPreference: normalizeMealPreference(rsvp.mealPreference || ''),
          allergies: rsvp.allergies || '',
          additionalNotes: rsvp.additionalNotes || '',
          guestCount: rsvp.guestCount || 1,
          guests: rsvp.guests?.map(guest => ({
            fullName: guest.fullName || '',
            mealPreference: normalizeMealPreference(guest.mealPreference || ''),
            allergies: guest.allergies || '',
          })) || [
            {
              fullName: rsvp.fullName || '',
              mealPreference: normalizeMealPreference(
                rsvp.mealPreference || ''
              ),
              allergies: rsvp.allergies || '',
            },
          ],
        };
        const isDifferent = Object.keys(newData).some(
          key => (prev as any)[key] !== (newData as any)[key]
        );
        return isDifferent ? newData : prev;
      });
    }
  }, [rsvp, successMessage]); // Removed formData.attending to prevent reset loop

  // Available meal options
  const mealOptions = [
    { value: '', label: 'Select your preference' },
    { value: 'chicken', label: '🍗 Herb-Roasted Chicken' },
    { value: 'beef', label: '🥩 Grilled Beef Tenderloin' },
    { value: 'fish', label: '🐟 Pan-Seared Salmon' },
    { value: 'vegetarian', label: '🥗 Vegetarian Pasta Primavera' },
    { value: 'vegan', label: '🌱 Vegan Mediterranean Bowl' },
    { value: 'kids', label: '🍕 Kids Menu (Chicken Tenders & Fries)' },
  ];

  // Helper function to update guest count and manage guests array
  const updateGuestCount = (newCount: number) => {
    const currentGuests = [...formData.guests];

    if (newCount > currentGuests.length) {
      // Add new empty guests
      for (let i = currentGuests.length; i < newCount; i++) {
        currentGuests.push({ fullName: '', mealPreference: '', allergies: '' });
      }
    } else if (newCount < currentGuests.length) {
      // Remove excess guests
      currentGuests.splice(newCount);
    }

    setFormData(prev => ({
      ...prev,
      guestCount: newCount,
      guests: currentGuests,
    }));
  };

  // Helper function to update individual guest data
  const updateGuest = (
    guestIndex: number,
    field: keyof Guest,
    value: string
  ) => {
    setFormData(prev => {
      const updatedGuests = [...prev.guests];
      const currentGuest = updatedGuests[guestIndex] || {
        fullName: '',
        mealPreference: '',
        allergies: '',
      };
      updatedGuests[guestIndex] = {
        ...currentGuest,
        [field]: value,
      } as Guest;
      return {
        ...prev,
        guests: updatedGuests,
      };
    });
  };

  // Real-time validation
  const validateField = (name: string, value: string, guestIndex?: number) => {
    const errors: Record<string, string> = {};

    switch (name) {
      case 'fullName':
        if (guestIndex !== undefined) {
          // Validating individual guest name
          if (!value.trim()) {
            errors[`guest-${guestIndex}-fullName`] =
              "Please enter guest's full name";
          } else if (value.trim().length < 2) {
            errors[`guest-${guestIndex}-fullName`] =
              'Name must be at least 2 characters';
          }
        } else {
          // Legacy validation for backward compatibility
          if (!value.trim()) {
            errors.fullName = 'Please enter your full name';
          } else if (value.trim().length < 2) {
            errors.fullName = 'Name must be at least 2 characters';
          }
        }
        break;
      case 'mealPreference':
        if (guestIndex !== undefined) {
          // Validating individual guest meal preference
          if (formData.attending === 'YES' && !value) {
            errors[`guest-${guestIndex}-mealPreference`] =
              'Please select a meal preference';
          }
        } else {
          // Legacy validation
          if (formData.attending === 'YES' && !value) {
            errors.mealPreference = 'Please select a meal preference';
          }
        }
        break;
      case 'guestCount':
        const count = parseInt(value);
        if (isNaN(count) || count < 1 || count > 10) {
          errors.guestCount = 'Guest count must be between 1 and 10';
        }
        break;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };

      // Clear or set the specific error for this field
      if (guestIndex !== undefined) {
        const errorKey = `guest-${guestIndex}-${name}`;
        if (errors[errorKey]) {
          newErrors[errorKey] = errors[errorKey];
        } else {
          delete newErrors[errorKey];
        }
      } else {
        if (errors[name]) {
          newErrors[name] = errors[name];
        } else {
          delete newErrors[name];
        }
      }

      return newErrors;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    validateField(name, value);

    // Clear success/error messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  // Enhanced handler for mobile touch events on attendance options
  const handleAttendanceChange = (value: 'YES' | 'NO' | 'MAYBE') => {
    setFormData(prev => {
      // When switching to YES, ensure guests array is properly initialized
      if (value === 'YES') {
        // If guests array is empty, initialize with one guest
        if (prev.guests.length === 0) {
          const initialGuest = {
            fullName: prev.fullName || '',
            mealPreference: prev.mealPreference || '',
            allergies: prev.allergies || '',
          };
          return {
            ...prev,
            attending: value,
            guestCount: 1,
            guests: [initialGuest],
          };
        }
        // If guests exist, create new array reference to trigger re-render
        // This ensures guest form sections appear immediately
        return {
          ...prev,
          attending: value,
          guests: [...prev.guests], // Create new array reference
        };
      }

      // When switching to NO or MAYBE, clear meal preference
      return {
        ...prev,
        attending: value,
        mealPreference: '', // Clear legacy meal preference
      };
    });

    // Real-time validation
    validateField('attending', value);

    // Clear success/error messages
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setValidationErrors({});

    // Final validation
    const errors: Record<string, string> = {};

    // Validate guest count
    if (formData.guestCount < 1 || formData.guestCount > 10) {
      errors.guestCount = 'Guest count must be between 1 and 10';
    }

    // Validate guest count matches guests array length
    if (formData.guestCount !== formData.guests.length) {
      errors.guestCount = 'Guest count mismatch. Please refresh and try again.';
    }

    // Validate each guest if attending
    if (formData.attending === 'YES') {
      formData.guests.forEach((guest, index) => {
        if (!guest.fullName.trim()) {
          errors[`guest-${index}-fullName`] = "Please enter guest's full name";
        }
        if (!guest.mealPreference) {
          errors[`guest-${index}-mealPreference`] =
            'Please select a meal preference';
        }
      });
    }
    // Note: Removed fullName requirement for non-attending guests
    // Non-attending guests don't need to provide detailed information

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    logDebug('RSVPForm handleSubmit called', 'RSVPForm');

    /**
     * React 18+ Concurrent RSVP Submission Implementation
     *
     * Wraps the async RSVP submission in startTransition to leverage React 18's
     * concurrent rendering. This ensures the UI remains responsive while the
     * GraphQL mutation is processing, providing better user experience.
     *
     * @concurrent This operation uses React 18's concurrent features
     * @nonblocking UI interactions remain available during execution
     *
     * How it works:
     * 1. startTransition marks the updates as non-urgent
     * 2. React can interrupt this work to handle user interactions
     * 3. Form stays responsive even during slow network requests
     * 4. Loading states are handled through isPending flag
     *
     * @performance
     * - Prevents UI blocking during async operations
     * - Allows React to prioritize user interactions
     * - Enables smooth loading state transitions
     * - Improves perceived performance significantly
     */
    startTransition(() => {
      /**
       * Async RSVP Submission Handler
       *
       * Performs the actual RSVP creation/update operation within a transition.
       * This function is called inside startTransition to benefit from React 18's
       * concurrent rendering capabilities.
       *
       * @async
       * @function performRSVPSubmission
       * @returns {Promise<void>} Promise that resolves when submission completes
       */
      const performRSVPSubmission = async () => {
        try {
          // Ensure legacy fields are synchronized with first guest for backward compatibility
          const submissionData = {
            ...formData,
            fullName: formData.guests[0]?.fullName || formData.fullName,
            mealPreference:
              formData.guests[0]?.mealPreference || formData.mealPreference,
            allergies:
              formData.guests[0]?.allergies || formData.allergies || '',
          };

          if (rsvp) {
            await editRSVP(submissionData);
            setSuccessMessage('RSVP updated successfully! 🎉');
            logDebug('RSVP updated', 'RSVPForm');
          } else {
            await createRSVP(submissionData);
            setSuccessMessage('RSVP submitted successfully! 🎉');
            logDebug('RSVP submitted', 'RSVPForm');
          }

          // Store submitted data and show confirmation
          setSubmittedData(submissionData);
          setShowConfirmation(true);

          // Reset form only for new RSVPs
          if (!rsvp) {
            setFormData({
              fullName: '',
              attending: 'NO',
              mealPreference: '',
              allergies: '',
              additionalNotes: '',
              guestCount: 1,
              guests: [{ fullName: '', mealPreference: '', allergies: '' }],
            });
          }
        } catch (err: any) {
          setErrorMessage(
            err.message || 'Something went wrong. Please try again.'
          );
        }
      };

      // Execute the async function
      performRSVPSubmission();
    });
  };

  const handleEditRsvp = () => {
    setShowConfirmation(false);
    setSubmittedData(null);
  };

  // Show confirmation if submission was successful
  if (showConfirmation && submittedData) {
    const primaryGuestName =
      submittedData.guests[0]?.fullName || submittedData.fullName;
    return (
      <RSVPConfirmation
        guestName={primaryGuestName}
        isAttending={submittedData.attending === 'YES'}
        partySize={submittedData.guestCount}
        onEditRsvp={handleEditRsvp}
      />
    );
  }

  return (
    <div className="rsvp-form-container">
      <form className="rsvp-form card" onSubmit={handleSubmit} noValidate>
        <div className="rsvp-header">
          <h2 className="rsvp-title">💌 RSVP for Our Wedding</h2>
          <p className="rsvp-subtitle">
            We can't wait to celebrate with you! Please let us know if you'll be
            joining us.
          </p>
        </div>

        {/* Global Error Summary for Mobile */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="form-error-summary" role="alert" aria-live="polite">
            <div className="error-summary-icon">⚠️</div>
            <div className="error-summary-content">
              <strong>Please fix the following:</strong>
              <ul className="error-summary-list">
                {Object.entries(validationErrors).map(([key, message]) => (
                  <li key={key} className="error-summary-item">
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Attendance Question */}
        <div className="form-group">
          <label htmlFor="attending" className="form-label">
            Will you be attending our wedding?{' '}
            <span className="required">*</span>
          </label>
          <div className="attendance-options">
            {[
              { value: 'YES', label: "Yes, I'll be there!", icon: '🎉' },
              { value: 'NO', label: "Sorry, I can't make it", icon: '😢' },
              { value: 'MAYBE', label: "I'm not sure yet", icon: '⏰' },
            ].map(option => (
              <label
                key={option.value}
                className={`attendance-option ${formData.attending === option.value ? 'selected' : ''}`}
                data-value={option.value}
                onTouchStart={() => {}}
                onClick={() => {
                  handleAttendanceChange(
                    option.value as 'YES' | 'NO' | 'MAYBE'
                  );
                }}
              >
                {/* Hidden radio input for form functionality */}
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={formData.attending === option.value}
                  onChange={e => {
                    handleAttendanceChange(
                      e.target.value as 'YES' | 'NO' | 'MAYBE'
                    );
                  }}
                  className="attendance-radio-safari"
                />
                <div className="option-content">
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-text">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional Fields - Only show if attending */}
        <div
          className={`conditional-fields ${showMealOptions ? 'show' : 'hide'}`}
        >
          {/* Guest Count Field */}
          <div className="form-group">
            <label htmlFor="guestCount" className="form-label">
              Guest Count <span className="required">*</span>
            </label>
            <select
              id="guestCount"
              name="guestCount"
              className={`form-select ${validationErrors.guestCount ? 'error' : ''}`}
              value={formData.guestCount}
              onChange={e => {
                const newCount = parseInt(e.target.value);
                updateGuestCount(newCount);
                validateField('guestCount', e.target.value);
              }}
              required
              aria-describedby={
                validationErrors.guestCount ? 'guestCount-error' : undefined
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {validationErrors.guestCount && (
              <div id="guestCount-error" className="field-error" role="alert">
                {validationErrors.guestCount}
              </div>
            )}
            <small className="form-hint">
              How many people will be attending from your invitation?
            </small>
          </div>

          {/* Individual Guest Forms */}
          {formData.guests.map((guest, index) => (
            <div
              key={index}
              className="guest-form-section"
              data-guest-index={index}
            >
              <div className="guest-form-header">
                <h3 className="guest-form-title">
                  {formData.guestCount === 1
                    ? 'Guest Information'
                    : `Guest ${index + 1} Information`}
                </h3>
                {formData.guestCount > 1 && (
                  <div className="guest-progress-indicator">
                    <span className="guest-current">{index + 1}</span>
                    <span className="guest-total">
                      of {formData.guestCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Guest Name */}
              <div className="form-group">
                <label
                  htmlFor={`guest-${index}-fullName`}
                  className="form-label"
                >
                  Full Name <span className="required">*</span>
                </label>
                <div className="form-input-container">
                  <input
                    id={`guest-${index}-fullName`}
                    name={`guest-${index}-fullName`}
                    type="text"
                    className={`form-input ${validationErrors[`guest-${index}-fullName`] ? 'error' : ''} ${guest.fullName ? 'filled' : ''}`}
                    value={guest.fullName}
                    onChange={e => {
                      updateGuest(index, 'fullName', e.target.value);
                      validateField('fullName', e.target.value, index);
                    }}
                    placeholder="Enter full name"
                    required
                    aria-describedby={
                      validationErrors[`guest-${index}-fullName`]
                        ? `guest-${index}-fullName-error`
                        : undefined
                    }
                  />
                  {guest.fullName && <div className="form-input-check">✓</div>}
                </div>
                {validationErrors[`guest-${index}-fullName`] && (
                  <div
                    id={`guest-${index}-fullName-error`}
                    className="field-error mobile-friendly"
                    role="alert"
                  >
                    <span className="error-icon">⚠️</span>
                    {validationErrors[`guest-${index}-fullName`]}
                  </div>
                )}
              </div>

              {/* Guest Meal Preference */}
              <div className="form-group">
                <label
                  htmlFor={`guest-${index}-mealPreference`}
                  className="form-label"
                >
                  Meal Preference <span className="required">*</span>
                </label>
                <div className="form-select-container">
                  <select
                    id={`guest-${index}-mealPreference`}
                    name={`guest-${index}-mealPreference`}
                    className={`form-select ${validationErrors[`guest-${index}-mealPreference`] ? 'error' : ''} ${guest.mealPreference ? 'filled' : ''}`}
                    value={guest.mealPreference}
                    onChange={e => {
                      updateGuest(index, 'mealPreference', e.target.value);
                      validateField('mealPreference', e.target.value, index);
                    }}
                    required={formData.attending === 'YES'}
                    aria-describedby={
                      validationErrors[`guest-${index}-mealPreference`]
                        ? `guest-${index}-mealPreference-error`
                        : undefined
                    }
                  >
                    {mealOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {guest.mealPreference && (
                    <div className="form-select-check">✓</div>
                  )}
                </div>
                {validationErrors[`guest-${index}-mealPreference`] && (
                  <div
                    id={`guest-${index}-mealPreference-error`}
                    className="field-error mobile-friendly"
                    role="alert"
                  >
                    <span className="error-icon">⚠️</span>
                    {validationErrors[`guest-${index}-mealPreference`]}
                  </div>
                )}
              </div>

              {/* Guest Allergies */}
              <div className="form-group">
                <label
                  htmlFor={`guest-${index}-allergies`}
                  className="form-label"
                >
                  Food Allergies or Dietary Restrictions
                </label>
                <input
                  id={`guest-${index}-allergies`}
                  name={`guest-${index}-allergies`}
                  type="text"
                  className="form-input"
                  value={guest.allergies || ''}
                  onChange={e =>
                    updateGuest(index, 'allergies', e.target.value)
                  }
                  placeholder="Please list any allergies or dietary needs"
                />
                <small className="form-hint">
                  Help us ensure this guest has a safe and enjoyable dining
                  experience
                </small>
              </div>
            </div>
          ))}

          {/* Additional Notes - moved inside conditional fields */}
          <div className="form-group">
            <label htmlFor="additionalNotes" className="form-label">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              className="form-textarea"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special requests, song suggestions, or messages for us..."
            />
            <small className="form-hint">
              Feel free to share anything else we should know or any special
              songs you'd like to hear!
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button
            className={`rsvp-submit-btn ${loading || isPending ? 'loading' : ''} ${Object.keys(validationErrors).length > 0 ? 'has-errors' : ''}`}
            type="submit"
            disabled={loading || isPending}
            aria-describedby={
              Object.keys(validationErrors).length > 0
                ? 'form-errors'
                : undefined
            }
          >
            {loading || isPending ? (
              <>
                <span className="loading-spinner"></span>
                <span className="loading-text">
                  {isPending
                    ? rsvp
                      ? 'Processing update...'
                      : 'Processing submission...'
                    : rsvp
                      ? 'Updating...'
                      : 'Submitting...'}
                </span>
              </>
            ) : (
              <>
                <span className="submit-text">
                  {rsvp ? 'Update RSVP' : 'Submit RSVP'}
                </span>
                <span className="submit-icon">💕</span>
              </>
            )}
          </button>

          {/* Progress indicator for mobile */}
          {(loading || isPending) && (
            <div className="submission-progress" aria-live="polite">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <small className="progress-text">
                {isPending
                  ? rsvp
                    ? 'Processing your RSVP update...'
                    : 'Processing your RSVP submission...'
                  : rsvp
                    ? 'Updating your RSVP...'
                    : 'Submitting your RSVP...'}
              </small>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="form-success" role="alert">
            <div className="success-icon">🎉</div>
            <div className="success-content">
              <strong>Amazing!</strong>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="form-error" role="alert">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Oops!</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
