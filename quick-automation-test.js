// Quick Automation Test - Run this on the Automations page
// This uses the React app's Supabase instance

(async () => {
  console.log('🚀 Quick Automation Test\n');
  
  // Try to find React's Supabase instance
  let supabase = null;
  
  // Method 1: Check window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const fiber = hook.getFiberRoots(1)?.values()?.next()?.value?.current;
    if (fiber) {
      console.log('✅ Found React DevTools hook');
    }
  }
  
  // Method 2: Try to find through the page's imports
  // Look for the supabase client in the webpack modules
  if (window.webpackChunkapp) {
    console.log('✅ Found webpack chunks');
  }
  
  // Method 3: Direct API test with hardcoded values
  console.log('\n📊 Direct API Test:\n');
  
  const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
  const authToken = localStorage.getItem('sb-mqppvcrlvsgrsqelglod-auth-token');
  
  if (!authToken) {
    console.error('❌ Not logged in! Please login to Fixlify first.');
    return;
  }
  
  const { access_token } = JSON.parse(authToken);
  console.log('✅ Found auth token');
  
  // Test the automation system
  try {
    // 1. Get user info
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNDI5MjIsImV4cCI6MjAzNjcxODkyMn0.zxnn15sJJhZwvtELW1OfrECqhzLqYjjw5a9HBwm0DPc'
      }
    });
    const userData = await userRes.json();
    console.log(`✅ Logged in as: ${userData.email}`);
    
    // 2. Check active workflows
    const workflowsRes = await fetch(`${SUPABASE_URL}/rest/v1/automation_workflows?status=eq.active`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNDI5MjIsImV4cCI6MjAzNjcxODkyMn0.zxnn15sJJhZwvtELW1OfrECqhzLqYjjw5a9HBwm0DPc'
      }
    });
    const workflows = await workflowsRes.json();
    console.log(`\n📋 Active Workflows: ${workflows.length}`);
    workflows.forEach(w => console.log(`  - ${w.name}`));
    
    // 3. Check pending logs
    const logsRes = await fetch(`${SUPABASE_URL}/rest/v1/automation_execution_logs?status=eq.pending&limit=5`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNDI5MjIsImV4cCI6MjAzNjcxODkyMn0.zxnn15sJJhZwvtELW1OfrECqhzLqYjjw5a9HBwm0DPc'
      }
    });
    const logs = await logsRes.json();
    console.log(`\n⏳ Pending Automations: ${logs.length}`);
    
    // 4. Check API keys
    console.log('\n🔑 Checking API Keys...');
    const keysRes = await fetch(`${SUPABASE_URL}/functions/v1/check-api-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    const keysData = await keysRes.json();
    if (keysData.integrations) {
      console.log(`  Mailgun: ${keysData.integrations.mailgun?.configured ? '✅' : '❌'}`);
      console.log(`  Telnyx: ${keysData.integrations.telnyx?.configured ? '✅' : '❌'}`);
      console.log(`  OpenAI: ${keysData.integrations.openai?.configured ? '✅' : '❌'}`);
    }
    
    console.log('\n✅ Automation system check complete!');
    console.log('\n💡 Next steps:');
    console.log('1. If API keys are missing, configure them at:');
    console.log('   https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
    console.log('2. Use the "Debug Panel" tab to process pending automations');
    console.log('3. Or click "Process Pending" button');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
