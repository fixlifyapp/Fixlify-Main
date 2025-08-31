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
    const { voice, text } = await req.json();
    
    // For now, return success without actual API call
    // Telnyx TTS requires specific setup and may not have direct speech generation endpoint
    console.log('Voice test requested:', voice, text);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Voice ${voice} selected. Test audio not available in preview.`,
      note: 'Voice will work during actual calls'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Voice test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
