// Simulate Incoming SMS Webhook
// Run this after running test-sms-system.js

(async function simulateIncomingSMS() {
  console.log('📨 Simulating incoming SMS webhook...');
  
  // Get current user and their phone number
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  const { data: phoneData } = await window.supabase
    .from('phone_numbers')
    .select('phone_number')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single();
    
  if (!phoneData) {
    console.error('❌ No primary phone number found');
    return;
  }
  
  const { data: clientData } = await window.supabase
    .from('clients')
    .select('phone')
    .eq('user_id', user.id)
    .limit(1)
    .single();
    
  if (!clientData) {
    console.error('❌ No client found');
    return;
  }
  
  // Simulate webhook payload
  const webhookPayload = {
    data: {
      event_type: 'message.received',
      occurred_at: new Date().toISOString(),
      payload: {
        from: {
          phone_number: clientData.phone
        },
        to: [
          {
            phone_number: phoneData.phone_number
          }
        ],
        text: 'Hello! This is a test message from the client.',
        id: 'test-message-' + Date.now()
      }
    }
  };
  
  console.log('Webhook payload:', webhookPayload);
  
  // Call the webhook function
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const result = await response.json();
    console.log('Webhook response:', result);
    
    if (response.ok) {
      console.log('✅ Incoming SMS simulated successfully!');
      console.log('Check the Connect Center SMS tab to see the new message');
    } else {
      console.error('❌ Webhook error:', result);
    }
  } catch (error) {
    console.error('❌ Error calling webhook:', error);
  }
})();