#!/bin/bash

# Test script to verify email config validation works correctly
# This simulates missing/invalid environment variables

echo "🧪 Testing Email Config Validation Script"
echo "=========================================="
echo ""

# Save original .env
cp server/.env server/.env.backup

# Test 1: Missing SMTP_HOST
echo "Test 1: Missing SMTP_HOST"
echo "-------------------------"
sed 's/^SMTP_HOST=.*/SMTP_HOST=/' server/.env > server/.env.tmp && mv server/.env.tmp server/.env
./test-email-config.sh > /dev/null 2>&1
if [ $? -eq 1 ]; then
  echo "✅ PASS: Correctly detected missing SMTP_HOST"
else
  echo "❌ FAIL: Did not detect missing SMTP_HOST"
fi
echo ""

# Restore .env
cp server/.env.backup server/.env

# Test 2: Placeholder SMTP_USER
echo "Test 2: Placeholder SMTP_USER"
echo "------------------------------"
sed 's/^SMTP_USER=.*/SMTP_USER=your-email@gmail.com/' server/.env > server/.env.tmp && mv server/.env.tmp server/.env
./test-email-config.sh > /dev/null 2>&1
if [ $? -eq 1 ]; then
  echo "✅ PASS: Correctly detected placeholder SMTP_USER"
else
  echo "❌ FAIL: Did not detect placeholder SMTP_USER"
fi
echo ""

# Restore .env
cp server/.env.backup server/.env

# Test 3: All variables present (should pass)
echo "Test 3: All variables present"
echo "------------------------------"
./test-email-config.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ PASS: Correctly validated complete configuration"
else
  echo "❌ FAIL: Failed with complete configuration"
fi
echo ""

# Cleanup
rm server/.env.backup

echo "=========================================="
echo "✅ Validation tests complete!"
