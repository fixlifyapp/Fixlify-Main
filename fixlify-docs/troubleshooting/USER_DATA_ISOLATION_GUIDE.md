# User Data Isolation Guide

## The Problem

Currently, when a new user creates an account, they can see jobs, clients, and other data from other users. This is because the Row Level Security (RLS) policies are only checking if a user is authenticated (`auth.uid() IS NOT NULL`) rather than checking if they actually own the data.

## What Needs to Be Isolated

Each user account should have its own isolated data for:

### Core Business Data
1. **Jobs** - Each user should only see their own jobs
2. **Clients** - Each user should only see their own clients
3. **Estimates** - Each user should only see estimates for their own jobs
4. **Invoices** - Each user should only see invoices for their own jobs
5. **Payments** - Each user should only see payments for their own invoices
6. **Products/Services** - Each user should have their own product catalog (with option for shared/default products)

### Communication Data
7. **Messages** - Users should only see messages they sent or received
8. **Conversations** - Users should only see conversations they're part of
9. **Notifications** - Each user should only see their own notifications
10. **Email/SMS History** - Communication logs should be user-specific

### Configuration & Settings
11. **Config Items** - Business settings, tax rates, etc. should be per-user
12. **Automations** - Each user should have their own automation rules
13. **Templates** - Message templates, invoice templates should be user-specific
14. **Custom Fields** - Custom field definitions should be per-user

### Team Management
15. **Team Members** - Each account owner manages their own team
16. **Roles & Permissions** - Custom roles are account-specific
17. **Team Invitations** - Invitations are scoped to the inviting user's account

### Integration Data
18. **Phone Numbers** - Telnyx phone numbers belong to specific accounts
19. **API Keys** - Integration credentials are account-specific
20. **Webhooks** - Webhook configurations are per-user

### Analytics & Reports
21. **Reports** - Generated reports belong to specific users
22. **Dashboard Data** - Analytics are calculated per-user
23. **Activity Logs** - Audit trails are user-specific

## The Solution

The migration file `20250120000000_fix_user_data_isolation.sql` implements proper RLS policies that:

1. Add `user_id` columns to all tables that need isolation
2. Create RLS policies that check `auth.uid() = user_id` 
3. Add triggers to automatically set `user_id` when creating records
4. Add indexes for performance

## Implementation Steps

1. **Apply the migration** to add proper user isolation
2. **Handle existing data** - The migration attempts to set user_id based on created_by fields
3. **Test thoroughly** - Create multiple test accounts to verify isolation
4. **Monitor for issues** - Check that users can't access each other's data

## Important Considerations

- **Shared Resources**: Some resources like default products or system templates might be shared (where `user_id IS NULL`)
- **Team Access**: Team members should see data from their team owner's account
- **Client Portal**: Clients should only see their own jobs/invoices through portal access
- **Migration of Existing Data**: Existing data needs to be assigned to appropriate users

## Security Best Practices

1. Always use RLS policies that check ownership
2. Never use policies that only check if user is authenticated
3. Use database triggers to automatically set user_id
4. Regularly audit RLS policies for security
5. Test with multiple user accounts to verify isolation 