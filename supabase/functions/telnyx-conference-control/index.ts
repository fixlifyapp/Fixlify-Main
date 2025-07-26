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
    const { action, conferenceId, phoneNumber, callControlId, userId } = await req.json();
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let telnyxResponse;
    let result = {};

    switch (action) {
      case 'create_conference':
        // Create a new conference room
        telnyxResponse = await fetch('https://api.telnyx.com/v2/conferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `conf_${Date.now()}`,
            call_control_id: callControlId
          }),
        });
        
        if (!telnyxResponse.ok) {
          const error = await telnyxResponse.text();
          throw new Error(`Telnyx API error: ${error}`);
        }
        
        result = await telnyxResponse.json();
        break;

      case 'add_participant':
        // First make a call to the participant
        const callResponse = await fetch('https://api.telnyx.com/v2/calls', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connection_id: '2709042883142354871',
            to: phoneNumber,
            from: '+14375249932',
            webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook',
            webhook_url_method: 'POST',
            client_state: JSON.stringify({ 
              userId, 
              conferenceId,
              type: 'conference_participant',
              action: 'join_conference'
            })
          }),
        });

        if (!callResponse.ok) {
          const error = await callResponse.text();
          throw new Error(`Telnyx call API error: ${error}`);
        }

        const callData = await callResponse.json();
        
        // Store the call with conference info
        await supabase
          .from('telnyx_calls')
          .insert({
            call_control_id: callData.data.call_control_id,
            call_leg_id: callData.data.call_leg_id,
            user_id: userId,
            from_number: '+14375249932',
            to_number: phoneNumber,
            direction: 'outbound',
            status: 'ringing',
            conference_id: conferenceId,
            started_at: new Date().toISOString(),
          });

        result = {
          participantId: callData.data.call_control_id,
          callControlId: callData.data.call_control_id,
          status: 'connecting'
        };
        break;

      case 'join_conference':
        // Join an existing conference
        telnyxResponse = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/join_conference`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conference_name: conferenceId
          }),
        });
        
        if (!telnyxResponse.ok) {
          const error = await telnyxResponse.text();
          throw new Error(`Telnyx join conference error: ${error}`);
        }
        
        result = await telnyxResponse.json();
        break;

      case 'leave_conference':
        // Leave conference
        telnyxResponse = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/leave_conference`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!telnyxResponse.ok) {
          const error = await telnyxResponse.text();
          throw new Error(`Telnyx leave conference error: ${error}`);
        }
        
        result = await telnyxResponse.json();
        break;

      case 'mute_participant':
        // Mute participant in conference
        telnyxResponse = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/mute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!telnyxResponse.ok) {
          const error = await telnyxResponse.text();
          throw new Error(`Telnyx mute error: ${error}`);
        }
        
        result = await telnyxResponse.json();
        break;

      case 'unmute_participant':
        // Unmute participant in conference
        telnyxResponse = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/unmute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!telnyxResponse.ok) {
          const error = await telnyxResponse.text();
          throw new Error(`Telnyx unmute error: ${error}`);
        }
        
        result = await telnyxResponse.json();
        break;

      default:
        throw new Error(`Unknown conference action: ${action}`);
    }

    // Send real-time update
    await supabase
      .channel('conference-updates')
      .send({
        type: 'broadcast',
        event: 'conference_action',
        payload: {
          conferenceId,
          action,
          callControlId,
          timestamp: new Date().toISOString(),
          result
        }
      });

    return new Response(JSON.stringify({
      success: true,
      action,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in conference control:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});