// Fetch edge function logs via Supabase Management API
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'mqppvcrlvsgrsqelglod';
const FUNCTION_SLUG = 'ai-assistant-webhook';

async function getLogs() {
  if (!SUPABASE_ACCESS_TOKEN) {
    console.log('❌ SUPABASE_ACCESS_TOKEN not set in environment');
    console.log('\nTo view logs:');
    console.log('1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/ai-assistant-webhook/logs');
    console.log('2. Or check the "Logs" tab in the Edge Functions section');
    return;
  }

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${FUNCTION_SLUG}/logs?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('=== Recent Logs for ai-assistant-webhook ===\n');
    
    if (data.logs && data.logs.length > 0) {
      data.logs.forEach(log => {
        console.log(`[${log.timestamp}] ${log.level}: ${log.message}`);
        if (log.metadata) {
          console.log('  Metadata:', JSON.stringify(log.metadata, null, 2));
        }
      });
    } else {
      console.log('No logs found. The webhook may not have been called yet.');
    }
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    console.log('\n📊 View logs directly at:');
    console.log('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/ai-assistant-webhook/logs');
  }
}

getLogs();
