// Test the Universal Send Fix
// Run this in browser console after refreshing the page

console.log('🧪 Testing Universal Send Fix...');

async function testSendFix() {
  // Wait a moment for page to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Find send buttons
  const sendButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Send') || 
    btn.querySelector('svg[class*="send"]') ||
    btn.querySelector('svg[class*="Send"]')
  );

  console.log(`Found ${sendButtons.length} send button(s)`);

  if (sendButtons.length > 0) {
    console.log('✅ Send buttons found!');
    console.log('💡 Click on a Send button to test the fix');
    
    // Add event listener to monitor the send dialog
    let checkInterval = setInterval(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog && dialog.textContent.includes('Send Estimate')) {
        console.log('✅ Send dialog opened successfully!');
        
        // Check if the send method options are available
        const emailOption = dialog.querySelector('input[value="email"]');
        const smsOption = dialog.querySelector('input[value="sms"]');
        
        if (emailOption && smsOption) {
          console.log('✅ Email and SMS options available');
          console.log('📧 Try sending via Email to test the fix');
        }
        
        clearInterval(checkInterval);
      }
    }, 500);

    // Stop checking after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000);
  } else {
    console.log('❌ No send buttons found on this page');
    console.log('💡 Navigate to a job with estimates or invoices');
  }
}

// Monitor network requests to edge functions
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;
  
  if (typeof url === 'string' && url.includes('/functions/v1/send-')) {
    console.log('📡 Edge function call detected:', url);
    console.log('Request body:', JSON.parse(options?.body || '{}'));
    
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      if (response.ok) {
        console.log('✅ Edge function response:', data);
        if (data.testMode) {
          console.log('🧪 Running in TEST MODE - no actual email/SMS sent');
        }
      } else {
        console.error('❌ Edge function error:', data);
      }
      
      return response;
    } catch (err) {
      console.error('❌ Network error:', err);
      throw err;
    }
  }
  
  return originalFetch.apply(this, args);
};

console.log('✅ Network monitoring enabled');
console.log('📌 The fix has been applied!');
console.log('');
console.log('To test:');
console.log('1. Click on any Send button for an estimate or invoice');
console.log('2. Select Email or SMS');
console.log('3. Click Send');
console.log('');
console.log('Expected result:');
console.log('- Success message should appear');
console.log('- No error about edge functions');
console.log('- Communication logged in database');

testSendFix();
