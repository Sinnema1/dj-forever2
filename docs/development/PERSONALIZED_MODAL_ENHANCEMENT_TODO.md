# Personalized Modal Enhancement TODO

## 🎯 Overview

Enhance the WelcomeModal and PersonalizedWelcome components to support more dynamic, database-driven personalization beyond the current basic name extraction.

## 📋 Current State

- ✅ Basic personalization using `user.fullName.split(" ")[0]`
- ✅ RSVP status checking (`user.hasRSVPed`)
- ✅ Modal persistence via localStorage
- ❌ Static content hard-coded in components
- ❌ No relationship-based messaging
- ❌ No custom messages per guest

## 🚀 Planned Enhancements

### Phase 1: Expand User Model

**File**: `/client/src/models/userTypes.ts`

```typescript
export interface User {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  isAdmin?: boolean;
  hasRSVPed?: boolean;
  rsvpId?: string | null;

  // NEW FIELDS:
  relationshipToBride?: "family" | "friend" | "coworker" | "college" | "other";
  relationshipToGroom?: "family" | "friend" | "coworker" | "college" | "other";
  customWelcomeMessage?: string; // Personalized message from couple
  specialInstructions?: string; // Travel, accommodation notes
  guestGroup?: string; // "Wedding Party", "Family", etc.
  plusOneAllowed?: boolean; // For RSVP logic
  dietaryRestrictions?: string[]; // For meal planning
  tableAssignment?: string; // For seating chart
  accommodationBooked?: boolean; // Track hotel bookings
}
```

### Phase 2: Backend Data Migration

**Files**: Server-side user model and database

- [ ] Update GraphQL schema with new user fields
- [ ] Create database migration script for existing users
- [ ] Update QR token generation to include new fields
- [ ] Add admin interface to manage guest personalization

### Phase 3: Enhanced Welcome Modal

**File**: `/client/src/components/WelcomeModal.tsx`

**New Features**:

- [ ] Relationship-based welcome messages
- [ ] Custom messages from the couple
- [ ] Dynamic content based on guest group
- [ ] Personalized RSVP prompts
- [ ] Travel information for out-of-town guests

**Implementation**:

```tsx
// Example enhanced personalization
const getPersonalizedGreeting = () => {
  if (user.customWelcomeMessage) {
    return user.customWelcomeMessage;
  }

  const relationship = user.relationshipToBride || user.relationshipToGroom;
  switch (relationship) {
    case "family":
      return `We're so excited to celebrate with family like you, ${firstName}!`;
    case "college":
      return `It means the world to have our college friends here, ${firstName}!`;
    case "coworker":
      return `Thank you for being such an important part of our work family, ${firstName}!`;
    default:
      return `We are absolutely thrilled that you're here, ${firstName}!`;
  }
};
```

### Phase 4: Smart RSVP Integration

**Files**:

- `/client/src/components/WelcomeModal.tsx`
- `/client/src/components/RSVP/RSVPForm.tsx`

**Features**:

- [ ] Pre-populate RSVP with known dietary restrictions
- [ ] Show plus-one options based on `user.plusOneAllowed`
- [ ] Display custom RSVP deadlines per guest group
- [ ] Integrate table assignment information

### Phase 5: Enhanced Banner System

**File**: `/client/src/components/PersonalizedWelcome.tsx`

**New Banner Types**:

- [ ] Travel reminders for out-of-town guests
- [ ] Accommodation booking prompts
- [ ] Wedding party specific messages
- [ ] RSVP deadline warnings
- [ ] Thank you messages for completed RSVPs

### Phase 6: Admin Management Interface

**New Files**:

- `/client/src/pages/AdminGuestManagement.tsx`
- `/client/src/components/admin/GuestPersonalization.tsx`

**Features**:

- [ ] Bulk upload guest personalization data
- [ ] Edit custom messages per guest
- [ ] Preview personalized content
- [ ] Guest group management
- [ ] Analytics on engagement

## 🛠️ Technical Implementation Steps

### Step 1: Database Schema Updates

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN relationship_to_bride VARCHAR(50);
ALTER TABLE users ADD COLUMN relationship_to_groom VARCHAR(50);
ALTER TABLE users ADD COLUMN custom_welcome_message TEXT;
ALTER TABLE users ADD COLUMN guest_group VARCHAR(100);
ALTER TABLE users ADD COLUMN plus_one_allowed BOOLEAN DEFAULT false;
```

### Step 2: GraphQL Schema Updates

```graphql
type User {
  _id: ID!
  fullName: String!
  email: String!
  isInvited: Boolean!
  hasRSVPed: Boolean
  relationshipToBride: RelationshipType
  relationshipToGroom: RelationshipType
  customWelcomeMessage: String
  guestGroup: String
  plusOneAllowed: Boolean
  dietaryRestrictions: [String]
}

enum RelationshipType {
  FAMILY
  FRIEND
  COWORKER
  COLLEGE
  OTHER
}
```

### Step 3: Component Refactoring

- [ ] Create `usePersonalization` hook for common logic
- [ ] Build `PersonalizedContent` wrapper component
- [ ] Implement message template system
- [ ] Add A/B testing for different message variations

## 📊 Success Metrics

- [ ] Increased RSVP completion rate
- [ ] Higher guest engagement with website features
- [ ] Positive feedback on personalized experience
- [ ] Reduced support requests for basic information

## 🎨 UI/UX Considerations

- [ ] Ensure accessibility with screen readers
- [ ] Mobile-responsive personalized content
- [ ] Graceful fallbacks for missing data
- [ ] Performance optimization for large guest lists

## 🔄 Migration Strategy

1. **Backward Compatibility**: Keep existing basic personalization working
2. **Gradual Rollout**: Add new fields incrementally
3. **Data Validation**: Ensure all existing users have sensible defaults
4. **Testing**: Comprehensive testing with various user personas

## 📅 Estimated Timeline

- **Phase 1-2**: 2-3 days (Backend changes)
- **Phase 3-4**: 3-4 days (Frontend enhancements)
- **Phase 5-6**: 2-3 days (Admin tools)
- **Testing & Polish**: 2 days
- **Total**: ~10-12 days

## 🚨 Risks & Considerations

- Database migration complexity with existing user data
- Performance impact with additional user fields
- Privacy concerns with storing personal relationship data
- Maintaining consistency across different personalization levels

## 📝 Notes

- Consider implementing feature flags for gradual rollout
- Document all new personalization options for future reference
- Plan for internationalization if guest list includes non-English speakers
- Consider integration with external services (calendar invites, maps, etc.)

---

**Created**: September 6, 2025  
**Priority**: Medium-High  
**Dependencies**: Database migration, GraphQL updates  
**Assignee**: TBD
