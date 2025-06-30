import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    // Не показываем полный ключ из соображений безопасности
    const keyInfo = telnyxApiKey 
      ? {
          exists: true,
          length: telnyxApiKey.length,
          prefix: telnyxApiKey.substring(0, 3),
          isTestKey: telnyxApiKey === 'test'
        }
      : {
          exists: false,
          length: 0,
          prefix: null,
          isTestKey: false
        };

    return new Response(
      JSON.stringify({
        success: true,
        telnyx_api_key: keyInfo,
        other_keys: {
          messaging_profile_id: !!Deno.env.get('TELNYX_MESSAGING_PROFILE_ID'),
          public_key: !!Deno.env.get('TELNYX_PUBLIC_KEY'),
          connection_id: !!Deno.env.get('TELNYX_CONNECTION_ID')
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});