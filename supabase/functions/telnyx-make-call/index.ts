import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { action, to, from, call_control_id, clientId, connectionId } = await req.json()
    
    if (!TELNYX_API_KEY) {
      throw new Error('TELNYX_API_KEY is not configured')
    }

    let response
    let data

    switch (action) {
      case 'call':
        // Make outbound call
        const callBody = {
          to: to,
          from: from,
          webhook_url: `${SUPABASE_URL}/functions/v1/telnyx-voice-webhook`
        };

        // Add connection_id if provided
        if (connectionId) {
          callBody.connection_id = connectionId;
        }

        response = await fetch('https://api.telnyx.com/v2/calls', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TELNYX_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(callBody)
        })
        data = await response.json()
        
        if (!response.ok) {
          throw new Error(`Telnyx API error: ${data.errors?.[0]?.detail || 'Unknown error'}`)
        }

        // Log the call in database
        await supabaseClient
          .from('telnyx_calls')
          .insert({
            call_control_id: data.data.call_control_id,
            from_number: from,
            to_number: to,
            direction: 'outbound',
            status: 'initiated',
            client_id: clientId,
            started_at: new Date().toISOString()
          })

        break

      case 'hangup':
        // End call
        response = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/hangup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TELNYX_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        data = await response.json()
        
        if (!response.ok) {
          throw new Error(`Telnyx hangup error: ${data.errors?.[0]?.detail || 'Unknown error'}`)
        }

        // Update call status
        await supabaseClient
          .from('telnyx_calls')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('call_control_id', call_control_id)

        break

      case 'mute':
        // Mute call
        response = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/mute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TELNYX_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        data = await response.json()
        break

      case 'unmute':
        // Unmute call
        response = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/unmute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TELNYX_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        data = await response.json()
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data?.data || data,
        action
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in telnyx-make-call function:', error)
    
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
