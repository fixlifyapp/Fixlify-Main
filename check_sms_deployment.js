import { execSync } from 'child_process';

// Check if SMS tables exist
const checkSQL = `
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
ORDER BY table_name;
`;

try {
  console.log('Checking SMS/Email tables in Supabase...');
  
  // Execute via edge function with proper syntax
  const data = JSON.stringify({
    query: checkSQL.replace(/\n/g, ' ').trim()
  });
  
  const result = execSync(`echo '${data}' | npx supabase functions invoke exec-sql`, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: 'powershell'
  });
  
  console.log('Result:', result);
  
  // Parse the result
  try {
    const parsed = JSON.parse(result);
    if (parsed.data && parsed.data.length > 0) {
      console.log('\n✅ SMS/Email tables found:');
      parsed.data.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('\n❌ SMS/Email tables NOT found!');
      console.log('Please deploy the schema first.');
    }
  } catch (e) {
    console.log('Raw result:', result);
  }
  
} catch (error) {
  console.error('Error checking tables:', error.message);
  console.log('\n⚠️  Please run the deployment SQL manually in Supabase SQL Editor.');
  console.log('File: DEPLOY_SMS_EMAIL_SCHEMA_COMPLETE.sql');
  console.log('URL: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new');
}
