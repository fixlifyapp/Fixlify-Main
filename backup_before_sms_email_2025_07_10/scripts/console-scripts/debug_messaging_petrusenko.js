// Debug script for messaging system with petrusenkocorp@gmail.com
// Run this in the browser console

async function debugMessagingSystem() {
  console.log('=== Debugging Messaging System ===');
  
  const { supabase } = window;
  if (!supabase) {
    console.error('Supabase client not found');
    return;
  }
  
  try {
    // 1. Verify current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return;
    }
    
    console.log('\n1. Current User:');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    
    // Expected values for petrusenkocorp@gmail.com
    if (user.email === 'petrusenkocorp@gmail.com') {
      console.log('✅ Correct user logged in');
      console.log('Expected user_id: 6dfbdcae-c484-45aa-9327-763500213f24');
      console.log('Actual user_id:', user.id);
      console.log('Match:', user.id === '6dfbdcae-c484-45aa-9327-763500213f24' ? '✅' : '❌');
    } else {
      console.error('❌ Wrong user! Should be petrusenkocorp@gmail.com');
      return;
    }
    
    // 2. Check phone number assignment
    console.log('\n2. Phone Number Check:');
    const { data: phoneData, error: phoneError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (phoneError) {
      console.error('Phone lookup error:', phoneError);
    } else if (phoneData) {
      console.log('✅ Phone number found:', phoneData.phone_number);
      console.log('Status:', phoneData.status);
      console.log('Messaging Profile ID:', phoneData.messaging_profile_id);
      console.log('Features:', phoneData.features);
    }
    
    // 3. Test Telnyx SMS edge function
    console.log('\n3. Testing Telnyx SMS Edge Function:');
    try {
      const testResponse = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: '+12898192158', // Send to self for testing
          message: 'Test message from debugging script',
          user_id: user.id
        }
      });
      
      console.log('Telnyx SMS response:', testResponse);
      if (testResponse.error) {
        console.error('❌ SMS Error:', testResponse.error);
      } else if (testResponse.data?.success) {
        console.log('✅ SMS sent successfully');
      } else {
        console.log('⚠️ SMS response:', testResponse.data);
      }
    } catch (smsError) {
      console.error('SMS test failed:', smsError);
    }
    
    // 4. Check for API keys
    console.log('\n4. Checking Edge Function Configuration:');
    const edgeFunctions = ['send-estimate', 'send-invoice', 'send-estimate-sms', 'send-invoice-sms', 'telnyx-sms'];
    
    for (const func of edgeFunctions) {
      try {
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/${func}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${user.session?.access_token || (await supabase.auth.getSession()).data.session?.access_token}`
          }
        });
        console.log(`${func}:`, response.status === 200 ? '✅ Available' : `❌ Status: ${response.status}`);
      } catch (e) {
        console.error(`${func}: ❌ Error:`, e.message);
      }
    }
    
    // 5. Check current page and navigation
    console.log('\n5. Current Page State:');
    console.log('URL:', window.location.href);
    console.log('Path:', window.location.pathname);
    
    // 6. Test navigation to communications
    console.log('\n6. Test Navigation:');
    console.log('To test messaging, navigate to:');
    console.log(`${window.location.origin}/communications?tab=messages`);
    
    // 7. Check for any errors in console
    console.log('\n7. Recent Console Errors:');
    console.log('Check the browser console for any red error messages above');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Function to test sending a message directly
async function testSendMessage(phoneNumber = '+15551234567', message = 'Test message') {
  console.log('=== Testing Direct Message Send ===');
  
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Not authenticated');
    return;
  }
  
  console.log('Sending SMS to:', phoneNumber);
  console.log('Message:', message);
  
  try {
    const response = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: phoneNumber,
        message: message,
        user_id: user.id
      }
    });
    
    console.log('Response:', response);
    
    if (response.error) {
      console.error('❌ Error:', response.error);
    } else if (response.data?.success) {
      console.log('✅ Message sent successfully!');
      console.log('Message ID:', response.data.messageId);
    } else {
      console.log('Response data:', response.data);
    }
  } catch (error) {
    console.error('Failed to send:', error);
  }
}

// Function to open message dialog manually
async function openMessageDialog() {
  console.log('=== Opening Message Dialog ===');
  
  // Try to find and click the message button
  const messageButtons = document.querySelectorAll('button');
  let found = false;
  
  messageButtons.forEach(btn => {
    if (btn.textContent?.includes('Message') || btn.querySelector('svg')) {
      const svg = btn.querySelector('svg');
      if (svg && (svg.innerHTML.includes('message') || btn.title?.includes('message'))) {
        console.log('Found message button, clicking...');
        btn.click();
        found = true;
      }
    }
  });
  
  if (!found) {
    console.log('Message button not found. Try navigating to a job page first.');
  }
}

console.log('=== Messaging System Debug Tools ===');
console.log('Commands:');
console.log('- debugMessagingSystem() - Run full system check');
console.log('- testSendMessage(phone, message) - Test sending SMS directly');
console.log('- openMessageDialog() - Try to open message dialog');
console.log('\nRunning debug...\n');

// Auto-run debug
debugMessagingSystem();
