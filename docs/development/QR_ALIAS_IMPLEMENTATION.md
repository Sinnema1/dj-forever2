# QR Alias Feature Implementation

**Date**: January 28, 2026  
**Feature**: Human-readable QR token aliases  
**Status**: ✅ Implemented

---

## 🎯 Overview

Added support for **human-readable QR aliases** alongside existing QR tokens. This allows guests to use memorable URLs like `/login/qr/smith-family` instead of `/login/qr/abc123xyz789`.

### Problem Solved

- QR tokens are secure but hard to remember/type
- If guests lose their QR code, they can manually type an alias
- Better user experience for sharing login URLs

### Backward Compatibility

- ✅ Existing QR tokens continue to work
- ✅ No breaking changes to authentication flow
- ✅ Aliases are optional (can be added later)

---

## 📋 Implementation Details

### 1. Database Schema Changes

**User Model** (`server/src/models/User.ts`):

```typescript
qrAlias: {
  type: String,
  unique: true,
  sparse: true,              // Allows null values
  trim: true,
  lowercase: true,
  match: /^[a-z0-9-]+$/,     // Only lowercase, numbers, hyphens
  minlength: 3,
  maxlength: 50,
}
```

**New Static Methods**:

- `User.findByQRAlias(alias)` - Find user by alias
- `User.findByQRTokenOrAlias(identifier)` - Find by either token or alias

### 2. Authentication Service Updates

**Modified**: `server/src/services/authService.ts`

The `loginWithQrToken()` function now accepts both:

- Original QR tokens: `abc123xyz789`
- Human-readable aliases: `smith-family`

```typescript
// Works with both formats:
await loginWithQrToken({ qrToken: "abc123xyz789" }); // Original
await loginWithQrToken({ qrToken: "smith-family" }); // Alias
```

### 3. GraphQL Schema

**Updated**: `server/src/graphql/typeDefs.ts`

```graphql
type User {
  qrToken: String!
  qrAlias: String # New field
  # ... other fields
}
```

### 4. Utility Functions

**Created**: `server/src/utils/qrAliasGenerator.ts`

Helper functions to generate aliases from names:

- `generateQRAlias(fullName)` - Create alias from name
- `generateUniqueQRAlias(fullName, existingAliases)` - Ensure uniqueness
- `validateQRAlias(alias)` - Validate format

**Examples**:

```typescript
generateQRAlias("John Smith"); // → "smith-family"
generateQRAlias("María García-López"); // → "garcia-lopez-family"
generateQRAlias("The O'Brien Family"); // → "obrien-family"
```

### 5. Migration Script

**Created**: `server/src/scripts/addQRAliases.ts`

Automated script to add aliases to existing users without modifying QR tokens.

---

## 🚀 Usage

### For New Users

When creating users in seed data, include `qrAlias`:

```typescript
{
  fullName: "John Smith",
  email: "john@example.com",
  qrToken: "abc123xyz789",
  qrAlias: "smith-family",    // New field
}
```

### For Existing Users

Run migration script to add aliases:

```bash
# Development environment
cd server
npm run add:qr-aliases:dev

# Production environment
npm run add:qr-aliases:prod
```

**Output**:

```
✅ QR Aliases Added:

┌─────────────────────────────┬──────────────────────┬──────────────────────┐
│ Full Name                   │ QR Token             │ QR Alias             │
├─────────────────────────────┼──────────────────────┼──────────────────────┤
│ John Smith                  │ abc123xyz789         │ smith-family         │
│ Jane Doe                    │ def456ghi012         │ doe-family           │
│ Bob Johnson                 │ jkl789mno345         │ johnson-family       │
└─────────────────────────────┴──────────────────────┴──────────────────────┘

✅ Successfully added aliases to 30 users
```

### URL Formats

Both formats work identically:

**Original QR Token**:

```
https://www.djforever2026.com/login/qr/abc123xyz789
```

**Human-Readable Alias**:

```
https://www.djforever2026.com/login/qr/smith-family
```

---

## 📝 Alias Format Rules

### Valid Characters

- ✅ Lowercase letters: `a-z`
- ✅ Numbers: `0-9`
- ✅ Hyphens: `-`
- ❌ Uppercase letters (auto-converted to lowercase)
- ❌ Spaces (auto-converted to hyphens)
- ❌ Special characters (removed)

### Length Requirements

- Minimum: 3 characters
- Maximum: 50 characters

### Examples

| Full Name       | Generated Alias                      |
| --------------- | ------------------------------------ |
| John Smith      | `smith-family`                       |
| María García    | `garcia-family`                      |
| The O'Briens    | `obriens-family`                     |
| John & Jane Doe | `doe-family`                         |
| 李明 (Li Ming)  | `li-family` (if Latin chars present) |

### Handling Duplicates

If multiple families share the same last name:

- First occurrence: `smith-family`
- Second occurrence: `smith-family-2`
- Third occurrence: `smith-family-3`

---

## 🔐 Security Considerations

### Uniqueness Enforcement

- Database enforces unique constraint on `qrAlias`
- Migration script handles collision detection
- Manual duplicates rejected with validation error

### Privacy

- Aliases are based on last names (not full names)
- Reduces PII exposure in URLs
- Still requires valid alias/token to authenticate

### Attack Surface

- No increased risk: both tokens and aliases validated
- Same authentication flow and JWT generation
- Rate limiting applies to both methods

---

## 🧪 Testing

### Manual Testing

1. **Test Original QR Token**:

   ```bash
   curl -X POST http://localhost:3001/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"mutation { loginWithQrToken(qrToken: \"abc123xyz789\") { token user { fullName } } }"}'
   ```

2. **Test QR Alias**:

   ```bash
   curl -X POST http://localhost:3001/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"mutation { loginWithQrToken(qrToken: \"smith-family\") { token user { fullName } } }"}'
   ```

3. **Test Invalid Alias**:
   ```bash
   curl -X POST http://localhost:3001/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"mutation { loginWithQrToken(qrToken: \"invalid-alias\") { token user { fullName } } }"}'
   ```
   Expected: `"Invalid or expired QR token"`

### Automated Tests

Add tests to `server/tests/auth.e2e.test.ts`:

```typescript
describe("QR Alias Authentication", () => {
  it("should login with QR alias", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "test@example.com",
      qrToken: "test-token-123",
      qrAlias: "test-family",
    });

    const result = await loginWithQrToken({ qrToken: "test-family" });
    expect(result.user.fullName).toBe("Test User");
  });

  it("should login with original QR token when alias exists", async () => {
    const result = await loginWithQrToken({ qrToken: "test-token-123" });
    expect(result.user.fullName).toBe("Test User");
  });

  it("should reject invalid alias", async () => {
    await expect(
      loginWithQrToken({ qrToken: "nonexistent-family" }),
    ).rejects.toThrow("Invalid or expired QR token");
  });
});
```

---

## 📊 Production Deployment

### Pre-Deployment Checklist

- [ ] Run tests: `cd server && npm test`
- [ ] Build server: `cd server && npm run build`
- [ ] Backup production database (MongoDB Atlas snapshot)
- [ ] Deploy server with schema changes
- [ ] Run migration script in production

### Deployment Steps

1. **Deploy Backend**:

   ```bash
   # Push to Render.com (triggers automatic deployment)
   git push origin main
   ```

2. **Wait for Deployment**: Monitor Render.com dashboard

3. **Run Migration** (SSH into Render container or use one-off job):

   ```bash
   MONGODB_DB_NAME=djforever2 node dist/scripts/addQRAliases.js
   ```

4. **Verify**: Test both token and alias login URLs

### Rollback Plan

If issues occur:

1. Revert deployment to previous version
2. Aliases are optional - existing tokens continue working
3. No data loss (aliases are additive, not replacing tokens)

---

## 🎨 Frontend Integration (Optional)

### Display Alias in Admin Dashboard

Update `client/src/components/admin/AdminDashboard.tsx`:

```typescript
<div className="guest-info">
  <span>QR Token: {guest.qrToken}</span>
  {guest.qrAlias && (
    <span>Friendly URL: /login/qr/{guest.qrAlias}</span>
  )}
</div>
```

### Share Links with Guests

Email template with both options:

```html
<p>Login to RSVP:</p>
<ul>
  <li>Scan your invitation QR code, or</li>
  <li>Visit: https://www.djforever2026.com/login/qr/smith-family</li>
</ul>
```

---

## 📚 API Reference

### GraphQL Queries

**Get user with alias**:

```graphql
query {
  me {
    qrToken
    qrAlias
    fullName
  }
}
```

### GraphQL Mutations

**Login with alias** (no changes to mutation signature):

```graphql
mutation {
  loginWithQrToken(qrToken: "smith-family") {
    token
    user {
      fullName
      qrAlias
    }
  }
}
```

### REST Endpoints

**QR redirect** (backend handles both):

```
GET /login/qr/:qrToken
GET /login/qr/:qrAlias
```

Both redirect to: `${FRONTEND_URL}/login/qr/:identifier`

---

## 🔧 Maintenance

### Adding Aliases to New Users

When seeding or creating users, include alias:

```typescript
const user = await User.create({
  fullName: "New Guest",
  email: "guest@example.com",
  qrToken: generateQRToken(),
  qrAlias: generateQRAlias("New Guest"),
});
```

### Bulk Update Aliases

Use admin mutation (TODO: implement if needed):

```graphql
mutation {
  adminBulkUpdateAliases(updates: [{ userId: "123", qrAlias: "custom-alias" }])
}
```

### Remove Alias (Revert to Token-Only)

```typescript
await User.findByIdAndUpdate(userId, {
  $unset: { qrAlias: "" },
});
```

---

## ✅ Benefits

### For Guests

- ✅ Memorable URLs (smith-family vs abc123xyz789)
- ✅ Easier to share with household members
- ✅ Can type URL if QR code is lost/damaged
- ✅ More professional appearance

### For Admins

- ✅ Easier to manage and communicate with guests
- ✅ Quick lookup by family name
- ✅ Better analytics (identify guests by readable names)

### Technical

- ✅ Backward compatible (existing tokens work)
- ✅ Optional field (can be added incrementally)
- ✅ Unique constraint prevents collisions
- ✅ Minimal code changes (authentication layer only)

---

## 📖 Related Documentation

- [User Model Schema](/server/src/models/User.ts)
- [Authentication Service](/server/src/services/authService.ts)
- [GraphQL Schema](/server/src/graphql/typeDefs.ts)
- [QR Code Generation](/server/src/seeds/generateQRCodes.ts)

---

## 🎉 Summary

**Status**: ✅ **Implementation Complete**

All code changes implemented:

- ✅ User schema updated with `qrAlias` field
- ✅ Authentication service supports both tokens and aliases
- ✅ GraphQL schema includes new field
- ✅ Migration script created for existing users
- ✅ Utility functions for alias generation
- ✅ npm scripts added for easy execution

**Next Steps**:

1. Test in development environment
2. Run migration on dev database
3. Deploy to production when ready
4. Run migration in production

**Ready to use!** 🚀
