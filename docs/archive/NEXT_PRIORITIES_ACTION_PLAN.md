# Next Priorities - Comprehensive Action Plan

**Date**: November 9, 2025  
**Status**: Ready to Begin  
**Previous Work**: 5/6 Accessibility TODOs Complete (83%)

---

## 📋 Overview

This document outlines the next four priority areas for the DJ Forever 2 wedding website after completing the comprehensive accessibility enhancements.

### Priority Items

1. **Personalized Modal Enhancement** - Database-driven guest personalization
2. **Mobile Enhancement Plan** - Advanced mobile UX features
3. **Admin Feature Testing in Production** - Validate production environment
4. **Code TODOs - Technical Improvements** - Clean up technical debt

---

## 1️⃣ Personalized Modal Enhancement

**Priority**: Medium-High  
**Complexity**: High  
**Estimated Time**: 10-12 days  
**Dependencies**: Database migration, GraphQL updates

### Current State

✅ **Working**:

- Basic name personalization (`user.fullName.split(" ")[0]`)
- RSVP status checking
- Modal persistence via localStorage

❌ **Missing**:

- Database-driven relationship messaging
- Custom messages per guest
- Guest group categorization
- Plus-one logic
- Special instructions

### Implementation Phases

#### Phase 1: Expand User Model (2-3 days)

**Backend Changes**:

```typescript
// New fields to add to User model
interface User {
  // Existing fields...

  // NEW:
  relationshipToBride?: "family" | "friend" | "coworker" | "college" | "other";
  relationshipToGroom?: "family" | "friend" | "coworker" | "college" | "other";
  customWelcomeMessage?: string;
  specialInstructions?: string;
  guestGroup?: string; // "Wedding Party", "Family", etc.
  plusOneAllowed?: boolean;
  dietaryRestrictions?: string[];
  tableAssignment?: string;
  accommodationBooked?: boolean;
}
```

**Tasks**:

- [ ] Update GraphQL schema (`server/src/graphql/typeDefs.ts`)
- [ ] Update Mongoose User model (`server/src/models/User.ts`)
- [ ] Create database migration script
- [ ] Update TypeScript interfaces (`client/src/models/userTypes.ts`)
- [ ] Test backward compatibility

#### Phase 2: Enhanced Welcome Modal (3-4 days)

**Component**: `client/src/components/WelcomeModal.tsx`

**Features to Add**:

- [ ] Relationship-based greeting messages
- [ ] Custom messages from couple
- [ ] Dynamic content based on guest group
- [ ] Personalized RSVP prompts
- [ ] Travel info for out-of-town guests

**Implementation Pattern**:

```tsx
const getPersonalizedGreeting = () => {
  if (user.customWelcomeMessage) return user.customWelcomeMessage;

  const relationship = user.relationshipToBride || user.relationshipToGroom;
  switch (relationship) {
    case "family":
      return `We're so excited to celebrate with family like you, ${firstName}!`;
    case "college":
      return `It means the world to have our college friends here, ${firstName}!`;
    default:
      return `We are absolutely thrilled that you're here, ${firstName}!`;
  }
};
```

**Tasks**:

- [ ] Create message template system
- [ ] Add relationship-based logic
- [ ] Implement custom message display
- [ ] Add guest group indicators
- [ ] Update tests

#### Phase 3: Smart RSVP Integration (2-3 days)

**Components**:

- `client/src/components/WelcomeModal.tsx`
- `client/src/components/RSVP/RSVPForm.tsx`

**Features**:

- [ ] Pre-populate dietary restrictions
- [ ] Show plus-one options based on `plusOneAllowed`
- [ ] Display custom RSVP deadlines
- [ ] Integrate table assignments
- [ ] Add special instructions display

**Tasks**:

- [ ] Update RSVPForm to consume new user fields
- [ ] Add conditional plus-one logic
- [ ] Pre-fill dietary restrictions
- [ ] Display special instructions
- [ ] Test various user scenarios

#### Phase 4: Admin Management Interface (2-3 days)

**New Files**:

- `client/src/pages/AdminGuestPersonalization.tsx`
- `client/src/components/admin/GuestPersonalizationPanel.tsx`

**Features**:

- [ ] Bulk upload guest data
- [ ] Edit custom messages per guest
- [ ] Preview personalized content
- [ ] Guest group management
- [ ] Analytics on personalization

**Tasks**:

- [ ] Create admin UI for personalization
- [ ] Add bulk import functionality
- [ ] Build preview system
- [ ] Add analytics tracking
- [ ] Test admin workflows

### Success Metrics

- **Increased RSVP completion**: Target +15%
- **Higher engagement**: More time on site
- **Reduced support requests**: Fewer questions about basic info
- **Positive feedback**: Guest testimonials

### Risks & Mitigation

| Risk                      | Impact | Mitigation                        |
| ------------------------- | ------ | --------------------------------- |
| Database migration issues | High   | Thorough testing, rollback plan   |
| Performance impact        | Medium | Lazy loading, caching strategy    |
| Privacy concerns          | High   | Clear data policy, secure storage |
| Backward compatibility    | Medium | Feature flags, gradual rollout    |

---

## 2️⃣ Mobile Enhancement Plan

**Priority**: High  
**Complexity**: Medium-High  
**Estimated Time**: 4 weeks  
**Current State**: Mobile-first design ✅, needs advanced features

### Priority Matrix

#### 🔴 HIGH PRIORITY (Week 1-2)

**1. Swipeable Gallery** ⭐⭐⭐⭐⭐

- **Status**: ✅ **COMPLETE** - Already implemented
- **Component**: `SwipeableLightbox.tsx` already exists
- **Files**: Component and CSS already in place
- **Action**: ✅ Verify functionality and add to documentation

**2. Enhanced PWA Features** ⭐⭐⭐⭐⭐

- **User Impact**: Very High
- **Time**: 1-2 days
- **Files**: Enhanced `vite.config.ts`, `offline.html`
- **Tasks**:
  - [ ] Test PWA installation on iOS/Android
  - [ ] Verify offline functionality
  - [ ] Add install prompt optimization
  - [ ] Test update mechanisms
  - [ ] Add splash screen images

**3. Offline Functionality** ⭐⭐⭐⭐

- **User Impact**: High (critical for poor reception areas)
- **Time**: 3-4 days
- **Files**: `public/sw-enhanced.js`, `public/offline.html`
- **Tasks**:
  - [ ] Enhance service worker caching strategy
  - [ ] Add offline RSVP form data persistence
  - [ ] Implement sync when back online
  - [ ] Test offline scenarios
  - [ ] Add offline indicator UI

#### 🟡 MEDIUM PRIORITY (Week 3)

**4. Guest Photo Sharing** ⭐⭐⭐⭐⭐

- **User Impact**: Very High - Highly requested
- **Time**: 1 week
- **Complexity**: High (requires backend)
- **Tasks**:
  - [ ] Design photo upload UI
  - [ ] Implement backend photo storage (S3/Cloudinary)
  - [ ] Add photo moderation system
  - [ ] Create photo gallery feed
  - [ ] Add compression for mobile uploads
  - [ ] Test on real devices

**5. Pull-to-Refresh** ⭐⭐⭐

- **User Impact**: Medium - Nice UX improvement
- **Time**: 1-2 days
- **Tasks**:
  - [ ] Create `usePullToRefresh` hook
  - [ ] Integrate with main content areas
  - [ ] Add visual feedback
  - [ ] Test on iOS/Android
  - [ ] Add to PWA best practices

**6. Enhanced Error States** ⭐⭐⭐

- **User Impact**: Medium
- **Time**: 1 day
- **Tasks**:
  - [ ] Audit existing error components
  - [ ] Create unified `ErrorState` component
  - [ ] Replace error boundaries
  - [ ] Add retry mechanisms
  - [ ] Test error scenarios

#### 🟢 LOW PRIORITY (Week 4)

**7. Venue Check-in System** ⭐⭐⭐⭐

- **User Impact**: High for event management
- **Time**: 2-3 days
- **Tasks**:
  - [ ] Design check-in UI
  - [ ] Backend integration for staff
  - [ ] Real-time stats dashboard
  - [ ] QR code check-in flow
  - [ ] Test with mock data

**8. Push Notifications** ⭐⭐

- **User Impact**: Medium
- **Time**: 1 week
- **Tasks**:
  - [ ] Generate VAPID keys
  - [ ] Implement notification service
  - [ ] Add subscription management
  - [ ] Create notification triggers
  - [ ] Test on iOS/Android

### Mobile Testing Checklist

**Required Device Testing**:

- [ ] iPhone (Safari) - iOS 15+
- [ ] Android Chrome - Android 10+
- [ ] iPad (Safari) - iPadOS 15+
- [ ] Android Tablet - Chrome

**Feature Testing**:

- [ ] Swipe gestures in gallery ✅
- [ ] Touch targets (44px+ minimum)
- [ ] Form input experience (no zoom on iOS)
- [ ] PWA installation prompt
- [ ] Offline functionality
- [ ] Photo upload from camera
- [ ] QR scanner performance

### Quick Wins (Can Do Today)

1. ✅ Import mobile enhancements CSS - **DONE**
2. ✅ Update viewport meta tag - **DONE**
3. ✅ Swipeable gallery - **ALREADY IMPLEMENTED**
4. ⏳ Test enhanced PWA features
5. ⏳ Add pull-to-refresh to main pages

---

## 3️⃣ Admin Feature Testing in Production

**Priority**: High (Risk Mitigation)  
**Complexity**: Low  
**Estimated Time**: 1-2 days  
**Goal**: Validate admin features work correctly in production environment

### Current Admin Features

**Implemented & Needs Testing**:

1. Admin Dashboard (`/admin`)
2. Guest Management (CRUD operations)
3. RSVP Manager
4. Email Reminders
5. Guest List Export
6. Production analytics

### Testing Plan

#### Phase 1: Environment Validation (1 hour)

**Tasks**:

- [ ] Verify production database connection
- [ ] Check admin authentication flow
- [ ] Validate environment variables
- [ ] Test QR token generation
- [ ] Confirm email service configuration

**Commands**:

```bash
# Check production health
curl https://dj-forever2.onrender.com/health

# Test GraphQL endpoint
curl https://dj-forever2.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}'
```

#### Phase 2: Admin CRUD Operations (2-3 hours)

**Test Cases**:

1. **Guest Creation**:

   - [ ] Create new guest with all fields
   - [ ] Verify QR code generation
   - [ ] Check email notification sent
   - [ ] Validate database entry

2. **Guest Update**:

   - [ ] Update guest information
   - [ ] Modify RSVP status
   - [ ] Change invitation status
   - [ ] Verify changes persist

3. **Guest Deletion**:

   - [ ] Soft delete guest
   - [ ] Verify RSVP data handling
   - [ ] Check referential integrity
   - [ ] Confirm QR code invalidation

4. **Bulk Operations**:
   - [ ] Export guest list to CSV
   - [ ] Bulk email sending
   - [ ] Filter and search guests
   - [ ] Pagination with large datasets

#### Phase 3: RSVP Management (1-2 hours)

**Test Cases**:

- [ ] View all RSVPs
- [ ] Filter by attendance status
- [ ] Export RSVP data
- [ ] Dietary restrictions summary
- [ ] Guest count analytics
- [ ] Meal preference breakdown

#### Phase 4: Email Reminders (1 hour)

**Test Cases**:

- [ ] Send test email to yourself
- [ ] Bulk reminder to non-RSVPed guests
- [ ] Verify email delivery
- [ ] Check email template rendering
- [ ] Test email tracking/analytics

#### Phase 5: Production Data Integrity (1 hour)

**Validation**:

- [ ] Check for orphaned RSVPs
- [ ] Validate all user-RSVP relationships
- [ ] Verify QR token uniqueness
- [ ] Check for duplicate guests
- [ ] Validate email format consistency

**Scripts**:

```bash
# Run data integrity checks
cd server && npm run check:data-integrity

# Verify all QR tokens are unique
cd server && node checkTokens.js
```

#### Phase 6: Performance Testing (1 hour)

**Metrics to Check**:

- [ ] Admin dashboard load time
- [ ] Guest list query performance
- [ ] RSVP creation/update speed
- [ ] Email sending throughput
- [ ] Export generation time

**Tools**:

- Chrome DevTools Performance tab
- Network waterfall analysis
- Lighthouse audit for admin pages

### Production Testing Checklist

**Pre-Testing**:

- [ ] Backup production database
- [ ] Set up staging environment if needed
- [ ] Notify team of testing window
- [ ] Prepare rollback plan

**During Testing**:

- [ ] Document all issues found
- [ ] Take screenshots of errors
- [ ] Note performance bottlenecks
- [ ] Track any data anomalies

**Post-Testing**:

- [ ] Create issue tickets for bugs
- [ ] Update documentation
- [ ] Share findings with team
- [ ] Plan fixes for critical issues

### Known Issues to Verify

**From Previous Testing**:

- [ ] Verify QR code scanning works on production
- [ ] Check RSVP form submission
- [ ] Validate email delivery
- [ ] Test authentication flow
- [ ] Confirm admin permissions

**Production-Specific**:

- [ ] SSL/HTTPS working correctly
- [ ] CORS configured properly
- [ ] Rate limiting effective
- [ ] Session management stable
- [ ] Error logging functional

---

## 4️⃣ Code TODOs - Technical Improvements

**Priority**: Medium  
**Complexity**: Low-Medium  
**Estimated Time**: 2-3 days  
**Goal**: Clean up technical debt and implement deferred features

### Identified TODOs

#### 1. Performance Monitor Analytics Integration

**Location**: `client/src/services/performanceMonitor.ts`  
**Lines**: 130, 137  
**Priority**: Medium

**Current State**:

```typescript
// TODO: Integrate with actual analytics service
if (process.env.NODE_ENV === "development") {
  console.log("Analytics Event:", { event, userId, properties });
}
```

**Implementation Options**:

**Option A: Google Analytics 4**

```typescript
// Install: npm install react-ga4
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");

export const analyticsService = {
  track: (event: string, userId?: string, properties?: AnalyticsProperties) => {
    ReactGA.event({
      category: properties?.category || "general",
      action: event,
      label: userId,
      ...properties,
    });
  },
  trackPerformance: (data: PerformanceMetricData) => {
    ReactGA.event({
      category: "Web Vitals",
      action: data.name,
      value: Math.round(data.value),
      label: data.rating,
    });
  },
};
```

**Option B: Plausible Analytics** (Privacy-focused)

```typescript
// Install: npm install plausible-tracker
import Plausible from "plausible-tracker";

const plausible = Plausible({
  domain: "dj-forever2.onrender.com",
});

export const analyticsService = {
  track: (event: string, userId?: string, properties?: AnalyticsProperties) => {
    plausible.trackEvent(event, { props: { userId, ...properties } });
  },
  trackPerformance: (data: PerformanceMetricData) => {
    plausible.trackEvent("Performance", {
      props: {
        metric: data.name,
        value: data.value,
        rating: data.rating,
      },
    });
  },
};
```

**Option C: PostHog** (Open source, self-hosted option)

```typescript
// Install: npm install posthog-js
import posthog from "posthog-js";

posthog.init("YOUR_API_KEY", {
  api_host: "https://app.posthog.com",
});

export const analyticsService = {
  track: (event: string, userId?: string, properties?: AnalyticsProperties) => {
    posthog.capture(event, { userId, ...properties });
  },
  trackPerformance: (data: PerformanceMetricData) => {
    posthog.capture("performance_metric", data);
  },
};
```

**Tasks**:

- [ ] Choose analytics provider (recommend Plausible for privacy)
- [ ] Install and configure analytics SDK
- [ ] Replace TODO with actual implementation
- [ ] Add environment variable for analytics key
- [ ] Test event tracking
- [ ] Update documentation

#### 2. Smooth Scroll Utility

**Location**: `client/src/utils/smoothScroll.ts`  
**Line**: 1  
**Priority**: Low

**Current State**:

```typescript
// TODO: Implement smooth scroll utility or use a library like react-scroll
export function smoothScroll(targetId: string) {
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
```

**Implementation Options**:

**Option A: Native Enhancement** (Recommended - no dependencies)

```typescript
/**
 * Enhanced smooth scroll utility with offset support
 * @param targetId - Element ID to scroll to
 * @param offset - Offset from top in pixels (for fixed headers)
 */
export function smoothScroll(targetId: string, offset: number = 80) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

/**
 * Scroll to top of page
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}
```

**Option B: react-scroll Library**

```typescript
// Install: npm install react-scroll
import { scroller } from "react-scroll";

export function smoothScroll(targetId: string, offset: number = -80) {
  scroller.scrollTo(targetId, {
    duration: 800,
    delay: 0,
    smooth: "easeInOutQuart",
    offset,
  });
}
```

**Recommendation**: Use Option A (native enhancement) - no dependencies, better performance

**Tasks**:

- [ ] Implement enhanced smooth scroll utility
- [ ] Add offset support for fixed navbar
- [ ] Update all scroll references
- [ ] Test on iOS/Android Safari
- [ ] Remove TODO comment

### Additional Code Quality Improvements

#### 3. Type Safety Enhancements

**Tasks**:

- [ ] Review and strengthen TypeScript strict mode
- [ ] Add missing type annotations
- [ ] Remove any `any` types
- [ ] Add JSDoc comments for complex functions
- [ ] Update interface documentation

#### 4. Error Handling Standardization

**Tasks**:

- [ ] Create centralized error handling utility
- [ ] Standardize error messages
- [ ] Add error boundary logging
- [ ] Improve user-facing error messages
- [ ] Add retry logic for failed requests

#### 5. Performance Optimizations

**Tasks**:

- [ ] Audit and optimize bundle size
- [ ] Add code splitting for large components
- [ ] Optimize image loading
- [ ] Review and remove unused dependencies
- [ ] Add performance budgets

#### 6. Testing Coverage

**Current**: 25 tests passing  
**Goal**: 40+ tests

**Tasks**:

- [ ] Add tests for new personalization features
- [ ] Test admin CRUD operations
- [ ] Add mobile gesture tests
- [ ] Test offline functionality
- [ ] Add performance regression tests

### Technical Debt Prioritization

| Item                  | Priority | Effort | Impact |
| --------------------- | -------- | ------ | ------ |
| Analytics Integration | High     | Medium | High   |
| Smooth Scroll         | Low      | Low    | Low    |
| Type Safety           | Medium   | Medium | Medium |
| Error Handling        | High     | Medium | High   |
| Performance           | High     | High   | High   |
| Testing Coverage      | Medium   | High   | High   |

---

## 📊 Overall Priority Ranking

### Week 1 (Nov 11-15)

1. **Admin Feature Testing in Production** - De-risk deployment
2. **Code TODOs** - Quick wins (smooth scroll, analytics setup)
3. **Mobile: PWA Testing** - Validate offline features

### Week 2 (Nov 18-22)

4. **Mobile: Offline Functionality** - Critical for poor reception
5. **Mobile: Pull-to-Refresh** - Nice UX improvement
6. **Code: Error Handling** - Improve reliability

### Week 3-4 (Nov 25-Dec 6)

7. **Personalized Modal: Phase 1-2** - Database & basic features
8. **Mobile: Guest Photo Sharing** - High user value
9. **Code: Performance Optimizations** - Maintain speed

### Week 5-6 (Dec 9-20)

10. **Personalized Modal: Phase 3-4** - Complete personalization
11. **Mobile: Venue Check-in** - Event management
12. **Code: Testing Coverage** - Ensure quality

---

## 🎯 Success Metrics

### Personalized Modal

- [ ] 15%+ increase in RSVP completion
- [ ] Reduced support requests
- [ ] Positive guest feedback

### Mobile Enhancement

- [ ] PWA installation rate > 20%
- [ ] Offline usage tracked
- [ ] Photo sharing engagement

### Admin Testing

- [ ] Zero production incidents
- [ ] All CRUD operations validated
- [ ] Performance within targets

### Code Quality

- [ ] Analytics tracking 100% events
- [ ] Zero high-priority TODOs
- [ ] Test coverage > 50%

---

## 📝 Next Steps

**Immediate Actions** (Today):

1. Review this plan with team
2. Set up production testing window
3. Create tracking issues for each item
4. Begin admin feature testing

**This Week**:

1. Complete admin testing
2. Fix critical analytics TODOs
3. Test PWA features
4. Begin personalization planning

**This Month**:

1. Deliver personalized modal Phase 1-2
2. Complete mobile offline features
3. Launch guest photo sharing
4. Achieve 50%+ test coverage

---

**Document Owner**: Development Team  
**Last Updated**: November 9, 2025  
**Review Schedule**: Weekly during implementation
