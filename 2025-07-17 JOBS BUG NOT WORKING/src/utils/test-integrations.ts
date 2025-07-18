import { createClient } from '@supabase/supabase-js';

// Test script for verifying Telnyx and Mailgun integrations
const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test Telnyx Connection
export async function testTelnyxConnection() {
  console.log('🔍 Testing Telnyx Connection...');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-telnyx-connection', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Telnyx test failed:', error);
      return false;
    }
    
    console.log('✅ Telnyx connection successful:', data);
    return true;
  } catch (err) {
    console.error('❌ Telnyx test error:', err);
    return false;
  }
}

// Test Mailgun Email Send
export async function testMailgunEmail(userEmail: string, recipientEmail: string) {
  console.log('📧 Testing Mailgun Email Send...');
  
  try {
    // First, sign in to get auth token
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: 'your-password' // Replace with actual password
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: 'Fixlify Test Email',
        html: '<h1>Test Email</h1><p>This is a test email from Fixlify to verify Mailgun integration.</p>',
        text: 'Test Email - This is a test email from Fixlify to verify Mailgun integration.',
        useSandbox: true // Use sandbox for testing
      },
      headers: {
        Authorization: `Bearer ${authData.session?.access_token}`
      }
    });
    
    if (error) {
      console.error('❌ Mailgun test failed:', error);
      return false;
    }
    
    console.log('✅ Mailgun email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('❌ Mailgun test error:', err);
    return false;
  }
}

// Test Automations Database
export async function testAutomationsDatabase() {
  console.log('🤖 Testing Automations Database...');
  
  try {
    // Test fetching automation templates
    const { data: templates, error: templatesError } = await supabase
      .from('automation_templates')
      .select('*')
      .limit(5);
    
    if (templatesError) {
      console.error('❌ Failed to fetch templates:', templatesError);
      return false;
    }
    
    console.log(`✅ Found ${templates?.length || 0} automation templates`);
    
    // Test fetching workflows (requires auth)
    const { data: authData } = await supabase.auth.getSession();
    
    if (authData.session) {
      const { data: workflows, error: workflowsError } = await supabase
        .from('automation_workflows')
        .select('*')
        .limit(5);
      
      if (workflowsError) {
        console.error('⚠️  Failed to fetch workflows (might be RLS):', workflowsError);
      } else {
        console.log(`✅ Found ${workflows?.length || 0} automation workflows`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Automations database test error:', err);
    return false;
  }
}

// Run all tests
export async function runAllTests(userEmail?: string, recipientEmail?: string) {
  console.log('🚀 Starting Fixlify Integration Tests...\n');
  
  const results = {
    telnyx: await testTelnyxConnection(),
    automations: await testAutomationsDatabase(),
    mailgun: false
  };
  
  if (userEmail && recipientEmail) {
    results.mailgun = await testMailgunEmail(userEmail, recipientEmail);
  } else {
    console.log('⚠️  Skipping Mailgun test (no email credentials provided)');
  }
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Telnyx:      ${results.telnyx ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Automations: ${results.automations ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Mailgun:     ${results.mailgun ? '✅ PASS' : '❌ FAIL'}`);
  
  return results;
}

// Usage example:
// runAllTests('user@example.com', 'recipient@example.com');