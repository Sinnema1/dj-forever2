# Guest List Data Setup Guide

This guide walks you through converting your informal guest list into production-ready database seed data.

## Overview

Your guest data flows through these stages:

1. **Informal CSV** → Fill in missing details (last names, emails, relationships)
2. **Template CSV** → Structured format with all required fields
3. **userData.json** → Database-ready format with QR tokens
4. **Database** → Seeded into MongoDB
5. **QR Codes** → Generated for each guest's invitation

---

## Step 1: Complete the Guest List Template

**File**: `server/src/seeds/guest-list-template.csv`

I've created a template with your current guest list. You need to fill in:

### Required Fields:

- **Last names** - For all guests (currently blank for most)
- **Email addresses** - Unique for each guest (currently using placeholders like `dad@example.com`)

### Real Names Needed:

- **Row 1**: "Dad" → Real first name
- **Row 5**: "Grandpa" → Real first name

### Optional but Recommended:

- **relationship_to_bride** - e.g., "sister", "friend", "cousin"
- **relationship_to_groom** - e.g., "brother", "best friend", "coworker"
- **guest_group** - Options: `grooms_family`, `brides_family`, `extended_family`, `friends`, `other`
- **plus_one_allowed** - `TRUE` or `FALSE`
- **custom_welcome_message** - Personalized greeting (use quotes if it contains commas)

### Example Row (properly filled):

```csv
1,Justin,Manning,justin.manning@gmail.com,brother,brother-in-law,Emma,Smith,emma.smith@gmail.com,,,,,,,,,,,,,grooms_family,FALSE,"Justin and Emma! We're thrilled to celebrate with you both!"
```

---

## Step 2: Convert CSV to userData.json

Once you've completed the CSV, run:

```bash
cd server
npm run convert:guests
```

This will:

- ✅ Read `guest-list-template.csv`
- ✅ Generate unique QR tokens for each guest (20-character cryptographic tokens)
- ✅ Validate email uniqueness
- ✅ Create `userData-generated.json` in the same directory

**Output Example**:

```
🔄 Converting guest list to userData.json...

✅ Justin Manning            justin.manning@gmail.com       a7f3k9m2p1q5r8t4w6x9
✅ Emma Smith                emma.smith@gmail.com           b2c5d8f1g4h7j0k3m6n9
...

🎉 Successfully converted 27 households (56 total guests)!
📄 Output written to: userData-generated.json
```

---

## Step 3: Review and Deploy userData.json

### Review the Generated File

Open `server/src/seeds/userData-generated.json` and verify:

- [ ] All names are correct (no "Dad" or "Grandpa")
- [ ] All emails are valid and unique
- [ ] Relationships make sense
- [ ] Plus-one permissions are correct
- [ ] Custom welcome messages display properly

### Deploy to Production

Once verified:

```bash
# Option 1: Replace existing userData.json
cp userData-generated.json userData.json

# Option 2: Merge with existing (if you have other users like admins)
# Manually merge the "users" arrays
```

---

## Step 4: Seed the Database

**For Production**:

```bash
cd server
npm run build
npm run seed-prod
```

**For Development/Testing**:

```bash
cd server
npm run build
npm run seed-test
```

**Output**:

```
🚀 Starting database seeding for djforever2...
✅ Inserted 26 users.
🎉 Database seeding completed successfully!
```

---

## Step 5: Generate QR Codes

After seeding, generate QR codes for invitations:

**For Production**:

```bash
npm run generate:qrcodes:prod
```

**For Development**:

```bash
npm run generate:qrcodes:dev
```

This creates PNG files in `server/qr-codes/production/` or `server/qr-codes/development/`:

- Each guest gets a unique QR code
- Filename format: `{fullName.replace(' ', '_')}.png`
- QR codes encode URL: `https://dj-forever2.onrender.com/login/qr/{qrToken}`

**Output**:

```
🔄 Generating QR codes for production environment...
✅ Generated QR code: Justin_Manning.png
✅ Generated QR code: Emma_Smith.png
...
🎉 Successfully generated 26 QR codes!
📂 Saved to: /path/to/server/qr-codes/production/
```

---

## Data Structure Reference

### userData.json Format

```json
{
  "users": [
    {
      "fullName": "Justin Manning",
      "email": "justin.manning@gmail.com",
      "isInvited": true,
      "hasRSVPed": false,
      "qrToken": "a7f3k9m2p1q5r8t4w6x9",
      "relationshipToBride": "brother",
      "relationshipToGroom": "brother-in-law",
      "guestGroup": "family",
      "plusOneAllowed": false,
      "customWelcomeMessage": "Justin! We're so excited to have you celebrate with us!"
    }
  ]
}
```

### Field Descriptions

| Field                  | Type    | Required | Description                                 |
| ---------------------- | ------- | -------- | ------------------------------------------- |
| `fullName`             | string  | ✅       | Guest's full name (max 100 chars)           |
| `email`                | string  | ✅       | Unique email address (validated)            |
| `isInvited`            | boolean | ✅       | Invitation status (usually `true`)          |
| `hasRSVPed`            | boolean | ✅       | RSVP completion (starts as `false`)         |
| `qrToken`              | string  | ✅       | Unique 20-char authentication token         |
| `relationshipToBride`  | string  | ❌       | Relationship to bride                       |
| `relationshipToGroom`  | string  | ❌       | Relationship to groom                       |
| `guestGroup`           | string  | ❌       | Group: `family`, `friends`, `work`, `other` |
| `plusOneAllowed`       | boolean | ❌       | Can bring +1 (default: `false`)             |
| `customWelcomeMessage` | string  | ❌       | Personalized greeting                       |

---

## Email Address Guidelines

Since guests authenticate via QR codes only, emails are primarily for:

- **Admin communication** (sending reminders, updates)
- **Database uniqueness** (each guest needs a unique email)
- **RSVP notifications** (optional feature)

### If Guests Don't Have Emails:

You can use placeholder emails following a pattern:

```
justin.manning.guest@djforever2.wedding
emma.smith.guest@djforever2.wedding
```

**Important**:

- These won't be used for login (QR-only authentication)
- Make sure they're unique
- Consider using a domain you control if you plan to send emails later

---

## Household Structure

The CSV uses `household_id` to group guests who share an invitation:

- **household_id**: Groups guests getting the same physical invitation
- **Up to 4 guests per household** (expandable if needed)
- **One QR code per household** - all members share authentication
- Primary guest (guest_1) gets the User record; others stored in `householdMembers` array

### Example Household:

```csv
household_id: 1
guest_1: Justin Manning (justin@...) - Primary user with QR token
guest_2: Emma Smith (emma@...) - Household member
guest_3: Anna Manning (anna@...) - Household member
```

All three access the site via the same QR code and RSVP together.

---

## Troubleshooting

### Duplicate Email Warning

```
⚠️  Warning: Duplicate email justin@example.com for Justin Manning
```

**Fix**: Ensure each guest has a unique email address

### Missing Required Fields

```
❌ Error: Missing required field 'email' for guest Justin
```

**Fix**: Fill in all required fields (first name, last name, email) in the CSV

### QR Code Generation Fails

```
❌ Error: No users found in database
```

**Fix**: Run `npm run seed-prod` first to populate the database

### Invalid Email Format

The User model validates emails with regex. Ensure format:

```
valid@example.com     ✅
invalid@              ❌
@invalid.com          ❌
no-at-sign.com        ❌
```

---

## Quick Start Checklist

- [ ] Open `server/src/seeds/guest-list-template.csv`
- [ ] Replace "Dad" and "Grandpa" with real names
- [ ] Add last names for all guests
- [ ] Replace placeholder emails with real/unique emails
- [ ] Fill in relationships and guest groups (optional)
- [ ] Set `plus_one_allowed` for appropriate guests
- [ ] Run `npm run convert:guests`
- [ ] Review `userData-generated.json`
- [ ] Copy to `userData.json`
- [ ] Run `npm run build && npm run seed-prod`
- [ ] Run `npm run generate:qrcodes:prod`
- [ ] Print QR codes for physical invitations

---

## Next Steps After Setup

1. **Test Authentication**: Scan a QR code on your phone to verify login works
2. **Test RSVP**: Complete an RSVP to ensure data saves correctly
3. **Admin Dashboard**: View all guests and their RSVP status
4. **Print Invitations**: Include unique QR codes on each invitation
5. **Monitor RSVPs**: Track responses via admin dashboard

---

**Questions?** Check the main README or the copilot instructions file.
