import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfigRequest {
  action: 'get' | 'save' | 'delete';
  phoneNumberId: string;
  config?: {
    business_name?: string;
    business_type?: string;
    business_greeting?: string;
    diagnostic_fee?: number;
    emergency_surcharge?: number;
    hourly_rate?: number;
    voice_selection?: string;
    emergency_detection_enabled?: boolean;
    collect_customer_info?: boolean;
    appointment_booking_enabled?: boolean;
    working_hours?: Record<string, unknown>;
    service_areas?: string[];
    custom_prompts?: Record<string, string>;
  };
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ConfigRequest = await req.json();
    const { action, phoneNumberId, config, userId } = requestData;

    console.log('ai-dispatcher-configs action:', action, { phoneNumberId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!phoneNumberId) {
      throw new Error('Phone number ID is required');
    }

    switch (action) {
      case 'get': {
        // Get AI dispatcher configuration
        const { data: configData, error } = await supabase
          .from('ai_dispatcher_configs')
          .select('*')
          .eq('phone_number_id', phoneNumberId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        // Also get phone number details
        const { data: phoneData } = await supabase
          .from('phone_numbers')
          .select('phone_number, ai_dispatcher_enabled, friendly_name')
          .eq('id', phoneNumberId)
          .single();

        return new Response(
          JSON.stringify({
            success: true,
            config: configData || null,
            phoneNumber: phoneData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'save': {
        if (!config) {
          throw new Error('Configuration data is required');
        }

        // Check if config exists
        const { data: existingConfig } = await supabase
          .from('ai_dispatcher_configs')
          .select('id')
          .eq('phone_number_id', phoneNumberId)
          .single();

        let result;

        if (existingConfig) {
          // Update existing config
          const { data, error: updateError } = await supabase
            .from('ai_dispatcher_configs')
            .update({
              ...config,
              updated_at: new Date().toISOString()
            })
            .eq('phone_number_id', phoneNumberId)
            .select()
            .single();

          if (updateError) throw updateError;
          result = data;
        } else {
          // Create new config
          const { data, error: insertError } = await supabase
            .from('ai_dispatcher_configs')
            .insert({
              phone_number_id: phoneNumberId,
              user_id: userId,
              business_name: config.business_name || 'Your Business',
              business_type: config.business_type || 'General Service',
              business_greeting: config.business_greeting || 'Thank you for calling. How can I help you today?',
              diagnostic_fee: config.diagnostic_fee || 75,
              emergency_surcharge: config.emergency_surcharge || 50,
              hourly_rate: config.hourly_rate || 100,
              voice_selection: config.voice_selection || 'alloy',
              emergency_detection_enabled: config.emergency_detection_enabled !== false,
              collect_customer_info: config.collect_customer_info !== false,
              appointment_booking_enabled: config.appointment_booking_enabled !== false,
              working_hours: config.working_hours || {},
              service_areas: config.service_areas || [],
              custom_prompts: config.custom_prompts || {}
            })
            .select()
            .single();

          if (insertError) throw insertError;
          result = data;
        }

        // Enable AI dispatcher on the phone number if saving config
        await supabase
          .from('phone_numbers')
          .update({
            ai_dispatcher_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', phoneNumberId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Configuration saved successfully',
            config: result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { error: deleteError } = await supabase
          .from('ai_dispatcher_configs')
          .delete()
          .eq('phone_number_id', phoneNumberId);

        if (deleteError) throw deleteError;

        // Disable AI dispatcher on the phone number
        await supabase
          .from('phone_numbers')
          .update({
            ai_dispatcher_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', phoneNumberId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Configuration deleted successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in ai-dispatcher-configs:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
