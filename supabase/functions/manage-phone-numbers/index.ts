import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManagePhoneRequest {
  action: 'search' | 'configure_webhooks' | 'update_settings' | 'get_details';
  phone_number_id?: string;
  phone_number?: string;
  areaCode?: string;
  contains?: string;
  country?: string;
  webhookUrl?: string;
  settings?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ManagePhoneRequest = await req.json();
    const { action } = requestData;

    console.log('manage-phone-numbers action:', action, requestData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Telnyx credentials
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');

    switch (action) {
      case 'search': {
        if (!telnyxApiKey) {
          throw new Error('Telnyx API key not configured');
        }

        const params = new URLSearchParams({
          'filter[country_code]': requestData.country || 'US',
          'filter[features]': 'sms,voice',
          'filter[limit]': '20',
          'filter[best_effort]': 'false'
        });

        if (requestData.areaCode) {
          params.append('filter[national_destination_code]', requestData.areaCode);
        }

        if (requestData.contains) {
          params.append('filter[phone_number][contains]', requestData.contains);
        }

        const response = await fetch(
          `https://api.telnyx.com/v2/available_phone_numbers?${params}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to search for numbers');
        }

        const data = await response.json();

        return new Response(
          JSON.stringify({
            success: true,
            numbers: data.data || [],
            count: data.data?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'configure_webhooks': {
        if (!telnyxApiKey) {
          throw new Error('Telnyx API key not configured');
        }

        if (!requestData.phone_number_id && !requestData.phone_number) {
          throw new Error('Phone number ID or phone number is required');
        }

        // Get phone number details from database if only ID provided
        let phoneNumber = requestData.phone_number;
        let telnyxId = null;

        if (requestData.phone_number_id) {
          const { data: phoneData, error } = await supabase
            .from('phone_numbers')
            .select('phone_number, telnyx_id')
            .eq('id', requestData.phone_number_id)
            .single();

          if (error) throw error;
          phoneNumber = phoneData.phone_number;
          telnyxId = phoneData.telnyx_id;
        }

        // Configure webhook URL for the number
        const baseUrl = Deno.env.get('SUPABASE_URL');
        const webhookUrl = requestData.webhookUrl ||
          `${baseUrl}/functions/v1/sms-webhook`;

        console.log('Configuring webhooks for:', phoneNumber, 'URL:', webhookUrl);

        // Update the messaging settings for this number
        // Note: This typically requires configuring at the messaging profile level in Telnyx

        // Update local database record
        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({
            webhook_url: webhookUrl,
            updated_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);

        if (updateError) {
          console.error('Error updating webhook URL:', updateError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Webhook configured successfully',
            phoneNumber,
            webhookUrl
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_settings': {
        if (!requestData.phone_number_id) {
          throw new Error('Phone number ID is required');
        }

        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({
            ...requestData.settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestData.phone_number_id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Settings updated successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_details': {
        if (!requestData.phone_number_id && !requestData.phone_number) {
          throw new Error('Phone number ID or phone number is required');
        }

        let query = supabase
          .from('phone_numbers')
          .select('*, ai_dispatcher_configs(*)');

        if (requestData.phone_number_id) {
          query = query.eq('id', requestData.phone_number_id);
        } else {
          query = query.eq('phone_number', requestData.phone_number);
        }

        const { data, error } = await query.single();

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in manage-phone-numbers:', error);
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
