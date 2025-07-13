export interface EventDetail {
  time: string;
  title: string;
  location?: string;
}

export const details: EventDetail[] = [
  // Example:
  { time: "2:00 PM", title: "Ceremony", location: "Venue at the Grove" },
  {
    time: "3:00 PM",
    title: "Cocktail Hour",
    location: "Venue at the Grove Patio",
  },
];
