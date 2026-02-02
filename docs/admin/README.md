# Admin Features Documentation

Administrative dashboard and management features for DJ Forever 2 wedding website.

## 📊 Dashboard Features

- **[ADMIN_DASHBOARD_SUMMARY.md](./ADMIN_DASHBOARD_SUMMARY.md)** - Complete admin features overview (500+ lines)
- **[ADMIN_LOGIN_GUIDE.md](./ADMIN_LOGIN_GUIDE.md)** - Admin authentication and access control
- **[ANALYTICS_DASHBOARD_IMPLEMENTATION.md](./ANALYTICS_DASHBOARD_IMPLEMENTATION.md)** - Analytics technical details

## 👥 Guest Management

- **[GUEST_MANAGEMENT_IMPLEMENTATION.md](./GUEST_MANAGEMENT_IMPLEMENTATION.md)** - CRUD operations and personalization
- **[ADMIN_PRODUCTION_TESTING.md](./ADMIN_PRODUCTION_TESTING.md)** - Production testing procedures

## 📧 Email System

- **[EMAIL_SYSTEM_GUIDE.md](./EMAIL_SYSTEM_GUIDE.md)** - SMTP setup and email reminders

## 🔑 Key Components

### Frontend
- `client/src/components/admin/AdminDashboard.tsx` - Main dashboard
- `client/src/components/admin/AdminAnalytics.tsx` - Analytics visualizations
- `client/src/components/admin/BulkPersonalization.tsx` - CSV upload
- `client/src/components/admin/AdminRSVPManager.tsx` - Guest list management

### Backend
- `server/src/graphql/resolvers.ts` - Admin queries and mutations
- `server/src/middleware/authMiddleware.ts` - Admin authorization

## 🧪 Testing

See [ADMIN_PRODUCTION_TESTING.md](./ADMIN_PRODUCTION_TESTING.md) for comprehensive testing procedures.
