# Render.com Deployment URLs - Quick Reference

## 🌐 Production URLs

| Service | Custom Domain | Render URL (fallback) |
|---------|-------------|----------------------|
| Frontend | https://www.djforever2026.com | https://dj-forever2.onrender.com |
| Backend API | https://api.djforever2026.com | https://dj-forever2-backend.onrender.com |

> DNS is managed in Cloudflare. Both Render `.onrender.com` URLs remain active as fallback.

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

```bash
# Replace with your actual backend URL
curl https://dj-forever2-backend.onrender.com/health

# Expected: { "status": "ok", "timestamp": "...", "uptime": ... }
```

### Backend GraphQL

```bash
# Replace with your actual backend URL
curl -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Expected: { "data": { "__typename": "Query" } }
```

### Frontend

```bash
# Should return HTML
curl https://dj-forever2.onrender.com

# Expected: <!doctype html>...
```

---

## 📝 Update Production Test Scripts

Once you have the correct backend URL, update these files:

### 1. `scripts/verify-production.sh`

Replace all instances of `https://dj-forever2.onrender.com` for backend tests with your actual backend URL.

### 2. `.github/copilot-instructions.md`

Update the production URL documentation if needed.

---

## 🚨 Common Issues

### Issue: GraphQL endpoint returns HTML

**Cause**: You're hitting the frontend URL instead of backend  
**Fix**: Use the backend service URL for GraphQL requests

### Issue: CORS errors in production

**Cause**: Backend not configured to allow frontend domain  
**Fix**: Check backend `server.ts` CORS configuration includes your frontend URL

### Issue: Backend not deployed

**Cause**: Only frontend service exists on Render.com  
**Fix**: Deploy backend as separate web service (see instructions above)

---

## 📞 Next Steps

1. [ ] Find your backend service URL on Render.com dashboard
2. [ ] Test backend `/health` endpoint works
3. [ ] Test backend `/graphql` endpoint works
4. [ ] Verify frontend can communicate with backend
5. [ ] Update `VITE_GRAPHQL_ENDPOINT` if needed
6. [ ] Run `./scripts/verify-production.sh` with correct URLs
7. [ ] Proceed to `ADMIN_PRODUCTION_TESTING.md`

---

**Once you have the backend URL, let me know and I'll update the test scripts!**
