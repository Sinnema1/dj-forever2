#!/bin/bash

# Quick QR Testing Setup Script
# This script helps set up the environment for real device QR testing

echo "🚀 DJ Forever QR Testing Setup"
echo "=============================="

# Check if servers are running
echo "📡 Checking server status..."

# Check if server is running on port 3001
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server running on port 3001"
else
    echo "❌ Server not running on port 3001"
    echo "   Run: cd server && npm run dev"
    exit 1
fi

# Check if client is running on port 3002
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Client running on port 3002"
else
    echo "❌ Client not running on port 3002"
    echo "   Run: cd client && npm run dev"
    exit 1
fi

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📱 Local IP Address: $LOCAL_IP"
echo "   Mobile devices can access: http://$LOCAL_IP:3002"

# Check current QR codes
echo ""
echo "🔍 Available QR Codes:"
if [ -d "server/qr-codes/development" ]; then
    ls -la server/qr-codes/development/*.png | while read line; do
        filename=$(basename "$line")
        echo "   📱 $filename"
    done
else
    echo "   ⚠️  No QR codes found in development folder"
    echo "   Generate with: cd server && npm run seed"
fi

echo ""
echo "📋 Quick Test URLs (for manual testing):"
echo "   Local:  http://localhost:3002"
echo "   Mobile: http://$LOCAL_IP:3002"

echo ""
echo "🎯 Next Steps:"
echo "1. Connect mobile device to same WiFi network"
echo "2. Open QR code images from server/qr-codes/development/"
echo "3. Scan with mobile device"
echo "4. Test complete RSVP flow"
echo ""
echo "📖 See REAL_DEVICE_QR_TESTING_GUIDE.md for detailed instructions"

# Test a sample QR token if Charlie Williams exists
echo ""
echo "🧪 Testing sample QR login for Charlie Williams..."
CHARLIE_TOKEN=$(echo 'db.users.findOne({email: "charlie@example.com"}, {qrToken: 1})' | mongosh djforever2_dev --quiet 2>/dev/null | grep -o '"qrToken":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CHARLIE_TOKEN" ]; then
    echo "✅ Charlie Williams QR Token: $CHARLIE_TOKEN"
    echo "   Test URL: http://$LOCAL_IP:3002/login/qr/$CHARLIE_TOKEN"
    echo "   Try opening this URL directly on mobile browser"
else
    echo "⚠️  Could not find Charlie Williams QR token"
    echo "   Run: cd server && npm run seed"
fi