---
name: security-audit
description: Security audit and vulnerability assessment skill for Fixlify. Automatically activates when discussing security, vulnerabilities, authentication, authorization, RLS policies, OWASP, penetration testing, or security best practices.
version: 1.0.0
author: Fixlify Team
tags: [security, audit, owasp, rls, authentication, vulnerabilities]
---

# Security Audit Skill

You are a senior security engineer conducting comprehensive security audits for Fixlify.

## Security Stack

- **Authentication**: Supabase Auth (JWT-based)
- **Authorization**: Row Level Security (RLS)
- **API Security**: Edge Functions with CORS
- **Data Protection**: PostgreSQL encryption, HTTPS
- **Secrets**: Supabase Secrets Manager

## OWASP Top 10 Checklist

### 1. Broken Access Control
```typescript
// ❌ VULNERABLE: No authorization check
const { data } = await supabase.from('jobs').select('*');

// ✅ SECURE: RLS enforces organization isolation
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('organization_id', org.id);
```

**Audit Points:**
- [ ] All tables have RLS enabled
- [ ] RLS policies check organization_id
- [ ] No direct table access without auth
- [ ] Admin functions verify role

### 2. Cryptographic Failures
```typescript
// ❌ VULNERABLE: Storing sensitive data in localStorage
localStorage.setItem('apiKey', key);

// ✅ SECURE: Use Supabase secrets
// Store in Supabase: supabase secrets set API_KEY=...
const apiKey = Deno.env.get('API_KEY');
```

**Audit Points:**
- [ ] No secrets in client-side code
- [ ] No secrets in git repository
- [ ] Passwords hashed (Supabase handles this)
- [ ] HTTPS enforced everywhere

### 3. Injection
```typescript
// ❌ VULNERABLE: String interpolation in SQL
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ SECURE: Parameterized queries (Supabase default)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

**Audit Points:**
- [ ] No raw SQL with user input
- [ ] Supabase client used for all queries
- [ ] Input validation on all forms
- [ ] XSS prevention in React (default escaping)

### 4. Insecure Design
**Audit Points:**
- [ ] Multi-tenant isolation verified
- [ ] Rate limiting on sensitive endpoints
- [ ] Fail-secure defaults
- [ ] Threat modeling documented

### 5. Security Misconfiguration
```typescript
// ❌ VULNERABLE: Permissive CORS
Access-Control-Allow-Origin: *

// ✅ SECURE: Restrict CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fixlify.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Audit Points:**
- [ ] CORS properly configured
- [ ] Error messages don't leak info
- [ ] Debug mode disabled in production
- [ ] Security headers set

### 6. Vulnerable Components
```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

**Audit Points:**
- [ ] Dependencies updated regularly
- [ ] No known vulnerabilities (npm audit)
- [ ] Unused dependencies removed

### 7. Authentication Failures
```typescript
// ✅ SECURE: Supabase Auth handles:
// - Password hashing (bcrypt)
// - Session management
// - JWT tokens
// - Password reset flow

// Additional protections:
// - Implement 2FA for sensitive accounts
// - Account lockout after failed attempts
```

**Audit Points:**
- [ ] Strong password policy enforced
- [ ] Session timeout configured
- [ ] Secure password reset flow
- [ ] No credentials in URLs

### 8. Data Integrity Failures
**Audit Points:**
- [ ] Input validation on all forms
- [ ] File upload restrictions
- [ ] Signature verification for webhooks
- [ ] Audit logging enabled

### 9. Security Logging Failures
```typescript
// ✅ SECURE: Log security events
console.log(JSON.stringify({
  event: 'auth_failure',
  user_id: userId,
  ip: request.headers.get('x-forwarded-for'),
  timestamp: new Date().toISOString(),
}));
```

**Audit Points:**
- [ ] Authentication events logged
- [ ] Access control failures logged
- [ ] Sensitive actions logged
- [ ] Logs don't contain sensitive data

### 10. Server-Side Request Forgery (SSRF)
```typescript
// ❌ VULNERABLE: Unrestricted URL fetch
const response = await fetch(userProvidedUrl);

// ✅ SECURE: Whitelist allowed domains
const ALLOWED_DOMAINS = ['api.stripe.com', 'api.telnyx.com'];
const url = new URL(userProvidedUrl);
if (!ALLOWED_DOMAINS.includes(url.hostname)) {
  throw new Error('Domain not allowed');
}
```

**Audit Points:**
- [ ] External requests validated
- [ ] URL whitelisting implemented
- [ ] No internal network access from user input

## RLS Security Patterns

### Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
-- Should return empty if all tables have RLS
```

### Common RLS Policy Template
```sql
-- Organization isolation policy
CREATE POLICY "org_isolation" ON table_name
  FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );
```

### Test RLS Policies
```sql
-- Test as specific user
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid"}';

SELECT * FROM jobs; -- Should only return user's org data
```

## API Security Checklist

### Edge Function Template
```typescript
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check (implement based on needs)
    // const rateLimit = await checkRateLimit(user.id);
    // if (rateLimit.exceeded) { return 429 response }

    // Input validation
    const body = await req.json();
    // Validate body with zod or similar

    // Business logic here...

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Don't leak error details
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Security Headers

### Vercel Configuration (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## Audit Report Template

```markdown
# Security Audit Report - Fixlify
Date: YYYY-MM-DD
Auditor: [Name/Claude]

## Executive Summary
[Brief overview of findings]

## Scope
- Frontend application
- Supabase backend
- Edge Functions
- Third-party integrations

## Findings

### Critical (P0)
| ID | Issue | Status | Remediation |
|----|-------|--------|-------------|
| C1 | [Issue] | [Open/Fixed] | [Action] |

### High (P1)
| ID | Issue | Status | Remediation |
|----|-------|--------|-------------|
| H1 | [Issue] | [Open/Fixed] | [Action] |

### Medium (P2)
| ID | Issue | Status | Remediation |
|----|-------|--------|-------------|
| M1 | [Issue] | [Open/Fixed] | [Action] |

### Low (P3)
| ID | Issue | Status | Remediation |
|----|-------|--------|-------------|
| L1 | [Issue] | [Open/Fixed] | [Action] |

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Appendix
- Tools used
- Test methodology
- Evidence screenshots
```

## Quick Security Scan Commands

```bash
# Check npm vulnerabilities
npm audit

# Check for secrets in code
grep -r "password\|secret\|api_key\|token" src/ --include="*.ts" --include="*.tsx"

# Check for hardcoded URLs
grep -r "http://" src/ --include="*.ts" --include="*.tsx"

# Check RLS status
supabase db query "SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=false"
```
