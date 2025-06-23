import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Add the Telnyx phone number
    const { data, error } = await supabaseClient
      .from('telnyx_phone_numbers')
      .upsert({
        phone_number: '+14375249932',
        status: 'owned',
        country_code: 'US',
        connection_id: '2709042883142354871',
        area_code: '437',
        region: 'Ontario',
        locality: 'Toronto',
        ai_dispatcher_enabled: false,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-voice-webhook`
      }, {
        onConflict: 'phone_number'
      })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: 'Telnyx phone number configured successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error setting up Telnyx number:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
}) 