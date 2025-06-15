export interface RSVP {
  _id: string;
  userId: string;
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName: string;
}

export interface CreateRSVPInput {
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName: string;
}

export interface RSVPFormData {
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName: string;
}

export interface RSVPInput {
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
}
