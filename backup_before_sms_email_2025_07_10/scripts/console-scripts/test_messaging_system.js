// Test script to check messaging system functionality
// Run this in the browser console

console.log('=== Testing Messaging System ===');

// 1. Check if we're on the correct page
console.log('Current URL:', window.location.href);

// 2. Check if navigation works
console.log('Testing navigation to communications page...');
const testNavigation = () => {
  const testClientId = 'test-client-123';
  const testClientName = 'Test Client';
  const testClientPhone = '1234567890';
  
  const url = `/communications?tab=messages&clientId=${testClientId}&clientName=${encodeURIComponent(testClientName)}&clientPhone=${encodeURIComponent(testClientPhone)}&autoOpen=true`;
  
  console.log('Navigating to:', url);
  window.location.href = url;
};

// 3. Check if message dialog opens
const checkMessageDialog = () => {
  console.log('Checking for message dialog elements...');
  
  // Check for dialog elements
  const dialogs = document.querySelectorAll('[role="dialog"]');
  console.log('Found dialogs:', dialogs.length);
  
  // Check for message-related elements
  const messageElements = document.querySelectorAll('[data-testid*="message"], [class*="message"]');
  console.log('Found message elements:', messageElements.length);
  
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  console.log('URL Parameters:', {
    tab: params.get('tab'),
    clientId: params.get('clientId'),
    clientName: params.get('clientName'),
    clientPhone: params.get('clientPhone'),
    autoOpen: params.get('autoOpen')
  });
};

// 4. Check if unified send dialog is present
const checkUnifiedSendDialog = () => {
  console.log('Checking for UniversalSendDialog...');
  
  // Look for send dialog elements
  const sendDialogs = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent?.includes('Send estimate') || 
    el.textContent?.includes('Send invoice')
  );
  
  console.log('Found send dialog elements:', sendDialogs.length);
  
  // Check for edge function errors in network tab
  console.log('Check Network tab for failed requests to /functions/v1/send-estimate or /functions/v1/send-invoice');
};

// 5. Test edge function connectivity
const testEdgeFunction = async () => {
  console.log('Testing edge function connectivity...');
  
  try {
    // Get auth token
    const authToken = localStorage.getItem('fixlify-auth-token');
    if (!authToken) {
      console.error('No auth token found!');
      return;
    }
    
    const token = JSON.parse(authToken);
    
    // Test send-estimate function
    console.log('Testing send-estimate edge function...');
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate', {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    });
    
    console.log('send-estimate response:', response.status, response.statusText);
    
    // Test send-invoice function
    console.log('Testing send-invoice edge function...');
    const response2 = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-invoice', {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    });
    
    console.log('send-invoice response:', response2.status, response2.statusText);
    
  } catch (error) {
    console.error('Edge function test error:', error);
  }
};

// 6. Fix authentication if needed
const fixAuth = () => {
  console.log('Clearing auth data and refreshing...');
  localStorage.removeItem('fixlify-auth-token');
  sessionStorage.clear();
  window.location.href = '/login';
};

// Display menu
console.log('\n=== Available Tests ===');
console.log('1. testNavigation() - Test navigation to communications page');
console.log('2. checkMessageDialog() - Check if message dialog is open');
console.log('3. checkUnifiedSendDialog() - Check for send dialog');
console.log('4. testEdgeFunction() - Test edge function connectivity');
console.log('5. fixAuth() - Clear auth and refresh');
console.log('\nRun any of these functions to test specific functionality');

// Auto-run some checks
checkMessageDialog();
checkUnifiedSendDialog();
