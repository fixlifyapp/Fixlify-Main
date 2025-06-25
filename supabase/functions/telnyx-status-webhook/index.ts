import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const payload = await req.json()
    console.log('Telnyx webhook received:', payload)

    // Extract event data
    const { data } = payload
    const eventType = data.event_type
    const eventPayload = data.payload

    // Handle different event types
    switch (eventType) {
      case 'message.sent':
        await updateMessageStatus(supabase, eventPayload.id, 'sent')
        break
        
      case 'message.finalized':
        await updateMessageStatus(supabase, eventPayload.id, 'delivered', {
          to: eventPayload.to,
          cost: eventPayload.cost
        })
        break
        
      case 'message.delivery_failed':
        await updateMessageStatus(supabase, eventPayload.id, 'failed', {
          errors: eventPayload.errors
        })
        break
        
      case 'call.initiated':
        await updateCallStatus(supabase, eventPayload.call_control_id, 'initiated')
        break
        
      case 'call.answered':
        await updateCallStatus(supabase, eventPayload.call_control_id, 'answered')
        break
        
      case 'call.hangup':
        await updateCallStatus(supabase, eventPayload.call_control_id, 'completed', {
          duration: eventPayload.call_duration
        })
        break
    }

    // Log raw webhook for debugging
    await supabase.from('webhook_logs').insert({
      provider: 'telnyx',
      event_type: eventType,
      payload: payload,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing Telnyx webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function updateMessageStatus(supabase: any, externalId: string, status: string, additionalData?: any) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...(additionalData && { metadata: additionalData })
  }
  
  const { error } = await supabase
    .from('communication_logs')
    .update(updateData)
    .eq('external_id', externalId)
    
  if (error) {
    console.error('Error updating message status:', error)
  }
}

async function updateCallStatus(supabase: any, callControlId: string, status: string, additionalData?: any) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...(additionalData && { metadata: additionalData })
  }
  
  const { error } = await supabase
    .from('communication_logs')
    .update(updateData)
    .eq('external_id', callControlId)
    
  if (error) {
    console.error('Error updating call status:', error)
  }
}
