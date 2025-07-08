# Comprehensive Fixes for Messaging, Products, and Niche Issues

## Issues Identified

1. **Messaging Center Error**: Failed to send messages through messaging center
2. **Estimate/Invoice Send Error**: Failed to send estimates/invoices via email
3. **Telnyx SMS Configuration**: SMS two-way messaging not working
4. **Mailgun Email Configuration**: Email sending failing
5. **Products Creation Error**: Error when creating new products
6. **Niche Switching Issue**: Products showing 0 after switching niche

## Root Causes

### 1. Telnyx SMS Issues
- The edge function expects active Telnyx phone numbers in the database
- Missing or inactive phone numbers cause SMS failures
- API key might not be configured

### 2. Mailgun Email Issues
- Mailgun API key not configured in environment variables
- Domain authorization issues
- From email generation might fail

### 3. Products Creation Issue
- The products table expects a `user_id` field for data isolation
- The hook is correctly adding `user_id` but there might be RLS policy issues

### 4. Niche Switching Products Issue
- When switching niches, products are replaced but might not be visible due to:
  - RLS policies filtering by user_id
  - Data not properly associated with the current user
  - Frontend not refreshing after niche switch

## Fixes

### Fix 1: Check and Configure Telnyx

```sql
-- Check if you have active Telnyx phone numbers
SELECT * FROM telnyx_phone_numbers WHERE status = 'active';

-- If no active numbers, you need to add one:
INSERT INTO telnyx_phone_numbers (phone_number, status, user_id, purchased_at)
VALUES ('+1234567890', 'active', auth.uid(), NOW());
```

### Fix 2: Configure Environment Variables

Make sure these are set in your Supabase project:
- `TELNYX_API_KEY` - Your Telnyx API key
- `MAILGUN_API_KEY` - Your Mailgun API key

### Fix 3: Fix Products RLS Policies

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Create new policies that handle user_id properly
CREATE POLICY "Users can view their products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Ensure all products have user_id set
UPDATE products 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;
```

### Fix 4: Fix Niche Data Loading

```sql
-- Create a function to properly load niche products with user_id
CREATE OR REPLACE FUNCTION load_niche_products_for_user(
  p_user_id UUID,
  p_niche TEXT
) RETURNS void AS $$
DECLARE
  v_product RECORD;
BEGIN
  -- Delete existing products for the user
  DELETE FROM products WHERE user_id = p_user_id;
  
  -- The enhanced niche data loader will handle inserting new products
  -- This is just to ensure proper cleanup
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fix 5: Update Edge Functions

For the send-email function, ensure it handles missing configuration gracefully:

```typescript
// In send-email/index.ts, add better error handling:
const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
if (!mailgunApiKey) {
  return new Response(
    JSON.stringify({ 
      error: 'Email service not configured. Please contact support.',
      details: 'MAILGUN_API_KEY environment variable is not set'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    }
  );
}
```

## Testing Steps

### 1. Test SMS Messaging
```javascript
// In browser console:
const { data, error } = await supabase.functions.invoke('telnyx-sms', {
  body: {
    recipientPhone: '+1234567890',
    message: 'Test message',
    client_id: 'test-client-id',
    user_id: (await supabase.auth.getUser()).data.user.id
  }
});
console.log({ data, error });
```

### 2. Test Email Sending
```javascript
// In browser console:
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email</p>',
    text: 'This is a test email'
  }
});
console.log({ data, error });
```

### 3. Test Product Creation
```javascript
// In browser console:
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Test Product',
    category: 'Test',
    price: 100,
    cost: 50,
    taxable: true,
    user_id: user.id,
    created_by: user.id
  })
  .select()
  .single();
console.log({ data, error });
```

## Quick Fix Script

Create and run this PowerShell script to apply all fixes:

```powershell
# fix-all-issues.ps1
Write-Host "Applying comprehensive fixes..." -ForegroundColor Green

# Apply the products RLS fix
$productsFix = @"
-- Fix products RLS policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Users can view their products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Ensure all products have user_id set
UPDATE products 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;
"@

# Save to file
$productsFix | Out-File -FilePath "supabase/migrations/fix_products_rls.sql" -Encoding UTF8

# Apply migrations
npx supabase db push

Write-Host "Fixes applied!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Set TELNYX_API_KEY in Supabase dashboard" -ForegroundColor Yellow
Write-Host "2. Set MAILGUN_API_KEY in Supabase dashboard" -ForegroundColor Yellow
Write-Host "3. Add active Telnyx phone number in database" -ForegroundColor Yellow
Write-Host "4. Redeploy edge functions: npx supabase functions deploy" -ForegroundColor Yellow
```

## Environment Variables Setup

In Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add these secrets:
   - `TELNYX_API_KEY`: Your Telnyx API key
   - `MAILGUN_API_KEY`: Your Mailgun API key
   - `MAILGUN_DOMAIN`: Your Mailgun domain (if not using fixlify.app)

## Verification Checklist

- [ ] Telnyx API key configured
- [ ] Mailgun API key configured
- [ ] Active Telnyx phone number in database
- [ ] Products RLS policies updated
- [ ] Edge functions redeployed
- [ ] Test SMS sending works
- [ ] Test email sending works
- [ ] Test product creation works
- [ ] Test niche switching properly loads products 