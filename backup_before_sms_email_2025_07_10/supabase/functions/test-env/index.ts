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
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    // Check the API key format
    const keyInfo = {
      exists: !!telnyxApiKey,
      length: telnyxApiKey?.length || 0,
      startsWithKEY: telnyxApiKey?.startsWith('KEY') || false,
      firstChars: telnyxApiKey?.substring(0, 8) || 'NOT_SET',
      lastChars: telnyxApiKey?.substring(telnyxApiKey.length - 4) || 'NOT_SET',
      hasSpaces: telnyxApiKey !== telnyxApiKey?.trim(),
      hasQuotes: telnyxApiKey?.includes('"') || telnyxApiKey?.includes("'") || false,
      trimmedLength: telnyxApiKey?.trim().length || 0,
    };
    
    return new Response(
      JSON.stringify({ 
        success: true,
        keyInfo,
        message: 'Environment variable check complete'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});