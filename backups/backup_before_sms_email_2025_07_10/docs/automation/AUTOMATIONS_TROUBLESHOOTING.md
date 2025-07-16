# Automations Page Troubleshooting Guide

## Current Issue: "Failed to load automations"

This error occurs when the database tables don't exist or there are permission issues. Follow these steps:

## Step 1: Run Database Setup

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click on "SQL Editor" in the sidebar

2. **Run the Migration Script**
   - Copy the entire contents of `supabase/migrations/create_automation_tables.sql`
   - Paste and run it in the SQL editor
   - This will create all necessary tables and permissions

3. **Run the Debug Script**
   - Copy the contents of `supabase/debug_automations.sql`
   - Run it to see diagnostic information
   - Check if:
     - Tables exist
     - User has a profile
     - RLS policies are created

## Step 2: Check Browser Console

Open browser developer tools (F12) and check for errors:

1. Look for any red error messages
2. Check the Network tab for failed requests
3. Look for console.log messages showing:
   - "Fetching workflows for org: [id]"
   - "Workflows fetched: [data]"

## Step 3: Verify User Authentication

The updated code now handles cases where organization_id might not be set. It will:
- First try to use organization.id from context
- Fall back to user.id if organization is not set
- Show proper error messages if user is not authenticated

## Step 4: Common Issues & Solutions

### Issue 1: Tables don't exist
**Solution**: Run the migration script in Step 1

### Issue 2: RLS (Row Level Security) blocking access
**Solution**: The migration script includes proper RLS policies. Make sure it ran successfully.

### Issue 3: No organization_id in profiles
**Solution**: The updated code now handles this by using user.id as fallback

### Issue 4: User not authenticated
**Solution**: Make sure you're logged in. Try logging out and back in.

## Step 5: Test the Fix

After running the migration:

1. **Refresh the page**
2. **Check if templates appear** in the Templates tab
3. **Try creating a workflow** using the Create Automation button

## Quick SQL to Insert Test Data

If you want to see sample data immediately, run this after the migration:

```sql
-- Insert a test workflow for current user
INSERT INTO automation_workflows (
  organization_id,
  name,
  description,
  status,
  category
)
VALUES (
  auth.uid(), -- Uses current user ID
  'Test Automation',
  'This is a test automation to verify the system works',
  'active',
  'marketing'
);
```

## Still Having Issues?

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs → API
   - Look for any error messages

2. **Verify Database Connection**
   - Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in .env

3. **Clear Browser Cache**
   - Sometimes old data can cause issues
   - Try opening in an incognito/private window

## Expected Result

After following these steps, you should see:
- The automations page loading without errors
- Templates visible in the Templates tab
- Ability to create new automations
- Any existing workflows displayed in "My Automations" tab

The page is now more robust and handles edge cases better!