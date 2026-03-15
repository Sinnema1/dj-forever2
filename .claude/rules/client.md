---
paths:
  - "client/**"
---

# Client-Side Rules

## Apollo Client

- Error link and JWT auth header injection are configured in `client/src/api/apolloClient.ts` — check there before adding custom fetch logic
- JWT is stored in `localStorage` as `'id_token'` and injected automatically into every request
- Cache is `InMemoryCache` with normalized queries — don't bypass with `fetchPolicy: 'no-cache'` unless there's a specific reason

## React Portals & Modal Architecture

- `QRLoginModal` and `SwipeableLightbox` render to `document.body` via React Portal — CSS positioning must account for this (viewport-relative, not container-relative)
- z-index hierarchy: Content (1–100) → Drawers (999999) → Modals (9999) — use `!important` on modal z-index where needed

## QR Scanner Resource Management

- Always call `scanner.stop()` before `scanner.clear()` — doing it in the wrong order throws "Cannot clear while scan is ongoing"
- Use unique, stable IDs for scanner DOM elements; clean up in `useEffect` return function
- Desktop QR scanning requires the most careful cleanup — modal close/reopen cycles are the common failure point

## Feature Flags

- `VITE_ENABLE_MEAL_PREFERENCES` — meal preference UI is off; the food emoji (🍗 🥩 🐟 🥗 🌱 🍕) in RSVPForm are dormant. Do not add meal UI without enabling this flag first.
- `VITE_ENABLE_GUESTBOOK` — guestbook is off

## Component-Specific Notes

- `useLayoutEffect` in `PersonalizedWelcome.tsx` is intentional — it clears banners before paint when the user changes, preventing a one-frame flash of the previous guest's banner. Do not convert to `useEffect`.
- `PersonalizedWelcome` banner state is scoped to `localStorage` keys namespaced by `user._id` (format: `djforever:<userId>:banners:dismissed`). All household members share the same `_id`.

## Mobile-First

- All components are designed with touch interactions as the baseline; desktop behavior layers on top
- Photo gallery supports double-tap zoom via `SwipeableLightbox`
- Scrollbars: invisible on mobile, 8px with hover effect on desktop (WebKit + Firefox)
- PWA: service worker in `sw-enhanced.js`, offline fallback page configured in `vite.config.ts`
