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
    const { action, callControlId, userId } = await req.json();
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let endpoint = '';
    let requestBody = {};

    switch (action) {
      case 'start':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_start`;
        requestBody = {
          format: 'mp3',
          channels: 'dual',
          play_beep: true
        };
        break;
      
      case 'stop':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_stop`;
        break;
      
      case 'pause':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_pause`;
        break;
      
      case 'resume':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_resume`;
        break;
      
      default:
        throw new Error(`Unknown recording action: ${action}`);
    }

    // Make API call to Telnyx
    const telnyxResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
    });

    if (!telnyxResponse.ok) {
      const error = await telnyxResponse.text();
      throw new Error(`Telnyx API error: ${error}`);
    }

    const result = await telnyxResponse.json();

    // Update call record in database
    const updateData: any = {};
    if (action === 'start') {
      updateData.is_recording = true;
      updateData.recording_started_at = new Date().toISOString();
    } else if (action === 'stop') {
      updateData.is_recording = false;
      updateData.recording_ended_at = new Date().toISOString();
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('telnyx_calls')
        .update(updateData)
        .eq('call_control_id', callControlId);
    }

    // Send real-time update
    await supabase
      .channel('call-updates')
      .send({
        type: 'broadcast',
        event: 'recording_action',
        payload: {
          callControlId,
          action,
          timestamp: new Date().toISOString()
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
    console.error('Error controlling recording:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});