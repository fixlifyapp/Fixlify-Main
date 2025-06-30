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
    console.log('🔍 Checking Telnyx account...');
    
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey || telnyxApiKey === 'test') {
      return new Response(
        JSON.stringify({ 
          error: 'Telnyx API key not configured',
          hint: 'Please set TELNYX_API_KEY in Supabase secrets'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get all phone numbers from Telnyx account
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telnyx API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Telnyx API returned ${response.status}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const result = await response.json();
    const numbers = result.data || [];
    
    console.log(`Found ${numbers.length} numbers in Telnyx account`);

    // Format the response with relevant details
    const formattedNumbers = numbers.map(num => ({
      phone_number: num.phone_number,
      status: num.status,
      connection_id: num.connection_id,
      created_at: num.created_at,
      messaging_enabled: !!num.messaging_profile_id,
      messaging_profile_id: num.messaging_profile_id,
      voice_enabled: !!num.connection_id,
      tags: num.tags || []
    }));

    // Also get messaging profiles
    const profilesResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Accept': 'application/json'
      }
    });

    let messagingProfiles = [];
    if (profilesResponse.ok) {
      const profilesData = await profilesResponse.json();
      messagingProfiles = profilesData.data || [];
    }

    // Get current connection info
    const connectionId = Deno.env.get('TELNYX_CONNECTION_ID');

    return new Response(
      JSON.stringify({ 
        success: true,
        total_numbers: numbers.length,
        connection_id: connectionId,
        numbers: formattedNumbers,
        messaging_profiles: messagingProfiles.map(p => ({
          id: p.id,
          name: p.name,
          created_at: p.created_at
        })),
        summary: {
          total: numbers.length,
          with_messaging: numbers.filter(n => n.messaging_profile_id).length,
          with_voice: numbers.filter(n => n.connection_id).length,
          active: numbers.filter(n => n.status === 'active').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})