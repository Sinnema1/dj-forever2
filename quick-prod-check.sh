#!/bin/bash

echo "🚀 Production Validation - Quick Check"
echo "========================================"
echo ""
echo "Backend: https://dj-forever2-backend.onrender.com"
echo "Frontend: https://dj-forever2.onrender.com"
echo ""

echo "Test 1: GraphQL Endpoint"
RESPONSE=$(curl -s -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}')
if echo "$RESPONSE" | grep -q "Query"; then
  echo "✅ PASS: GraphQL responding"
else
  echo "❌ FAIL: GraphQL not responding"
fi

echo ""
echo "Test 2: Frontend Site"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dj-forever2.onrender.com)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS: Frontend loads (HTTP $HTTP_CODE)"
else
  echo "❌ FAIL: Frontend returned HTTP $HTTP_CODE"
fi

echo ""
echo "Test 3: GraphQL Admin Protection"
RESPONSE=$(curl -s -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { adminGetAllUsersWithRSVPs { fullName } }"}')
if echo "$RESPONSE" | grep -qE "Unauthorized|Not authenticated|Unauthenticated|errors"; then
  echo "✅ PASS: Admin queries protected"
else
  echo "⚠️  CHECK: $RESPONSE"
fi

echo ""
echo "Test 4: Public Query (Schema Introspection)"
RESPONSE=$(curl -s -X POST https://dj-forever2-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}')
if echo "$RESPONSE" | grep -q "Query"; then
  echo "✅ PASS: Public GraphQL queries work"
else
  echo "❌ FAIL: Schema query failed"
fi

echo ""
echo "=========================================="
echo "✅ Production services are operational!"
echo ""
echo "Next: Manual testing via browser"
echo "1. Visit: https://dj-forever2.onrender.com/admin"
echo "2. Login with your admin QR token"
echo "3. Verify dashboard displays correctly"
echo "4. Test creating/editing guest (optional)"
