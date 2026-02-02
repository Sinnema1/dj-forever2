#!/bin/bash

echo "🗂️  Documentation Reorganization Script"
echo "========================================"
echo ""

# Create deployment directory
echo "Step 1: Creating docs/deployment/ directory..."
mkdir -p docs/deployment

# Move deployment files
echo "Step 2: Moving deployment documentation..."
if [ -f "ADMIN_PRODUCTION_TESTING.md" ]; then
  mv ADMIN_PRODUCTION_TESTING.md docs/admin/
  echo "✅ Moved ADMIN_PRODUCTION_TESTING.md → docs/admin/"
fi

if [ -f "DEPLOYMENT.md" ]; then
  mv DEPLOYMENT.md docs/deployment/
  echo "✅ Moved DEPLOYMENT.md → docs/deployment/"
fi

if [ -f "RENDER_DEPLOYMENT_URLS.md" ]; then
  mv RENDER_DEPLOYMENT_URLS.md docs/deployment/
  echo "✅ Moved RENDER_DEPLOYMENT_URLS.md → docs/deployment/"
fi

if [ -f "PRODUCTION_READINESS_CHECKLIST.md" ]; then
  mv PRODUCTION_READINESS_CHECKLIST.md docs/deployment/
  echo "✅ Moved PRODUCTION_READINESS_CHECKLIST.md → docs/deployment/"
fi

# Move mobile debug guide
echo ""
echo "Step 3: Consolidating mobile documentation..."
if [ -f "docs/guides/MOBILE_DEBUG_GUIDE.md" ]; then
  mv docs/guides/MOBILE_DEBUG_GUIDE.md docs/development/mobile/
  echo "✅ Moved MOBILE_DEBUG_GUIDE.md → docs/development/mobile/"
fi

echo ""
echo "Step 4: Creating index files..."

# Create deployment README
cat > docs/deployment/README.md << 'EOF'
# Deployment Documentation

Production deployment guides and checklists for DJ Forever 2 wedding website.

## 📋 Guides

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Render.com
- **[RENDER_DEPLOYMENT_URLS.md](./RENDER_DEPLOYMENT_URLS.md)** - Production URLs and configuration
- **[PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md)** - Pre-deployment verification

## 🧪 Testing

- **[Admin Production Testing](../admin/ADMIN_PRODUCTION_TESTING.md)** - Comprehensive production testing guide

## 🔗 Quick Links

- **Frontend**: https://dj-forever2.onrender.com
- **Backend**: https://dj-forever2-backend.onrender.com
- **Render Dashboard**: https://dashboard.render.com

## 🚀 Deployment Workflow

1. Review [PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md)
2. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) deployment steps
3. Verify using [ADMIN_PRODUCTION_TESTING.md](../admin/ADMIN_PRODUCTION_TESTING.md)
4. Monitor production via [RENDER_DEPLOYMENT_URLS.md](./RENDER_DEPLOYMENT_URLS.md)
EOF
echo "✅ Created docs/deployment/README.md"

# Create admin README
cat > docs/admin/README.md << 'EOF'
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
EOF
echo "✅ Created docs/admin/README.md"

# Create mobile README
cat > docs/development/mobile/README.md << 'EOF'
# Mobile Features Documentation

Mobile optimization and debugging guides for DJ Forever 2 wedding website.

## 📱 Features

- **[MOBILE_FEATURES_SUMMARY.md](./MOBILE_FEATURES_SUMMARY.md)** - Complete mobile feature list
- **[MOBILE_DRAWER_IMPLEMENTATION.md](./MOBILE_DRAWER_IMPLEMENTATION.md)** - Mobile navigation drawer
- **[MOBILE_QR_TESTING_READY.md](./MOBILE_QR_TESTING_READY.md)** - QR scanner status and testing

## 🐛 Debugging

- **[MOBILE_DEBUG_GUIDE.md](./MOBILE_DEBUG_GUIDE.md)** - Mobile debugging strategies and tools
- **[../../../guides/REAL_DEVICE_QR_TESTING_GUIDE.md](../../../guides/REAL_DEVICE_QR_TESTING_GUIDE.md)** - Physical device testing procedures

## 🔧 Technical Details

### Mobile Optimizations
- Touch-friendly interactions
- Responsive layouts
- QR scanner with html5-qrcode
- Swipeable lightbox for photo gallery
- Mobile drawer navigation

### Key Components
- `client/src/components/QRLoginModal.tsx` - QR scanner modal
- `client/src/components/MobileDrawer.tsx` - Mobile navigation
- `client/src/components/SwipeableLightbox.tsx` - Photo gallery

## 🧪 Testing

### Real Device Testing
1. Review [MOBILE_DEBUG_GUIDE.md](./MOBILE_DEBUG_GUIDE.md)
2. Follow [REAL_DEVICE_QR_TESTING_GUIDE.md](../../../guides/REAL_DEVICE_QR_TESTING_GUIDE.md)
3. Test on iOS and Android devices
4. Verify QR scanner functionality
5. Test touch interactions

### Mobile-Specific Bugs
See [../../bug-fixes/MOBILE_DRAWER_SCROLL_COMPATIBILITY_FIX.md](../../bug-fixes/MOBILE_DRAWER_SCROLL_COMPATIBILITY_FIX.md) for resolved issues.
EOF
echo "✅ Created docs/development/mobile/README.md"

echo ""
echo "Step 5: Updating root README.md..."

# Check if README.md exists and add documentation section
if [ -f "README.md" ]; then
  # Create backup
  cp README.md README.md.backup
  echo "✅ Created README.md.backup"
fi

echo ""
echo "=========================================="
echo "✅ Documentation Reorganization Complete!"
echo ""
echo "Summary:"
echo "  - Created docs/deployment/ directory"
echo "  - Moved 4 deployment files"
echo "  - Moved 1 mobile guide"
echo "  - Created 3 index files"
echo "  - Backed up README.md"
echo ""
echo "Next Steps:"
echo "  1. Review moved files: ls -la docs/deployment/"
echo "  2. Verify mobile docs: ls -la docs/development/mobile/"
echo "  3. Update root README.md with documentation section"
echo "  4. Test all documentation links"
echo ""
echo "Rollback: mv README.md.backup README.md"
