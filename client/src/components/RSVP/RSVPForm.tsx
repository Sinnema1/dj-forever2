import React, { useState, useEffect } from "react";
import { useRSVP } from "../../features/rsvp/hooks/useRSVP";
import { RSVPFormData, Guest } from "../../features/rsvp/types/rsvpTypes";
import RSVPConfirmation from "./RSVPConfirmation";
import "../../assets/rsvp-enhancements.css";

export default function RSVPForm() {
  const { createRSVP, editRSVP, rsvp, loading } = useRSVP();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormData | null>(null);
  const [formData, setFormData] = useState<RSVPFormData>(() => {
    // Initialize with proper guest structure, handling legacy data
    const initialGuests = rsvp?.guests || [
      {
        fullName: rsvp?.fullName || "",
        mealPreference: rsvp?.mealPreference || "",
        allergies: rsvp?.allergies || "",
      },
    ];

    return {
      fullName: rsvp?.fullName || "",
      attending: rsvp?.attending || "NO",
      mealPreference: rsvp?.mealPreference || "",
      allergies: rsvp?.allergies || "",
      additionalNotes: rsvp?.additionalNotes || "",
      guestCount: rsvp?.guestCount || initialGuests.length,
      guests: initialGuests,
    };
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showMealOptions, setShowMealOptions] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[RSVPForm] Rendered. successMessage:", successMessage);
    if (rsvp) {
      setFormData((prev) => {
        const newData = {
          fullName: rsvp.fullName || "",
          attending: rsvp.attending || "NO",
          mealPreference: rsvp.mealPreference || "",
          allergies: rsvp.allergies || "",
          additionalNotes: rsvp.additionalNotes || "",
          guestCount: rsvp.guestCount || 1,
          guests: rsvp.guests || [
            {
              fullName: rsvp.fullName || "",
              mealPreference: rsvp.mealPreference || "",
              allergies: rsvp.allergies || "",
            },
          ],
        };
        const isDifferent = Object.keys(newData).some(
          (key) => (prev as any)[key] !== (newData as any)[key]
        );
        return isDifferent ? newData : prev;
      });
    }

    // Show meal options if attending
    setShowMealOptions(formData.attending === "YES");
  }, [rsvp, successMessage, formData.attending]);

  // Available meal options
  const mealOptions = [
    { value: "", label: "Select your preference" },
    { value: "chicken", label: "🍗 Herb-Roasted Chicken" },
    { value: "beef", label: "🥩 Grilled Beef Tenderloin" },
    { value: "fish", label: "🐟 Pan-Seared Salmon" },
    { value: "vegetarian", label: "🥗 Vegetarian Pasta Primavera" },
    { value: "vegan", label: "🌱 Vegan Mediterranean Bowl" },
    { value: "kids", label: "🍕 Kids Menu (Chicken Tenders & Fries)" },
  ];

  // Helper function to update guest count and manage guests array
  const updateGuestCount = (newCount: number) => {
    const currentGuests = [...formData.guests];

    if (newCount > currentGuests.length) {
      // Add new empty guests
      for (let i = currentGuests.length; i < newCount; i++) {
        currentGuests.push({ fullName: "", mealPreference: "", allergies: "" });
      }
    } else if (newCount < currentGuests.length) {
      // Remove excess guests
      currentGuests.splice(newCount);
    }

    setFormData((prev) => ({
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
    setFormData((prev) => {
      const updatedGuests = [...prev.guests];
      updatedGuests[guestIndex] = {
        ...updatedGuests[guestIndex],
        [field]: value,
      };
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
      case "fullName":
        if (guestIndex !== undefined) {
          // Validating individual guest name
          if (!value.trim()) {
            errors[`guest-${guestIndex}-fullName`] =
              "Please enter guest's full name";
          } else if (value.trim().length < 2) {
            errors[`guest-${guestIndex}-fullName`] =
              "Name must be at least 2 characters";
          }
        } else {
          // Legacy validation for backward compatibility
          if (!value.trim()) {
            errors.fullName = "Please enter your full name";
          } else if (value.trim().length < 2) {
            errors.fullName = "Name must be at least 2 characters";
          }
        }
        break;
      case "mealPreference":
        if (guestIndex !== undefined) {
          // Validating individual guest meal preference
          if (formData.attending === "YES" && !value) {
            errors[`guest-${guestIndex}-mealPreference`] =
              "Please select a meal preference";
          }
        } else {
          // Legacy validation
          if (formData.attending === "YES" && !value) {
            errors.mealPreference = "Please select a meal preference";
          }
        }
        break;
      case "guestCount":
        const count = parseInt(value);
        if (isNaN(count) || count < 1 || count > 10) {
          errors.guestCount = "Guest count must be between 1 and 10";
        }
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...errors,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    validateField(name, value);

    // Clear success/error messages when user starts typing
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear meal preference when not attending
    if (name === "attending" && value !== "YES") {
      setFormData((prev) => ({ ...prev, mealPreference: "" }));
    }

    // Real-time validation
    validateField(name, value);

    // Clear success/error messages
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setValidationErrors({});

    // Final validation
    const errors: Record<string, string> = {};

    // Validate guest count
    if (formData.guestCount < 1 || formData.guestCount > 10) {
      errors.guestCount = "Guest count must be between 1 and 10";
    }

    // Validate each guest if attending
    if (formData.attending === "YES") {
      formData.guests.forEach((guest, index) => {
        if (!guest.fullName.trim()) {
          errors[`guest-${index}-fullName`] = "Please enter guest's full name";
        }
        if (!guest.mealPreference) {
          errors[`guest-${index}-mealPreference`] =
            "Please select a meal preference";
        }
      });
    } else {
      // For backward compatibility, still validate the legacy fullName field for non-attending guests
      if (
        !formData.fullName.trim() &&
        formData.guests[0] &&
        !formData.guests[0].fullName.trim()
      ) {
        errors.fullName = "Please enter your full name";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // eslint-disable-next-line no-console
    console.log("[RSVPForm] handleSubmit called");
    try {
      // Ensure legacy fields are synchronized with first guest for backward compatibility
      const submissionData = {
        ...formData,
        fullName: formData.guests[0]?.fullName || formData.fullName,
        mealPreference:
          formData.guests[0]?.mealPreference || formData.mealPreference,
        allergies: formData.guests[0]?.allergies || formData.allergies,
      };

      if (rsvp) {
        await editRSVP(submissionData);
        setSuccessMessage("RSVP updated successfully! 🎉");
        // eslint-disable-next-line no-console
        console.log("[RSVPForm] setSuccessMessage: RSVP updated!");
      } else {
        await createRSVP(submissionData);
        setSuccessMessage("RSVP submitted successfully! 🎉");
        // eslint-disable-next-line no-console
        console.log("[RSVPForm] setSuccessMessage: RSVP submitted!");
      }

      // Store submitted data and show confirmation
      setSubmittedData(submissionData);
      setShowConfirmation(true);

      // Reset form only for new RSVPs
      if (!rsvp) {
        setFormData({
          fullName: "",
          attending: "NO",
          mealPreference: "",
          allergies: "",
          additionalNotes: "",
          guestCount: 1,
          guests: [{ fullName: "", mealPreference: "", allergies: "" }],
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
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
        isAttending={submittedData.attending === "YES"}
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

        {/* Guest Count Field */}
        <div className="form-group">
          <label htmlFor="guestCount" className="form-label">
            Guest Count <span className="required">*</span>
          </label>
          <select
            id="guestCount"
            name="guestCount"
            className={`form-select ${validationErrors.guestCount ? "error" : ""}`}
            value={formData.guestCount}
            onChange={(e) => {
              const newCount = parseInt(e.target.value);
              updateGuestCount(newCount);
              validateField("guestCount", e.target.value);
            }}
            required
            aria-describedby={
              validationErrors.guestCount ? "guestCount-error" : undefined
            }
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "Guest" : "Guests"}
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

        {/* Attendance Question */}
        <div className="form-group">
          <label htmlFor="attending" className="form-label">
            Will you be attending our wedding?{" "}
            <span className="required">*</span>
          </label>
          <div className="attendance-options">
            {[
              { value: "YES", label: "✅ Yes, I'll be there!", icon: "🎉" },
              { value: "NO", label: "❌ Sorry, I can't make it", icon: "😢" },
              { value: "MAYBE", label: "🤔 I'm not sure yet", icon: "⏰" },
            ].map((option) => (
              <label
                key={option.value}
                className={`attendance-option ${formData.attending === option.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={formData.attending === option.value}
                  onChange={(e) => handleSelectChange(e as any)}
                  className="attendance-radio"
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
          className={`conditional-fields ${showMealOptions ? "show" : "hide"}`}
        >
          {/* Individual Guest Forms */}
          {formData.guests.map((guest, index) => (
            <div key={index} className="guest-form-section">
              <h3 className="guest-form-title">
                {formData.guestCount === 1
                  ? "Guest Information"
                  : `Guest ${index + 1} Information`}
              </h3>

              {/* Guest Name */}
              <div className="form-group">
                <label
                  htmlFor={`guest-${index}-fullName`}
                  className="form-label"
                >
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id={`guest-${index}-fullName`}
                  name={`guest-${index}-fullName`}
                  type="text"
                  className={`form-input ${validationErrors[`guest-${index}-fullName`] ? "error" : ""}`}
                  value={guest.fullName}
                  onChange={(e) => {
                    updateGuest(index, "fullName", e.target.value);
                    validateField("fullName", e.target.value, index);
                  }}
                  placeholder="Enter full name"
                  required
                  aria-describedby={
                    validationErrors[`guest-${index}-fullName`]
                      ? `guest-${index}-fullName-error`
                      : undefined
                  }
                />
                {validationErrors[`guest-${index}-fullName`] && (
                  <div
                    id={`guest-${index}-fullName-error`}
                    className="field-error"
                    role="alert"
                  >
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
                <select
                  id={`guest-${index}-mealPreference`}
                  name={`guest-${index}-mealPreference`}
                  className={`form-select ${validationErrors[`guest-${index}-mealPreference`] ? "error" : ""}`}
                  value={guest.mealPreference}
                  onChange={(e) => {
                    updateGuest(index, "mealPreference", e.target.value);
                    validateField("mealPreference", e.target.value, index);
                  }}
                  required={formData.attending === "YES"}
                  aria-describedby={
                    validationErrors[`guest-${index}-mealPreference`]
                      ? `guest-${index}-mealPreference-error`
                      : undefined
                  }
                >
                  {mealOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors[`guest-${index}-mealPreference`] && (
                  <div
                    id={`guest-${index}-mealPreference-error`}
                    className="field-error"
                    role="alert"
                  >
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
                  value={guest.allergies || ""}
                  onChange={(e) =>
                    updateGuest(index, "allergies", e.target.value)
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
        </div>

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
          />
          <small className="form-hint">
            Feel free to share anything else we should know or any special songs
            you'd like to hear!
          </small>
        </div>

        {/* Submit Button */}
        <button
          className={`rsvp-submit-btn ${loading ? "loading" : ""}`}
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              {rsvp ? "Update RSVP" : "Submit RSVP"}
              <span className="submit-icon">💕</span>
            </>
          )}
        </button>

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
