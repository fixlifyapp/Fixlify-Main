import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { callControlId } = await req.json();
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    // Check call status via Telnyx API
    const telnyxResponse = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let active = false;
    
    if (telnyxResponse.ok) {
      const callData = await telnyxResponse.json();
      // Call is active if it exists and is not in an ended state
      active = callData.data && !['hangup', 'completed', 'failed'].includes(callData.data.state);
    }

    return new Response(JSON.stringify({
      active,
      status: telnyxResponse.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking call status:', error);
    return new Response(JSON.stringify({
      active: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});