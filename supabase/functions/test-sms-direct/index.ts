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
    console.log('🧪 Testing SMS configuration...')
    
    // Check if all required environment variables are set
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
    
    const config = {
      TELNYX_API_KEY: telnyxApiKey ? '✅ Set' : '❌ Missing',
      TELNYX_MESSAGING_PROFILE_ID: messagingProfileId ? '✅ Set' : '❌ Missing',
      MESSAGING_PROFILE_ID_VALUE: messagingProfileId ? messagingProfileId : 'Not set'
    };
    
    console.log('📋 Configuration check:', config);
    
    // Test Telnyx API connection
    let telnyxStatus = 'Unknown';
    if (telnyxApiKey) {
      try {
        const response = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          telnyxStatus = '✅ API connection successful';
          const data = await response.json();
          console.log('📱 Messaging profiles found:', data.data?.length || 0);
        } else {
          telnyxStatus = `❌ API error: ${response.status}`;
          const errorText = await response.text();
          console.error('Telnyx API error:', errorText);
        }
      } catch (error) {
        telnyxStatus = `❌ Connection failed: ${error.message}`;
        console.error('Telnyx connection error:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'SMS Configuration Test',
      config: config,
      telnyx_status: telnyxStatus,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})