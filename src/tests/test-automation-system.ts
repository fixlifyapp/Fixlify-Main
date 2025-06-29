// Automation System Quick Test Script
// Run this to verify automation components are working

import { supabase } from '@/integrations/supabase/client';

export async function testAutomationSystem() {
  console.log('🔍 Testing Automation System...\n');
  
  // 1. Check if automation tables exist
  console.log('1. Checking database tables...');
  try {
    const tables = [
      'automation_workflows',
      'automation_execution_logs',
      'automation_templates'
    ];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: Found (${count} records)`);
      }
    }
  } catch (error) {
    console.error('Database check failed:', error);
  }
  
  // 2. Test creating an automation
  console.log('\n2. Testing automation creation...');
  try {
    const testAutomation = {
      name: 'Test Automation',
      description: 'Created by test script',
      trigger_type: 'job_completed',
      trigger_config: {},
      workflow_config: {
        triggers: [{
          type: 'job_completed',
          name: 'Job Completed'
        }],
        steps: [{
          type: 'send_sms',
          name: 'Send SMS',
          config: {
            message: 'Thank you for your business!'
          }
        }]
      },
      status: 'active',
      created_by: (await supabase.auth.getUser()).data.user?.id
    };
    
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(testAutomation)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create automation:', error.message);
    } else {
      console.log('✅ Automation created successfully:', data.id);
      
      // Clean up
      await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', data.id);
      console.log('🧹 Test automation cleaned up');
    }
  } catch (error) {
    console.error('Creation test failed:', error);
  }
  
  // 3. Check edge functions
  console.log('\n3. Checking edge functions...');
  const edgeFunctions = [
    'telnyx-sms',
    'mailgun-email',
    'automation-executor'
  ];
  
  for (const func of edgeFunctions) {
    try {
      const { data, error } = await supabase.functions.invoke(func, {
        body: { test: true }
      });
      
      if (error) {
        console.log(`⚠️  Edge function ${func}: Not deployed or errored`);
      } else {
        console.log(`✅ Edge function ${func}: Available`);
      }
    } catch (error) {
      console.log(`⚠️  Edge function ${func}: Not available`);
    }
  }
  
  // 4. Check required environment variables
  console.log('\n4. Checking environment variables...');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  for (const varName of requiredVars) {
    if (import.meta.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
    }
  }
  
  console.log('\n✨ Automation system test complete!');
}