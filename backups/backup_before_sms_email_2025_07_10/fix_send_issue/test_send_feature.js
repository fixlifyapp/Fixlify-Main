// Test Send Feature - Run this in browser console at http://localhost:8080/jobs/J-2006

console.log('🔍 Testing Universal Send Feature...');

// Test if we can call the edge function directly
async function testEdgeFunction() {
  try {
    const supabase = window.supabase;
    if (!supabase) {
      console.error('❌ Supabase client not found!');
      return;
    }

    console.log('📡 Testing send-estimate edge function...');
    
    // Create a test estimate ID (use a real one from your database)
    const testEstimateId = 'use-real-estimate-id-here';
    
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: testEstimateId,
        sendToClient: true,
        customMessage: 'This is a test'
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      console.error('Error details:', error.message);
      
      // Check if it's an API key issue
      if (error.message?.includes('MAILGUN_API_KEY')) {
        console.error('🔑 MAILGUN_API_KEY is not configured in Supabase secrets!');
        console.log('Fix: Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
        console.log('Add MAILGUN_API_KEY and MAILGUN_DOMAIN');
      }
    } else {
      console.log('✅ Edge function responded:', data);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Test the hooks and components
function testUniversalSendComponents() {
  console.log('\n📦 Testing Universal Send Components...');
  
  // Check if hooks exist
  if (window.useUniversalDocumentSend) {
    console.log('✅ useUniversalDocumentSend hook is available');
  } else {
    console.error('❌ useUniversalDocumentSend hook not found');
  }

  // Check if the dialog component exists
  const dialogElement = document.querySelector('[data-state="open"]');
  if (dialogElement) {
    console.log('✅ Send dialog is currently open');
  } else {
    console.log('ℹ️ Send dialog is not currently open');
  }

  // Check for send buttons
  const sendButtons = document.querySelectorAll('button:has(svg[class*="Send"])');
  console.log(`Found ${sendButtons.length} send button(s) on the page`);
}

// Run tests
testEdgeFunction();
testUniversalSendComponents();

console.log('\n💡 To fix the issue:');
console.log('1. Set up Mailgun account and get API key');
console.log('2. Set up Telnyx account and get API key + phone number');
console.log('3. Add secrets in Supabase dashboard');
console.log('4. Or use the test mode edge functions (coming next)');
