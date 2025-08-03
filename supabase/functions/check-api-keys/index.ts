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
    // Check which API keys are configured
    const mailgunKey = Deno.env.get('MAILGUN_API_KEY');
    const telnyxKey = Deno.env.get('TELNYX_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const status = {
      supabase: {
        url: !!supabaseUrl,
        serviceKey: !!supabaseServiceKey
      },
      integrations: {
        mailgun: {
          configured: !!mailgunKey,
          keyLength: mailgunKey ? mailgunKey.length : 0,
          keyPrefix: mailgunKey ? mailgunKey.substring(0, 5) + '...' : 'NOT SET'
        },
        telnyx: {
          configured: !!telnyxKey,
          keyLength: telnyxKey ? telnyxKey.length : 0,
          keyPrefix: telnyxKey ? telnyxKey.substring(0, 5) + '...' : 'NOT SET'
        },
        openai: {
          configured: !!openaiKey,
          keyLength: openaiKey ? openaiKey.length : 0,
          keyPrefix: openaiKey ? openaiKey.substring(0, 5) + '...' : 'NOT SET'
        }
      },
      message: 'API key configuration status',
      timestamp: new Date().toISOString()
    };

    // Determine overall status
    const allConfigured = mailgunKey && telnyxKey;
    status.message = allConfigured 
      ? 'All required API keys are configured' 
      : 'Some API keys are missing. Please configure them in Supabase Dashboard > Functions > Secrets';

    return new Response(
      JSON.stringify(status, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error checking configuration:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Failed to check configuration'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
