# Test Command

Run tests with various configurations.

## Instructions

1. **Determine test scope**:
   - `all` - Run all tests
   - `unit` - Unit tests only
   - `e2e` - End-to-end tests only
   - `coverage` - Tests with coverage report
   - `watch` - Watch mode for development
   - `<pattern>` - Run tests matching pattern

2. **Execute tests**:

   ### All Tests
   ```bash
   npm test
   ```

   ### Unit Tests
   ```bash
   npm test -- --testPathPattern="\.test\.(ts|tsx)$"
   ```

   ### E2E Tests
   ```bash
   npm run test:e2e
   ```

   ### Coverage
   ```bash
   npm run test:coverage
   ```

   ### Watch Mode
   ```bash
   npm test -- --watch
   ```

   ### Pattern Match
   ```bash
   npm test -- --testPathPattern="$ARGUMENTS"
   ```

3. **Analyze results**:
   - Report failing tests
   - Show coverage summary
   - Suggest fixes for failures

4. **If tests fail**:
   - Identify root cause
   - Suggest fix or create todo

## Arguments

$ARGUMENTS - Test scope or pattern (optional, defaults to 'all')

## Examples

- `/test` - Run all tests
- `/test unit` - Run unit tests only
- `/test e2e` - Run E2E tests
- `/test coverage` - Run with coverage
- `/test JobsTable` - Run tests matching "JobsTable"
