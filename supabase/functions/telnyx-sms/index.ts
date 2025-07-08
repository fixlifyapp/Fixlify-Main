
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, from } = await req.json()
    
    if (!to || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'to and message are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    const telnyxFromNumber = from || Deno.env.get('TELNYX_FROM_NUMBER')
    
    if (!telnyxApiKey || !telnyxFromNumber) {
      console.error('Telnyx configuration missing')
      return new Response(
        JSON.stringify({ 
          error: 'SMS service not configured', 
          details: 'Missing Telnyx API key or from number' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending SMS:', { to, from: telnyxFromNumber, message: message.substring(0, 50) + '...' })

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyxFromNumber,
        to: to,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Telnyx API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS', 
          details: `Telnyx API returned ${response.status}`,
          telnyxError: errorText
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('SMS sent successfully:', result.data?.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.data?.id,
        message: 'SMS sent successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in telnyx-sms function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
