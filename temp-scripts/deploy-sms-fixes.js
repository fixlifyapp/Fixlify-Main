// Deploy the updated SMS edge functions with correct domain
// Run these commands to deploy the fixes

console.log(`
🚀 Deploy the SMS functions with the fix:

cd C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main

npx supabase functions deploy send-estimate-sms
npx supabase functions deploy send-invoice-sms

The functions now use PUBLIC_SITE_URL (hub.fixlify.app) instead of localhost.
`);
