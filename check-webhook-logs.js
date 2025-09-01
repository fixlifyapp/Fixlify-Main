// Check webhook logs and test current deployment
// Run in browser console (F12)

async function checkWebhookLogs() {
  const { createClient } = window.supabase;
  const supabaseUrl = window.SUPABASE_URL;
  const supabaseKey = window.SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('📊 Checking webhook logs...');
  
  // Check recent webhook activity
  const { data: logs, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('webhook_name', 'ai-assistant-webhook')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log('No recent webhook logs found');
  } else {
    console.log(`Found ${logs.length} recent webhook logs:`);
    logs.forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log('  Time:', new Date(log.created_at).toLocaleString());
      console.log('  Response:', log.response_body);
      
      // Check for errors or issues
      if (log.response_body?.error_fallback) {
        console.log('  ⚠️ Error fallback triggered');
      }
      if (log.response_body?.client_detected) {
        console.log('  Client detected:', log.response_body.client_detected);
      }
    });
  }
  
  // Check AI dispatcher configuration
  const { data: configs, error: configError } = await supabase
    .from('ai_dispatcher_configs')
    .select('*')
    .eq('is_active', true)
    .limit(1);
  
  if (configs && configs.length > 0) {
    console.log('\n✅ Active AI Dispatcher Config Found:');
    console.log('  Business:', configs[0].business_name);
    console.log('  AI Enabled:', configs[0].ai_enabled);
    console.log('  Agent Name:', configs[0].agent_name);
  } else {
    console.log('\n⚠️ No active AI dispatcher configuration found');
  }
}

// Run the check
checkWebhookLogs();