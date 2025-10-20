# Email System Testing Checklist

**Date**: October 19, 2025  
**Status**: Ready for Testing  
**SMTP Configuration**: ✅ Configured (Gmail)

---

## 🎯 Testing Objectives

1. Verify SMTP configuration is correct
2. Confirm email delivery to real recipients
3. Test email template rendering (HTML + plain text)
4. Validate QR login links work from emails
5. Test bulk sending functionality
6. Verify error handling and retry logic
7. Confirm admin dashboard integration

---

## 📋 Pre-Testing Checklist

### Environment Configuration

- [x] **SMTP_HOST** configured: `smtp.gmail.com`
- [x] **SMTP_PORT** configured: `587`
- [x] **SMTP_USER** configured: `sinnema1.jm@gmail.com`
- [x] **SMTP_PASS** configured: App password set
- [x] **CONFIG\_\_FRONTEND_URL** configured: `https://dj-forever2.onrender.com`

### System Status

- [ ] **Server running**: `npm run dev` in `/server`
- [ ] **Client running**: `npm run dev` in `/client` (optional for testing)
- [ ] **Admin user logged in**: Required to access email admin interface
- [ ] **Test guests available**: At least 1 guest with `isInvited=true` and `hasRSVPed=false`

---

## 🧪 Test Suite

### Test 1: Verify SMTP Configuration

**Purpose**: Confirm email service detects SMTP configuration

**Steps**:

1. Start server: `cd server && npm run dev`
2. Check server logs for: **"SMTP transporter created"**
3. Verify no missing environment variable warnings

**Expected Output**:

```
INFO[EmailService]: SMTP transporter created {
  host: 'smtp.gmail.com',
  port: 587
}
```

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

### Test 2: Send Test Email to Yourself

**Purpose**: Verify email delivery and template rendering

**Steps**:

1. Log into admin dashboard at `/admin`
2. Navigate to "Email Reminders" tab
3. Find yourself in the pending guest list (if applicable)
4. Click checkbox next to your email
5. Click "Send Reminders" button
6. Check your email inbox (sinnema1.jm@gmail.com)

**Expected Behavior**:

- Success modal appears with "1 email(s) sent successfully"
- Email arrives within 1-2 minutes
- Subject: "🎉 Friendly Reminder: Please RSVP to Our Wedding"
- HTML email is properly formatted with styles
- QR login link is present and clickable

**Email Template Checklist**:

- [ ] Subject line displays correctly
- [ ] Recipient name is personalized ("Hello [Name]")
- [ ] Gradient header displays properly
- [ ] "Click Here to RSVP Now" button renders
- [ ] QR login URL is correct format
- [ ] Fallback link in gray box is visible
- [ ] Footer text is present
- [ ] Email looks good on mobile (if checking on phone)

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

### Test 3: Validate QR Login Link

**Purpose**: Ensure QR links in emails work correctly

**Steps**:

1. Open test email from Test 2
2. Click "Click Here to RSVP Now" button
3. Verify redirect to wedding website
4. Confirm automatic login occurs
5. Check if redirected to appropriate page

**Expected Behavior**:

- Click redirects to: `https://dj-forever2.onrender.com/login/qr/[token]`
- Automatic authentication happens
- User is logged in and sees personalized content
- No error messages appear

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

### Test 4: Test Plain Text Fallback

**Purpose**: Verify plain text version renders for email clients that don't support HTML

**Steps**:

1. Forward test email to a plain-text email client (or use "View Source" in Gmail)
2. Look for plain text version
3. Verify all content is readable without HTML

**Expected Content**:

```
Hello [Name],

We hope this message finds you well! ...

Click here to RSVP now:
https://dj-forever2.onrender.com/login/qr/[token]

...
```

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

### Test 5: Bulk Email Sending

**Purpose**: Test sending to multiple recipients simultaneously

**Steps**:

1. Identify 2-3 test guests in admin dashboard
2. Select multiple checkboxes
3. Click "Send Reminders"
4. Wait for confirmation modal
5. Check server logs for sequential sending

**Expected Behavior**:

- Modal shows "X email(s) sent successfully"
- Server logs show emails sent with 100ms delay between each
- All selected recipients receive emails
- No rate limiting errors

**Result**: ⬜ Pass / ⬜ Fail

**Recipients Tested**:

1. ******\_\_\_\_****** (email) - ⬜ Received
2. ******\_\_\_\_****** (email) - ⬜ Received
3. ******\_\_\_\_****** (email) - ⬜ Received

**Notes**:

---

### Test 6: "Send to All Pending" Functionality

**Purpose**: Validate mass email sending to all non-respondents

**⚠️ WARNING**: This will send emails to ALL guests who haven't RSVP'd!  
**Recommendation**: Only test this if you're ready to send actual reminders, or use test database.

**Steps**:

1. Click "Send to All Pending RSVPs" button
2. Confirm in modal dialog
3. Wait for completion
4. Review results modal

**Expected Behavior**:

- Modal shows total count before confirming
- Emails sent sequentially (not all at once)
- Results modal shows success/failure breakdown
- Server logs show progress

**Result**: ⬜ Pass / ⬜ Fail / ⬜ Skipped (Production Safety)

**Notes**:

---

### Test 7: Error Handling - Invalid Email

**Purpose**: Test system handles invalid email addresses gracefully

**Steps**:

1. Manually create test user with invalid email (e.g., "invalid@")
2. Attempt to send reminder
3. Check results modal and server logs

**Expected Behavior**:

- Email attempt logged as failed
- Error message in results modal: "invalid@: Failed to send"
- System continues processing other emails
- No server crash

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

### Test 8: Gmail Rate Limiting

**Purpose**: Verify system handles Gmail's sending limits

**Background**: Gmail limits:

- 500 emails/day for free accounts
- 100 emails per batch
- 1-2 second delays recommended

**Steps**:

1. Check current email service implementation for rate limit handling
2. Verify 100ms delay between emails exists
3. If testing with >10 emails, monitor for errors

**Expected Behavior**:

- 100ms delay between each email (in code)
- No "rate limit exceeded" errors for small batches (<10 emails)
- Errors logged but don't crash server

**Result**: ⬜ Pass / ⬜ Fail / ⬜ Not Applicable

**Notes**:

---

### Test 9: Email Job Queue (If Implemented)

**Purpose**: Test retry logic for failed emails

**Steps**:

1. Check database for `EmailJob` collection
2. Send email to trigger job creation
3. Verify job status transitions (pending → sent)
4. Manually mark job as "retrying" and verify retry logic

**Expected Behavior**:

- Job created with status "pending"
- After send, status updates to "sent"
- Retry jobs have exponential backoff (1min, 5min, 15min)
- Failed jobs after 5 attempts marked as "failed"

**Result**: ⬜ Pass / ⬜ Fail / ⬜ Not Applicable

**Notes**:

---

### Test 10: Admin Dashboard Integration

**Purpose**: Verify UI accurately reflects email sending state

**Steps**:

1. Navigate to Email Reminders tab
2. Verify pending guest list displays correctly
3. Test checkbox selection (individual + select all)
4. Send emails and verify success modal
5. Check if guest count updates after successful send

**UI Elements to Verify**:

- [ ] Pending guest list populates
- [ ] Guest count is accurate
- [ ] Checkboxes work for selection
- [ ] "Send Reminders" button enabled when guests selected
- [ ] "Send to All" button shows correct count
- [ ] Success modal displays results
- [ ] Error messages are clear and actionable

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:

---

## 🔍 Validation Checklist

### Email Deliverability

- [ ] Emails arrive in inbox (not spam folder)
- [ ] Emails arrive within 1-2 minutes of sending
- [ ] "From" address displays correctly
- [ ] Reply-to address is appropriate (if configured)

### Template Quality

- [ ] HTML renders correctly in Gmail
- [ ] HTML renders correctly in Outlook (if testing)
- [ ] HTML renders correctly on mobile email app
- [ ] Personalization works (name, QR token)
- [ ] Links are clickable and work

### Security & Privacy

- [ ] QR tokens are unique per user
- [ ] QR tokens expire appropriately (if implemented)
- [ ] Email doesn't expose sensitive data
- [ ] Links use HTTPS

### Performance

- [ ] Bulk sending completes in reasonable time
- [ ] No memory leaks during large batches
- [ ] Server remains responsive during sending
- [ ] Database updates don't block email sending

---

## 📊 Test Results Summary

**Date Tested**: ******\_\_\_******  
**Tester**: ******\_\_\_******  
**Environment**: ⬜ Development ⬜ Production

### Overall Results

| Test # | Test Name                   | Result    | Notes |
| ------ | --------------------------- | --------- | ----- |
| 1      | SMTP Configuration          | ⬜ P/F    |       |
| 2      | Send Test Email             | ⬜ P/F    |       |
| 3      | QR Login Link               | ⬜ P/F    |       |
| 4      | Plain Text Fallback         | ⬜ P/F    |       |
| 5      | Bulk Email Sending          | ⬜ P/F    |       |
| 6      | Send to All Pending         | ⬜ P/F/S  |       |
| 7      | Error Handling              | ⬜ P/F    |       |
| 8      | Rate Limiting               | ⬜ P/F/NA |       |
| 9      | Email Job Queue             | ⬜ P/F/NA |       |
| 10     | Admin Dashboard Integration | ⬜ P/F    |       |

**Pass Rate**: **\_** / **\_** (\_\_\_%)

---

## 🐛 Issues Found

### Issue 1

**Severity**: ⬜ Critical ⬜ High ⬜ Medium ⬜ Low  
**Test**: **********\_**********  
**Description**:

**Steps to Reproduce**:

1.
2.
3.

**Expected**:

**Actual**:

**Screenshots/Logs**:

---

### Issue 2

(Repeat as needed)

---

## ✅ Sign-Off

### Development Testing

- [ ] All tests passing in development environment
- [ ] No critical issues found
- [ ] Email templates render correctly
- [ ] QR links work as expected

**Developer Sign-off**: ******\_****** **Date**: **\_\_\_**

### Production Readiness

- [ ] SMTP credentials secured (not in git)
- [ ] Email sending limits understood
- [ ] Spam prevention configured (SPF/DKIM if using custom domain)
- [ ] Error monitoring in place
- [ ] Rollback plan documented

**Production Sign-off**: ******\_****** **Date**: **\_\_\_**

---

## 🚀 Production Deployment Checklist

Before sending real wedding reminders:

- [ ] **Test on production server** (not just localhost)
- [ ] **Send test email to yourself** in production
- [ ] **Verify QR links work** in production environment
- [ ] **Check spam folder** - emails should be in inbox
- [ ] **Have backup plan** if emails fail (phone calls, text messages)
- [ ] **Monitor first 10 sends** before doing bulk operation
- [ ] **Prepare communication** for guests who don't receive email

---

## 📧 Gmail-Specific Configuration

### App Password Setup

If using Gmail, you MUST use an App Password (not your regular password):

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to "App passwords"
4. Select "Mail" and generate password
5. Copy 16-character password to `.env` file as `SMTP_PASS`

### Common Gmail Errors

| Error                       | Solution                               |
| --------------------------- | -------------------------------------- |
| "Invalid login credentials" | Use App Password, not regular password |
| "Less secure app access"    | Enable 2FA and use App Password        |
| "Daily sending limit"       | Gmail free: 500/day, wait 24 hours     |
| "Suspicious activity"       | Verify account, may need to wait       |

---

## 🔧 Troubleshooting Guide

### Problem: Emails not sending

**Check**:

1. Server logs for SMTP transporter creation
2. Environment variables are set correctly
3. No typos in email addresses
4. Gmail App Password is correct (not regular password)

### Problem: Emails going to spam

**Solutions**:

1. Ask recipients to mark as "Not Spam"
2. Set up SPF record if using custom domain
3. Set up DKIM if using custom domain
4. Avoid spam trigger words ("free", "click here")

### Problem: QR links not working

**Check**:

1. `CONFIG__FRONTEND_URL` is correct in .env
2. QR tokens exist in database for users
3. Frontend QR login route is working
4. HTTPS is used (not HTTP)

---

## 📚 Additional Resources

- **Email Service Code**: `/server/src/services/emailService.ts`
- **Email System Guide**: `/docs/admin/EMAIL_SYSTEM_GUIDE.md`
- **Admin Dashboard**: `https://dj-forever2.onrender.com/admin`
- **Gmail SMTP Docs**: https://support.google.com/mail/answer/7126229
- **Nodemailer Docs**: https://nodemailer.com/about/

---

**Next Steps After Testing**:

1. ✅ Mark all passing tests
2. 📋 Document any issues found
3. 🐛 Fix critical bugs before production use
4. 🚀 Deploy to production (if not already deployed)
5. 📧 Send real reminders to guests

---

_Created: October 19, 2025_  
_Last Updated: October 19, 2025_
