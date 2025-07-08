
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, message, from } = await req.json();
    console.log('Sending SMS:', { to, message, from });

    const telnyx_api_key = Deno.env.get('TELNYX_API_KEY');
    const telnyx_from_number = from || Deno.env.get('TELNYX_FROM_NUMBER');

    if (!telnyx_api_key || !telnyx_from_number) {
      throw new Error('Telnyx configuration missing');
    }

    // Send SMS via Telnyx
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyx_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyx_from_number,
        to: to,
        text: message,
      }),
    });

    const result = await response.json();
    console.log('Telnyx response:', result);

    if (!response.ok) {
      throw new Error(`Telnyx error: ${result.errors?.[0]?.detail || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully', 
        telnyx_id: result.data?.id,
        result: result.data 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
