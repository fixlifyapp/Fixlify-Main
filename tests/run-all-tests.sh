#!/bin/bash

# Fixlify Master Test Runner
# Runs all test suites in sequence

set -e

echo "🧪 Fixlify Test Suite Runner"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to run test and track results
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name - FAILED${NC}"
        ((FAILED++))
    fi
    echo ""
}

# Database Tests
echo "📊 Database Tests"
echo "-----------------"
# Add database test commands here
echo "Skipping database tests (requires database connection)"
echo ""

# SMS/Email Tests
echo "📱 SMS/Email Tests"
echo "------------------"
if [ -f "tests/sms-email/test_email_config.js" ]; then
    run_test "Email Config Test" "node tests/sms-email/test_email_config.js"
fi
echo ""

# Automation Tests
echo "⚙️ Automation Tests"
echo "-------------------"
if [ -f "tests/automation/quick-automation-test.js" ]; then
    run_test "Quick Automation Test" "node tests/automation/quick-automation-test.js"
fi
echo ""

# Integration Tests
echo "🔗 Integration Tests"
echo "--------------------"
if [ -f "tests/integration/test-supabase-connection.mjs" ]; then
    run_test "Supabase Connection" "node tests/integration/test-supabase-connection.mjs"
fi
echo ""

# Console Tests
echo "💻 Console Tests"
echo "----------------"
echo "Console tests must be run in browser console"
echo ""

# Production Tests
echo "🚀 Production Tests"
echo "-------------------"
if [ -f "tests/production/run-production-tests.js" ]; then
    echo "⚠️  Production tests should be run with caution"
    # run_test "Production Suite" "node tests/production/run-production-tests.js"
fi
echo ""

# Summary
echo "======================================="
echo "📊 Test Results Summary"
echo "======================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi