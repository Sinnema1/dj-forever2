# Wedding Website Project Structure and Boilerplate

This structure is for a single-page React wedding website with a modern stack (React, TypeScript, Vite, Apollo, Node/Express, GraphQL, MongoDB). The countdown timer is set for November 8, 2026.

---

project-root/
│
├── client/  # Frontend (React, Vite, etc.)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── apolloClient.ts
│   │   ├── assets/
│   │   │   └── images/  # Hero, gallery, party headshots, etc.
│   │   ├── components/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── Gallery/
│   │   │   │   ├── GalleryGrid.tsx
│   │   │   │   └── LightboxModal.tsx
│   │   │   ├── WeddingParty/
│   │   │   │   ├── PartyList.tsx
│   │   │   │   └── PartyCard.tsx
│   │   │   ├── TravelGuide.tsx
│   │   │   ├── FAQAccordion.tsx
│   │   │   ├── RegistryLinks.tsx
│   │   │   ├── RSVP/
│   │   │   │   ├── RSVPButton.tsx
│   │   │   │   ├── RSVPAccessControl.tsx
│   │   │   │   ├── RSVPForm.tsx
│   │   │   │   └── RSVPConfirmation.tsx
│   │   │   ├── Guestbook/
│   │   │   │   ├── GuestbookForm.tsx
│   │   │   │   └── GuestbookFeed.tsx
│   │   ├── models/
│   │   │   ├── userTypes.ts
│   │   │   └── rsvpTypes.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── OurStory.tsx
│   │   │   ├── TheDetails.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── WeddingParty.tsx
│   │   │   ├── TravelGuide.tsx
│   │   │   ├── FAQs.tsx
│   │   │   ├── Registry.tsx
│   │   │   ├── RSVP.tsx
│   │   │   └── Guestbook.tsx
│   │   ├── theme/
│   │   │   ├── theme.ts
│   │   │   └── ThemeProvider.tsx
│   │   ├── utils/
│   │   │   ├── smoothScroll.ts
│   │   │   └── sectionHighlight.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .eslintrc.cjs
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/  # Backend (Node.js, Express, Apollo)
│   ├── src/
│   │   ├── config/
│   │   ├── graphql/
│   │   │   ├── typeDefs.ts
│   │   │   └── resolvers.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── RSVP.ts
│   │   │   └── GuestbookMessage.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── rsvpService.ts
│   │   │   └── userService.ts
│   │   ├── seeds/
│   │   │   ├── seed.ts
│   │   │   ├── userData.json
│   │   │   └── rsvpData.json
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env.EXAMPLE
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── .gitignore
├── README.md
└── package.json

---

## Boilerplate Code: Countdown Timer (client/src/components/CountdownTimer.tsx)

```tsx
import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-11-08T16:00:00-05:00");

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(WEDDING_DATE.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(WEDDING_DATE.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) return <span>It's wedding time!</span>;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span>
      {days} days {hours}h {minutes}m {seconds}s
    </span>
  );
}
```

---

This structure and boilerplate will help you get started. Let me know if you want boilerplate for other sections (e.g., HeroBanner, Navbar, RSVP form, etc.) or backend setup!
