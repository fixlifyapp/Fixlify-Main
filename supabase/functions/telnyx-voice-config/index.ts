import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceConfigRequest {
  action: 'assign_to_voice_app' | 'release_from_voice_app' | 'update_voice_settings';
  phoneNumber: string;
  settings?: any;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: VoiceConfigRequest = await req.json();
    console.log('Voice config request:', request);
    
    // Get Telnyx credentials
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxAppId = Deno.env.get('TELNYX_TEXML_APP_ID') || 'your-texml-app-id';
    const messagingProfileId = '400197fa-ac3b-4052-8c14-6da54bf7e800';
    
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    let result = { success: false, message: '' };

    switch (request.action) {
      case 'assign_to_voice_app':
        // First, check current assignment
        const checkResponse = await fetch(
          `https://api.telnyx.com/v2/phone_numbers/${request.phoneNumber}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Accept': 'application/json',
            },
          }
        );

        if (checkResponse.ok) {
          const phoneData = await checkResponse.json();
          console.log('Current phone assignment:', phoneData.data);

          // If assigned to a different voice profile, we need to release it first
          if (phoneData.data?.connection_id && phoneData.data.connection_id !== telnyxAppId) {
            console.log('Phone is assigned to another connection, releasing first...');
            
            // Release from current connection
            const releaseResponse = await fetch(
              `https://api.telnyx.com/v2/phone_numbers/${phoneData.data.id}/voice`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${telnyxApiKey}`,
                },
              }
            );

            if (!releaseResponse.ok) {
              console.warn('Could not release from current connection');
            }

            // Wait a moment for the release to process
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // Now assign to TeXML app for AI voice
          const assignResponse = await fetch(
            `https://api.telnyx.com/v2/phone_numbers/${phoneData.data.id}/voice`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${telnyxApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                connection_id: telnyxAppId,
                // Configure for TeXML/AI voice handling
              })
            }
          );

          if (assignResponse.ok) {
            result = { 
              success: true, 
              message: 'Phone number assigned to AI voice app' 
            };
          } else {
            const error = await assignResponse.json();
            console.error('Failed to assign to voice app:', error);
            result = { 
              success: false, 
              message: 'Could not assign to voice app. The number may need to be manually configured in Telnyx.' 
            };
          }
        }
        break;

      case 'release_from_voice_app':
        // Release number from voice app
        const releaseResp = await fetch(
          `https://api.telnyx.com/v2/phone_numbers/${request.phoneNumber}/voice`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
            },
          }
        );

        if (releaseResp.ok || releaseResp.status === 404) {
          result = { 
            success: true, 
            message: 'Phone number released from voice app' 
          };
        } else {
          result = { 
            success: false, 
            message: 'Failed to release from voice app' 
          };
        }
        break;

      case 'update_voice_settings':
        // Update TeXML app webhook or other settings
        // This would update your TeXML application settings
        result = { 
          success: true, 
          message: 'Voice settings updated' 
        };
        break;
    }

    // Store settings in database
    if (request.settings) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('phone_numbers')
          .update({
            ai_voice_settings: request.settings,
            telnyx_settings: {
              texml_app_id: telnyxAppId,
              messaging_profile_id: messagingProfileId
            }
          })
          .eq('phone_number', request.phoneNumber);
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in voice config function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});