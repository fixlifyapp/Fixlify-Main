import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY')
    
    if (!TELNYX_API_KEY) {
      throw new Error('TELNYX_API_KEY is not configured in environment variables')
    }

    // Test the API key by fetching account info
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Telnyx API error: ${data.errors?.[0]?.detail || 'Invalid API key'}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Telnyx API connection successful',
        phoneNumbers: data.data?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error testing Telnyx connection:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        hint: 'Make sure TELNYX_API_KEY is set in Supabase Edge Function environment variables'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
}) 