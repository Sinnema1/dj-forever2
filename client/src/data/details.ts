export interface EventDetail {
  time: string;
  title: string;
  location?: string;
}

export const details: EventDetail[] = [
  { time: '3:00 PM', title: 'Guest Arrival', location: 'Venue at the Grove' },
  {
    time: '4:00 PM',
    title: 'Ceremony',
    location: 'Venue at the Grove (Outdoor)',
  },
  {
    time: '5:00 PM',
    title: 'Cocktail Hour & Reception',
    location: 'Venue at the Grove (Outdoor)',
  },
  { time: '10:00 PM', title: 'Event Conclusion' },
];
