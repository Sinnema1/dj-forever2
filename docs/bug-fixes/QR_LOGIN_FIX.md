# QR Code Login Fix Instructions

Follow these steps to fix the QR code login issues in production:

## 1. Update Database QR Token

Alice's QR code contains the token `r24gpj3wntgqwqfberlas`, but her database entry has a different token (`zolnlel3tpp4me90r10b5p`).

### Option A: Update via MongoDB Shell

Connect to your production MongoDB database and run:

```javascript
db.users.updateOne(
  { email: "alice@example.com" },
  { $set: { qrToken: "r24gpj3wntgqwqfberlas" } }
);

// Verify the update
db.users.findOne({ email: "alice@example.com" });
```

### Option B: Connect to Production MongoDB from Local Machine

1. Update your `.env` file with the production MongoDB connection string
2. Run the provided script:
   ```
   node --loader ts-node/esm src/scripts/updateQrToken.ts
   ```

## 2. Server Configuration Updates

The following changes have been made to the server:

1. **CORS Configuration**: Added the production frontend URL to allowed origins
2. **QR Redirect Route**: Added a server-side route handler for `/login/qr/:qrToken`
3. **Environment Variable**: Updated `CONFIG__FRONTEND_URL` to point to production

## 3. Render Configuration

Ensure your Render configuration is properly set up:

### Frontend Service:

- Add a rewrite rule:
  - Source: `/*`
  - Destination: `/index.html`
  - Type: Rewrite

### Backend Service:

- Deploy the updated code with CORS and redirect route changes

## 4. Test QR Code Login

1. Open one of the QR codes from `server/qr-codes/`
2. Scan it with your phone's camera or QR code reader app
3. Verify you're properly redirected and logged in
4. Check for any errors in the browser console

## 5. Troubleshooting

If login still fails:

- Verify the QR token in the database matches the token in the URL
- Check browser console for any CORS or network errors
- Ensure the GraphQL mutation for `loginWithQrToken` is working
- Verify the client is correctly processing the login response

## 6. Monitoring

After deploying these changes, monitor your application logs in Render for any errors related to:

- CORS issues
- GraphQL mutations
- Authentication failures
