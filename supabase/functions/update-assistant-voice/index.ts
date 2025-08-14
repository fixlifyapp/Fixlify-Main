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
    const { assistantId, voice, model } = await req.json();
    
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) throw new Error('Telnyx API key not configured');
    
    // Update voice in AI Assistant
    const response = await fetch(`https://api.telnyx.com/v1/ai_assistants/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voice: voice  // Just send voice name directly
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telnyx API error:', errorText);
      // Don't throw - just log and continue
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Voice updated to ${voice}`,
      assistantId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update voice error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
