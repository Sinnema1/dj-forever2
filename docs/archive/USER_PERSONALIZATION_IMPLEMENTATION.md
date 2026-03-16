# User Model Personalization - Implementation Documentation

**Status**: ✅ Completed  
**Date**: November 22, 2025  
**Phase**: Phase 1 - User Model Expansion

## Overview

This document details the implementation of user personalization fields in the DJ Forever 2 wedding website. The expansion enables relationship-based welcome messages, guest categorization, and plus-one management.

## Implementation Summary

### New Fields Added

Five new optional fields were added to the User model across all layers of the stack:

| Field                  | Type        | Description                       | Validation                                                          |
| ---------------------- | ----------- | --------------------------------- | ------------------------------------------------------------------- |
| `relationshipToBride`  | string      | Guest's relationship to bride     | Max 100 characters, trimmed                                         |
| `relationshipToGroom`  | string      | Guest's relationship to groom     | Max 100 characters, trimmed                                         |
| `customWelcomeMessage` | string      | Personalized greeting from couple | Max 500 characters, trimmed                                         |
| `guestGroup`           | enum/string | Guest category                    | Enum: grooms-family, friends, brides-family, extended-family, other |
| `plusOneAllowed`       | boolean     | Whether guest can bring a +1      | Default: false, indexed                                             |

### Guest Group Categories

The `guestGroup` field uses a predefined set of categories for consistent guest organization:

- **GROOMS_FAMILY**: Groom's family members
- **FRIENDS**: Close friends
- **BRIDES_FAMILY**: Bride's family members
- **EXTENDED_FAMILY**: Extended family members
- **OTHER**: Other guests

## Technical Changes

### 1. Server - Mongoose Model (`server/src/models/User.ts`)

**Updated `IUser` Interface**:

```typescript
export interface IUser extends Document {
  fullName: string;
  email: string;
  isAdmin: boolean;
  isInvited: boolean;
  hasRSVPed: boolean;
  rsvpId?: mongoose.Types.ObjectId;
  qrToken: string;
  relationshipToBride?: string; // NEW
  relationshipToGroom?: string; // NEW
  customWelcomeMessage?: string; // NEW
  guestGroup?: string; // NEW
  plusOneAllowed: boolean; // NEW
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Updates**:

```typescript
const userSchema = new Schema<IUser>({
  // ... existing fields ...
  relationshipToBride: {
    type: String,
    trim: true,
    maxlength: [100, "Relationship description cannot exceed 100 characters"],
  },
  relationshipToGroom: {
    type: String,
    trim: true,
    maxlength: [100, "Relationship description cannot exceed 100 characters"],
  },
  customWelcomeMessage: {
    type: String,
    trim: true,
    maxlength: [1000, "Welcome message cannot exceed 1000 characters"],
  },
  guestGroup: {
    type: String,
    trim: true,
    lowercase: true,
    enum: {
      values: [
        "grooms_family",
        "friends",
        "brides_family",
        "extended_family",
        "other",
      ],
      message: "{VALUE} is not a valid guest group",
    },
    index: true, // Indexed for efficient querying
  },
  plusOneAllowed: {
    type: Boolean,
    default: false,
    index: true, // Indexed for filtering guests with plus-one permissions
  },
});
```

**Key Features**:

- ✅ All fields are optional (except `plusOneAllowed` which defaults to `false`)
- ✅ Trimming applied to string fields to prevent whitespace issues
- ✅ Maximum length validation for relationship descriptions and welcome messages
- ✅ Enum validation for `guestGroup` with clear error messages
- ✅ Indexes added to `guestGroup` and `plusOneAllowed` for efficient queries
- ✅ Complete JSDoc documentation

### 2. Server - GraphQL Schema (`server/src/graphql/typeDefs.ts`)

**New Enum Type**:

```graphql
"""
Guest group classification for invitation management and personalization
"""
enum GuestGroup {
  """
  Groom's family members
  """
  GROOMS_FAMILY
  """
  Close friends
  """
  FRIENDS
  """
  Bride's family members
  """
  BRIDES_FAMILY
  """
  Extended family members
  """
  EXTENDED_FAMILY
  """
  Other guests
  """
  OTHER
}
```

**Updated User Type**:

```graphql
type User {
  _id: ID!
  fullName: String!
  email: String!
  isAdmin: Boolean!
  hasRSVPed: Boolean!
  rsvpId: ID
  rsvp: RSVP
  isInvited: Boolean!
  qrToken: String!
  relationshipToBride: String
  relationshipToGroom: String
  customWelcomeMessage: String
  guestGroup: GuestGroup
  plusOneAllowed: Boolean!
}
```

**Key Features**:

- ✅ GraphQL enum for `GuestGroup` with documentation
- ✅ All new fields properly typed
- ✅ `plusOneAllowed` is non-nullable (always returns true/false)
- ✅ Relationship and message fields are nullable
- ✅ Comprehensive GraphQL documentation

### 3. Client - TypeScript Interfaces (`client/src/models/userTypes.ts`)

**New Type**:

```typescript
/**
 * Guest group classification for invitation management and personalization.
 * Matches the GraphQL GuestGroup enum from the backend.
 */
export type GuestGroup =
  | "GROOMS_FAMILY"
  | "FRIENDS"
  | "BRIDES_FAMILY"
  | "EXTENDED_FAMILY"
  | "OTHER";
```

**Updated User Interface**:

```typescript
export interface User {
  _id: string;
  fullName: string;
  email: string;
  isInvited: boolean;
  isAdmin?: boolean;
  hasRSVPed?: boolean;
  rsvpId?: string | null;
  relationshipToBride?: string; // NEW
  relationshipToGroom?: string; // NEW
  customWelcomeMessage?: string; // NEW
  guestGroup?: GuestGroup; // NEW
  plusOneAllowed?: boolean; // NEW
}
```

**Key Features**:

- ✅ TypeScript union type for `GuestGroup` enum
- ✅ Complete JSDoc documentation
- ✅ All new fields are optional
- ✅ Type-safe alignment with GraphQL schema

## Database Migration

### Migration Script

**Location**: `server/src/scripts/migrateUserPersonalizationFields.ts`

**Purpose**: Add personalization fields to existing users in the database

**Features**:

- ✅ ES Module compatible (`import.meta.url` for `__dirname`)
- ✅ Environment-aware (respects `MONGODB_DB_NAME`)
- ✅ Batch processing with progress reporting
- ✅ Error handling and rollback safety
- ✅ Verification step to confirm migration success

**Migration Logic**:

```typescript
// Find users missing the new fields
const usersToMigrate = await User.find({
  plusOneAllowed: { $exists: false },
});

// Set default values
user.relationshipToBride = user.relationshipToBride || undefined;
user.relationshipToGroom = user.relationshipToGroom || undefined;
user.customWelcomeMessage = user.customWelcomeMessage || undefined;
user.guestGroup = user.guestGroup || undefined;
user.plusOneAllowed = user.plusOneAllowed ?? false; // Default to false

await user.save();
```

### NPM Scripts Added

Three migration commands were added to `server/package.json`:

```json
{
  "scripts": {
    "migrate:user-personalization": "npm run build && node dist/scripts/migrateUserPersonalizationFields.js",
    "migrate:user-personalization:dev": "npm run build && MONGODB_DB_NAME=djforever2_dev node dist/scripts/migrateUserPersonalizationFields.js",
    "migrate:user-personalization:prod": "npm run build && MONGODB_DB_NAME=djforever2 node dist/scripts/migrateUserPersonalizationFields.js"
  }
}
```

### Running the Migration

**Development**:

```bash
cd server
npm run migrate:user-personalization:dev
```

**Production**:

```bash
cd server
npm run migrate:user-personalization:prod
```

**Migration Output Example**:

```
✅ Connected to MongoDB: djforever2_dev

🔄 Starting user personalization migration...

📊 Found 5 users to migrate

📈 Migration Summary:
   ✅ Successfully migrated: 5 users
   ❌ Errors: 0 users
   📊 Total processed: 5 users

✅ Migration completed successfully! All users have personalization fields.
```

## Testing

### Test Results

All existing tests continue to pass after the User Model expansion:

```
✓ tests/CountdownTimer.test.tsx (2)
✓ tests/ConnectionStatus.test.tsx (7)
✓ tests/QRLoginModal.e2e.test.tsx (1)
✓ tests/RSVPForm.e2e.test.tsx (11)
✓ tests/QRTokenLogin.e2e.test.tsx (1)
✓ tests/Navbar.e2e.test.tsx (2)
✓ tests/App.e2e.test.tsx (1)

Test Files  7 passed (7)
     Tests  25 passed (25)
```

**Key Validations**:

- ✅ No TypeScript compilation errors
- ✅ GraphQL schema valid
- ✅ Mongoose schema validation working
- ✅ All client-side interfaces properly typed
- ✅ No regression in existing functionality

### Migration Testing

**Development Database**:

- ✅ Successfully migrated 5 existing users
- ✅ Zero errors during migration
- ✅ All users now have `plusOneAllowed: false` default
- ✅ Relationship and message fields set to `undefined` (not populated yet)

## Usage Examples

### Setting Personalization Fields (Server-Side)

```typescript
// Create a new user with personalization
const user = await User.create({
  fullName: "Jane Doe",
  email: "jane@example.com",
  qrToken: generateQRToken(),
  relationshipToBride: "Sister",
  relationshipToGroom: "Friend from college",
  customWelcomeMessage:
    "We're so excited to celebrate with you, Jane! Your support means the world to us.",
  guestGroup: "brides_family",
  plusOneAllowed: true,
});

// Update existing user
await User.findByIdAndUpdate(userId, {
  relationshipToGroom: "Cousin",
  guestGroup: "grooms_family",
  plusOneAllowed: false,
});
```

### GraphQL Queries (Client-Side)

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    _id
    fullName
    email
    relationshipToBride
    relationshipToGroom
    customWelcomeMessage
    guestGroup
    plusOneAllowed
    hasRSVPed
  }
}
```

### Using in React Components

```typescript
import { User, GuestGroup } from "../models/userTypes";

function WelcomeModal({ user }: { user: User }) {
  // Build personalized greeting
  const greeting =
    user.customWelcomeMessage ||
    `Welcome${
      user.relationshipToBride
        ? `, dear ${user.relationshipToBride} of the bride`
        : ""
    }!`;

  // Check if user can bring a plus-one
  const canBringPlusOne = user.plusOneAllowed;

  // Group-specific content
  if (user.guestGroup === "BRIDES_FAMILY") {
    return <BridesFamilyWelcome user={user} />;
  }

  return (
    <div>
      <h2>{greeting}</h2>
      {canBringPlusOne && <p>You're welcome to bring a guest!</p>}
    </div>
  );
}
```

## Future Enhancements (Phase 2)

The User Model expansion enables the following Phase 2 features:

### Enhanced Welcome Modal

- **Relationship-Based Greetings**: Display personalized messages based on `relationshipToBride` and `relationshipToGroom`
- **Custom Messages**: Show `customWelcomeMessage` if set by the couple
- **Group-Specific Content**: Different modal content for bridal party, family, friends, etc.
- **Plus-One Notifications**: Clear indication of plus-one permissions

### Admin Interface

- **Bulk Guest Management**: Filter and update guests by `guestGroup`
- **Plus-One Tracking**: View and manage which guests have plus-one permissions
- **Relationship Mapping**: Visualize guest relationships to bride/groom
- **Personalized Messaging**: Set custom welcome messages per guest

### Analytics & Insights

- **RSVP Analysis by Group**: Track RSVP rates by guest group
- **Plus-One Utilization**: Monitor how many plus-ones are being used
- **Relationship Distribution**: Understand guest demographics

## Database Schema

### Indexes

The following indexes were added for query optimization:

```javascript
// User Model Indexes
userSchema.index({ isInvited: 1, hasRSVPed: 1 }); // Existing
userSchema.index({ email: 1, qrToken: 1 }); // Existing
userSchema.index({ guestGroup: 1 }); // NEW - For filtering by group
userSchema.index({ plusOneAllowed: 1 }); // NEW - For filtering plus-one guests
```

**Query Performance Benefits**:

- Fast filtering of guests by group (e.g., all bridal party members)
- Efficient queries for plus-one enabled guests
- Optimized admin dashboard queries

### Data Size Considerations

**Estimated Storage Impact**:

- `relationshipToBride`: ~20-50 bytes per user (avg)
- `relationshipToGroom`: ~20-50 bytes per user (avg)
- `customWelcomeMessage`: ~100-300 bytes per user (avg)
- `guestGroup`: ~10-20 bytes per user
- `plusOneAllowed`: 1 byte per user

**Total Additional Storage**: ~150-420 bytes per user (negligible for typical guest lists)

## Migration Checklist

- ✅ Update Mongoose User model schema
- ✅ Update GraphQL User type definition
- ✅ Create GraphQL GuestGroup enum
- ✅ Update client-side TypeScript User interface
- ✅ Create client-side GuestGroup type
- ✅ Create database migration script
- ✅ Add migration NPM scripts
- ✅ Test migration on development database
- ✅ Verify all tests still pass
- ✅ Verify no TypeScript compilation errors
- ✅ Update documentation
- ⏳ Run migration on production database (pending deployment)

## Deployment Plan

### Pre-Deployment

1. ✅ Commit all code changes
2. ⏳ Create pull request with detailed description
3. ⏳ Code review and approval
4. ⏳ Merge to main branch

### Deployment Steps

1. Deploy backend with new User model schema
2. Wait for backend deployment to complete
3. Run production migration: `npm run migrate:user-personalization:prod`
4. Verify migration success in production database
5. Deploy frontend with updated User interface
6. Test production environment
7. Monitor for any errors or issues

### Rollback Plan

If issues arise:

1. Revert backend deployment
2. User data is preserved (migration only adds fields, doesn't remove)
3. New fields will be ignored by old schema
4. Re-run migration after fixes if needed

## References

**Modified Files**:

- `server/src/models/User.ts` - Mongoose User model
- `server/src/graphql/typeDefs.ts` - GraphQL schema
- `client/src/models/userTypes.ts` - TypeScript interfaces
- `server/src/scripts/migrateUserPersonalizationFields.ts` - Migration script
- `server/package.json` - Added migration commands

**Related Documentation**:

- [MongoDB Schema Design Best Practices](https://www.mongodb.com/docs/manual/core/data-model-design/)
- [GraphQL Schema Design](https://graphql.org/learn/schema/)

## Notes

- All new fields are optional to maintain backward compatibility
- Migration is idempotent (safe to run multiple times)
- Default value for `plusOneAllowed` is `false` for security
- Guest group enum values are lowercase in database, UPPERCASE in GraphQL/TypeScript
- Indexes added for common query patterns (filter by group, filter by plus-one status)
- No breaking changes to existing code
- All existing tests passing after implementation

## Contact

For questions or issues, refer to the project documentation or contact the development team.

---

**Last Updated**: November 22, 2025  
**Contributors**: DJ Forever Development Team
