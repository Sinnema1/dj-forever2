import React, { useState, useEffect, useTransition } from 'react';
import { useRSVP } from '../../features/rsvp/hooks/useRSVP';
import { useAuth } from '../../context/AuthContext';
import RSVPConfirmation from './RSVPConfirmation';
import MealPreferencesComingSoon from './MealPreferencesComingSoon';
import { RSVPFormData, Guest, GuestFormRow } from '../../features/rsvp/types/rsvpTypes';
import type { AttendanceStatus } from '../../features/rsvp/types/rsvpTypes';
import { logDebug } from '../../utils/logger';
import { features } from '../../config/features';
// Styles now imported globally via main.tsx

// Same character set as server validateName — keeps client and server in sync
const VALID_NAME_RE = /^[a-zA-Z\s\-']+$/;
function isValidGuestName(name: string): boolean {
  const t = name.trim();
  return t.length >= 2 && VALID_NAME_RE.test(t);
}

// Module-level helper — safe to call before component mounts
function normalizeMealPreference(value: string): string {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  const validValues = ['brisket', 'tritip', 'kids_chicken', 'kids_mac', 'dietary'];
  return validValues.includes(normalized) ? normalized : '';
}

/**
 * Internal form state. Guests carry a UI-only `attending: boolean` flag that
 * is stripped before the payload is sent to the API (AC 17/19).
 */
interface RsvpFormState {
  attending: AttendanceStatus;
  additionalNotes: string;
  guests: GuestFormRow[];
  // Legacy top-level fields — kept for API backward-compatibility; synced from
  // guests[0] at submit time.
  fullName: string;
  mealPreference: string;
  allergies: string;
}

/**
 * Build the guest rows for the initial/hydrated form state.
 *
 * Rules (per final ACs):
 * - No prior RSVP → all household rows attending: true  (AC 1)
 * - Prior RSVP YES/MAYBE → guests in rsvp.guests = true, absent household members = false  (AC 2/3)
 * - Prior RSVP NO → all rows attending: false  (AC 15)
 */
function buildGuestRows(
  rsvp: ReturnType<typeof useRSVP>['rsvp'],
  user: ReturnType<typeof useAuth>['user'],
): GuestFormRow[] {
  const normalize = (s: string) => s.toLowerCase().trim();

  if (rsvp) {
    if (rsvp.attending === 'NO') {
      // AC 15 — show all household rows, all unselected
      const rows: GuestFormRow[] = [
        {
          fullName: rsvp.fullName || user?.fullName || '',
          mealPreference: '',
          allergies: '',
          attending: false,
        },
      ];
      user?.householdMembers?.forEach(m => {
        const name = [m.firstName, m.lastName].filter(Boolean).join(' ');
        if (isValidGuestName(name)) rows.push({ fullName: name, mealPreference: '', allergies: '', attending: false });
      });
      return rows;
    }

    // Existing YES/MAYBE RSVP
    const rsvpGuestNames = new Set(
      (rsvp.guests?.length ? rsvp.guests : []).map(g => normalize(g.fullName || '')),
    );

    // RSVP guests → attending: true  (AC 2)
    const rows: GuestFormRow[] = (
      rsvp.guests?.length
        ? rsvp.guests
        : [{ fullName: rsvp.fullName || '', mealPreference: rsvp.mealPreference || '', allergies: rsvp.allergies || '' }]
    ).map(g => ({
      fullName: g.fullName || '',
      mealPreference: normalizeMealPreference(g.mealPreference || ''),
      allergies: g.allergies || '',
      attending: true,
    }));

    // Household members absent from RSVP → attending: false  (AC 3)
    user?.householdMembers?.forEach(m => {
      const name = [m.firstName, m.lastName].filter(Boolean).join(' ');
      if (isValidGuestName(name) && !rsvpGuestNames.has(normalize(name))) {
        rows.push({ fullName: name, mealPreference: '', allergies: '', attending: false });
      }
    });

    return rows;
  }

  // No prior RSVP — AC 1: all selected
  const rows: GuestFormRow[] = [
    {
      fullName: user?.fullName || '',
      mealPreference: '',
      allergies: user?.dietaryRestrictions || '',
      attending: true,
    },
  ];

  user?.householdMembers?.forEach(m => {
    const name = [m.firstName, m.lastName].filter(Boolean).join(' ');
    if (isValidGuestName(name)) rows.push({ fullName: name, mealPreference: '', allergies: '', attending: true });
  });

  // Plus-one slot (only when not already covered by a named household member)
  if (user?.plusOneAllowed && rows.length === (user?.householdMembers?.length || 0) + 1) {
    rows.push({ fullName: user?.plusOneName || '', mealPreference: '', allergies: '', attending: true });
  }

  return rows;
}

/**
 * RSVPForm — Wedding RSVP Form Component
 *
 * Supports per-person household attendance: every household member appears as
 * an individual row with its own attending toggle. Only selected rows are
 * included in the API payload; unselected rows are shown with a neutral hint.
 */
export default function RSVPForm() {
  const { createRSVP, editRSVP, rsvp, loading, mutationLoading, freshUser } = useRSVP();
  const { user: cachedUser } = useAuth();
  // Use fresh user data (network-only) to pick up household members added after login
  const user = freshUser ?? cachedUser;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormData | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<RsvpFormState>(() => ({
    attending: (rsvp?.attending || 'NO') as AttendanceStatus,
    mealPreference: normalizeMealPreference(rsvp?.mealPreference || ''),
    allergies: rsvp?.allergies || user?.dietaryRestrictions || '',
    additionalNotes: rsvp?.additionalNotes || '',
    fullName: rsvp?.fullName || '',
    guests: buildGuestRows(rsvp, user),
  }));

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Derived attending counts — used for live summary and submit validation
  const selectedCount = formData.guests.filter(g => g.attending).length;
  const totalCount = formData.guests.length;

  // Show guest rows for YES and MAYBE (AC 12 — MAYBE parity with YES)
  const showAttendingSection = formData.attending !== 'NO';

  // Hydration effect: re-run when RSVP data or fresh user arrives
  useEffect(() => {
    if (rsvp) {
      setFormData(() => ({
        attending: (rsvp.attending || 'NO') as AttendanceStatus,
        mealPreference: normalizeMealPreference(rsvp.mealPreference || ''),
        allergies: rsvp.allergies || '',
        additionalNotes: rsvp.additionalNotes || '',
        fullName: rsvp.fullName || '',
        guests: buildGuestRows(rsvp, user),
      }));
    }
  }, [rsvp, user]);

  // Available meal options
  const mealOptions = {
    placeholder: { value: '', label: 'Select your entree' },
    adult: [
      { value: 'brisket', label: 'BBQ Beef Brisket' },
      { value: 'tritip', label: 'Carved Tri Tip' },
    ],
    kids: [
      { value: 'kids_chicken', label: 'Chicken Tenders' },
      { value: 'kids_mac', label: 'Macaroni and Cheese' },
    ],
    other: [{ value: 'dietary', label: 'Dietary Accommodation' }],
  };

  // Toggle a single guest row's attending flag
  const toggleGuestAttending = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((g, i) => i === index ? { ...g, attending: !g.attending } : g),
    }));
    if (validationErrors.guestSelection) {
      setValidationErrors(prev => { const e = { ...prev }; delete e.guestSelection; return e; });
    }
  };

  // Update a single guest's string field
  const updateGuest = (guestIndex: number, field: keyof Guest, value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((g, i) => i === guestIndex ? { ...g, [field]: value } : g),
    }));
  };

  // Real-time validation (string fields only)
  const validateField = (name: string, value: string, guestIndex?: number) => {
    const errors: Record<string, string> = {};

    switch (name) {
      case 'fullName': {
        if (guestIndex !== undefined) {
          if (!value.trim()) errors[`guest-${guestIndex}-fullName`] = "Please enter guest's full name";
          else if (value.trim().length < 2) errors[`guest-${guestIndex}-fullName`] = 'Name must be at least 2 characters';
        }
        break;
      }
      case 'mealPreference': {
        if (guestIndex !== undefined && formData.attending === 'YES' && !value && features.mealPreferencesEnabled) {
          errors[`guest-${guestIndex}-mealPreference`] = 'Please select a meal preference';
        }
        break;
      }
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (guestIndex !== undefined) {
        const key = `guest-${guestIndex}-${name}`;
        errors[key] ? (newErrors[key] = errors[key]) : delete newErrors[key];
      } else {
        errors[name] ? (newErrors[name] = errors[name]) : delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  // Attendance toggle with AC 13 and AC 14 transitions
  const handleAttendanceChange = (value: 'YES' | 'NO' | 'MAYBE') => {
    setFormData(prev => {
      let guests = prev.guests;

      if (value === 'NO') {
        // AC 13: switching to NO — unselect everyone
        guests = guests.map(g => ({ ...g, attending: false }));
      } else if (prev.attending === 'NO') {
        // AC 14: switching from NO — if nobody is selected, auto-select primary
        const anySelected = guests.some(g => g.attending);
        if (!anySelected) {
          guests = guests.map((g, i) => i === 0 ? { ...g, attending: true } : g);
        }
      }

      return {
        ...prev,
        attending: value,
        mealPreference: value !== 'YES' ? '' : prev.mealPreference,
        guests,
      };
    });

    validateField('attending', value);
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setValidationErrors({});

    const errors: Record<string, string> = {};

    // AC 8: block YES/MAYBE with zero selected guests
    if (formData.attending !== 'NO' && selectedCount === 0) {
      errors.guestSelection =
        'Nobody is selected — please select at least one guest or change your response to No.';
    }

    // Validate name + meal for each selected guest
    if (formData.attending !== 'NO') {
      formData.guests.forEach((guest, index) => {
        if (!guest.attending) return;
        if (!guest.fullName.trim()) {
          errors[`guest-${index}-fullName`] = "Please enter guest's full name";
        }
        if (features.mealPreferencesEnabled && formData.attending === 'YES' && !guest.mealPreference) {
          errors[`guest-${index}-mealPreference`] = 'Please select a meal preference';
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    logDebug('RSVPForm handleSubmit called', 'RSVPForm');

    startTransition(() => {
      const performRSVPSubmission = async () => {
        try {
          // Build API payload — strip UI-only `attending` flag, include only selected guests
          const apiGuests: Guest[] = formData.attending === 'NO'
            ? []
            : formData.guests
                .filter(g => g.attending)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(({ attending: _attending, ...rest }) => rest);

          // AC 9/10/11: guestCount = selected guests - 1 (primary guest is implicit), min 0
          const guestCount = formData.attending === 'NO' ? 0 : Math.max(0, apiGuests.length - 1);

          const submissionData: RSVPFormData = {
            attending: formData.attending,
            guestCount,
            guests: apiGuests,
            additionalNotes: formData.additionalNotes,
            // Legacy top-level fields synced from first attending guest
            fullName: apiGuests[0]?.fullName || formData.fullName,
            mealPreference: apiGuests[0]?.mealPreference || formData.mealPreference,
            allergies: apiGuests[0]?.allergies || formData.allergies || '',
          };

          if (rsvp) {
            await editRSVP(submissionData);
            setSuccessMessage('RSVP updated successfully!');
            logDebug('RSVP updated', 'RSVPForm');
          } else {
            await createRSVP(submissionData);
            setSuccessMessage('RSVP submitted successfully!');
            logDebug('RSVP submitted', 'RSVPForm');
          }

          setSubmittedData(submissionData);
          setShowConfirmation(true);

          // Reset form only for new RSVPs
          if (!rsvp) {
            setFormData({
              attending: 'NO',
              additionalNotes: '',
              guests: [{ fullName: '', mealPreference: '', allergies: '', attending: true }],
              fullName: '',
              mealPreference: '',
              allergies: '',
            });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setErrorMessage(message || 'Something went wrong. Please try again.');
        }
      };

      performRSVPSubmission();
    });
  };

  const handleEditRsvp = () => {
    setShowConfirmation(false);
    setSubmittedData(null);
  };

  if (showConfirmation && submittedData) {
    const primaryGuestName = submittedData.guests[0]?.fullName || submittedData.fullName;
    return (
      <RSVPConfirmation
        guestName={primaryGuestName}
        isAttending={submittedData.attending === 'YES'}
        partySize={submittedData.guests.length}
        onEditRsvp={handleEditRsvp}
      />
    );
  }

  return (
    <div className="rsvp-form-container">
      <form
        className="rsvp-form card"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="rsvp-form-title"
        aria-describedby={
          Object.keys(validationErrors).length > 0
            ? 'form-error-summary'
            : 'rsvp-form-description'
        }
      >
        <div className="rsvp-header">
          <h2 id="rsvp-form-title" className="rsvp-form-title">
            Your Response
          </h2>
          <p id="rsvp-form-description" className="rsvp-form-subtitle">
            We can't wait to celebrate with you! Please let us know if you'll be
            joining us.
          </p>
        </div>

        {/* Global Error Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div
            id="form-error-summary"
            className="form-error-summary"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="error-summary-icon" aria-hidden="true">
              ⚠️
            </div>
            <div className="error-summary-content">
              <strong>
                Please fix the following {Object.keys(validationErrors).length}{' '}
                error{Object.keys(validationErrors).length > 1 ? 's' : ''}:
              </strong>
              <ul className="error-summary-list">
                {Object.entries(validationErrors).map(([key, message]) => {
                  const fieldName = key.includes('guest-')
                    ? key.split('-').slice(2).join(' ').replace(/([A-Z])/g, ' $1').toLowerCase()
                    : key.replace(/([A-Z])/g, ' $1').toLowerCase();
                  return (
                    <li key={key} className="error-summary-item">
                      <a
                        href={`#${key}`}
                        onClick={e => {
                          e.preventDefault();
                          const el = document.getElementById(key);
                          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                        }}
                        aria-label={`Fix ${fieldName} error: ${message}`}
                      >
                        {message}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Attendance Question */}
        <fieldset className="form-group" aria-required="true">
          <legend className="form-label">
            Will you be attending our wedding?{' '}
            <span className="required" aria-label="required">*</span>
          </legend>
          <div className="attendance-options" role="radiogroup" aria-label="Attendance selection">
            {[
              { value: 'YES', label: "Yes, I'll be there!" },
              { value: 'NO', label: "Sorry, I can't make it" },
              { value: 'MAYBE', label: "I'm not sure yet" },
            ].map(option => (
              <label
                key={option.value}
                className={`attendance-option ${formData.attending === option.value ? 'selected' : ''}`}
                data-value={option.value}
              >
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={formData.attending === option.value}
                  onChange={e => handleAttendanceChange(e.target.value as 'YES' | 'NO' | 'MAYBE')}
                  className="attendance-radio-safari"
                  aria-label={option.label}
                />
                <div className="option-content">
                  <span className="option-text">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Conditional Fields — shown for YES and MAYBE (AC 12) */}
        <div className={`conditional-fields ${showAttendingSection ? 'show' : 'hide'}`}>

          {/* Live Attendance Summary — AC 7 */}
          {totalCount > 1 && (
            <div className="guest-attendance-summary" aria-live="polite">
              <span className="attendance-summary-count">
                {selectedCount} of {totalCount} attending
              </span>
              <span className="attendance-summary-hint">
                Select who in your household can make it.
                It&apos;s okay if only some of you can attend.
              </span>
            </div>
          )}

          {/* Zero-selection validation message — AC 8 */}
          {validationErrors.guestSelection && (
            <div
              id="guestSelection"
              className="field-error"
              role="alert"
              aria-live="assertive"
            >
              {validationErrors.guestSelection}
            </div>
          )}

          {/* Meal Preferences Coming Soon Banner */}
          {!features.mealPreferencesEnabled && <MealPreferencesComingSoon />}

          {/* Individual Guest Rows */}
          {formData.guests.map((guest, index) => (
            <div
              key={`guest-${index}`}
              className={`guest-form-section ${!guest.attending ? 'guest-not-attending' : ''}`}
              data-guest-index={index}
            >
              {/* Row header: name + attending toggle */}
              <div className="guest-form-header">
                <h3 className="guest-form-title">
                  {guest.fullName ||
                    (totalCount === 1 ? 'Guest Information' : `Guest ${index + 1}`)}
                </h3>

                {/* AC 4: per-person attendance control */}
                <label className="guest-attending-toggle">
                  <input
                    type="checkbox"
                    checked={guest.attending}
                    onChange={() => toggleGuestAttending(index)}
                    aria-label={`${guest.fullName || `Guest ${index + 1}`} will attend`}
                  />
                  <span className="guest-attending-label">
                    {guest.attending ? 'Attending' : 'Not attending'}
                  </span>
                </label>
              </div>

              {/* AC 3: neutral hint for unselected rows */}
              {!guest.attending && (
                <p className="guest-not-attending-hint">
                  Not in your current response. Select to include them.
                </p>
              )}

              {/* Guest Name — always visible so user knows who they're toggling */}
              <div className="form-group">
                <label htmlFor={`guest-${index}-fullName`} className="form-label">
                  Full Name{' '}
                  {guest.attending && <span className="required" aria-label="required">*</span>}
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
                      if (guest.attending) validateField('fullName', e.target.value, index);
                    }}
                    placeholder="Enter full name"
                    required={guest.attending}
                    aria-describedby={
                      validationErrors[`guest-${index}-fullName`]
                        ? `guest-${index}-fullName-error`
                        : undefined
                    }
                    aria-invalid={validationErrors[`guest-${index}-fullName`] ? 'true' : 'false'}
                  />
                  {guest.fullName && (
                    <div className="form-input-check" aria-hidden="true">✓</div>
                  )}
                </div>
                {validationErrors[`guest-${index}-fullName`] && (
                  <div
                    id={`guest-${index}-fullName-error`}
                    className="field-error mobile-friendly"
                    role="alert"
                    aria-live="assertive"
                  >
                    <span className="error-icon" aria-hidden="true">⚠️</span>
                    {validationErrors[`guest-${index}-fullName`]}
                  </div>
                )}
              </div>

              {/* AC 5/6: meal + allergy only for selected guests */}
              {guest.attending && (
                <>
                  {/* Meal Preference */}
                  {features.mealPreferencesEnabled && (
                    <div className="form-group">
                      <label htmlFor={`guest-${index}-mealPreference`} className="form-label">
                        Meal Preference{' '}
                        <span className="required" aria-label="required">*</span>
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
                          aria-invalid={
                            validationErrors[`guest-${index}-mealPreference`] ? 'true' : 'false'
                          }
                        >
                          <option value={mealOptions.placeholder.value}>
                            {mealOptions.placeholder.label}
                          </option>
                          <optgroup label="Adult Entrees">
                            {mealOptions.adult.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Kids Menu (ages 3-12)">
                            {mealOptions.kids.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          {mealOptions.other.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        {guest.mealPreference && (
                          <div className="form-select-check" aria-hidden="true">✓</div>
                        )}
                      </div>
                      {validationErrors[`guest-${index}-mealPreference`] && (
                        <div
                          id={`guest-${index}-mealPreference-error`}
                          className="field-error mobile-friendly"
                          role="alert"
                          aria-live="assertive"
                        >
                          <span className="error-icon" aria-hidden="true">⚠️</span>
                          {validationErrors[`guest-${index}-mealPreference`]}
                        </div>
                      )}
                      <p className="form-hint meal-selection-note">
                        {guest.mealPreference === 'brisket' ? (
                          <>
                            Served with chipotle honey BBQ sauce.
                            <br /><br />
                            Every meal includes a Field of Greens salad, Roasted
                            Garlic Mashed Potatoes, and Glazed Carrots.
                          </>
                        ) : guest.mealPreference === 'tritip' ? (
                          <>
                            Marinated in fresh garlic and herbs, with a peppercorn
                            crust, served with chimichurri, horseradish cream, or au jus.
                            <br /><br />
                            Every meal includes a Field of Greens salad, Roasted
                            Garlic Mashed Potatoes, and Glazed Carrots.
                          </>
                        ) : guest.mealPreference === 'kids_chicken' ||
                          guest.mealPreference === 'kids_mac' ? (
                          <>Kids meals come with french fries, fresh fruit, and a juice box.</>
                        ) : (
                          <>
                            Every meal includes a Field of Greens salad, Roasted
                            Garlic Mashed Potatoes, and Glazed Carrots.
                          </>
                        )}
                      </p>
                      {guest.mealPreference === 'dietary' && (
                        <p className="form-hint dietary-hint">
                          Please describe your dietary needs in the field below so
                          our kitchen can prepare a suitable meal for you.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Allergies */}
                  <div className="form-group">
                    <label htmlFor={`guest-${index}-allergies`} className="form-label">
                      Food Allergies or Dietary Restrictions
                    </label>
                    <input
                      id={`guest-${index}-allergies`}
                      name={`guest-${index}-allergies`}
                      type="text"
                      className="form-input"
                      value={guest.allergies || ''}
                      onChange={e => updateGuest(index, 'allergies', e.target.value)}
                      placeholder="Please list any allergies or dietary needs"
                      aria-describedby={`guest-${index}-allergies-hint`}
                    />
                    <small id={`guest-${index}-allergies-hint`} className="form-hint">
                      Let us know so we can make sure you're taken care of
                    </small>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Additional Notes */}
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
              aria-describedby="additionalNotes-hint"
            />
            <small id="additionalNotes-hint" className="form-hint">
              Feel free to share anything else we should know or any special
              songs you'd like to hear!
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button
            className={`rsvp-submit-btn ${mutationLoading || isPending ? 'loading' : ''} ${Object.keys(validationErrors).length > 0 ? 'has-errors' : ''}`}
            type="submit"
            disabled={loading || isPending}
            aria-describedby={
              Object.keys(validationErrors).length > 0 ? 'form-error-summary' : undefined
            }
            aria-live="polite"
            aria-busy={mutationLoading || isPending ? 'true' : 'false'}
          >
            {mutationLoading || isPending ? (
              <>
                <span className="loading-spinner" aria-hidden="true" />
                <span className="loading-text">
                  {isPending
                    ? rsvp ? 'Processing update...' : 'Processing submission...'
                    : rsvp ? 'Updating...' : 'Submitting...'}
                </span>
              </>
            ) : (
              <span className="submit-text">{rsvp ? 'Update RSVP' : 'Submit RSVP'}</span>
            )}
          </button>

          {(mutationLoading || isPending) && (
            <div className="submission-progress" aria-live="polite" aria-atomic="true">
              <div className="progress-bar" role="progressbar" aria-label="RSVP submission progress">
                <div className="progress-fill" />
              </div>
              <small className="progress-text">
                {isPending
                  ? rsvp ? 'Processing your RSVP update...' : 'Processing your RSVP submission...'
                  : rsvp ? 'Updating your RSVP...' : 'Submitting your RSVP...'}
              </small>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="form-success" role="status" aria-live="polite" aria-atomic="true">
            <div className="success-icon" aria-hidden="true">✓</div>
            <div className="success-content">
              <strong>Amazing!</strong>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="error-icon" aria-hidden="true">⚠️</div>
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
