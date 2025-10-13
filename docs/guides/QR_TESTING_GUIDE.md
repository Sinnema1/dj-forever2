# QR Code Testing Guide

## Development Environment

**Database**: `mongodb://localhost:27017/djforever2_dev`
**Frontend**: `http://localhost:4173` (Vite preview)
**Backend**: `http://localhost:3001/graphql`

### Development QR Tokens:

- **Alice Johnson** (alice@example.com): `r24gpj3wntgqwqfberlas`
- **Bob Smith** (bob@example.com): `ssq7b7bkfqqpd2724vlcol`
- **Charlie Williams** (charlie@example.com): `ss0qx6mg20f2qaiyl9hnl7`

### Development QR Codes:

- `qr-codes/development/Alice_Johnson_alice_example_com.png`
- `qr-codes/development/Bob_Smith_bob_example_com.png`
- `qr-codes/development/Charlie_Williams_charlie_example_com.png`

---

## Production Environment

**Database**: `mongodb+srv://...cluster0...djforever2`
**Frontend**: `https://dj-forever2.onrender.com`
**Backend**: `https://dj-forever2-backend.onrender.com/graphql`

### Production QR Tokens:

- **Alice Johnson** (alice@example.com): `zolnlel3tpp4me90r10b5p`
- **Bob Smith** (bob@example.com): `6mbqwyfi5tjgiyxzsn1h5r`
- **Charlie Williams** (charlie@example.com): `m4t39u2ieg5jcn5qme05b`

### Production QR Codes:

- `qr-codes/production/Alice_Johnson_alice_example_com_6885a53d88bfbecaced1d567.png`
- `qr-codes/production/Bob_Smith_bob_example_com_6885a53d88bfbecaced1d568.png`
- `qr-codes/production/Charlie_Williams_charlie_example_com_6885a53d88bfbecaced1d569.png`

---

## Testing Instructions:

### Local Development Testing:

1. Use QR codes from `qr-codes/development/`
2. These will point to local environment
3. Scan with phone or use tokens directly

### Production Testing:

1. Use QR codes from `qr-codes/production/`
2. These point to production frontend
3. **Note**: Currently backend is returning 503, needs deployment fix

---

## Current Status:

✅ Development environment: Fully working
✅ Production database: Seeded with users
✅ Frontend configuration: Updated to use backend URL
❌ Production backend: Returning 503 errors (needs deployment fix)
