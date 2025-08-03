export interface Guest {
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

export interface RSVP {
  _id: string;
  userId: string;
  attending: "YES" | "NO" | "MAYBE";
  guestCount: number;
  guests: Guest[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

export interface CreateRSVPInput {
  attending: "YES" | "NO" | "MAYBE";
  guestCount: number;
  guests: Guest[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

export interface RSVPFormData {
  attending: "YES" | "NO" | "MAYBE";
  guestCount: number;
  guests: Guest[];
  additionalNotes?: string;
  // Legacy fields for backward compatibility
  fullName: string;
  mealPreference: string;
  allergies?: string;
}

export interface RSVPInput {
  attending: "YES" | "NO" | "MAYBE";
  guestCount: number;
  guests: Guest[];
  additionalNotes?: string;
}
