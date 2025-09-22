#!/bin/bash

# RSVP Test Suite Runner
# This script runs comprehensive tests for all RSVP validation scenarios

echo "🧪 Running RSVP Test Suite"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
    esac
}

# Check if server is running
check_server() {
    print_status "INFO" "Checking if server is running on port 3001..."
    if lsof -i :3001 > /dev/null 2>&1; then
        print_status "SUCCESS" "Server is running"
        return 0
    else
        print_status "WARNING" "Server not running, starting development server..."
        npm run dev &
        SERVER_PID=$!
        
        print_status "INFO" "Waiting for server to start..."
        sleep 10
        
        if lsof -i :3001 > /dev/null 2>&1; then
            print_status "SUCCESS" "Server started successfully"
            return 0
        else
            print_status "ERROR" "Failed to start server"
            return 1
        fi
    fi
}

# Run server-side E2E tests
run_server_tests() {
    print_status "INFO" "Running server-side RSVP E2E tests..."
    cd server
    
    if npm test -- tests/rsvp.e2e.test.ts; then
        print_status "SUCCESS" "Server-side RSVP tests passed"
        cd ..
        return 0
    else
        print_status "ERROR" "Server-side RSVP tests failed"
        cd ..
        return 1
    fi
}

# Run client-side E2E tests
run_client_tests() {
    print_status "INFO" "Running client-side RSVP E2E tests..."
    cd client
    
    if npm test -- tests/RSVPForm.e2e.test.tsx; then
        print_status "SUCCESS" "Client-side RSVP tests passed"
        cd ..
        return 0
    else
        print_status "ERROR" "Client-side RSVP tests failed"
        cd ..
        return 1
    fi
}

# Run GraphQL integration test
run_graphql_test() {
    print_status "INFO" "Running GraphQL integration test..."
    
    if node debug-rsvp-graphql.js; then
        print_status "SUCCESS" "GraphQL integration test passed"
        return 0
    else
        print_status "ERROR" "GraphQL integration test failed"
        return 1
    fi
}

# Main test execution
main() {
    print_status "INFO" "Starting RSVP validation test suite..."
    
    # Check dependencies
    if ! command -v npm &> /dev/null; then
        print_status "ERROR" "npm is required but not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_status "ERROR" "node is required but not installed"
        exit 1
    fi
    
    # Ensure we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_status "ERROR" "Please run this script from the project root directory"
        exit 1
    fi
    
    # Test counters
    TESTS_PASSED=0
    TESTS_FAILED=0
    
    # Check server
    if check_server; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
        print_status "ERROR" "Cannot continue without server"
        exit 1
    fi
    
    # Run server tests
    if run_server_tests; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Run client tests
    if run_client_tests; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Run GraphQL test
    if run_graphql_test; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Summary
    echo
    print_status "INFO" "Test Suite Summary"
    print_status "INFO" "=================="
    print_status "SUCCESS" "Tests Passed: $TESTS_PASSED"
    if [[ $TESTS_FAILED -gt 0 ]]; then
        print_status "ERROR" "Tests Failed: $TESTS_FAILED"
    else
        print_status "SUCCESS" "Tests Failed: $TESTS_FAILED"
    fi
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        print_status "SUCCESS" "All RSVP validation tests passed! 🎉"
        echo
        print_status "INFO" "The following scenarios are now validated:"
        print_status "SUCCESS" "• Attending RSVPs with required fields"
        print_status "SUCCESS" "• Non-attending RSVPs without meal preferences"
        print_status "SUCCESS" "• Maybe RSVPs without meal preferences"
        print_status "SUCCESS" "• Mobile touch interaction handling"
        print_status "SUCCESS" "• Form validation edge cases"
        print_status "SUCCESS" "• GraphQL mutation validation"
        exit 0
    else
        print_status "ERROR" "Some tests failed. Please check the output above."
        exit 1
    fi
}

# Cleanup function
cleanup() {
    if [[ -n $SERVER_PID ]]; then
        print_status "INFO" "Stopping test server..."
        kill $SERVER_PID 2>/dev/null
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Run main function
main "$@"