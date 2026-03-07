#!/bin/bash
# Production Environment Verification Script
# Run this before admin production testing

set -e  # Exit on error

echo "🔍 DJ Forever 2 - Production Environment Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected)"
        ((FAILED++))
        return 1
    fi
}

# Function to test GraphQL
test_graphql() {
    echo -n "Testing GraphQL endpoint... "
    
    response=$(curl -s -X POST https://api.djforever2026.com/graphql \
        -H "Content-Type: application/json" \
        -d '{"query": "{ __typename }"}')
    
    if echo "$response" | grep -q "Query"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "1️⃣ Frontend Tests"
echo "-------------------"
test_endpoint "Frontend Homepage" "https://www.djforever2026.com" "200"
test_endpoint "Frontend /admin Route" "https://www.djforever2026.com/admin" "200"
echo ""

echo "2️⃣ Backend Tests"
echo "-------------------"
# Note: /health endpoint may not be deployed, but GraphQL is the critical test
test_graphql
echo ""

echo "3️⃣ Static Assets"
echo "-------------------"
test_endpoint "Favicon" "https://www.djforever2026.com/favicon.svg" "200"
test_endpoint "Manifest" "https://www.djforever2026.com/manifest.json" "200"
echo ""

# Summary
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Production environment is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review PRODUCTION_READINESS_CHECKLIST.md"
    echo "2. Create database backup"
    echo "3. Begin ADMIN_PRODUCTION_TESTING.md"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Fix issues before proceeding.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "- Check Render.com deployment status"
    echo "- Verify environment variables"
    echo "- Review application logs"
    exit 1
fi
