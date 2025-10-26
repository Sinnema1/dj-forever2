#!/bin/bash

# Email System Quick Test Script
# Tests SMTP configuration and sends a test email

echo "📧 DJ Forever 2 - Email System Test"
echo "===================================="
echo ""

# Check if server directory exists
if [ ! -d "server" ]; then
  echo "❌ Error: Run this script from the project root directory"
  exit 1
fi

# Check environment variables
echo "🔍 Checking SMTP configuration..."
echo ""

cd server

if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found in server directory"
  exit 1
fi

# Source .env file
set -a
source .env
set +a

# Validate SMTP configuration
MISSING=()

# Check SMTP_HOST
if [ -z "$SMTP_HOST" ]; then
  echo "❌ SMTP_HOST not configured"
  MISSING+=("SMTP_HOST")
else
  echo "✅ SMTP_HOST: $SMTP_HOST"
fi

# Check SMTP_PORT
if [ -z "$SMTP_PORT" ]; then
  echo "❌ SMTP_PORT not configured"
  MISSING+=("SMTP_PORT")
else
  echo "✅ SMTP_PORT: $SMTP_PORT"
fi

# Check SMTP_USER (must be set and not placeholder)
if [ -z "$SMTP_USER" ] || [ "$SMTP_USER" = "your-email@gmail.com" ]; then
  echo "❌ SMTP_USER not configured or using placeholder"
  MISSING+=("SMTP_USER")
else
  echo "✅ SMTP_USER: $SMTP_USER"
fi

# Check SMTP_PASS (must be set and not placeholder)
if [ -z "$SMTP_PASS" ] || [ "$SMTP_PASS" = "your-app-password" ]; then
  echo "❌ SMTP_PASS not configured or using placeholder"
  MISSING+=("SMTP_PASS")
else
  echo "✅ SMTP_PASS: [CONFIGURED - $(echo $SMTP_PASS | wc -c | tr -d ' ') characters]"
fi

# Check FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
  echo "❌ FRONTEND_URL not configured"
  MISSING+=("FRONTEND_URL")
else
  echo "✅ FRONTEND_URL: $FRONTEND_URL"
fi

echo ""

# Check if any variables are missing
if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Missing environment variables: ${MISSING[*]}"
  echo ""
  echo "Please update your server/.env file with:"
  echo ""
  echo "SMTP_HOST=smtp.gmail.com"
  echo "SMTP_PORT=587"
  echo "SMTP_USER=your-actual-email@gmail.com"
  echo "SMTP_PASS=your-16-character-app-password"
  echo "FRONTEND_URL=https://dj-forever2.onrender.com"
  echo ""
  exit 1
fi

echo "✅ All SMTP configuration variables present!"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start the server:"
echo "   cd server && npm run dev"
echo ""
echo "2. Log into admin dashboard:"
echo "   http://localhost:3001/admin"
echo ""
echo "3. Navigate to 'Email Reminders' tab"
echo ""
echo "4. Send a test email to yourself:"
echo "   - Find your email in the pending list"
echo "   - Click the checkbox next to your name"
echo "   - Click 'Send Reminders'"
echo "   - Check your inbox (sinnema1.jm@gmail.com)"
echo ""
echo "5. Verify email received:"
echo "   - Check subject line"
echo "   - Verify personalization"
echo "   - Test QR login link"
echo ""
echo "📚 Full testing checklist:"
echo "   See EMAIL_SYSTEM_TESTING_CHECKLIST.md"
echo ""
echo "✅ Configuration check complete!"
