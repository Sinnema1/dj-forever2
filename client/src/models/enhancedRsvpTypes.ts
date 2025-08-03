// Enhanced RSVP with guest management
export interface RSVPGroup {
  _id: string;
  primaryGuestId: string;
  guests: Guest[];
  maxGuests: number;
  rsvpDeadline: Date;
  notes?: string;
}

export interface Guest {
  _id: string;
  name: string;
  email?: string;
  attending: "YES" | "NO" | "PENDING";
  mealPreference?: string;
  dietaryRestrictions?: string[];
  ageGroup: "adult" | "child" | "infant";
  isMainContact: boolean;
}

export interface EnhancedRSVP {
  _id: string;
  groupId: string;
  submittedBy: string;
  submittedAt: Date;
  totalAttending: number;
  specialRequests?: string;
  accommodationNeeds?: string;
  songRequests?: string[];
  status: "PENDING" | "CONFIRMED" | "DECLINED";
}
