# 🧪 Fixlify Test Suite

> Comprehensive test collection organized by modules and functionality

## 📁 Test Directory Structure

All test files have been consolidated and organized into module-specific directories for better maintainability and discoverability.

## 🗂️ Test Modules

### 📱 [SMS/Email Tests](./sms-email/)
Communication system testing
- SMS sending tests (PowerShell, JavaScript)
- Email configuration tests
- Telnyx webhook tests
- Two-way SMS tests
- Complete integration tests

**Key Files:**
- `send_test_sms.ps1` - SMS sending test
- `test-telnyx-webhook.ps1` - Webhook testing
- `test_email_config.js` - Email configuration
- `test-sms-detailed.ps1` - Detailed SMS tests

### ⚙️ [Automation Tests](./automation/)
Workflow automation testing
- `quick-automation-test.js` - Quick automation checks
- `run-test.ps1` - PowerShell test runner
- `workflow-test.html` - Browser-based workflow testing

### 🔌 [Edge Functions Tests](./edge-functions/)
Supabase Edge Function tests
- `test-email/` - Email function tests
- `test-env/` - Environment tests
- `test-send-estimate/` - Estimate sending tests
- `test-telnyx/` - Telnyx integration tests
- `test-voice/` - Voice calling tests

### 🗄️ [Database Tests](./database/)
Database and SQL testing
- `test-realtime-updates.sql` - Real-time subscription tests
- `test-edge-function-queries.sql` - Edge function queries
- `test-storage.sql` - Storage tests
- `test_portal_access.sql` - Portal access tests
- `enable_test_mode.sql` - Test mode configuration

### 🔗 [Integration Tests](./integration/)
System integration testing
- `test-supabase-connection.mjs` - Supabase connectivity
- `test-webhook.ps1` - Webhook integration
- `test_send_feature.js` - Send functionality
- `deploy_test_functions.sh` - Function deployment

### 🚀 [Production Tests](./production/)
Production environment testing
- `production-test-suite.ts` - Complete production test suite
- `run-production-tests.js` - Production test runner

### 💻 [Console Tests](./console/)
Browser console test scripts
- `automated-email-test.js` - Automated email testing
- `quick-email-test.js` - Quick email checks
- `test_client_jobs.js` - Client and job testing

### 📜 [Script Tests](./scripts/)
Various test scripts and utilities
- PowerShell test scripts
- JavaScript test utilities
- HTML test interfaces
- Integration test scripts

### 🧩 [Unit Tests](./unit/)
Unit test files (to be populated)
- Component tests
- Utility function tests
- Service tests

## 🚀 Quick Start

### Running SMS/Email Tests

```bash
# PowerShell
./tests/sms-email/send_test_sms.ps1

# JavaScript
node tests/sms-email/test_email_config.js

# SQL
psql -f tests/database/test_sms_email_complete.sql
```

### Running Automation Tests

```bash
# Quick test
node tests/automation/quick-automation-test.js

# Full test suite
./tests/automation/run-test.ps1
```

### Running Edge Function Tests

```bash
# Deploy test functions
supabase functions deploy test-email
supabase functions deploy test-telnyx

# Invoke test functions
supabase functions invoke test-email --data '{}'
```

### Running Database Tests

```sql
-- Run in Supabase SQL editor
-- Real-time updates test
\i tests/database/test-realtime-updates.sql

-- Storage test
\i tests/database/test-storage.sql
```

## 📋 Test Types

### 1. SMS/Email Tests
- **Purpose**: Verify communication systems
- **Coverage**: Sending, receiving, webhooks, templates
- **Tools**: PowerShell, Node.js, cURL

### 2. Automation Tests
- **Purpose**: Test workflow automation
- **Coverage**: Triggers, actions, conditions
- **Tools**: JavaScript, PowerShell

### 3. Edge Function Tests
- **Purpose**: Test Supabase Edge Functions
- **Coverage**: All edge functions
- **Tools**: Supabase CLI, Node.js

### 4. Database Tests
- **Purpose**: Test database operations
- **Coverage**: CRUD, RLS, real-time
- **Tools**: SQL, psql

### 5. Integration Tests
- **Purpose**: Test system integration
- **Coverage**: API connections, webhooks
- **Tools**: Node.js, PowerShell

### 6. Production Tests
- **Purpose**: Validate production environment
- **Coverage**: Full system check
- **Tools**: TypeScript, Node.js

## 🔧 Test Configuration

### Environment Variables
```env
# Test environment
NODE_ENV=test
TEST_MODE=true

# Test credentials
TEST_SUPABASE_URL=your-test-url
TEST_SUPABASE_ANON_KEY=your-test-key
TEST_TELNYX_API_KEY=your-test-key

# Test phone numbers
TEST_SMS_FROM=+1234567890
TEST_SMS_TO=+0987654321
```

### Test Database
```sql
-- Enable test mode
UPDATE settings 
SET test_mode = true 
WHERE organization_id = 'test-org';
```

## 📊 Test Coverage

### Current Coverage
- ✅ SMS/Email: Comprehensive
- ✅ Edge Functions: All functions
- ✅ Database: Core operations
- ✅ Integration: Key integrations
- ⚠️ Unit Tests: Needs expansion
- ⚠️ E2E Tests: To be implemented

### Coverage Goals
- Unit Tests: 80% coverage
- Integration Tests: All critical paths
- E2E Tests: User workflows
- Performance Tests: Load testing

## 🏃 Running Tests

### Run All Tests
```bash
# Create a master test runner
npm run test:all
```

### Run Module Tests
```bash
# SMS/Email tests
npm run test:sms-email

# Automation tests
npm run test:automation

# Database tests
npm run test:database
```

### Run Specific Tests
```bash
# Single test file
node tests/sms-email/test_email_config.js

# PowerShell test
pwsh tests/sms-email/send_test_sms.ps1
```

## 🐛 Debugging Tests

### Enable Debug Mode
```javascript
// Set debug flag
process.env.DEBUG = 'true';
```

### View Test Logs
```bash
# Tail test logs
tail -f tests/logs/test.log
```

### Interactive Testing
```bash
# Open test console
npm run test:console
```

## 📝 Writing New Tests

### Test Template
```javascript
// tests/module/test-name.js
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  it('should do something', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### PowerShell Template
```powershell
# tests/module/test-name.ps1
$ErrorActionPreference = "Stop"

Write-Host "Starting test..." -ForegroundColor Green

try {
    # Test code here
    $result = Invoke-RestMethod -Uri $testUrl
    
    if ($result.success) {
        Write-Host "✅ Test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run test:quick
```

## 📈 Test Metrics

### Track Metrics
- Test execution time
- Pass/fail rates
- Code coverage
- Performance benchmarks

### Generate Reports
```bash
# Coverage report
npm run test:coverage

# Performance report
npm run test:performance
```

## 🤝 Contributing Tests

1. Create test in appropriate module
2. Follow naming convention: `test-[feature].js`
3. Include documentation
4. Ensure test is idempotent
5. Add to test suite

---

*Last Updated: Current*
*Total Test Files: 50+*
*Test Modules: 9*