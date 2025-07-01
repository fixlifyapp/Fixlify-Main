import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if Mailgun API key is configured
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    const hasMailgunKey = !!mailgunApiKey
    
    // Check if Telnyx API key is configured
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    const hasTelnyxKey = !!telnyxApiKey
    
    // Get all available environment variables (names only for security)
    const envVars = Object.keys(Deno.env.toObject())
    
    const response = {
      success: true,
      configuration: {
        mailgun: {
          configured: hasMailgunKey,
          keyLength: mailgunApiKey ? mailgunApiKey.length : 0,
          keyPrefix: mailgunApiKey ? mailgunApiKey.substring(0, 8) + '...' : 'NOT SET'
        },
        telnyx: {
          configured: hasTelnyxKey,
          keyLength: telnyxApiKey ? telnyxApiKey.length : 0,
          keyPrefix: telnyxApiKey ? telnyxApiKey.substring(0, 8) + '...' : 'NOT SET'
        },
        availableEnvVars: envVars.filter(key => 
          !key.includes('KEY') && 
          !key.includes('SECRET') && 
          !key.includes('PASSWORD')
        )
      },
      recommendations: []
    }
    
    if (!hasMailgunKey) {
      response.recommendations.push('Set MAILGUN_API_KEY environment variable for email functionality')
    }
    
    if (!hasTelnyxKey) {
      response.recommendations.push('Set TELNYX_API_KEY environment variable for SMS functionality')
    }
    
    return new Response(
      JSON.stringify(response, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
