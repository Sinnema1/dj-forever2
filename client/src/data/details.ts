export interface EventDetail {
  time: string;
  title: string;
  location?: string;
  address?: string;
  mapsUrl?: string;
}

export const details: EventDetail[] = [
  {
    time: '3:30 PM',
    title: 'Guest Arrival',
    location: 'Venue at the Grove',
    address: '7010 S. 27th Ave, Phoenix, AZ 85041',
    mapsUrl: 'https://maps.google.com/?q=7010+S+27th+Ave+Phoenix+AZ+85041',
  },
  {
    time: '4:00 PM',
    title: 'Ceremony',
    location: 'Venue at the Grove (Outdoor)',
  },
  {
    time: '4:30 PM',
    title: 'Cocktail Hour & Reception',
    location: 'Venue at the Grove (Outdoor)',
  },
  { time: '10:00 PM', title: 'Event Conclusion' },
];
