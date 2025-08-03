import React, { useState, useEffect } from "react";
import { useRSVP } from "../../features/rsvp/hooks/useRSVP";
import { RSVPFormData } from "../../features/rsvp/types/rsvpTypes";
import RSVPConfirmation from "./RSVPConfirmation";
import "../../assets/rsvp-enhancements.css";

export default function RSVPForm() {
  const { createRSVP, editRSVP, rsvp, loading } = useRSVP();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormData | null>(null);
  const [formData, setFormData] = useState<RSVPFormData>({
    fullName: rsvp?.fullName || "",
    attending: rsvp?.attending || "NO",
    mealPreference: rsvp?.mealPreference || "",
    allergies: rsvp?.allergies || "",
    additionalNotes: rsvp?.additionalNotes || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showMealOptions, setShowMealOptions] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[RSVPForm] Rendered. successMessage:', successMessage);
    if (rsvp) {
      setFormData((prev) => {
        const newData = {
          fullName: rsvp.fullName || "",
          attending: rsvp.attending || "NO",
          mealPreference: rsvp.mealPreference || "",
          allergies: rsvp.allergies || "",
          additionalNotes: rsvp.additionalNotes || "",
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

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case "fullName":
        if (!value.trim()) {
          errors.fullName = "Please enter your full name";
        } else if (value.trim().length < 2) {
          errors.fullName = "Name must be at least 2 characters";
        }
        break;
      case "mealPreference":
        if (formData.attending === "YES" && !value) {
          errors.mealPreference = "Please select a meal preference";
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: errors[name] || ""
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
      setFormData(prev => ({ ...prev, mealPreference: "" }));
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
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name";
    }
    
    if (formData.attending === "YES" && !formData.mealPreference) {
      errors.mealPreference = "Please select a meal preference";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // eslint-disable-next-line no-console
    console.log('[RSVPForm] handleSubmit called');
    try {
      if (rsvp) {
        await editRSVP(formData);
        setSuccessMessage("RSVP updated successfully! 🎉");
        // eslint-disable-next-line no-console
        console.log('[RSVPForm] setSuccessMessage: RSVP updated!');
      } else {
        await createRSVP(formData);
        setSuccessMessage("RSVP submitted successfully! 🎉");
        // eslint-disable-next-line no-console
        console.log('[RSVPForm] setSuccessMessage: RSVP submitted!');
      }
      
      // Store submitted data and show confirmation
      setSubmittedData(formData);
      setShowConfirmation(true);
      
      // Reset form only for new RSVPs
      if (!rsvp) {
        setFormData({
          fullName: "",
          attending: "NO",
          mealPreference: "",
          allergies: "",
          additionalNotes: "",
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
    return (
      <RSVPConfirmation
        guestName={submittedData.fullName}
        isAttending={submittedData.attending === "YES"}
        partySize={1} // You might want to add party size to your form data
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
      >
        <div className="rsvp-header">
          <h2 className="rsvp-title">💌 RSVP for Our Wedding</h2>
          <p className="rsvp-subtitle">
            We can't wait to celebrate with you! Please let us know if you'll be joining us.
          </p>
        </div>

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={`form-input ${validationErrors.fullName ? 'error' : ''}`}
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            aria-describedby={validationErrors.fullName ? "fullName-error" : undefined}
          />
          {validationErrors.fullName && (
            <div id="fullName-error" className="field-error" role="alert">
              {validationErrors.fullName}
            </div>
          )}
        </div>

        {/* Attendance Question */}
        <div className="form-group">
          <label htmlFor="attending" className="form-label">
            Will you be attending our wedding? <span className="required">*</span>
          </label>
          <div className="attendance-options">
            {[
              { value: "YES", label: "✅ Yes, I'll be there!", icon: "🎉" },
              { value: "NO", label: "❌ Sorry, I can't make it", icon: "😢" },
              { value: "MAYBE", label: "🤔 I'm not sure yet", icon: "⏰" }
            ].map((option) => (
              <label 
                key={option.value} 
                className={`attendance-option ${formData.attending === option.value ? 'selected' : ''}`}
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
        <div className={`conditional-fields ${showMealOptions ? 'show' : 'hide'}`}>
          {/* Meal Preference */}
          <div className="form-group">
            <label htmlFor="mealPreference" className="form-label">
              Meal Preference <span className="required">*</span>
            </label>
            <select
              id="mealPreference"
              name="mealPreference"
              className={`form-select ${validationErrors.mealPreference ? 'error' : ''}`}
              value={formData.mealPreference}
              onChange={handleSelectChange}
              required={formData.attending === "YES"}
              aria-describedby={validationErrors.mealPreference ? "mealPreference-error" : undefined}
            >
              {mealOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.mealPreference && (
              <div id="mealPreference-error" className="field-error" role="alert">
                {validationErrors.mealPreference}
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="form-group">
            <label htmlFor="allergies" className="form-label">
              Food Allergies or Dietary Restrictions
            </label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              className="form-input"
              value={formData.allergies}
              onChange={handleInputChange}
              placeholder="Please list any allergies or dietary needs"
            />
            <small className="form-hint">
              Help us ensure you have a safe and enjoyable dining experience
            </small>
          </div>
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
            Feel free to share anything else we should know or any special songs you'd like to hear!
          </small>
        </div>

        {/* Submit Button */}
        <button 
          className={`rsvp-submit-btn ${loading ? 'loading' : ''}`} 
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
