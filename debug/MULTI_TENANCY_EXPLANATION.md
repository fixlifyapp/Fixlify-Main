# Multi-Tenancy in ID Generation System

## ✅ YES, It's Fully Multi-Tenant!

The ID generation system is designed to work separately for each user/company account. Here's how:

## 🏢 How Multi-Tenancy Works:

### 1. **User-Specific Counters** (Jobs & Clients)
Each user has their OWN separate counters:

**User A (Company ABC):**
- Clients: C-2000, C-2001, C-2002...
- Jobs: J-1000, J-1001, J-1002...

**User B (Company XYZ):**
- Clients: C-2000, C-2001, C-2002... (Same numbers, different user!)
- Jobs: J-1000, J-1001, J-1002...

### 2. **Global Counters** (Estimates & Invoices)
These are shared across ALL users (for compliance/audit purposes):
- Estimates: 1000, 1001, 1002... (sequential across all users)
- Invoices: INV-1000, INV-1001, INV-1002... (sequential across all users)

## 🔧 Database Structure:

```sql
id_counters table:
- entity_type: 'client', 'job', 'estimate', 'invoice'
- user_id: UUID (NULL for global counters)
- current_value: 2003
- prefix: 'C', 'J', 'INV', etc.
- start_value: 2000 (default starting point)
```

## 🚀 When a New User Signs Up:

1. **First Client Creation:**
   - System checks: No counter exists for this user
   - Creates new counter starting at C-2000
   - User gets: C-2000

2. **First Job Creation:**
   - System checks: No counter exists for this user
   - Creates new counter starting at J-1000
   - User gets: J-1000

3. **Each User Starts Fresh:**
   - Every new account gets the default starting values
   - No collision between users
   - Complete data isolation

## 📊 Example Scenario:

**Company A (user_id: abc-123):**
```
Clients: C-2000, C-2001, C-2002, C-2003
Jobs: J-1000, J-1001, J-1002
```

**Company B (user_id: xyz-789):**
```
Clients: C-2000, C-2001 (only 2 clients so far)
Jobs: J-1000, J-1001, J-1002, J-1003, J-1004
```

**Company C (user_id: new-456) - Just signed up:**
```
Clients: (none yet)
Jobs: (none yet)
First client will be: C-2000
First job will be: J-1000
```

## ⚙️ Configuration Per Company:

Each company can customize their numbering through Settings > Document Numbering:

1. **Change Prefixes:**
   - Company A uses: "CL-" for clients
   - Company B uses: "CUST-" for clients
   - Company C keeps default: "C-"

2. **Change Starting Numbers:**
   - Company A wants to start at 5000
   - Company B wants to start at 100
   - Each company controls their own

## 🔒 Security & Isolation:

1. **Row Level Security (RLS):**
   - Users can only see/modify their own counters
   - Complete data isolation between companies

2. **User Context:**
   - System automatically uses `auth.uid()` to identify user
   - No way to access another company's counters

3. **Atomic Operations:**
   - Database locks ensure no race conditions
   - Even if two users from same company create clients simultaneously

## 📋 Default Starting Values:

When a new user/company signs up, they get:
- Clients: Start at C-2000
- Jobs: Start at J-1000
- Estimates: Continue global sequence
- Invoices: Continue global sequence
- Payments: Start at PAY-1000

## 🎯 Benefits:

1. **Clean Start:** Every company starts with professional-looking IDs
2. **No Conflicts:** Companies can't see or interfere with each other
3. **Customizable:** Each company can set their own preferences
4. **Scalable:** Works for 1 user or 10,000 companies
5. **Audit-Friendly:** Sequential numbers make accounting easy

The system is designed to be truly multi-tenant from the ground up!
