# Security & Performance Audit Command

Run comprehensive security and performance audit.

## Instructions

1. **Determine audit type**:
   - `security` - Security vulnerabilities
   - `performance` - Performance analysis
   - `dependencies` - Dependency audit
   - `rls` - RLS policy audit
   - `all` - Complete audit

2. **Security Audit**:
   ```bash
   # Check npm vulnerabilities
   npm audit

   # Check for secrets in code
   grep -r "password\|secret\|api_key\|token" src/ --include="*.ts" --include="*.tsx" || echo "No secrets found"

   # Check for hardcoded URLs
   grep -r "http://" src/ --include="*.ts" --include="*.tsx" || echo "No insecure URLs"
   ```

3. **Dependency Audit**:
   ```bash
   # Check outdated packages
   npm outdated

   # Check for vulnerabilities
   npm audit --audit-level=moderate
   ```

4. **RLS Policy Audit**:
   ```sql
   -- Check tables without RLS
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = false;

   -- List all policies
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

5. **Performance Audit**:
   - Check bundle size
   - Identify large dependencies
   - Review lazy loading
   - Check for N+1 queries

   ```bash
   # Build and analyze
   npm run build

   # Check bundle size (if available)
   npx vite-bundle-analyzer
   ```

6. **Generate Report**:
   - List all findings
   - Categorize by severity (Critical, High, Medium, Low)
   - Provide remediation steps

## Arguments

$ARGUMENTS - Audit type: `security`, `performance`, `dependencies`, `rls`, or `all`

## Examples

- `/audit` - Run complete audit
- `/audit security` - Security audit only
- `/audit dependencies` - Check dependencies
- `/audit rls` - Audit RLS policies
