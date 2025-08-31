#!/usr/bin/env node

/**
 * ⚠️ DEPRECATED - DO NOT USE ⚠️
 * 
 * This script used the dangerous exec-sql edge function which has been removed
 * for security reasons.
 * 
 * Instead, use the safe migration file:
 * supabase/migrations/20250113_safe_sms_schema.sql
 * 
 * To run the migration:
 * 1. Go to Supabase Dashboard > SQL Editor
 * 2. Copy the contents of the migration file
 * 3. Run the SQL directly in the editor
 * 
 * Or use Supabase CLI:
 * supabase db push
 */

console.error('❌ This deployment script is deprecated and unsafe!')
console.error('❌ The exec-sql edge function has been removed for security.')
console.error('✅ Use supabase/migrations/20250113_safe_sms_schema.sql instead')
process.exit(1)
