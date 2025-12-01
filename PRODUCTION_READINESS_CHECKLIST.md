# Production Environment Checklist

**Before running Admin Production Testing, verify these items:**

## 🔧 Server Configuration (Render.com)

### Environment Variables

Log into Render.com → dj-forever2 backend service → Environment

**Required Variables**:

```bash
# Database
MONGODB_URI=mongodb+srv://[your-connection-string]
MONGODB_DB_NAME=djforever2  # NOT djforever2_test or djforever2_dev

# Authentication
JWT_SECRET=[production-jwt-secret-min-32-chars]

# Frontend
CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com

# Logging
LOG_LEVEL=INFO  # or ERROR for less verbose

# Environment
NODE_ENV=production
```

### Verify Backend is Running

```bash
# Test health endpoint
curl https://dj-forever2.onrender.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-30T...",
  "uptime": 12345
}

# Test GraphQL endpoint
curl -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}''

# Expected: GraphQL introspection response (not error)
```

---

## 🌐 Client Configuration (Render.com)

### Environment Variables

Render.com → dj-forever2 frontend service → Environment

**Required Variables**:

```bash
# API Endpoint
VITE_GRAPHQL_ENDPOINT=https://dj-forever2-backend.onrender.com/graphql

# Analytics
VITE_GA4_MEASUREMENT_ID=G-MWVQZEMF70
```

### Build Settings

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 20

---

## 📊 Database Configuration (MongoDB Atlas)

### Production Database

- **Cluster**: [Your production cluster name]
- **Database Name**: `djforever2` (verify this!)
- **Collections**:
  - `users` - Guest/user data
  - `rsvps` - RSVP responses
  - `emailjobs` - Email queue (if using email feature)

### Verify Database Access

```bash
# From server directory
cd server

# Check database connection (requires .env with MONGODB_URI)
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { dbName: 'djforever2' })
  .then(() => {
    console.log('✅ Connected to production database');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(dbs => {
    console.log('Available databases:', dbs.databases.map(d => d.name));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
"
```

### Production Data Status

Check current production data:

```bash
# Count users
db.users.countDocuments({ isInvited: true })

# Count RSVPs
db.rsvps.countDocuments()

# Sample user to verify personalization fields exist
db.users.findOne({ isInvited: true })
# Should have fields: relationshipToBride, relationshipToGroom,
# customWelcomeMessage, guestGroup, etc.
```

---

## 🔐 Admin User Setup

### Create/Verify Admin User

```bash
# In production MongoDB, verify admin user exists:
db.users.findOne({ isAdmin: true })

# If not, create one:
db.users.insertOne({
  fullName: "Admin User",
  email: "admin@example.com",
  qrToken: "admin-unique-token-12345",
  isInvited: true,
  isAdmin: true,
  hasRSVPed: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Test Admin Login

1. Navigate to: https://dj-forever2.onrender.com/login/qr/admin-unique-token-12345
2. Should login successfully
3. Navigate to: https://dj-forever2.onrender.com/admin
4. Should see admin dashboard (not access denied)

---

## 🧪 Quick Smoke Tests

Before full testing suite, run these quick checks:

### 1. Frontend Loads

```
✅ https://dj-forever2.onrender.com loads without errors
✅ Console shows no critical errors
✅ GA4 tracking initializes (check Network tab for GA requests)
```

### 2. GraphQL Connection

Open browser console on production site:

```javascript
// Test GraphQL query
fetch("https://dj-forever2-backend.onrender.com/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `query { __typename }`,
  }),
})
  .then((r) => r.json())
  .then((d) => console.log("GraphQL Response:", d));

// Expected: { "data": { "__typename": "Query" } }
```

### 3. User Authentication

```
✅ QR login works (/login/qr/[token])
✅ JWT stored in localStorage
✅ Protected routes enforce authentication
```

### 4. Admin Access

```
✅ Admin dashboard accessible at /admin
✅ All tabs load (Guest List, Bulk Personalization, Analytics, etc.)
✅ Guest data displays correctly
```

---

## 📦 Backup Before Testing

**CRITICAL**: Create database backup before any production testing!

### MongoDB Atlas Backup

1. Log into MongoDB Atlas
2. Navigate to your cluster
3. Click "Backup" tab
4. Take a manual snapshot
5. Name it: `pre-admin-testing-2025-11-30`
6. Wait for completion (usually < 5 minutes)

### Alternative: Export Data

```bash
# Export all collections
mongodump --uri="mongodb+srv://..." --db=djforever2 --out=./backup-2025-11-30

# To restore if needed:
mongorestore --uri="mongodb+srv://..." --db=djforever2 ./backup-2025-11-30/djforever2
```

---

## 🚦 Go/No-Go Decision

**Only proceed with production testing if ALL items below are ✅**:

### Critical Requirements

- [ ] Production backend is deployed and running
- [ ] Production frontend is deployed and running
- [ ] Database connection verified
- [ ] Admin user exists and can login
- [ ] Database backup created
- [ ] All environment variables set correctly
- [ ] No current production errors in logs

### Recommended (Not Blockers)

- [ ] GA4 analytics working
- [ ] Email service configured (if testing emails)
- [ ] Staging environment tested first
- [ ] Rollback plan documented

---

## 🎬 Ready to Begin?

If all critical requirements are ✅, proceed to:
**[ADMIN_PRODUCTION_TESTING.md](./ADMIN_PRODUCTION_TESTING.md)**

Start with Test 1 (Admin Login & Access Control).

---

## 🆘 Troubleshooting

### Backend Not Responding

```bash
# Check Render.com logs
# Dashboard → Backend service → Logs

# Common issues:
# - Build failed (check build logs)
# - Database connection failed (check MONGODB_URI)
# - Port binding issue (Render uses PORT env var)
```

### Frontend Not Loading

```bash
# Check Render.com logs
# Dashboard → Frontend service → Logs

# Common issues:
# - Vite build failed (missing dependencies)
# - Environment variables not set
# - GraphQL endpoint incorrect
```

### Database Connection Issues

```bash
# Verify MongoDB Atlas:
# - IP whitelist includes 0.0.0.0/0 (or Render IP ranges)
# - Database user has correct permissions
# - Connection string has correct password
# - SSL/TLS enabled
```

### Admin Access Denied

```bash
# Check:
# 1. User has isAdmin: true in database
# 2. JWT token is valid (check localStorage)
# 3. GraphQL auth context includes user
# 4. Protected route logic correct
```

---

**Last Updated**: November 30, 2025
