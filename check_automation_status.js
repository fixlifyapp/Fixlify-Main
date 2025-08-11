// Check automation system status and diagnose issues
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAutomationStatus() {
  console.log('🔍 Checking Automation System Status...\n');
  
  try {
    // 1. Check for job status change automations
    console.log('1️⃣ Checking job status change automations:');
    const { data: workflows, error: workflowError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('trigger_type', 'job_status_changed')
      .eq('status', 'active');
    
    if (workflowError) {
      console.error('❌ Error fetching workflows:', workflowError);
    } else {
      console.log(`✅ Found ${workflows?.length || 0} active job status change workflows`);
      workflows?.forEach(w => {
        console.log(`   - "${w.name}" (ID: ${w.id})`);
        console.log(`     Conditions: ${JSON.stringify(w.trigger_conditions)}`);
      });
    }
    
    // 2. Check recent execution logs
    console.log('\n2️⃣ Checking recent automation execution logs:');
    const { data: logs, error: logsError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (logsError) {
      console.error('❌ Error fetching logs:', logsError);
    } else {
      console.log(`✅ Last 10 execution logs:`);
      logs?.forEach(log => {
        const status = log.status === 'completed' ? '✅' : log.status === 'failed' ? '❌' : '⏳';
        console.log(`   ${status} ${log.trigger_type} - ${log.status} (${new Date(log.created_at).toLocaleString()})`);
        if (log.error) {
          console.log(`      Error: ${JSON.stringify(log.error)}`);
        }
      });
    }
    
    // 3. Check for pending automations
    console.log('\n3️⃣ Checking pending automations:');
    const { data: pending, error: pendingError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .in('status', ['pending', 'running']);
    
    if (pendingError) {
      console.error('❌ Error fetching pending:', pendingError);
    } else {
      console.log(`⏳ ${pending?.length || 0} automations pending/running`);
      pending?.forEach(p => {
        console.log(`   - ${p.trigger_type} (Status: ${p.status}, Created: ${new Date(p.created_at).toLocaleString()})`);
      });
    }
    
    // 4. Check Edge Function secrets
    console.log('\n4️⃣ Checking Edge Function configuration:');
    console.log('   Run this command to check secrets:');
    console.log('   supabase secrets list');
    
    // 5. Test trigger function
    console.log('\n5️⃣ Testing if triggers are configured:');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers', {})
      .single();
    
    if (triggerError) {
      console.log('   ℹ️ Cannot directly check triggers (expected)');
    }
    
    // 6. Check for job completion workflows specifically
    console.log('\n6️⃣ Checking for "completed" status workflows:');
    const { data: completedWorkflows, error: completedError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('trigger_type', 'job_status_changed')
      .eq('status', 'active')
      .or('trigger_conditions.cs.{"field":"status","operator":"equals","value":"completed"}');
    
    if (completedError) {
      console.error('❌ Error checking completed workflows:', completedError);
    } else {
      console.log(`✅ Found ${completedWorkflows?.length || 0} workflows for completed status`);
      completedWorkflows?.forEach(w => {
        console.log(`   - "${w.name}"`);
        console.log(`     Steps: ${w.steps?.length || 0} actions`);
        w.steps?.forEach((step, i) => {
          console.log(`       ${i+1}. ${step.type} action`);
        });
      });
    }
    
    // 7. Check recent job status changes
    console.log('\n7️⃣ Checking recent job status changes:');
    const { data: recentJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, status, updated_at')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError);
    } else {
      console.log(`✅ Last 5 completed jobs:`);
      recentJobs?.forEach(job => {
        console.log(`   - Job ${job.id.substring(0, 8)}... completed at ${new Date(job.updated_at).toLocaleString()}`);
      });
    }
    
    // 8. Check communication logs for recent sends
    console.log('\n8️⃣ Checking recent communications:');
    const { data: comms, error: commsError } = await supabase
      .from('communication_logs')
      .select('type, status, created_at, subject')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (commsError) {
      console.error('❌ Error fetching communications:', commsError);
    } else {
      console.log(`✅ Last 5 communications:`);
      comms?.forEach(comm => {
        const icon = comm.type === 'sms' ? '📱' : '📧';
        console.log(`   ${icon} ${comm.type} - ${comm.status} (${new Date(comm.created_at).toLocaleString()})`);
        if (comm.subject) console.log(`      Subject: ${comm.subject}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAutomationStatus().then(() => {
  console.log('\n✅ Automation system check complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});