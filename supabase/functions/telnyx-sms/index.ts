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
    console.log('=== Telnyx SMS Function Called ===')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { recipientPhone, message, client_id, job_id } = await req.json()
    console.log('Request data:', { recipientPhone, message, client_id, job_id })

    // Validate required fields
    if (!recipientPhone || !message) {
      console.error('Missing required fields:', { recipientPhone: !!recipientPhone, message: !!message })
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: recipientPhone and message' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get Telnyx configuration
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID')
    
    console.log('Telnyx config:', { 
      hasApiKey: !!telnyxApiKey, 
      hasMessagingProfile: !!messagingProfileId 
    })

    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY not configured')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'TELNYX_API_KEY not configured in Supabase secrets' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Get active phone number from database
    const { data: phoneNumbers, error: phoneError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active')
      .limit(1)

    console.log('Phone numbers query:', { phoneNumbers, phoneError })

    if (phoneError || !phoneNumbers || phoneNumbers.length === 0) {
      console.error('No active phone number found:', phoneError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active phone number found. Please configure a Telnyx phone number first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const fromPhone = phoneNumbers[0].phone_number
    console.log('Using from phone:', fromPhone)

    // Send SMS via Telnyx
    const smsPayload = {
      from: fromPhone,
      to: recipientPhone,
      text: message,
      ...(messagingProfileId && { messaging_profile_id: messagingProfileId })
    }
    
    console.log('Sending SMS with payload:', smsPayload)

    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smsPayload)
    })

    const smsResult = await smsResponse.json()
    console.log('Telnyx API response:', { status: smsResponse.status, result: smsResult })

    if (!smsResponse.ok) {
      console.error('SMS send failed:', smsResult)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `SMS send failed: ${smsResult.errors?.[0]?.detail || 'Unknown error'}`,
        telnyxError: smsResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Log the message in communication_logs if we have client_id
    if (client_id) {
      try {
        const { error: logError } = await supabaseAdmin
          .from('communication_logs')
          .insert({
            client_id,
            job_id,
            type: 'sms',
            direction: 'outbound',
            phone_number: recipientPhone,
            message: message,
            status: 'sent',
            telnyx_message_id: smsResult.data?.id,
            metadata: { telnyx_response: smsResult }
          })
        
        if (logError) {
          console.error('Failed to log message:', logError)
        } else {
          console.log('Message logged successfully')
        }
      } catch (logErr) {
        console.error('Error logging message:', logErr)
      }
    }

    console.log('SMS sent successfully:', smsResult.data?.id)

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: smsResult.data?.id,
      from: fromPhone,
      to: recipientPhone,
      message: 'SMS sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in telnyx-sms function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})