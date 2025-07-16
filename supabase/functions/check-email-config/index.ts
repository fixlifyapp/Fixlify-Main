import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if user is authenticated
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get environment variables (without exposing the actual API key)
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const mailgunFromEmail = Deno.env.get('MAILGUN_FROM_EMAIL');
    
    const config = {
      mailgun: {
        apiKeySet: !!mailgunApiKey,
        apiKeyLength: mailgunApiKey ? mailgunApiKey.length : 0,
        domain: mailgunDomain || 'NOT SET - Defaulting to fixlify.app',
        fromEmail: mailgunFromEmail || 'NOT SET - Will use user company email',
        isTestMode: !mailgunApiKey
      },
      defaults: {
        domain: 'fixlify.app',
        fromEmail: 'noreply@fixlify.app'
      },
      recommendation: {
        domain: 'Should be set to: fixlify.app',
        note: 'MAILGUN_FROM_EMAIL should NOT be set - system uses company email from user profile'
      }
    };

    return new Response(
      JSON.stringify(config, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
