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
    const { phoneNumber } = await req.json();
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxConnectionId = Deno.env.get('TELNYX_CONNECTION_ID') || '2709100729850660858';

    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    // Create a temporary SIP connection for WebRTC
    const response = await fetch('https://api.telnyx.com/v2/telephony_credentials', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connection_id: telnyxConnectionId,
        name: `WebRTC Call ${Date.now()}`,
        expires_at: new Date(Date.now() + 300000).toISOString() // 5 min expiry
      })
    });

    if (!response.ok) {
      // Fallback - return instructions for direct calling
      return new Response(JSON.stringify({
        success: false,
        message: 'WebRTC requires SIP credentials setup',
        fallback: true,
        phoneNumber
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      token: data.data?.sip_password,
      username: data.data?.sip_username,
      realm: 'sip.telnyx.com'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Token error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
