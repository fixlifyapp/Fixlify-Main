// Debug script to check what's being sent to the edge function
(async () => {
  // Find the send SMS button and check what happens when clicked
  const sendButton = document.querySelector('button[aria-label*="Send SMS"]') || 
                     document.querySelector('button:has(.text-blue-600)') ||
                     Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Send SMS'));
  
  if (sendButton) {
    console.log('Found Send SMS button:', sendButton);
    
    // Add a temporary click handler to intercept the call
    const originalOnClick = sendButton.onclick;
    sendButton.onclick = async function(e) {
      console.log('SMS Send button clicked!');
      
      // Get the estimate ID from the page
      const estimateId = document.querySelector('[data-estimate-id]')?.dataset.estimateId || 
                        document.querySelector('input[name="estimateId"]')?.value ||
                        '5c0cd9d9-6a8e-4a73-9bea-a0e4677c6fb1';
      
      const phoneInput = document.querySelector('input[type="tel"]');
      const phone = phoneInput?.value || '4377476737';
      
      console.log('Sending with:', { estimateId, phone });
      
      // Call the original handler if it exists
      if (originalOnClick) {
        originalOnClick.call(this, e);
      }
    };
  }
  
  // Also test the edge function directly with correct parameters
  console.log('\nTesting edge function with correct parameters...');
  
  const { data, error } = await window.supabase.functions.invoke('send-estimate-sms', {
    body: {
      estimateId: '5c0cd9d9-6a8e-4a73-9bea-a0e4677c6fb1',
      recipientPhone: '4377476737',
      message: 'Test from debug script'
    }
  });
  
  console.log('Direct test result:', { data, error });
})();