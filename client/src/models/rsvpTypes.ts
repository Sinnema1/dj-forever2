// Example type for RSVP
export type AttendanceStatus = "YES" | "NO" | "MAYBE";

export interface RSVP {
  id: string;
  userId: string;
  attending: AttendanceStatus;
  mealPreference: string;
  allergies?: string;
  additionalNotes?: string;
  fullName: string;
}
