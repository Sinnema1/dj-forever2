# Render.com Deployment URLs - Quick Reference

## 🌐 Production URLs

| Service     | Custom Domain                 | Render URL (fallback)                    |
| ----------- | ----------------------------- | ---------------------------------------- |
| Frontend    | https://www.djforever2026.com | https://dj-forever2.onrender.com         |
| Backend API | https://api.djforever2026.com | https://dj-forever2-backend.onrender.com |

> DNS is managed in Cloudflare. Custom domains are primary for all guest-facing traffic. Render `.onrender.com` URLs are fallback/legacy endpoints for diagnostics and rollback only.

---

## 🔍 Render.com Service Overview

Two Render.com services are deployed:

### 1. Frontend Service (Static Site)

- **Service Name**: `dj-forever2`
- **Custom Domain**: https://www.djforever2026.com
- **Render URL**: https://dj-forever2.onrender.com
- **Root Directory**: `client/`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 2. Backend Service (Web Service)

- **Service Name**: `dj-forever2-backend`
- **Custom Domain**: https://api.djforever2026.com
- **Render URL**: https://dj-forever2-backend.onrender.com
- **Root Directory**: `server/`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## ✅ Required Environment Variables

### Backend service (Render Dashboard → Environment):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://[your-atlas-connection]
MONGODB_DB_NAME=djforever2
JWT_SECRET=[your-jwt-secret-min-32-chars]
CONFIG__FRONTEND_URL=https://www.djforever2026.com
LOG_LEVEL=INFO
```

### Frontend service (Render Dashboard → Environment):

```
VITE_GRAPHQL_ENDPOINT=https://api.djforever2026.com/graphql
```

> ⚠️ After changing any `VITE_` env var, trigger a **Manual Deploy → Clear build cache & deploy** — Vite bakes these at build time.

---

## 🧪 Test Your Deployment

Use the verification scripts (already updated to use custom domains):

```bash
# Full verification suite
bash scripts/verify-production.sh

# Frontend-backend communication test
bash scripts/test-frontend-backend.sh

# Comprehensive validation
bash scripts/validate-production.sh
```

Or manually:

```bash
# Backend health
curl https://api.djforever2026.com/health

# Backend GraphQL
curl -X POST https://api.djforever2026.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Frontend
curl -I https://www.djforever2026.com
```

---

## 🚨 Common Issues

### Issue: GraphQL endpoint returns HTML

**Cause**: Hitting the frontend URL instead of backend  
**Fix**: Use `api.djforever2026.com` for GraphQL requests

### Issue: CORS errors in production

**Cause**: Backend not configured to allow frontend domain  
**Fix**: Verify `server.ts` CORS origins includes `https://www.djforever2026.com`
