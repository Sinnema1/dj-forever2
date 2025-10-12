# Admin Login & Testing Guide

## 🔑 **The Problem**

You're seeing the guest UX because **you're not logged in**. The admin features only appear when authenticated with the admin user account.

## 📋 **Quick Testing Steps**

### **Option 1: Direct URL Login (Fastest!)**

1. **Copy and paste this URL into your browser:**

   ```
   http://localhost:3002/login/qr/obnzixyen8f6fzr5xwznda
   ```

2. **What should happen:**
   - You'll be automatically logged in as the admin user
   - You'll be redirected to the homepage
   - You should immediately see:
     - ✅ Admin welcome banner with "Admin Dashboard" button
     - ✅ ADMIN badge in the navbar
     - ✅ "Admin" link in the navbar menu

### **Option 2: Manual Token Entry**

1. Look for the QR code icon (📱) in the top-right of the navbar
2. Click it to open the QR login modal
3. Click "Enter Token Manually"
4. Paste this token: `obnzixyen8f6fzr5xwznda`
5. Click "Login"

### **Option 3: Scan QR Code (Most Realistic)**

1. Open the QR code folder that was just opened for you, or navigate to:
   ```
   /server/qr-codes/development/
   ```
2. Find the file: `Admin_User_admin_djforever2_com_*.png`
3. Scan it with your phone's camera or QR scanner
4. Click the link that appears

## 🔍 **Debug Authentication State**

Visit the new debug page to see exactly what's happening:

```
http://localhost:3002/auth-debug
```

This page shows:

- ✅ Current authentication status
- ✅ User details (if logged in)
- ✅ Admin status
- ✅ LocalStorage contents
- ✅ Quick login links

## ✨ **What You Should See After Admin Login**

### **Welcome Banner**

- **Message**: "Welcome, Admin! Access your dashboard to manage wedding details."
- **Button**: Prominent "Admin Dashboard" button (gold/accent color)
- **Duration**: Visible for 10 seconds

### **Navbar (Desktop)**

- **Greeting**: "Hello, Admin User! **ADMIN**" (with gold badge)
- **Links**: Home, Travel, Registry, RSVP, **Admin** ← new link

### **Admin Dashboard Access**

You can access the admin dashboard 3 ways:

1. Click "Admin Dashboard" button in the welcome banner
2. Click "Admin" link in the navbar
3. Navigate directly to: `http://localhost:3002/admin`

## 🛠️ **Troubleshooting**

### **Still seeing guest UX?**

1. Check browser console for any errors
2. Visit `/auth-debug` to verify authentication state
3. Clear browser cache/localStorage:
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   // Then login again
   ```

### **Admin link not showing in navbar?**

1. Verify you're logged in at `/auth-debug`
2. Check that `user.isAdmin` is `true`
3. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### **Welcome banner still showing?**

1. Check browser console for debug messages
2. Verify `user.isAdmin` is `true` at `/auth-debug`
3. Try logging out and logging back in

## 📝 **Admin User Details**

```
Full Name: Admin User
Email: admin@djforever2.com
QR Token: obnzixyen8f6fzr5xwznda
Is Admin: true
Is Invited: true

Direct Login URL:
http://localhost:3002/login/qr/obnzixyen8f6fzr5xwznda
```

## 🎯 **Expected Behavior Summary**

| Feature         | Guest User                               | Admin User                                    |
| --------------- | ---------------------------------------- | --------------------------------------------- |
| Welcome Banner  | "Welcome back, [Name]!" with RSVP button | "Welcome, Admin!" with Admin Dashboard button |
| Navbar Badge    | None                                     | **ADMIN** badge                               |
| Admin Link      | Hidden                                   | Visible                                       |
| Admin Dashboard | Access Denied (redirect to home)         | Full Access                                   |
| RSVP Features   | Visible                                  | Hidden                                        |

## 🚀 **Next Steps After Login**

Once logged in as admin, you should:

1. ✅ See the admin welcome banner
2. ✅ Click "Admin Dashboard" button or "Admin" navbar link
3. ✅ Access the full admin dashboard with:
   - Wedding statistics
   - Guest management
   - RSVP manager
   - Export functionality

---

**Need Help?** Check the `/auth-debug` page first to see your current authentication state!
