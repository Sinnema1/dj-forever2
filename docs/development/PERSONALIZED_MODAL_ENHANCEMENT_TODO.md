# Personalized Modal Enhancement TODO

## 🎯 Overview

Enhance the WelcomeModal and PersonalizedWelcome components to support more dynamic, database-driven personalization beyond the current basic name extraction.

## 📋 Current State (Updated: November 24, 2025)

### ✅ Phase 1 - COMPLETE

- ✅ User model expanded with 7 personalization fields
- ✅ GraphQL schema updated
- ✅ Database migration ready
- ✅ TypeScript interfaces updated

### ✅ Phase 2 - COMPLETE

- ✅ Relationship-based welcome messages
- ✅ Custom messages from the couple
- ✅ Dynamic content based on guest group
- ✅ Plus-one notifications in WelcomeModal
- ✅ Personal photos for each guest
- ✅ Special instructions (travel, accommodation, parking)
- ✅ Admin interface to manage guest personalization
- ✅ All fields tested and deployed

**Implemented Fields**:

- `relationshipToBride` - Free text field for relationship description
- `relationshipToGroom` - Free text field for relationship description
- `customWelcomeMessage` - Fully custom message (500 chars)
- `guestGroup` - Enum: grooms_family, brides_family, friends, extended_family, other
- `plusOneAllowed` - Boolean flag
- `personalPhoto` - URL to guest's personal photo
- `specialInstructions` - Travel/accommodation info (1000 chars)

## ✅ Phase 3: Advanced Personalization Features - COMPLETE (December 20, 2025)

**All Phase 3 features fully implemented and tested (66/66 tests passing).**

### Enhanced Banner System

**File**: `/client/src/components/PersonalizedWelcome.tsx`

**New Banner Types**:

- [x] Travel reminders for out-of-town guests
- [x] Accommodation booking prompts
- [x] Wedding party specific messages
- [x] RSVP deadline warnings
- [x] Thank you messages for completed RSVPs

**Implementation Strategy**:

- Use `specialInstructions` field to trigger banner display
- Add banner priority system (deadline warnings > travel reminders > thank you)
- Dismissible banners with localStorage persistence
- Mobile-responsive banner design

### Smart RSVP Pre-population

**Files**:

- `/client/src/components/WelcomeModal.tsx`
- `/client/src/components/RSVP/RSVPForm.tsx`

**Features**:

- [x] Pre-populate RSVP with known dietary restrictions
- [x] Auto-set guest count based on `plusOneAllowed`
- [x] Display dietary preferences in welcome modal
- [x] Pre-fill guest names for known plus-ones

**Technical Notes**:

- ✅ `dietaryRestrictions` field added to User model
- ✅ `plusOneName` field added to User model
- ✅ RSVP form pre-fills from user context
- ✅ Maintains edit capability (doesn't force pre-filled values)

### Admin Bulk Upload Tools

**New Files**:

- `/client/src/pages/admin/BulkPersonalization.tsx`
- `/server/src/scripts/importGuestData.ts`

**Features**:

- [x] CSV upload for bulk guest data import
- [x] Excel template download
- [x] Validation and preview before import
- [x] Progress tracking for large uploads
- [x] Rollback capability for bad imports

**Implementation**:

- ✅ Tracks affected users after import
- ✅ Shows detailed import results (created/updated/failed)
- ✅ Provides list of all affected users for manual reversion if needed
- ✅ Clear import history button to reset state

**Data Format**:

```csv
fullName,email,relationshipToBride,relationshipToGroom,guestGroup,plusOneAllowed,customWelcomeMessage,specialInstructions
"John Doe","john@example.com","College Friend","","friends","true","","Hotel block at Marriott"
```

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
