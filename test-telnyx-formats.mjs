// Test what Telnyx actually sends
const TELNYX_FORMATS = [
  // Format 1: Just the number
  { to: '14375249932', from: '1234567890' },
  
  // Format 2: With + prefix
  { to: '+14375249932', from: '+1234567890' },
  
  // Format 3: With country code
  { to: '4375249932', from: '234567890' },
  
  // Format 4: What Telnyx might actually send (based on their docs)
  { 
    to: '+14375249932',
    from: '+11234567890',
    call_control_id: 'v3:test123',
    call_leg_id: 'leg123',
    call_session_id: 'session123',
    connection_id: '1234567890',
    client_state: null
  }
];

async function testAllFormats() {
  console.log('Testing different phone number formats that Telnyx might send...\n');
  
  for (let i = 0; i < TELNYX_FORMATS.length; i++) {
    const format = TELNYX_FORMATS[i];
    console.log(`\nTest ${i + 1}: Testing format:`, format);
    
    try {
      const response = await fetch(
        'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(format)
        }
      );
      
      const data = await response.json();
      
      if (data.agent_name === 'Sarah' && data.company_name === 'kyky') {
        console.log('✅ SUCCESS with this format!');
        console.log('Agent:', data.agent_name);
        console.log('Company:', data.company_name);
      } else {
        console.log('❌ Failed - got default values');
        console.log('Agent:', data.agent_name);
        console.log('Company:', data.company_name);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  console.log('\n\n=== IMPORTANT ===');
  console.log('If all tests return default values, the issue is with phone number matching.');
  console.log('The webhook expects the "to" field to match exactly: +14375249932');
}

testAllFormats();
