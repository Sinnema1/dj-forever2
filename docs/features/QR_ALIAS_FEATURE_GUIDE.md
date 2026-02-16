# QR Alias Feature Implementation

## Overview

The QR Alias feature allows admins to assign human-readable URL aliases (e.g., "smith-family") as alternatives to cryptographic QR tokens for guest authentication. This makes it easier to share wedding website links and provides a more personalized login experience.

## Feature Capabilities

### Admin Dashboard - Personalization Tab

**Individual Guest Editing**

- Edit QR alias via the "Edit Personalization" modal for any guest
- Field location: Contact Information section (below email address)
- Real-time character count (3-50 characters)
- Input validation: lowercase letters, numbers, hyphens only
- Uniqueness enforcement: prevents duplicate aliases
- Clearing support: empty string removes the alias

**Bulk CSV Upload**

- New `qrAlias` column in CSV template
- Format validation: `[a-z0-9-]+` regex pattern
- Length validation: 3-50 characters
- Duplicate detection: checks existing database aliases
- Batch import with error reporting

## Technical Implementation

### Database Schema

```typescript
// server/src/models/User.ts
qrAlias: {
  type: String,
  unique: true,
  sparse: true,  // Allows null/undefined, enforces uniqueness when present
  trim: true,
  lowercase: true,
  match: [/^[a-z0-9-]+$/, "QR alias must contain only lowercase letters, numbers, and hyphens"],
  minlength: [3, "QR alias must be at least 3 characters"],
  maxlength: [50, "QR alias cannot exceed 50 characters"],
}
```

**Index Strategy:**

- Sparse unique index allows multiple null values
- Only enforces uniqueness for non-null aliases
- Automatic lowercase normalization via schema

### GraphQL API

**Input Types:**

```graphql
input AdminUserUpdateInput {
  qrAlias: String # Added
  # ... other fields
}

input UserPersonalizationInput {
  qrAlias: String # Added
  # ... other fields
}

input BulkPersonalizationInput {
  email: String!
  fullName: String
  personalization: UserPersonalizationInput! # Inherits qrAlias support
}
```

**Mutations:**

```graphql
# Single user update
mutation UpdateUserPersonalization(
  $userId: ID!
  $input: UserPersonalizationInput!
) {
  adminUpdateUserPersonalization(userId: $userId, input: $input) {
    _id
    qrAlias # Now returned
    # ... other fields
  }
}

# Bulk update
mutation AdminBulkUpdatePersonalization(
  $updates: [BulkPersonalizationInput!]!
) {
  adminBulkUpdatePersonalization(updates: $updates) {
    success
    created
    updated
    failed
    errors {
      email
      error
    }
  }
}
```

**Queries:**

```graphql
query GetAdminRSVPs {
  adminGetAllRSVPs {
    _id
    qrAlias # Now included
    # ... other fields
  }
}
```

### Backend Service Layer

**Validation Logic (`server/src/services/adminService.ts`):**

```typescript
// adminUpdateUser function
if (input.qrAlias !== undefined) {
  if (input.qrAlias === null || input.qrAlias === "") {
    // Allow clearing the alias
    user.qrAlias = undefined;
  } else {
    // Normalize the alias
    const normalizedAlias = input.qrAlias.toLowerCase().trim();

    // Check uniqueness (exclude current user)
    const existingAlias = await User.findOne({
      qrAlias: normalizedAlias,
      _id: { $ne: userId },
    });

    if (existingAlias) {
      throw new ValidationError(
        `QR alias "${normalizedAlias}" is already in use by another guest`,
      );
    }

    user.qrAlias = normalizedAlias;
  }
}
```

**Bulk Update Validation (`bulkUpdatePersonalization`):**

- Validates each alias against regex pattern
- Checks uniqueness for both existing DB entries and within CSV batch
- Provides detailed error messages for failed imports
- Normalizes to lowercase before saving

### Frontend Components

**GuestPersonalizationModal** (`client/src/components/admin/GuestPersonalizationModal.tsx`)

- Added qrAlias field to Contact Information section
- Character counter: 0/50 characters
- Placeholder: "smith-family"
- Pattern validation: `[a-z0-9-]+`
- Auto-lowercase transformation on input
- Helper text: "Human-readable URL alias for QR login (lowercase letters, numbers, and hyphens only, 3-50 characters)"

**BulkPersonalization** (`client/src/components/admin/BulkPersonalization.tsx`)

- Added qrAlias to CSVRow interface
- Updated CSV template download with qrAlias column
- Pre-validation before import:
  - Regex format check: `/^[a-z0-9-]+$/`
  - Length check: 3-50 characters
  - Reports validation errors by row number
- Duplicate detection within CSV file

**TypeScript Types** (`client/src/models/userTypes.ts`)

```typescript
export interface User {
  // ... existing fields
  qrAlias?: string; // Added
  // ... more fields
}
```

## Usage Examples

### Admin UI - Single Guest Update

1. Navigate to Admin Dashboard → Personalization tab
2. Click "Edit" on any guest row
3. Scroll to "Contact Information" section
4. Enter QR alias (e.g., "smith-family")
5. Click "Save Changes"

**Result:** Guest can now login via `/login/qr/smith-family` instead of cryptographic token

### Admin UI - Bulk CSV Upload

1. Navigate to Admin Dashboard → Bulk Upload tab
2. Click "Download CSV Template"
3. Open CSV and add qrAlias column values:

```csv
fullName,email,qrAlias,relationshipToBride,...
"John Smith","john@example.com","smith-family","Friend",...
"Jane Doe","jane@example.com","doe-family","Sister",...
```

4. Upload CSV file
5. Review preview table (shows qrAlias values)
6. Click "Import Data"

**Validation Errors:**

- `Row 5: qrAlias must contain only lowercase letters, numbers, and hyphens` - Invalid character detected
- `Row 8: qrAlias must be 3-50 characters` - Too short or too long
- `QR alias "smith-family" is already in use` - Duplicate in database

### GraphQL API Direct Usage

**Set Alias:**

```graphql
mutation {
  adminUpdateUserPersonalization(
    userId: "507f1f77bcf86cd799439011"
    input: { qrAlias: "smith-family" }
  ) {
    _id
    fullName
    qrAlias
  }
}
```

**Clear Alias:**

```graphql
mutation {
  adminUpdateUserPersonalization(
    userId: "507f1f77bcf86cd799439011"
    input: { qrAlias: "" }
  ) {
    _id
    qrAlias # Returns null
  }
}
```

**Query Aliases:**

```graphql
query {
  adminGetAllRSVPs {
    fullName
    email
    qrAlias
  }
}
```

## Authentication Flow

**Before (Token-based):**

1. Admin generates QR code with URL: `https://domain.com/login/qr/abc123xyz456`
2. Guest scans QR code
3. Backend validates token `abc123xyz456`
4. Issues JWT for session

**After (Alias-based):**

1. Admin sets qrAlias = "smith-family"
2. Admin generates custom link: `https://domain.com/login/qr/smith-family`
3. Guest visits link (shareable via text, email, or QR code)
4. Backend resolves alias → user → issues JWT
5. Same authentication flow as token-based

**Key Benefit:** Aliases are memorable and shareable without QR scanning

## Validation Rules

| Rule              | Enforcement                                | Error Message                                                       |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| **Pattern**       | `/^[a-z0-9-]+$/`                           | "qrAlias must contain only lowercase letters, numbers, and hyphens" |
| **Length**        | 3-50 characters                            | "qrAlias must be 3-50 characters"                                   |
| **Uniqueness**    | Database sparse index + service validation | "QR alias 'xyz' is already in use by another guest"                 |
| **Optional**      | Can be null/undefined                      | No error (sparse index allows)                                      |
| **Normalization** | Auto-lowercase, trim whitespace            | Silent transformation                                               |

## Error Handling

### Duplicate Alias Attempt

```
Error: ValidationError
Message: QR alias "smith-family" is already in use by another guest
```

- Caught at service layer before database save
- Prevents duplicate aliases across all users
- User-friendly error message returned to frontend

### Invalid Format

```
Error: ValidationError
Message: QR alias must contain only lowercase letters, numbers, and hyphens
```

- Caught by MongoDB schema validation
- Frontend also validates via input pattern attribute
- Character counter prevents length violations

### Bulk Import Errors

```json
{
  "success": 5,
  "created": 2,
  "updated": 3,
  "failed": 2,
  "errors": [
    {
      "email": "john@example.com",
      "error": "QR alias 'smith' is already in use"
    },
    { "email": "jane@example.com", "error": "qrAlias must be 3-50 characters" }
  ]
}
```

- Partial success: valid rows imported, invalid rows reported
- Detailed error messages per failed row
- Frontend displays errors in results section

## Testing

### Manual Testing Script

Located at `/test-qr-alias.js`:

```bash
# Install dependencies (if needed)
npm install @apollo/client cross-fetch

# Set admin token (get from QR login or database)
export ADMIN_TOKEN="your-jwt-token-here"

# Run test script
node test-qr-alias.js
```

**Test Coverage:**

1. ✅ Set QR alias for a user
2. ✅ Update existing alias
3. ✅ Validate duplicate rejection
4. ✅ Clear alias (set to empty string)
5. ✅ Query aliases in admin list

### E2E Test Integration

Existing RSVP test suite passes with qrAlias implementation:

```bash
npm run test:rsvp:server  # ✅ 9/9 tests passing
```

**Test Validation:**

- Backend service layer validates qrAlias without breaking existing RSVP tests
- GraphQL schema changes are backward-compatible
- Optional field doesn't affect existing mutations

### Frontend Component Testing

Test locations:

- `/client/tests/GuestPersonalizationModal.e2e.test.tsx` (TODO: add qrAlias test)
- `/client/tests/BulkPersonalization.e2e.test.tsx` (TODO: add CSV validation test)

## Future Enhancements

### Short-term (Optional)

1. **Auto-generate button**: Add "Generate from Name" button in modal
   - Calls `generateQRAlias(user.fullName)` utility
   - Pre-fills input with suggested alias
2. **QR alias column in guest list**: Display alias next to email with copy button
3. **Alias validation preview**: Show "Alias available ✓" or "Already taken ✗" while typing

### Medium-term

1. **Custom QR code generation**: Generate QR codes with alias URLs instead of tokens
2. **Analytics**: Track login source (token vs alias)
3. **Alias history**: Log alias changes for audit trail

### Long-term

1. **Guest-facing alias editing**: Allow guests to customize their own alias
2. **Multiple aliases**: Support alias sets (e.g., "smith" and "john-jane-smith")
3. **Vanity URL system**: Full custom domain support (e.g., `our-wedding.com/smith`)

## Deployment Checklist

✅ **Backend:**

- [x] GraphQL schema updated (AdminUserUpdateInput, UserPersonalizationInput)
- [x] Resolvers pass qrAlias to service layer
- [x] Service validation with uniqueness checking
- [x] Bulk update support with validation
- [x] E2E tests passing

✅ **Frontend:**

- [x] User model includes qrAlias field
- [x] GuestPersonalizationModal UI with input field
- [x] BulkPersonalization CSV template and parsing
- [x] GraphQL queries return qrAlias
- [x] TypeScript types updated

✅ **Database:**

- [x] User model has qrAlias field with validation
- [x] Sparse unique index supports optional values
- [x] Existing data compatible (no migration needed)

⚠️ **Pre-deployment:**

1. Run full test suite: `npm run test:rsvp`
2. Verify TypeScript compilation: `npm run build` (both client and server)
3. Test on staging environment with real QR codes
4. Backup production database before deploying

## Support & Troubleshooting

### Issue: "QR alias is already in use"

**Solution:** Check existing aliases in database:

```javascript
db.users.find(
  { qrAlias: { $ne: null } },
  { fullName: 1, email: 1, qrAlias: 1 },
);
```

### Issue: Bulk upload fails silently

**Solution:** Check validation errors in import result:

- CSV format must match template exactly
- All qrAlias values must be lowercase
- Check for duplicate aliases within CSV file

### Issue: Alias not appearing in admin list

**Solution:** Refresh GraphQL query to include qrAlias field

- Verify GET_ADMIN_RSVPS includes qrAlias
- Clear Apollo Client cache: `client.clearStore()`

## Related Files

**Backend:**

- Schema: `server/src/graphql/typeDefs.ts`
- Resolvers: `server/src/graphql/resolvers.ts`
- Service: `server/src/services/adminService.ts`
- Model: `server/src/models/User.ts`

**Frontend:**

- Queries: `client/src/api/adminQueries.ts`
- Modal: `client/src/components/admin/GuestPersonalizationModal.tsx`
- CSV Upload: `client/src/components/admin/BulkPersonalization.tsx`
- Types: `client/src/models/userTypes.ts`

**Testing:**

- Manual test: `test-qr-alias.js`
- E2E tests: `server/tests/*.e2e.test.ts`

## Security Considerations

1. **Authorization**: Only admins can set/update qrAliases (enforced by resolver context)
2. **Uniqueness**: Prevents alias hijacking via database unique index
3. **Validation**: Regex pattern prevents injection attacks
4. **Rate Limiting**: Consider adding rate limits to prevent alias squatting
5. **Audit Trail**: Log alias changes in future enhancement (currently not tracked)

---

**Implementation Date:** February 7, 2026  
**Feature Status:** ✅ Complete  
**Production Ready:** Yes (pending final testing)
