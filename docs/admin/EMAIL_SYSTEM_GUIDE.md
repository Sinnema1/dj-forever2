# Email Reminder System - Complete Guide

## Overview

The email reminder system allows admins to send RSVP reminders to guests who haven't responded yet. The system automatically detects whether SMTP is configured and switches between:

- **Console Mode**: Logs emails to console (development/testing)
- **SMTP Mode**: Actually sends emails via your email provider (production)

## Features

✅ **Flexible Sending Options**

- Send to individual guests
- Send to selected guests (bulk)
- Send to all pending RSVPs

✅ **Beautiful Email Templates**

- Branded HTML emails with inline styling
- Plain text fallback for compatibility
- QR code login links for easy access

✅ **Smart Configuration**

- Automatic mode detection (console vs SMTP)
- Zero configuration for development testing
- Easy production setup with environment variables

✅ **Admin Dashboard Integration**

- Visual pending guest list
- Checkbox selection for bulk operations
- Results modal with success/failure breakdown

## Quick Start

### Development Mode (Console Logging)

No configuration needed! The system automatically logs emails to the console:

```bash
npm run dev
```

Then in the admin dashboard:

1. Go to "Email Reminders" tab
2. Click "Send to All Pending" or select specific guests
3. Check your terminal to see the email content

### Production Mode (Actual Email Sending)

#### Step 1: Get Gmail App Password

If using Gmail:

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy the 16-character password

#### Step 2: Configure Environment Variables

Update your `.env` file in the `server` directory:

```bash
# SMTP Configuration (replace with your actual values)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**Important**: Replace the placeholder values:

- `your-email@gmail.com` → Your actual Gmail address
- `your-app-password` → The 16-character app password from Step 1

#### Step 3: Restart Server

```bash
npm run dev
```

The system will automatically detect SMTP configuration and switch to SMTP mode!

#### Step 4: Test Email Sending

1. Go to admin dashboard → "Email Reminders" tab
2. Send a test email to yourself first
3. Check your inbox (may take a few seconds)
4. If successful, proceed with bulk sending

## Email Providers

### Gmail (Recommended for Testing)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # From Google App Passwords
```

### Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid (Recommended for Production)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

## Using the Admin Dashboard

### Accessing Email Reminders

1. Log in as admin (use your admin QR code)
2. Navigate to Admin Dashboard
3. Click "Email Reminders" tab

### Send to Single Guest

1. Find the guest in the pending list
2. Click "Send Reminder" button next to their name
3. Confirm in the dialog
4. View result in success modal

### Send to Selected Guests

1. Check the boxes next to desired guests
2. Click "Send to Selected (X)" button at top
3. Confirm in the dialog
4. View results with success/failure breakdown

### Send to All Pending

1. Click "Send to All Pending (X)" button
2. Review the count in confirmation dialog
3. Confirm to send
4. View comprehensive results modal

### Results Modal

After sending, you'll see:

- Total emails sent
- Success count (green)
- Failure count (red)
- Detailed list with email addresses and status
- Error messages for any failures

## Email Template

### What Guests Receive

**Subject**: 🎉 Friendly Reminder: Please RSVP to Our Wedding

**Content**:

- Personalized greeting with their name
- Event details (date, venue)
- Friendly reminder about RSVP importance
- Direct QR login link (no manual login needed!)
- Contact information for questions
- Beautiful branded design

### Example Email (Text Version)

```
Hello [Guest Name],

We hope this message finds you well! We're excited to celebrate our special day with you,
and we wanted to send a gentle reminder about submitting your RSVP.

Your response helps us with planning and ensures we can accommodate everyone comfortably.
It only takes a moment to let us know if you'll be joining us!

EVENT DETAILS
Date: September 13, 2025
Venue: Brix & Mortar, Yountville, CA

QUICK LOGIN
Use this link to access your RSVP: [QR Login Link]
We're excited to celebrate with you!

If you have any questions, please don't hesitate to reach out.

With love,
Justin & DJ
```

## Troubleshooting

### "No pending RSVPs found"

- This means all invited guests have already submitted their RSVPs
- Check the "Guest Management" tab to see RSVP statuses

### Emails not sending (SMTP mode)

1. **Check environment variables**: Ensure all SMTP\_ variables are set correctly
2. **Verify credentials**: Test login to your email provider manually
3. **Check logs**: Look for error messages in the server console
4. **Gmail issues**: Make sure 2-Step Verification is enabled and you're using an App Password (not your regular password)
5. **Port blocked**: Try port 465 instead of 587

### Emails going to spam

- Add a proper "from" email address
- Consider using a dedicated email service (SendGrid, Mailgun)
- Add SPF/DKIM records to your domain (production only)

### Rate limiting

- The system adds 100ms delay between emails to prevent rate limiting
- For large batches, consider using a professional email service

## Technical Details

### Architecture

```
Client (React)
  └─> GraphQL Mutations
       └─> Server Resolvers
            └─> Email Service
                 ├─> Console Mode (development)
                 └─> SMTP Mode (production)
```

### GraphQL Mutations

```graphql
# Send to single guest
mutation AdminSendReminderEmail($userId: ID!) {
  adminSendReminderEmail(userId: $userId) {
    success
    email
    error
  }
}

# Send to multiple guests
mutation AdminSendBulkReminderEmails($userIds: [ID!]!) {
  adminSendBulkReminderEmails(userIds: $userIds) {
    totalSent
    successCount
    failureCount
    results {
      success
      email
      error
    }
  }
}

# Send to all pending
mutation AdminSendReminderToAllPending {
  adminSendReminderToAllPending {
    totalSent
    successCount
    failureCount
    results {
      success
      email
      error
    }
  }
}
```

### Files

- **Backend Service**: `server/src/services/emailService.ts`
- **GraphQL Schema**: `server/src/graphql/typeDefs.ts`
- **Resolvers**: `server/src/graphql/resolvers.ts`
- **Frontend Component**: `client/src/components/admin/AdminEmailReminders.tsx`
- **Queries**: `client/src/api/adminQueries.ts`

## Security

✅ **Admin-Only Access**

- All email mutations require admin authentication
- Non-admin users cannot access email functionality

✅ **Safe Environment Variables**

- Email credentials stored in `.env` (never committed to git)
- Automatic filtering of placeholder values

✅ **Rate Limiting Protection**

- 100ms delay between bulk emails
- Sequential sending to avoid provider blocks

✅ **Error Handling**

- Failed emails don't stop the batch
- Detailed error reporting for troubleshooting

## Best Practices

### Development

- Use console mode for testing email templates
- Verify email content before configuring SMTP
- Test with your own email first

### Production

- Use a dedicated email service (SendGrid, Mailgun, etc.)
- Set up proper SPF/DKIM records
- Monitor delivery rates and spam reports
- Send test emails to yourself periodically

### Email Etiquette

- Don't spam guests - use email reminders sparingly
- Give guests time to respond between reminders
- Personalize when possible
- Always provide an easy way to contact you with questions

## Future Enhancements

Possible future features:

- [ ] Email scheduling (send at specific time)
- [ ] Email templates customization in admin UI
- [ ] Delivery tracking and analytics
- [ ] Bounce and unsubscribe handling
- [ ] Email preview before sending
- [ ] A/B testing for subject lines
- [ ] Automated reminder schedules

---

**Need help?** Check the server logs for detailed error messages or review the code comments in `emailService.ts`.
