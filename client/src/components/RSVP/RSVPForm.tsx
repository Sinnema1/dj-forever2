import React, { useState, useEffect } from "react";
import { useRSVP } from "../../features/rsvp/hooks/useRSVP";
import { RSVPFormData } from "../../features/rsvp/types/rsvpTypes";

export default function RSVPForm() {
  const { createRSVP, editRSVP, rsvp, loading } = useRSVP();
  const [formData, setFormData] = useState<RSVPFormData>({
    fullName: rsvp?.fullName || "",
    attending: rsvp?.attending || "NO",
    mealPreference: rsvp?.mealPreference || "",
    allergies: rsvp?.allergies || "",
    additionalNotes: rsvp?.additionalNotes || "",
  });

  useEffect(() => {
    if (rsvp) {
      setFormData({
        fullName: rsvp.fullName || "",
        attending: rsvp.attending || "NO",
        mealPreference: rsvp.mealPreference || "",
        allergies: rsvp.allergies || "",
        additionalNotes: rsvp.additionalNotes || "",
      });
    }
  }, [rsvp]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    try {
      if (rsvp) {
        await editRSVP(formData);
        setSuccessMessage("RSVP updated!");
      } else {
        await createRSVP(formData);
        setSuccessMessage("RSVP submitted!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <form
      className="card"
      onSubmit={handleSubmit}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <h2 className="card-header">RSVP</h2>
      <label htmlFor="fullName">Full Name</label>
      <input
        id="fullName"
        name="fullName"
        type="text"
        value={formData.fullName}
        onChange={handleInputChange}
        required
      />
      <label htmlFor="attending">Will you attend?</label>
      <select
        id="attending"
        name="attending"
        value={formData.attending}
        onChange={handleSelectChange}
        required
      >
        <option value="YES">Yes</option>
        <option value="NO">No</option>
        <option value="MAYBE">Maybe</option>
      </select>
      <label htmlFor="mealPreference">Meal Preference</label>
      <input
        id="mealPreference"
        name="mealPreference"
        type="text"
        value={formData.mealPreference}
        onChange={handleInputChange}
        required
      />
      <label htmlFor="allergies">Allergies</label>
      <input
        id="allergies"
        name="allergies"
        type="text"
        value={formData.allergies}
        onChange={handleInputChange}
      />
      <label htmlFor="additionalNotes">Additional Notes</label>
      <textarea
        id="additionalNotes"
        name="additionalNotes"
        value={formData.additionalNotes}
        onChange={handleInputChange}
        rows={3}
      />
      <button className="btn-primary mt-4" type="submit" disabled={loading}>
        {loading ? "Submitting..." : rsvp ? "Update RSVP" : "Submit RSVP"}
      </button>
      {successMessage && (
        <div className="form-success mt-4">{successMessage}</div>
      )}
      {errorMessage && <div className="form-error mt-4">{errorMessage}</div>}
    </form>
  );
}
