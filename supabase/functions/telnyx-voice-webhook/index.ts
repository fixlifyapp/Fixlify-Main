import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event = await req.json();
    console.log('Telnyx voice webhook received:', event.data.event_type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: eventData } = event;
    const payload = eventData.payload;

    switch (eventData.event_type) {
      case 'call.initiated':
        // Handle incoming call
        if (payload.direction === 'incoming') {
          const clientState = payload.client_state ? JSON.parse(payload.client_state) : {};
          
          // Store incoming call
          await supabase.from('telnyx_calls').insert({
            call_control_id: payload.call_control_id,
            call_leg_id: payload.call_leg_id,
            from_number: payload.from,
            to_number: payload.to,
            direction: 'incoming',
            status: 'ringing',
            started_at: new Date().toISOString(),
            user_id: clientState.userId || null,
            client_id: clientState.clientId || null,
          });

          // Send real-time notification for incoming call
          await supabase
            .channel('incoming-calls')
            .send({
              type: 'broadcast',
              event: 'incoming_call',
              payload: {
                callControlId: payload.call_control_id,
                from: payload.from,
                to: payload.to,
                timestamp: new Date().toISOString()
              }
            });
        }
        break;

      case 'call.answered':
        // Update call status to active
        await supabase
          .from('telnyx_calls')
          .update({ 
            status: 'active',
            answered_at: new Date().toISOString()
          })
          .eq('call_control_id', payload.call_control_id);

        // Send real-time update
        await supabase
          .channel('call-updates')
          .send({
            type: 'broadcast',
            event: 'call_answered',
            payload: {
              callControlId: payload.call_control_id,
              timestamp: new Date().toISOString()
            }
          });
        break;

      case 'call.hangup':
        // Update call status to ended
        await supabase
          .from('telnyx_calls')
          .update({ 
            status: 'completed',
            ended_at: new Date().toISOString(),
            duration: payload.call_duration_secs || 0
          })
          .eq('call_control_id', payload.call_control_id);

        // Send real-time update
        await supabase
          .channel('call-updates')
          .send({
            type: 'broadcast',
            event: 'call_ended',
            payload: {
              callControlId: payload.call_control_id,
              duration: payload.call_duration_secs || 0,
              timestamp: new Date().toISOString()
            }
          });
        break;

      case 'call.recording.saved':
        // Update call with recording URL
        await supabase
          .from('telnyx_calls')
          .update({ 
            recording_url: payload.recording_urls?.mp3 || null
          })
          .eq('call_control_id', payload.call_control_id);
        break;

      default:
        console.log('Unhandled event type:', eventData.event_type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing voice webhook:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});