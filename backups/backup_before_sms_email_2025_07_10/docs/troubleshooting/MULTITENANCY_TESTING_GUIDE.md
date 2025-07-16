# Multi-Tenancy Testing Guide for Fixlify

## 🧪 Testing Data Isolation

### 1. Test Preparation

```bash
# Create two test accounts
# User A: hvac@test.com (HVAC Services)
# User B: plumber@test.com (Plumbing Services)
```

### 2. Data Isolation Test

#### Step 1: Create data for User A
1. Login as hvac@test.com
2. Complete onboarding, select "HVAC Services"
3. Create:
   - 2 clients
   - 3 jobs
   - 1 invoice

#### Step 2: Verify isolation with User B
1. Logout and login as plumber@test.com
2. Complete onboarding, select "Plumbing Services"
3. Verify:
   - ❌ Should NOT see User A's clients
   - ❌ Should NOT see User A's jobs
   - ✅ Should have own products for Plumbing
   - ✅ Should have own tags

### 3. SQL Queries for Verification

```sql
-- Check jobs isolation
SELECT user_id, COUNT(*) as job_count 
FROM jobs 
GROUP BY user_id;

-- Check clients isolation
SELECT user_id, COUNT(*) as client_count 
FROM clients 
GROUP BY user_id;

-- Check products by niche
SELECT p.user_id, pr.business_niche, COUNT(p.id) as product_count
FROM products p
JOIN profiles pr ON p.user_id = pr.id
GROUP BY p.user_id, pr.business_niche;

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'clients', 'products', 'invoices');
```
### 4. Functionality Checklist

#### Onboarding
- [ ] New user sees UnifiedOnboardingModal
- [ ] Niche selection saves to profiles.business_niche
- [ ] Products are created according to selected niche
- [ ] Tags are created for the niche
- [ ] Custom fields are created (if implemented)

#### Data Isolation
- [ ] User A cannot see User B's data
- [ ] user_id is automatically added when creating a job
- [ ] user_id is automatically added when creating a client
- [ ] Filtering works on all pages

#### Empty States
- [ ] Empty state shows correct niche
- [ ] Buttons in empty state lead to correct pages
- [ ] Icons match business type

### 5. API Testing (Postman/Thunder Client)

```javascript
// Test 1: Get jobs without authorization
GET /rest/v1/jobs
// Expected result: 401 Unauthorized

// Test 2: Get jobs with User A token
GET /rest/v1/jobs
Authorization: Bearer {userA_token}
// Expected result: Only User A's jobs
// Test 3: Attempt to create job with another user's user_id
POST /rest/v1/jobs
{
  "title": "Test Job",
  "user_id": "{userB_id}" // Attempting to use another user's ID
}
// Expected result: RLS error or user_id ignored
```

### 6. Issues and Solutions

#### Issue: User sees other users' data
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- Ensure there's a condition: user_id = auth.uid()
```

#### Issue: Data not created during onboarding
```javascript
// Check browser console
// Look for errors in NicheDataInitializer
// Verify table access permissions
```

#### Issue: Empty state not showing
```javascript
// Ensure business_niche is saved in profiles
// Check that component is imported correctly
```
### 7. Automated Tests

```typescript
// cypress/e2e/multitenancy.cy.ts
describe('Multi-tenancy', () => {
  it('isolates data between users', () => {
    // Create User A
    cy.createUser('hvac@test.com', 'HVAC Services');
    cy.createJob('AC Repair');
    
    // Switch to User B
    cy.logout();
    cy.createUser('plumber@test.com', 'Plumbing Services');
    
    // Verify no jobs from User A
    cy.visit('/jobs');
    cy.contains('AC Repair').should('not.exist');
    cy.contains('No plumbing jobs scheduled').should('exist');
  });
});
```

### 8. Success Metrics

- ✅ 0 data leaks between users
- ✅ 100% of new users receive correct templates
- ✅ Onboarding time < 2 minutes
- ✅ Query performance < 100ms with user_id filters