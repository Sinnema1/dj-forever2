#!/bin/bash

# Production Validation Test Suite
# This script validates critical functionality in production environment

set -e

echo "🚀 DJ Forever 2 - Production Validation Suite"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://dj-forever2.onrender.com}"
BACKEND_URL="${BACKEND_URL:-https://dj-forever2-backend.onrender.com}"

echo "📍 Testing Configuration:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Backend Health Check
echo "Test 1: Backend Health Check"
echo "----------------------------"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    test_result 0 "Backend health endpoint responding"
    curl -s "$BACKEND_URL/health" | jq '.' 2>/dev/null || echo "(Response received)"
else
    test_result 1 "Backend health endpoint failed (HTTP $HEALTH_RESPONSE)"
fi
echo ""

# Test 2: GraphQL Introspection
echo "Test 2: GraphQL Schema Available"
echo "--------------------------------"
GRAPHQL_RESPONSE=$(curl -s -X POST "$BACKEND_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}')

if echo "$GRAPHQL_RESPONSE" | grep -q "Query"; then
    test_result 0 "GraphQL endpoint responding with valid schema"
else
    test_result 1 "GraphQL endpoint not responding correctly"
    echo "Response: $GRAPHQL_RESPONSE"
fi
echo ""

# Test 3: Frontend Loads
echo "Test 3: Frontend Site Loads"
echo "----------------------------"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    test_result 0 "Frontend site loads successfully"
else
    test_result 1 "Frontend site failed to load (HTTP $FRONTEND_RESPONSE)"
fi
echo ""

# Test 4: GraphQL Admin Query (requires auth, expect auth error)
echo "Test 4: GraphQL Admin Protection"
echo "--------------------------------"
ADMIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { adminGetAllUsersWithRSVPs { fullName } }"}')

if echo "$ADMIN_RESPONSE" | grep -q "Unauthorized\|Not authenticated"; then
    test_result 0 "Admin queries properly protected (authentication required)"
else
    test_result 1 "Admin query protection may not be working"
    echo "Response: $ADMIN_RESPONSE"
fi
echo ""

# Test 5: Public Query Works
echo "Test 5: Public GraphQL Query"
echo "-----------------------------"
PUBLIC_RESPONSE=$(curl -s -X POST "$BACKEND_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { __schema { queryType { name } } }"}')

if echo "$PUBLIC_RESPONSE" | grep -q "Query"; then
    test_result 0 "Public introspection query works"
else
    test_result 1 "Public query failed"
    echo "Response: $PUBLIC_RESPONSE"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 Test Summary"
echo "=============================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Review ADMIN_PRODUCTION_TESTING.md for manual testing"
    echo "2. Test admin login with your admin QR token"
    echo "3. Verify admin dashboard loads and displays correct data"
    echo "4. Test bulk personalization CSV upload"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Review output above.${NC}"
    echo ""
    echo "Common Issues:"
    echo "- Backend URL incorrect: Check Render.com dashboard"
    echo "- Services still deploying: Wait a few minutes and retry"
    echo "- Environment variables missing: Check Render.com Environment tab"
    echo ""
    exit 1
fi
