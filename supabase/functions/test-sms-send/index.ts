import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test Telnyx configuration
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID')
    
    if (!telnyxApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'TELNYX_API_KEY not configured in Supabase secrets' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get active phone number
    const { data: phoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active')
      .limit(1)

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active phone number found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const fromPhone = phoneNumbers[0].phone_number

    // Test SMS send
    const testNumber = '+11234567890' // Test number - won't actually send
    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromPhone,
        to: testNumber,
        text: 'Test message from Fixlify SMS system',
        messaging_profile_id: messagingProfileId
      })
    })

    if (!smsResponse.ok) {
      const error = await smsResponse.text()
      return new Response(JSON.stringify({ 
        success: false, 
        error: `SMS test failed: ${error}`,
        config: {
          hasApiKey: !!telnyxApiKey,
          hasMessagingProfile: !!messagingProfileId,
          fromPhone: fromPhone
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const smsResult = await smsResponse.json()

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'SMS system configuration verified',
      config: {
        hasApiKey: !!telnyxApiKey,
        hasMessagingProfile: !!messagingProfileId,
        fromPhone: fromPhone,
        activeNumbers: phoneNumbers.length
      },
      testResult: smsResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error testing SMS:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})