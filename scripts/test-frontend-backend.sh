#!/bin/bash
# Quick Frontend-Backend Communication Test
# Tests if the deployed frontend can communicate with the backend

echo "🧪 Testing Frontend → Backend Communication"
echo "=============================================="
echo ""

# Test direct backend access (should work)
echo "1. Testing direct backend GraphQL access..."
backend_response=$(curl -s -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}')

if echo "$backend_response" | grep -q "Query"; then
    echo "   ✅ Backend GraphQL works directly"
else
    echo "   ❌ Backend GraphQL failed"
    echo "   Response: $backend_response"
    exit 1
fi

echo ""
echo "2. Checking CORS headers..."
cors_check=$(curl -s -I -X OPTIONS https://dj-forever2-backend.onrender.com/graphql \
  -H "Origin: https://dj-forever2.onrender.com" \
  -H "Access-Control-Request-Method: POST" 2>&1)

if echo "$cors_check" | grep -q "access-control-allow-origin"; then
    echo "   ✅ CORS headers present"
else
    echo "   ⚠️  CORS headers not visible (may still work)"
fi

echo ""
echo "=============================================="
echo "✅ Backend is accessible!"
echo ""
echo "Next: Test in browser console on the frontend"
echo ""
echo "Instructions:"
echo "1. Open https://dj-forever2.onrender.com"
echo "2. Open DevTools (F12 or Cmd+Option+I)"
echo "3. Go to Console tab"
echo "4. Paste and run:"
echo ""
echo "   fetch('https://dj-forever2-backend.onrender.com/graphql', {"
echo "     method: 'POST',"
echo "     headers: { 'Content-Type': 'application/json' },"
echo "     body: JSON.stringify({ query: '{ __typename }' })"
echo "   })"
echo "   .then(r => r.json())"
echo "   .then(d => console.log('✅ Success:', d))"
echo "   .catch(e => console.error('❌ CORS Error:', e));"
echo ""
echo "Expected: ✅ Success: {data: {__typename: \"Query\"}}"
echo ""
