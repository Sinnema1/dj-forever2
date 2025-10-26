# Deployment Guide - Render.com

This project is deployed on Render with separate services for frontend and backend.

## Service Configuration

### Backend Service (Web Service)

**URL**: `https://dj-forever2-backend.onrender.com`

**Build Command**: `npm run render-build`

**Start Command**: `node server/dist/server.js`

**Environment Variables**:

```bash
FRONTEND_URL=https://dj-forever2.onrender.com
JWT_SECRET=<your-secret>
MONGODB_URI=<your-mongodb-atlas-uri>
MONGODB_DB_NAME=djforever2
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-gmail-address>
SMTP_PASS=<your-gmail-app-password>
```

### Frontend Service (Static Site)

**URL**: `https://dj-forever2.onrender.com`

**Build Command**: `cd client && npm install && npm run build`

**Publish Directory**: `client/dist`

**Environment Variables**:

```bash
VITE_GRAPHQL_ENDPOINT=https://dj-forever2-backend.onrender.com/graphql
```

## SMTP Email Configuration

To enable email reminders, you need a Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll to "App passwords" at the bottom
4. Create a new app password for "Mail"
5. Use the generated 16-character password as `SMTP_PASS`

## Deployment Workflow

1. **Push to GitHub**: Changes pushed to `main` branch trigger auto-deployment
2. **Backend builds first**: Compiles TypeScript, builds client assets
3. **Frontend deploys**: Static site with built assets
4. **Services communicate**: Frontend calls backend GraphQL API with CORS enabled

## Database Setup

- **Production**: MongoDB Atlas cluster
- **Development**: Local MongoDB at `mongodb://localhost:27017/djforever2_dev`
- **Testing**: Local MongoDB at `mongodb://localhost:27017/djforever2_test`

## QR Code Generation

After seeding the production database:

```bash
cd server
npm run generate:qrcodes:prod
```

QR codes are saved to `server/qr-codes/production/` directory.

## Health Checks

- **Backend Health**: `https://dj-forever2-backend.onrender.com/health`
- **SMTP Health**: `https://dj-forever2-backend.onrender.com/health/smtp`
- **GraphQL**: `https://dj-forever2-backend.onrender.com/graphql`

## Troubleshooting

### Frontend can't reach backend

- Verify `VITE_GRAPHQL_ENDPOINT` points to backend URL
- Check CORS configuration in `server/src/server.ts` includes frontend domain

### Email system not working

- Verify all SMTP environment variables are set
- Check SMTP health endpoint returns `healthy: true`
- Ensure Gmail App Password is correct (not regular password)

### Database connection issues

- Verify `MONGODB_URI` format: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`
- Check `MONGODB_DB_NAME` is set to `djforever2` (not included in URI)
- Ensure MongoDB Atlas allows connections from Render IP addresses

## Local Development

```bash
# Start both client and server
npm run dev

# Server runs on: http://localhost:3001
# Client runs on: http://localhost:3002
```

For local testing with mobile devices on same WiFi:

- Update `server/.env`: `FRONTEND_URL=http://192.168.1.x:3002` (use your network IP)
- Restart dev server
- Mobile can access site at network IP address
