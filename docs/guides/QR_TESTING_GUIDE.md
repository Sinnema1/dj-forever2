# QR Code Testing Guide

## Development Environment

**Database**: `mongodb://localhost:27017/djforever2_dev`
**Frontend**: `http://localhost:4173` (Vite preview)
**Backend**: `http://localhost:3001/graphql`

### Development QR Tokens (Real Guests):

- **John Budach** (jpbudach@gmail.com): `3rz4heotj11wbkhdjoiv`
- **Brett Budach** (winterwalleye@gmail.com): `zofkagycljqyexmqrgr5`
- **Justin Manning (Admin)** (sinnema1.jm@gmail.com): `adminqrtoken2026justin`

### Development QR Codes:

- `qr-codes/production/John_Budach_jpbudach_gmail_com_*.png`
- `qr-codes/production/Brett_Budach_winterwalleye_gmail_com_*.png`
- `qr-codes/production/Justin_Manning_sinnema1_jm_gmail_com_*.png`

---

## Production Environment

**Database**: `mongodb+srv://...cluster0...djforever2`
**Frontend**: `https://dj-forever2.onrender.com`
**Backend**: `https://dj-forever2-backend.onrender.com/graphql`

### Production Guest Data:

**⚠️ Real wedding guests (30 households)**

- John Budach, Brett Budach, Raven Budach (Bride's family)
- Emerald Canny, Bailey Bowers, Abby Chose, etc. (Friends)
- See `server/src/seeds/userData.json` for complete list

### Production QR Codes:

- `qr-codes/production/` contains 30 QR codes for real guests
- Each QR code is named: `[FullName]_[email_sanitized]_[mongoId].png`
- **DO NOT** share QR codes publicly or commit to Git

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
