# Example Project Folder Structure and Key Code Snippets

This structure and code are based on best practices from the template and curriculum modules. Adjust names as needed for your project.

---

project-root/
│
├── client/ # Frontend (React, Vite, etc.)
│ ├── public/
│ ├── src/
│ │ ├── api/ # API utilities (e.g., apolloClient.ts)
│ │ ├── assets/
│ │ ├── components/
│ │ │ ├── Auth/
│ │ │ │ ├── Register.tsx
│ │ │ │ ├── Login.tsx
│ │ │ │ └── AuthContext.tsx
│ │ │ ├── Protected/
│ │ │ │ └── PrivateRoute.tsx
│ │ │ ├── User/
│ │ │ │ ├── Profile.tsx
│ │ │ │ ├── ManageUsers.tsx
│ │ │ ├── RSVP/
│ │ │ │ ├── RSVPForm.tsx
│ │ │ │ ├── RSVPList.tsx
│ │ │ │ └── RSVPService.ts
│ │ │ ├── Dashboard/
│ │ │ │ └── Dashboard.tsx
│ │ │ ├── Layout/
│ │ │ │ ├── AppLayout.tsx
│ │ │ │ ├── Navbar.tsx
│ │ │ │ └── Error.tsx
│ │ ├── models/
│ │ │ ├── userTypes.ts
│ │ │ └── rsvpTypes.ts
│ │ ├── pages/
│ │ ├── theme/
│ │ │ ├── ThemeMode.tsx
│ │ │ └── theme.ts
│ │ ├── utils/
│ │ └── main.tsx
│ ├── .eslintrc.cjs
│ ├── package.json
│ ├── tsconfig.json
│ └── vite.config.ts
│
├── server/ # Backend (Node.js, Express, Apollo)
│ ├── src/
│ │ ├── config/
│ │ ├── graphql/
│ │ │ ├── typeDefs.ts
│ │ │ └── resolvers.ts
│ │ ├── middleware/
│ │ │ └── auth.ts
│ │ ├── models/
│ │ │ ├── User.ts
│ │ │ └── RSVP.ts
│ │ ├── services/
│ │ │ ├── authService.ts
│ │ │ ├── rsvpService.ts
│ │ │ └── userService.ts
│ │ ├── seeds/
│ │ │ ├── seed.ts
│ │ │ ├── userData.json
│ │ │ └── rsvpData.json
│ │ ├── utils/
│ │ └── server.ts
│ ├── .env.EXAMPLE
│ ├── package.json
│ ├── tsconfig.json
│ └── README.md
│
├── .gitignore
├── README.md
└── package.json

---

## Key Code Snippets

### 1. Apollo Client Setup (client/src/api/apolloClient.ts)

```ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({ uri: "/graphql" });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### 2. Express + Apollo Server Setup (server/src/server.ts)

```ts
import express from "express";
import { ApolloServer } from "apollo-server-express";
import path from "path";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { authMiddleware } from "./middleware/auth";

const app = express();
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

await server.start();
server.applyMiddleware({ app });

// Serve static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });
}

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running");
});
```

### 3. Protected Route Example (client/src/components/Protected/PrivateRoute.tsx)

```tsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}
```

### 4. GraphQL TypeDefs (server/src/graphql/typeDefs.ts)

```ts
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum AttendanceStatus {
    YES
    NO
    MAYBE
  }
  type User {
    _id: ID!
    fullName: String!
    email: String!
    isAdmin: Boolean!
    hasRSVPed: Boolean!
    rsvpId: ID
    rsvp: RSVP
    isInvited: Boolean!
  }
  type RSVP {
    _id: ID!
    userId: ID!
    attending: AttendanceStatus!
    mealPreference: String!
    allergies: String
    additionalNotes: String
    fullName: String!
  }
  type Query {
    me: User
    getRSVP: RSVP
  }
  type Mutation {
    registerUser(
      fullName: String!
      email: String!
      password: String!
    ): AuthPayload
    loginUser(email: String!, password: String!): AuthPayload
    submitRSVP(
      attending: AttendanceStatus!
      mealPreference: String!
      allergies: String
      additionalNotes: String
    ): RSVP
    editRSVP(updates: RSVPInput!): RSVP
  }
`;
```

### 5. Auth Middleware (server/src/middleware/auth.ts)

```ts
import jwt from "jsonwebtoken";
import { Request } from "express";

export const authMiddleware = ({ req }: { req: Request }) => {
  // Get token from headers
  let token = req.headers.authorization || "";
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return { user };
  } catch {
    return {};
  }
};
```

---

## Example: Wedding Website Modeled After alexandbailey2024.com

## Site Structure & Main Sections

- **Home**: Hero banner with wedding date, location, and live countdown timer. Quick links to RSVP, Registry, and Travel Guide.
- **Our Story**: Vertical timeline of milestones (First Date, Engagement, Proposal) with captions and dates.
- **The Details**: Ceremony & reception times, venue address, dress code, embedded Google Map.
- **Gallery**: Masonry grid of photos, lightbox modal for full-screen viewing.
- **Wedding Party**: Headshots, names, roles, and short bios/fun facts.
- **Travel Guide**: Lodging recommendations, airport/transportation tips, local attractions.
- **FAQs**: Accordion Q&A for common questions (parking, plus-ones, children, accessibility, registry).
- **Registry**: External links/buttons (e.g., Zola, Amazon) and thank you message.
- **RSVP**: Multi-step form (attendance, meal, allergies, notes), confirmation screen, access control by email.
- **Guestbook (optional)**: Message form and live-updating feed.

## User Experience & Interactive Flows

- Sticky global navigation with section highlighting as you scroll.
- Smooth scroll to anchors on nav click.
- RSVP flow: email verification, multi-step form, inline validation, confirmation message.
- Accordion FAQ: only one panel open at a time.
- Gallery lightbox: modal with keyboard/swipe navigation.
- Countdown timer: live update to event start.

## Sample Public Text Content

- **Hero Welcome**: "We’re getting married! Saturday, August 17, 2024 | 4:00pm Greenwood Gardens, NJ"
- **RSVP Intro**: "Please let us know if you’ll join us!"
- **Ceremony Details**: "Ceremony begins promptly at 4:00pm at the Rose Arbor (address below). Reception to follow in the Garden Pavilion."
- **Registry Message**: "We’re so grateful for your love and support. If you’d like to honor us with a gift, our registry is here."

## Design & Style Guidelines

- **Colors**: Blush pink (#F7D3D8), slate gray (#4A4A4A), gold (#C9A66B), ivory (#FAF6F0)
- **Typography**: Headings in "Playfair Display" (serif), body in "Lato" or "Montserrat" (sans-serif)
- **Layout**: Responsive, mobile-first, generous white space, cards with 8px radius and subtle shadows
- **Imagery**: Full-width hero, gallery grid with cropping, soft overlays for text readability

## Unique Features to Replicate

- **Live Countdown Timer**: React state + setInterval, updates every second
- **Map Integration**: Google Maps iframe with custom marker
- **RSVP Access Control**: Email check via GraphQL before showing form
- **Gallery Lightbox**: Modal with keyboard/swipe navigation
- **Sticky Section Indicators**: Navbar highlights current section (Intersection Observer)
- **Guestbook**: GraphQL-backed, live-updating feed

## Example Component: Countdown Timer

```tsx
// src/components/CountdownTimer.tsx
import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2024-08-17T16:00:00-04:00");

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

## Example: Gallery Lightbox (Concept)

- Use a masonry grid for images (e.g., `react-masonry-css`)
- On image click, open a modal with left/right navigation and ESC/overlay close
- Add swipe support for mobile (e.g., `react-swipeable`)

## Example: RSVP Access Control (Concept)

- Show email input before RSVP form
- On submit, check invitation via GraphQL
- If valid, show RSVP form; else, show error

## Example: Sticky Navbar Section Highlight (Concept)

- Use Intersection Observer to detect which section is in view
- Update navbar to highlight the active section

---

This extended example shows how to structure and implement a modern, elegant wedding website with the features and style of alexandbailey2024.com, using React, TypeScript, GraphQL, and best practices from your curriculum.
