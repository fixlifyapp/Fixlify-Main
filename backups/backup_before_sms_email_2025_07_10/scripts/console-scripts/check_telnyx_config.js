// Script to check Telnyx edge function configuration
// Run this in the browser console

async function checkTelnyxConfiguration() {
  console.log('=== Checking Telnyx Configuration ===');
  
  const { supabase } = window;
  if (!supabase) {
    console.error('Supabase client not found');
    return;
  }
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Not authenticated');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Test a simple SMS send
    console.log('\nTesting SMS functionality...');
    
    const testMessage = {
      recipientPhone: '+12898192158', // Your own number
      message: 'Test from Fixlify debug script',
      user_id: user.id
    };
    
    console.log('Sending test SMS:', testMessage);
    
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: testMessage
    });
    
    if (error) {
      console.error('❌ SMS Error:', error);
      console.log('\nPossible issues:');
      console.log('1. TELNYX_API_KEY not set in edge function secrets');
      console.log('2. Messaging profile not configured');
      console.log('3. Phone number not properly configured');
      
      // Check if it's an auth error
      if (error.message?.includes('JWT') || error.message?.includes('401')) {
        console.log('4. Authentication issue - try refreshing the page');
      }
    } else {
      console.log('✅ SMS Response:', data);
      
      if (data?.success) {
        console.log('Message sent successfully!');
        console.log('Message ID:', data.messageId);
      } else if (data?.error) {
        console.log('SMS service error:', data.error);
      }
    }
    
    // Check phone number configuration
    console.log('\n=== Phone Number Configuration ===');
    const { data: phoneData } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (phoneData) {
      console.log('Phone:', phoneData.phone_number);
      console.log('Status:', phoneData.status);
      console.log('Messaging Profile ID:', phoneData.messaging_profile_id);
      console.log('Features:', phoneData.features);
      
      if (!phoneData.messaging_profile_id) {
        console.warn('⚠️ No messaging profile ID set!');
      }
    } else {
      console.error('❌ No phone number assigned to user');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkTelnyxConfiguration();

// Manual test function
window.testSMS = async (phone, message) => {
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('Sending SMS to:', phone);
  const { data, error } = await supabase.functions.invoke('telnyx-sms', {
    body: {
      recipientPhone: phone,
      message: message || 'Test message from Fixlify',
      user_id: user.id
    }
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Response:', data);
  }
};

console.log('\nTo test SMS manually, use:');
console.log('testSMS("+1234567890", "Your message here")');
