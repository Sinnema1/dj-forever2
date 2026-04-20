# Post-Wedding Refactor

Items deferred because they require database migrations, breaking API changes, or are
otherwise too risky to touch while guests are actively using the site.

---

## Data model: remove stored `guestCount` field

**Risk if done live:** Requires a MongoDB migration, GraphQL schema change, and client
query updates. Stale values in production documents could corrupt reads during the rollout.

**What to do:**
- Remove `guestCount` from the RSVP schema (`server/src/models/RSVP.ts`) and all write
  paths. `guests.length` is already the authoritative headcount.
- Delete the pre-save hook that normalizes `guestCount = guests.length - 1`. It only
  exists to maintain the redundant field.
- Delete the `totalGuestCount` virtual (also in `RSVP.ts`) — it computes `1 + guestCount`
  which equals `guests.length`. Never called; dead code.
- Update `getAttendanceStats` aggregation in `RSVP.ts` from
  `$sum: { $add: [1, "$guestCount"] }` to `$sum: { $size: "$guests" }`.
- Update `getWeddingStats` in `adminService.ts` similarly.
- Remove `validateGuestCount` calls and the normalization code added to `createRSVP` and
  `updateRSVP` in `rsvpService.ts` — they all exist purely to maintain `guestCount`.
- Write a one-time migration script (alongside the existing scripts in
  `server/src/scripts/`) to `$unset` the field from all existing documents.

**Why it's worth doing later:** The current design has caused two bugs already. Every new
developer touching RSVP writes has to re-learn the non-obvious `guests.length - 1`
convention. Removing the field eliminates an entire class of drift bugs and ~30 lines of
normalization code.

---

## Data model: remove legacy top-level RSVP fields

**Risk if done live:** `fullName`, `mealPreference`, and `allergies` are stored at the
top level of the RSVP document for backward compatibility. They duplicate `guests[0]`.
Removing them requires confirming no active client query depends on them.

**What to do:**
- Audit every GraphQL query and mutation that reads `fullName`/`mealPreference`/`allergies`
  off the top-level RSVP object. The client queries in `mutations.ts` and `queries.ts` both
  request these fields — update them to read from `guests[0]` instead.
- Once clients no longer request them, remove the fields from the GraphQL `RSVP` type in
  `typeDefs.ts` and from the Mongoose schema in `RSVP.ts`.
- Write a migration script to strip the fields from existing documents, or leave them in
  place (MongoDB ignores unknown fields) and just stop writing them.
- The one active sync gap to fix first: `adminUpdateRSVP` in `adminService.ts` does not
  update legacy top-level fields when guests change (because it uses `.save()` through the
  Mongoose model, which only runs the pre-save hook — the hook doesn't sync legacy fields).

---

## Dead code: `server/src/graphql/context.ts`

**Risk if done live:** Low, but the file is not used by `server.ts`, so touching it could
create confusion about whether it's being activated.

**What to do:**
- Delete `server/src/graphql/context.ts`. It contains a `decoded.id` reference that should
  be `decoded.userId` (the actual JWT payload field). `server.ts` uses `getUserFromRequest`
  from `middleware/auth.ts` instead, so this file is never called.
- Confirm via grep that nothing imports it before deleting.

---

## Admin RSVP update: missing party size validation

**Risk if done live:** Changing admin mutation behavior during active use could block
legitimate admin corrections.

**What to do:**
- Add `validatePartySize` to `adminUpdateRSVP` in `adminService.ts` (currently absent —
  admins can write any guest count). Decide whether admins should be exempt or capped.
- The function currently uses `.save()` so the pre-save hook runs; the missing piece is
  only the explicit party size guard before the save.

---

## Legacy `submitRSVP` mutation

**Risk if done live:** Removing a GraphQL mutation is a breaking change for any client
still calling it (e.g., old cached app versions on guest devices).

**What to do:**
- After the wedding, confirm no client is calling `submitRSVP` (check server logs).
- Remove the mutation from `typeDefs.ts`, `resolvers.ts`, and the `submitRSVP` function
  from `rsvpService.ts`. All current client code uses `createRSVP`/`editRSVP`.

---

## Feature flags: re-evaluate dormant features

These are off by default and safe to leave off, but should be explicitly decided on
post-wedding rather than forgotten.

| Flag | File | Status |
|---|---|---|
| `VITE_ENABLE_MEAL_PREFERENCES` | `client/src/config/features.ts` | Off — per-guest meal UI is wired but dormant; food emoji in `RSVPForm.tsx` are placeholders |
| `VITE_ENABLE_GUESTBOOK` | `client/src/config/features.ts` | Off — full feature behind flag |

Each should either be enabled with a QA pass or removed from the codebase to avoid
maintaining dead UI paths indefinitely.
