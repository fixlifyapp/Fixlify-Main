import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, phoneNumberId, config } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'enable': {
        // Enable AI dispatcher for a phone number
        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({ 
            ai_dispatcher_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', phoneNumberId);

        if (updateError) throw updateError;

        // Check if config exists
        const { data: existingConfig } = await supabase
          .from('ai_dispatcher_configs')
          .select('*')
          .eq('phone_number_id', phoneNumberId)
          .single();

        if (!existingConfig && config) {
          // Create new config if it doesn't exist
          const { error: insertError } = await supabase
            .from('ai_dispatcher_configs')
            .insert({
              phone_number_id: phoneNumberId,
              business_name: config.business_name || 'Your Business',
              business_type: config.business_type || 'General Service',
              business_greeting: config.business_greeting || 'Thank you for calling. How can I help you today?',
              diagnostic_fee: config.diagnostic_fee || 75,
              emergency_surcharge: config.emergency_surcharge || 50,
              hourly_rate: config.hourly_rate || 100,
              voice_selection: config.voice_selection || 'alloy',
              emergency_detection_enabled: config.emergency_detection_enabled !== false,
              user_id: config.user_id
            });

          if (insertError) throw insertError;
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'AI Dispatcher enabled successfully' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'disable': {
        // Disable AI dispatcher for a phone number
        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({ 
            ai_dispatcher_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', phoneNumberId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'AI Dispatcher disabled successfully' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'update_config': {
        // Update AI dispatcher configuration
        const { error: updateError } = await supabase
          .from('ai_dispatcher_configs')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('phone_number_id', phoneNumberId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Configuration updated successfully' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'get_config': {
        // Get AI dispatcher configuration
        const { data: phoneNumber, error: phoneError } = await supabase
          .from('phone_numbers')
          .select('*, ai_dispatcher_configs(*)')
          .eq('id', phoneNumberId)
          .single();

        if (phoneError) throw phoneError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: phoneNumber 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'handle_call': {
        // Handle incoming call with AI
        const { callData } = await req.json();
        
        // Log the call
        const { error: logError } = await supabase
          .from('ai_dispatcher_call_logs')
          .insert({
            phone_number_id: phoneNumberId,
            call_sid: callData.call_sid,
            from_number: callData.from_number,
            to_number: callData.to_number,
            call_status: 'in_progress',
            metadata: callData
          });

        if (logError) console.error('Error logging call:', logError);

        // Get AI configuration
        const { data: config, error: configError } = await supabase
          .from('ai_dispatcher_configs')
          .select('*')
          .eq('phone_number_id', phoneNumberId)
          .single();

        if (configError) throw configError;

        // Here you would integrate with OpenAI or other AI service
        // For now, return a basic response
        const response = {
          greeting: config?.business_greeting || 'Thank you for calling. How can I help you today?',
          voice: config?.voice_selection || 'alloy',
          business_name: config?.business_name || 'Our business'
        };

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: response 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in AI dispatcher handler:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
