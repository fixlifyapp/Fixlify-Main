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
    
    if (!telnyxApiKey || telnyxApiKey === 'your_telnyx_api_key_here') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Telnyx API key not configured',
        message: 'Please add your Telnyx API key to environment variables'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test API connection
    const response = await fetch('https://api.telnyx.com/v2/available_phone_numbers', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid API key or connection failed',
        status: response.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for AI Assistants
    const assistantsResponse = await fetch('https://api.telnyx.com/v2/ai/assistants', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });

    const assistants = assistantsResponse.ok ? await assistantsResponse.json() : null;

    // Check for phone numbers
    const numbersResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });

    const numbers = numbersResponse.ok ? await numbersResponse.json() : null;

    return new Response(JSON.stringify({
      success: true,
      message: 'Telnyx connection successful',
      data: {
        api_connected: true,
        assistants_count: assistants?.data?.length || 0,
        assistants: assistants?.data || [],
        phone_numbers_count: numbers?.data?.length || 0,
        phone_numbers: numbers?.data?.map(n => ({
          phone_number: n.phone_number,
          id: n.id,
          status: n.status,
          connection_id: n.connection_id
        })) || []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error testing Telnyx:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
