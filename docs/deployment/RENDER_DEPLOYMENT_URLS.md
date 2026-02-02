# Render.com Deployment URLs - Quick Reference

## 🔍 Finding Your Service URLs

You likely have **TWO** Render.com services deployed:

### 1. Frontend Service (Static Site or Web Service)

- **Service Name**: `dj-forever2` or `dj-forever2-client`
- **Type**: Static Site or Web Service
- **URL**: https://dj-forever2.onrender.com
- **Root Directory**: `client/`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

###2. Backend Service (Web Service)

- **Service Name**: `dj-forever2-backend` or `dj-forever2-server`
- **Type**: Web Service
- **URL**: https://dj-forever2-backend.onrender.com (or similar)
- **Root Directory**: `server/`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` or `node dist/server.js`

---

## ✅ Action Required: Find Your Backend URL

### Option 1: Check Render.com Dashboard

1. Log into https://dashboard.render.com
2. Look for your services - you should see **TWO**:
   - One for frontend (dj-forever2)
   - One for backend (dj-forever2-backend or similar name)
3. Click on the backend service
4. Copy the URL shown at the top (e.g., `https://dj-forever2-backend.onrender.com`)

### Option 2: Check Environment Variables

Your **frontend** service should have this environment variable set:

```
VITE_GRAPHQL_ENDPOINT=https://[BACKEND-SERVICE-URL].onrender.com/graphql
```

Check the frontend service → Environment tab to see what `VITE_GRAPHQL_ENDPOINT` is set to.

---

## 🔧 If You Only Have One Service Deployed

If you only deployed the **frontend** (static site), you need to deploy the backend separately.

### Deploy Backend to Render.com

1. **Create New Web Service**:

   - Dashboard → New → Web Service
   - Connect your GitHub repo: `Sinnema1/dj-forever2`
   - Branch: `main` or `feature-branch`

2. **Configure Build**:

   - **Name**: `dj-forever2-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Set Environment Variables**:

   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://[your-atlas-connection]
   MONGODB_DB_NAME=djforever2
   JWT_SECRET=[your-jwt-secret-min-32-chars]
   CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com
   LOG_LEVEL=INFO
   ```

4. **Deploy** and wait for build to complete

5. **Copy the backend URL** (e.g., `https://dj-forever2-backend.onrender.com`)

6. **Update Frontend Environment Variable**:
   - Go to frontend service → Environment
   - Add or update:
     ```
     VITE_GRAPHQL_ENDPOINT=https://dj-forever2-backend.onrender.com/graphql
     ```
   - Redeploy frontend (Manual Deploy → Clear build cache & deploy)

---

## 🧪 Test Your URLs

Once you have both URLs, test them:

### Backend Health Check

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
