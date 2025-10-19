# Wedding Website Routing Guide

## Overview

This document describes all navigation paths and routing behavior in the DJ Forever 2 wedding website.

## Route Types

### 1. **Page Routes** (React Router)

Full page navigation with URL changes:

| Route                | Component              | Access       | Description                          |
| -------------------- | ---------------------- | ------------ | ------------------------------------ |
| `/`                  | HomePage               | Public       | Main landing page with all sections  |
| `/rsvp`              | RSVPStandalonePage     | Invited Only | Standalone RSVP form page            |
| `/registry`          | RegistryStandalonePage | Public       | Registry information page            |
| `/admin`             | AdminPage              | Admin Only   | Admin dashboard for guest management |
| `/login/qr/:qrToken` | QRTokenLogin           | Public       | QR code authentication endpoint      |
| `/login/success`     | LoginSuccess           | Public       | Post-authentication confirmation     |
| `/qr-help`           | QRInfoPage             | Public       | QR code scanning help                |
| `/auth-debug`        | AuthDebug              | Public       | Authentication debugging page        |

### 2. **Homepage Anchor Links** (Hash Navigation)

Smooth scroll to sections within HomePage (`/`):

| Hash          | Section      | Description                            |
| ------------- | ------------ | -------------------------------------- |
| `/#our-story` | Our Story    | Couple's story section                 |
| `/#details`   | The Details  | Wedding ceremony and reception details |
| `/#gallery`   | Gallery      | Photo gallery with lightbox            |
| `/#travel`    | Travel Guide | Travel and accommodation information   |
| `/#faqs`      | FAQs         | Frequently asked questions             |
| `/#guestbook` | Guestbook    | Guest messages and well-wishes         |

**Note**: There is **NO** `#rsvp` section on the homepage. RSVP is a standalone page at `/rsvp`.

## Navigation Components

### PersonalizedWelcome Banner

**File**: `/client/src/components/PersonalizedWelcome.tsx`

**Behavior**:

- Shows personalized welcome message to authenticated users
- **RSVP Button**: Links to `/rsvp` (standalone page)
- **Admin Button**: Links to `/admin` (admin dashboard)
- Auto-hides after 5 seconds (10 seconds for admin)

**Fixed Issues**:

- ❌ Previously used `href="#rsvp"` (invalid - no such section)
- ✅ Now uses `href="/rsvp"` (correct standalone page)

### WelcomeModal

**File**: `/client/src/components/WelcomeModal.tsx`

**Behavior**:

- Shows on first visit for authenticated invited guests
- **RSVP Now Button**: Links to `/rsvp`
- **Explore Website Button**: Closes modal, stays on homepage

### RSVPConfirmation

**File**: `/client/src/components/RSVP/RSVPConfirmation.tsx`

**Next Steps Links** (for attending guests):

- **View Wedding Details**: `href="/#details"` → Navigates to homepage #details section
- **Travel Information**: `href="/#travel"` → Navigates to homepage #travel section
- **Back to Home**: `href="/"` → Returns to homepage top

**Fixed Issues**:

- ❌ Previously used `href="/details"` and `href="/travel"` (invalid routes)
- ✅ Now uses `href="/#details"` and `href="/#travel"` (correct hash navigation)

### Navbar

**File**: `/client/src/components/Navbar.tsx`

**Section Links** (Homepage only):

- Our Story → `#our-story`
- Details → `#details`
- Gallery → `#gallery`
- Travel → `#travel`
- FAQs → `#faqs`
- Guestbook → `#guestbook`

**Page Links** (All pages):

- Registry → `/registry`
- RSVP → `/rsvp` (invited users only)
- Admin → `/admin` (admin users only)

## Access Control

### InvitedRoute

**File**: `/client/src/components/InvitedRoute.tsx`

Wraps routes requiring invitation:

- `/rsvp` - RSVP form page

**Behavior**:

- Checks `user.isInvited` status
- Redirects to homepage if not invited
- Shows authentication prompt if not logged in

### AdminRoute

**File**: `/client/src/components/AdminRoute.tsx`

Wraps routes requiring admin access:

- `/admin` - Admin dashboard

**Behavior**:

- Checks `user.isAdmin` status
- Redirects to homepage if not admin
- Shows authentication prompt if not logged in

## Navigation Patterns

### From Homepage to RSVP

1. Click navbar "RSVP" button → `/rsvp`
2. Click PersonalizedWelcome "RSVP Now" button → `/rsvp`
3. Click WelcomeModal "RSVP Now 💌" button → `/rsvp`

### From RSVP Confirmation to Other Pages

1. Click "View Wedding Details" → `/#details` (homepage section)
2. Click "Travel Information" → `/#travel` (homepage section)
3. Click "Back to Home" → `/` (homepage top)

### Within Homepage

1. Click navbar section links → Smooth scroll to hash anchors
2. All sections use `id` attributes matching hash links

## Testing

### Route Validation

All routes validated in:

- `/client/src/App.tsx` - Route definitions
- `/client/tests/App.e2e.test.tsx` - E2E route testing
- `/client/tests/Navbar.e2e.test.tsx` - Navigation component testing

### Hash Navigation Testing

Test hash links work correctly:

```typescript
// Example test
const detailsLink = screen.getByRole("link", { name: /details/i });
expect(detailsLink).toHaveAttribute("href", "/#details");
```

## Common Issues & Solutions

### Issue 1: RSVP Button on Homepage

**Problem**: Clicking PersonalizedWelcome "RSVP Now" doesn't navigate anywhere
**Cause**: Using `href="#rsvp"` when no such section exists on homepage
**Solution**: Changed to `href="/rsvp"` to navigate to standalone RSVP page

### Issue 2: Confirmation Next Steps Links

**Problem**: "View Wedding Details" and "Travel Information" show 404 errors
**Cause**: Using `/details` and `/travel` routes that don't exist
**Solution**: Changed to `/#details` and `/#travel` to navigate to homepage sections

### Issue 3: Navigation Between Routes

**Problem**: Hash navigation doesn't work from RSVP page
**Cause**: Hash links are relative to current route
**Solution**: Use absolute hash links: `href="/#section"` instead of `href="#section"`

## Best Practices

1. **Page Routes**: Use `/path` for full page navigation
2. **Homepage Sections**: Use `/#section` for hash navigation to homepage sections
3. **Relative Hash Links**: Only use `#section` for same-page navigation
4. **Access Control**: Always wrap protected routes with InvitedRoute or AdminRoute
5. **Testing**: Test navigation flows in E2E tests, not just individual links

## Future Enhancements

Potential routing improvements:

- [ ] Add `/gallery` standalone page for direct gallery access
- [ ] Add `/travel` standalone page for comprehensive travel guide
- [ ] Implement scroll restoration for hash navigation
- [ ] Add route transition animations
- [ ] Implement breadcrumb navigation for standalone pages
