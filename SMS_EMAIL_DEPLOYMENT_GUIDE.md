# 🚀 SMS/Email Schema Deployment Guide

## Manual Deployment Steps

Since we're having issues with CLI deployment, please follow these manual steps:

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new

### 2. Run Each Part Sequentially

Run each SQL file in order. Wait for each to complete before running the next:

1. **Part 1**: `sms_email_part1_tables.sql` - Creates phone_numbers and communication_logs tables
2. **Part 2**: `sms_email_part2_tables.sql` - Creates message_templates and organization settings
3. **Part 3**: `sms_email_part3_indexes.sql` - Creates performance indexes
4. **Part 4**: `sms_email_part4_rls.sql` - Enables RLS and creates policies
5. **Part 5**: `sms_email_part5_functions.sql` - Creates helper functions
6. **Part 6**: `sms_email_part6_triggers.sql` - Creates triggers and grants permissions

### 3. Verify Each Step

After each part, verify it worked:
- Check for any errors in the output
- For tables: Go to Table Editor and verify they exist
- For functions: Check under Database > Functions

### 4. Run Verification Query

After all parts are complete, run this verification:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings');

-- Should return 4 rows
```

### 5. Test RLS

```sql
-- This should work (returns empty array if no phones)
SELECT * FROM phone_numbers WHERE user_id = auth.uid();

-- This should fail (no access to other users' data)
SELECT * FROM phone_numbers WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

## ✅ Success Checklist

- [ ] Part 1: Tables created (phone_numbers, communication_logs)
- [ ] Part 2: Tables created (message_templates, organization_communication_settings)
- [ ] Part 3: Indexes created (no errors)
- [ ] Part 4: RLS enabled and policies created
- [ ] Part 5: Functions created (get_user_primary_phone, log_communication)
- [ ] Part 6: Triggers and permissions granted
- [ ] Verification query returns 4 tables
- [ ] RLS test passes

## 🎉 Once Complete

You'll have a fully functional SMS/Email schema ready for:
- Storing user phone numbers
- Logging all communications
- Managing message templates
- Tracking delivery status

## ⏭️ Next Steps

After successful deployment:
1. I'll create the Telnyx SMS edge function
2. We'll test sending a real SMS
3. Then expand to email and full integration

---

**Need help?** Let me know which part fails and I'll help troubleshoot!