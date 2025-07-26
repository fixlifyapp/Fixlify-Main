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
    const { to, from, userId, clientId } = await req.json();
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Make the call via Telnyx Call Control API
    const callResponse = await fetch('https://api.telnyx.com/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: '2709100729850660858',
        to: to,
        from: from,
        webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook',
        webhook_url_method: 'POST',
        record: 'record-from-answer',
        record_format: 'mp3',
        record_max_length: 3600,
        billing_group_id: null,
        client_state: JSON.stringify({ userId, clientId, type: 'outbound' })
      }),
    });

    if (!callResponse.ok) {
      const error = await callResponse.text();
      throw new Error(`Telnyx API error: ${error}`);
    }

    const callData = await callResponse.json();
    console.log('Call initiated:', callData);

    // Store call record in database
    const { error: dbError } = await supabase
      .from('telnyx_calls')
      .insert({
        call_control_id: callData.data.call_control_id,
        call_leg_id: callData.data.call_leg_id,
        user_id: userId,
        client_id: clientId,
        from_number: from,
        to_number: to,
        direction: 'outbound',
        status: 'ringing',
        started_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      callControlId: callData.data.call_control_id,
      callLegId: callData.data.call_leg_id,
      status: 'ringing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error making call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});