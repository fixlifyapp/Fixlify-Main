import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDQwMDMsImV4cCI6MjA0ODM4MDAwM30.vVhvj94Iux0V1-vLlLZ_Pxdv1dCCSpY_rICt3rrJA-c'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWebhook() {
  console.log('Testing AI Assistant Webhook...\n')
  
  // Test the webhook directly
  const testData = {
    to: '+14375249932',
    from: '+1234567890',
    call_control_id: 'test-' + Date.now(),
    call_leg_id: 'test-leg-' + Date.now(),
    connection_id: 'test-connection'
  }
  
  console.log('Sending test request:', testData)
  
  try {
    const response = await fetch(
      'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      }
    )
    
    if (!response.ok) {
      console.error('❌ Webhook returned error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error body:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('\n✅ Webhook Response:')
    console.log(JSON.stringify(data, null, 2))
    
    // Verify the response has the expected structure
    if (data.agent_name && data.company_name) {
      console.log('\n✅ SUCCESS! Variables returned:')
      console.log('- Agent Name:', data.agent_name)
      console.log('- Company Name:', data.company_name)
      console.log('- Services:', data.services_offered)
      console.log('- Greeting:', data.greeting)
    } else {
      console.log('\n⚠️ Warning: Response missing expected variables')
    }
    
  } catch (error) {
    console.error('❌ Error calling webhook:', error)
  }
}

testWebhook()
