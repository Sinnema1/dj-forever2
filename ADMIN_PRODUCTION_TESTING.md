# Admin Production Testing Guide

**Date**: November 30, 2025  
**Environment**: Production (dj-forever2.onrender.com)  
**Testing Focus**: Admin Dashboard, Bulk Personalization, Phase 3 Features

---

## 🎯 Testing Objectives

1. **Bulk Personalization CSV Upload** - Validate complete workflow with real data
2. **Admin Dashboard Analytics** - Verify all stats display correctly
3. **Phase 3 Features** - Confirm all personalization features work in production
4. **Data Integrity** - Ensure no data corruption or loss
5. **Performance** - Monitor load times and API response times

---

## 📋 Pre-Testing Checklist

### Environment Verification

- [ ] Confirm production URL: https://dj-forever2.onrender.com
- [ ] Verify admin user credentials work
- [ ] Check database connection (MongoDB Atlas production cluster)
- [ ] Confirm environment variables are set correctly:
  - `MONGODB_DB_NAME=djforever2`
  - `NODE_ENV=production`
  - `CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com`
- [ ] Check logs are accessible (Render.com dashboard)

### Backup & Safety

- [ ] Create database snapshot/backup before testing
- [ ] Document current production data state
- [ ] Have rollback plan ready
- [ ] Test on staging/development first if possible

---

## 🧪 Test Suite

### Test 1: Admin Login & Access Control

**Objective**: Verify admin authentication and authorization

**Steps**:

1. Navigate to `/admin` without authentication
   - **Expected**: Redirect to login or show "Access Denied"
2. Login as admin user
   - **Expected**: Successful authentication, redirect to `/admin`
3. Verify admin navbar shows admin-specific features
   - **Expected**: Admin dashboard link visible
4. Logout and try to access `/admin` directly
   - **Expected**: Access denied or redirect

**Success Criteria**:

- ✅ Non-admin users cannot access admin dashboard
- ✅ Admin users can access all admin features
- ✅ Session persistence works correctly

---

### Test 2: Admin Dashboard Overview

**Objective**: Validate dashboard displays correct statistics

**Location**: `/admin`

**Steps**:

1. Open admin dashboard
2. Review "Quick Stats" section
   - Total Guests
   - RSVPs Received
   - Attending Count
   - Not Attending Count
3. Check percentage calculations
   - RSVP Response Rate
   - Attendance Rate
4. Verify "Recent Activity" timeline
5. Check "Guest Distribution" charts

**Success Criteria**:

- ✅ All numbers match database reality
- ✅ Percentages calculate correctly
- ✅ Charts render properly
- ✅ No console errors
- ✅ Loading states work

**Data to Record**:

```
Total Guests: _______
RSVPs Received: _______
Attending: _______
Not Attending: _______
RSVP Rate: _______% (should be RSVPs / Total * 100)
Attendance Rate: _______% (should be Attending / RSVPs * 100)
```

---

### Test 3: Guest List Management

**Objective**: Validate guest viewing and search functionality

**Location**: Admin Dashboard → "Guest List" tab

**Steps**:

1. View complete guest list
   - **Expected**: All invited guests displayed
2. Test search functionality:
   - Search by name
   - Search by email
   - Search by RSVP status
3. Test filtering:
   - Filter by "Has RSVP'd"
   - Filter by "Invited Only"
   - Filter by Guest Group
4. Test sorting:
   - Sort by name (A-Z, Z-A)
   - Sort by RSVP date
   - Sort by attendance status
5. Click individual guest to view details

**Success Criteria**:

- ✅ All guests load correctly
- ✅ Search returns accurate results
- ✅ Filters work as expected
- ✅ Sorting maintains data integrity
- ✅ Guest details modal opens correctly

---

### Test 4: Bulk Personalization CSV Upload (PRIMARY TEST)

**Objective**: Complete end-to-end CSV import workflow

**Location**: Admin Dashboard → "Bulk Personalization" tab

#### 4.1 Download Template

**Steps**:

1. Click "Download CSV Template" button
2. Open downloaded file
3. Verify headers match expected format

**Expected Headers**:

```csv
fullName,email,relationshipToBride,relationshipToGroom,guestGroup,plusOneAllowed,customWelcomeMessage,specialInstructions,dietaryRestrictions,personalPhoto
```

**Success Criteria**:

- ✅ Template downloads successfully
- ✅ Headers are correct
- ✅ Example row is present

#### 4.2 Prepare Test CSV

Create a test CSV file with **real production guest data**:

**test_personalization.csv**:

```csv
fullName,email,relationshipToBride,relationshipToGroom,guestGroup,plusOneAllowed,customWelcomeMessage,specialInstructions,dietaryRestrictions,personalPhoto
"[Real Guest Name 1]","[real-email-1]@example.com","College Friend","","friends","true","We're so excited to celebrate with you!","Hotel block at Marriott","Vegetarian",""
"[Real Guest Name 2]","[real-email-2]@example.com","","Sister","brides_family","false","Family means everything to us!","Shuttle available","Gluten-free",""
"[Real Guest Name 3]","[real-email-3]@example.com","Coworker","Friend","both","true","","","",""
```

**Important**: Replace bracketed values with actual production guest emails

#### 4.3 Upload & Preview

**Steps**:

1. Click "Choose File" button
2. Select `test_personalization.csv`
3. Review preview table
4. Check validation messages

**Success Criteria**:

- ✅ File uploads without errors
- ✅ Preview displays all rows correctly
- ✅ Validation runs automatically
- ✅ Matched users show green checkmark
- ✅ Unmatched emails show warning
- ✅ Invalid data shows error messages

**Validation Checks**:

- Email format validation
- Relationship values (family, friend, coworker, college, other)
- Guest group values (family, friends, wedding_party, etc.)
- plusOneAllowed boolean (true/false)

#### 4.4 Import Execution

**Steps**:

1. Review preview one final time
2. Click "Import Personalization Data" button
3. Monitor progress indicator
4. Wait for completion message

**Success Criteria**:

- ✅ Import starts successfully
- ✅ Progress bar shows accurately
- ✅ No network errors
- ✅ Completion message shows:
  - Number of successful updates
  - Number of failed updates
  - Error details for failures

**Expected Result**:

```
✅ Import Complete!
Successfully updated: 3 guests
Failed: 0
```

#### 4.5 Verify Data Persistence

**Steps**:

1. Navigate to "Guest List" tab
2. Search for each guest you updated
3. Click guest to view details
4. Verify personalization fields:
   - Relationship to Bride/Groom
   - Guest Group
   - Plus One Allowed
   - Custom Welcome Message
   - Special Instructions
   - Dietary Restrictions

**Success Criteria**:

- ✅ All fields saved correctly
- ✅ Data matches CSV input
- ✅ No data corruption
- ✅ No unexpected nulls

#### 4.6 Test Frontend Personalization Display

**Steps**:

1. Logout from admin account
2. Login as one of the updated guests (using QR token)
3. View Welcome Modal
4. Check for personalized content

**Success Criteria**:

- ✅ Custom welcome message displays
- ✅ Relationship-based greeting shows
- ✅ Guest group affects modal content
- ✅ Special instructions visible in appropriate section

---

### Test 5: Individual Guest Personalization

**Objective**: Test manual guest profile editing

**Location**: Admin Dashboard → Guest List → Edit Guest

**Steps**:

1. Search for a specific guest
2. Click "Edit" button
3. Update fields:
   - Full Name
   - Email
   - Relationship to Bride
   - Relationship to Groom
   - Guest Group
   - Custom Welcome Message
   - Special Instructions
   - Dietary Restrictions
4. Save changes
5. Verify update success message
6. Refresh page and verify persistence

**Success Criteria**:

- ✅ Edit modal opens correctly
- ✅ All fields editable
- ✅ Validation works (email format, required fields)
- ✅ Save successful
- ✅ Data persists after refresh

---

### Test 6: Email Reminder System

**Objective**: Validate email reminder functionality

**Location**: Admin Dashboard → "Email Reminders" tab

**Steps**:

1. View email statistics:
   - Total emails sent
   - Pending emails
   - Failed emails
2. Test "Send RSVP Reminder" feature:
   - Select guests who haven't RSVP'd
   - Click "Send Reminder"
   - Verify email queued
3. Check email history log
4. Monitor email delivery status

**Success Criteria**:

- ✅ Email stats display correctly
- ✅ Guest selection works
- ✅ Emails queue successfully
- ✅ Email history shows sent/pending/failed
- ✅ No duplicate sends

**⚠️ Warning**: Be careful sending to real guests during testing!

---

### Test 7: RSVP Management

**Objective**: Admin ability to view and modify RSVPs

**Location**: Admin Dashboard → "RSVP Manager" tab

**Steps**:

1. View all RSVPs
2. Filter by attendance status (Yes/No/Maybe)
3. Edit an RSVP:
   - Change attendance
   - Update guest count
   - Modify dietary restrictions
   - Add notes
4. Save changes
5. Verify RSVP history/audit log

**Success Criteria**:

- ✅ All RSVPs visible
- ✅ Filtering works correctly
- ✅ Admin can override RSVP data
- ✅ Changes log properly
- ✅ Guest receives update (if configured)

---

### Test 8: Analytics & Reporting

**Objective**: Validate reporting features

**Location**: Admin Dashboard → "Analytics" tab

**Steps**:

1. View guest distribution charts:
   - By Guest Group
   - By Relationship
   - By RSVP Status
2. Check attendance trends over time
3. Export guest list as CSV
4. Export RSVP summary

**Success Criteria**:

- ✅ Charts render correctly
- ✅ Data matches reality
- ✅ Export downloads successfully
- ✅ CSV format correct
- ✅ No data truncation

---

### Test 9: Data Export

**Objective**: Verify admin can export all data

**Location**: Admin Dashboard → "Export" section

**Steps**:

1. Export complete guest list
2. Export RSVP responses
3. Export personalization data
4. Open exported files
5. Verify data completeness

**Expected Columns** (Guest List):

- Full Name
- Email
- QR Token
- Invited Status
- RSVP Status
- Attendance
- Guest Group
- Relationship to Bride/Groom
- Custom Message
- Special Instructions
- Dietary Restrictions

**Success Criteria**:

- ✅ All exports download successfully
- ✅ Data complete and accurate
- ✅ CSV format valid
- ✅ Special characters handled correctly

---

### Test 10: Phase 3 Features Integration

**Objective**: Confirm all Phase 3 personalization features work end-to-end

#### Phase 3 Feature Checklist:

**Database Schema (User Model)**:

- [x] `relationshipToBride` field
- [x] `relationshipToGroom` field
- [x] `customWelcomeMessage` field
- [x] `guestGroup` field
- [x] `plusOneAllowed` field
- [x] `specialInstructions` field
- [x] `dietaryRestrictions` field
- [x] `personalPhoto` field

**GraphQL API**:

- [x] Query: `user` includes all personalization fields
- [x] Mutation: `adminBulkUpdatePersonalization`
- [x] Mutation: `adminUpdateUser`
- [x] Proper authentication/authorization

**Frontend Components**:

- [x] WelcomeModal shows personalized content
- [x] BulkPersonalization CSV upload
- [x] GuestPersonalizationModal for editing
- [x] AdminGuestPersonalization display

**End-to-End Flow**:

1. Admin uploads CSV with personalization data
2. Data saves to database
3. Guest logs in with QR code
4. Welcome modal shows personalized message
5. Guest sees custom instructions
6. RSVP form pre-fills dietary restrictions

**Success Criteria**:

- ✅ Complete workflow works without errors
- ✅ Data flows correctly from admin → database → guest view
- ✅ Personalization enhances guest experience
- ✅ No regression in existing features

---

## 🐛 Error Scenarios to Test

### Test with Invalid Data

**Invalid CSV Tests**:

1. **Malformed Email**: `invalid-email` (no @)
   - **Expected**: Validation error
2. **Invalid Relationship**: `BestFriend` (not in enum)
   - **Expected**: Validation error or default to "other"
3. **Invalid Guest Group**: `random_group`
   - **Expected**: Validation error or ignore
4. **Non-existent Email**: `nobody@example.com`
   - **Expected**: Warning, skip row, or error message
5. **Duplicate Rows**: Same email twice
   - **Expected**: Handle gracefully (last wins or error)

**Expected Behavior**:

- Clear error messages
- No partial updates (transaction rollback)
- Error log available
- Admin can fix and retry

---

## 📊 Performance Benchmarks

**Expected Response Times** (production):

- Admin dashboard initial load: < 3 seconds
- Guest list query (100 guests): < 1 second
- CSV upload (50 rows): < 2 seconds
- CSV import processing (50 rows): < 5 seconds
- Individual guest update: < 500ms
- Analytics chart generation: < 2 seconds

**Monitor**:

- Network tab in browser DevTools
- Render.com logs for backend timing
- GraphQL query performance
- Database query performance (MongoDB Atlas metrics)

---

## ✅ Success Criteria

### Must Pass (Blocker Issues)

- [ ] Admin can login and access dashboard
- [ ] All statistics display correctly
- [ ] CSV upload and import works end-to-end
- [ ] Personalization data saves to database
- [ ] Guests see personalized content on login
- [ ] No data loss or corruption
- [ ] No console errors (critical)

### Should Pass (High Priority)

- [ ] Email reminders send successfully
- [ ] Individual guest editing works
- [ ] Data export functions correctly
- [ ] Search and filtering work
- [ ] Charts and analytics accurate
- [ ] Performance within benchmarks

### Nice to Have (Low Priority)

- [ ] Smooth loading animations
- [ ] Helpful tooltips
- [ ] Keyboard shortcuts work
- [ ] Mobile-responsive admin panel

---

## 📝 Test Results Template

```markdown
## Test Execution Report

**Date**: **\_\_\_**
**Tester**: **\_\_\_**
**Environment**: Production
**Browser**: **\_\_\_**
**Duration**: **\_\_\_**

### Results Summary

- Total Tests: 10
- Passed: \_\_\_ / 10
- Failed: \_\_\_ / 10
- Blocked: \_\_\_ / 10

### Critical Issues Found

1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual

### Non-Critical Issues

1. [Issue description]

### Performance Notes

- Dashboard load time: **\_\_\_**
- CSV import time (N rows): **\_\_\_**
- Any timeouts or slowness: **\_\_\_**

### Data Integrity Check

- Pre-test guest count: **\_\_\_**
- Post-test guest count: **\_\_\_**
- Data corruption: Yes/No
- Rollback required: Yes/No

### Recommendations

- [ ] Deploy to production: Yes/No
- [ ] Fix issues and retest
- [ ] Performance optimization needed
- [ ] Additional features needed

### Sign-off

Admin Production Testing: ✅ Approved / ❌ Rejected

Signature: **********\_\_\_**********
Date: **********\_\_\_**********
```

---

## 🚨 Rollback Plan

**If critical issues found**:

1. **Immediate Actions**:

   - Stop all admin operations
   - Document the issue with screenshots
   - Note affected guest data

2. **Database Rollback**:

   ```bash
   # Restore from backup (MongoDB Atlas)
   # 1. Go to Atlas Console
   # 2. Select Cluster → Backup
   # 3. Choose snapshot from before testing
   # 4. Restore to cluster
   ```

3. **Code Rollback**:

   ```bash
   # Revert to last stable commit
   git revert <commit-hash>
   git push origin feature-branch

   # Or rollback deployment in Render.com
   # Dashboard → Deploys → Redeploy previous version
   ```

4. **Verification**:
   - Test production after rollback
   - Verify guest data intact
   - Confirm no functionality broken

---

## 📞 Support Contacts

**Technical Issues**:

- GitHub Repository: https://github.com/Sinnema1/dj-forever2
- Render.com Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com

**Escalation**:

- Create GitHub Issue with `[PRODUCTION]` tag
- Document steps to reproduce
- Include logs and screenshots

---

## 🎯 Next Steps After Testing

1. **If All Tests Pass**:

   - [ ] Document results
   - [ ] Mark "Admin Production Testing" as complete
   - [ ] Move to next priority (PWA Testing)
   - [ ] Celebrate! 🎉

2. **If Issues Found**:

   - [ ] Prioritize by severity
   - [ ] Create GitHub issues
   - [ ] Fix critical blockers
   - [ ] Retest before production use

3. **Optimization Opportunities**:
   - [ ] Note performance improvements needed
   - [ ] List UX enhancements
   - [ ] Document feature requests from testing

---

## 📚 Related Documentation

- [NEXT_PRIORITIES_ACTION_PLAN.md](./NEXT_PRIORITIES_ACTION_PLAN.md) - Overall roadmap
- [PERSONALIZED_MODAL_ENHANCEMENT_TODO.md](./docs/development/PERSONALIZED_MODAL_ENHANCEMENT_TODO.md) - Phase 3 details
- [Admin Dashboard GraphQL Queries](./client/src/api/adminQueries.ts)
- [Bulk Personalization Component](./client/src/components/admin/BulkPersonalization.tsx)

---

**Ready to Begin Testing?** ✅

Start with Test 1 and work through sequentially. Good luck! 🚀
