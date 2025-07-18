# Products Functionality Troubleshooting Guide

## Issue Description
Products are not working when changing business niche from settings, and manual product creation is throwing errors.

## Root Causes Identified

1. **RLS Policy Conflicts**: There were duplicate RLS policies on the products table
2. **User Authentication**: The user_id may not be properly set when creating products
3. **Frontend-Backend Mismatch**: The frontend uses `ourPrice` while the database uses `ourprice`
4. **Niche Data Loading**: Products may not be loading correctly when switching business niches

## Solutions Applied

### 1. Database Fixes

I've created a comprehensive SQL migration that:
- Removes duplicate RLS policies
- Creates proper, single RLS policies for products
- Adds triggers to ensure user_id is always set
- Creates helper functions for product operations
- Adds proper indexes for performance

Run this in your Supabase SQL Editor:
```sql
-- Already applied via migration: fix_products_rls_policies
```

### 2. Testing Functions

I've created diagnostic functions to test the products system:

```sql
-- Test products functionality
SELECT test_products_functionality();

-- Get current user info
SELECT get_current_user_info();
```

### 3. Frontend Testing

Use the test script I created (`test-products.js`). In your browser console:

```javascript
// First, make sure you're logged in to the app
// Then run:
testProductsSystem()
```

## How to Fix the Issues

### Step 1: Apply Database Fixes
Run the comprehensive fix SQL file in Supabase:
```bash
# The file is at: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\fix-products-complete.sql
```

### Step 2: Test Business Niche Change
1. Go to Settings > Configuration > Business Niche
2. Select a different business niche
3. Click "Update Business Niche"
4. Check if products are loaded correctly

### Step 3: Test Manual Product Creation
1. Go to Products page
2. Click "New Product"
3. Fill in the form:
   - Product Name: Test Product
   - Category: Service
   - Customer Price: 100
   - Our Price: 75
4. Click "Save Product"

### Step 4: Verify in Database
Run this query to check your products:
```sql
SELECT 
  id,
  name,
  category,
  price,
  ourprice as "ourPrice",
  user_id,
  created_at
FROM products
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

## Common Error Messages and Solutions

### Error: "Failed to add product"
**Cause**: Missing user_id or authentication issue
**Solution**: Make sure you're logged in and the user_id trigger is active

### Error: "RLS policy violation"
**Cause**: Duplicate or conflicting RLS policies
**Solution**: The migration should have fixed this. Check with:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'products';
```

### Error: "Cannot create products for other users"
**Cause**: Trying to set a different user_id than the authenticated user
**Solution**: The frontend should not send user_id, it will be set automatically

## Verification Steps

1. **Check Current User**:
```sql
SELECT get_current_user_info();
```

2. **Check Products Count**:
```sql
SELECT COUNT(*) FROM products WHERE user_id = auth.uid();
```

3. **Check Business Niche**:
```sql
SELECT business_niche FROM profiles WHERE id = auth.uid();
```

4. **Run Full Diagnostic**:
```sql
SELECT test_products_functionality();
```

## Expected Behavior

When changing business niche:
1. The system should delete existing products (if configured to do so)
2. Load new products specific to the selected niche
3. Show the products immediately in the Products page

When creating products manually:
1. The form should accept: name, description, category, price, ourPrice, taxable
2. The product should be created with the current user's ID
3. The product should appear immediately in the list

## If Issues Persist

1. Check browser console for JavaScript errors
2. Check Network tab for failed API calls
3. Check Supabase logs for database errors
4. Verify RLS is enabled on products table:
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'products';
```

## Contact Support
If the issue persists after following all these steps, provide:
1. The error message from the browser console
2. The result of `SELECT test_products_functionality();`
3. Your current business_niche from profiles table
4. The Supabase logs from when the error occurs
