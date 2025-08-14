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
    const { action, destination, sdp } = await req.json();
    
    // For now, return mock data since Telnyx WebRTC requires complex setup
    // In production, this would handle Telnyx TeXML/WebRTC integration
    
    if (action === 'start') {
      // Would initiate Telnyx call and return SDP
      return new Response(JSON.stringify({
        success: false,
        message: 'WebRTC not configured. Please call directly: ' + destination,
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'WebRTC integration requires Telnyx SIP credentials'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
