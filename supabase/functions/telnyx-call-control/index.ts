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

    let telnyxResponse;
    let endpoint = '';
    let method = 'POST';
    let body = {};

    switch (action) {
      case 'answer':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`;
        break;
      
      case 'hangup':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/hangup`;
        break;
      
      case 'hold':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/hold`;
        break;
      
      case 'unhold':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/unhold`;
        break;
      
      case 'mute':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/mute`;
        break;
      
      case 'unmute':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/unmute`;
        break;
      
      case 'record_start':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_start`;
        body = {
          format: 'mp3',
          channels: 'dual'
        };
        break;
      
      case 'record_stop':
        endpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/record_stop`;
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Make API call to Telnyx
    telnyxResponse = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    if (!telnyxResponse.ok) {
      const error = await telnyxResponse.text();
      throw new Error(`Telnyx API error: ${error}`);
    }

    const result = await telnyxResponse.json();

    // Update call status in database
    const statusUpdates: any = {};
    if (action === 'hangup') {
      statusUpdates.status = 'completed';
      statusUpdates.ended_at = new Date().toISOString();
    } else if (action === 'answer') {
      statusUpdates.status = 'active';
      statusUpdates.answered_at = new Date().toISOString();
    }

    if (Object.keys(statusUpdates).length > 0) {
      await supabase
        .from('telnyx_calls')
        .update(statusUpdates)
        .eq('call_control_id', callControlId);
    }

    // Send real-time update
    await supabase
      .channel('call-updates')
      .send({
        type: 'broadcast',
        event: 'call_action',
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
    console.error('Error controlling call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});