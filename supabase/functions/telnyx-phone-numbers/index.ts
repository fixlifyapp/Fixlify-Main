import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhoneNumbersRequest {
  action: 'list' | 'get_config' | 'search' | 'purchase' | 'release' | 'list_available_from_telnyx' | 'test_telnyx_connection';
  phoneNumber?: string;
  areaCode?: string;
  locality?: string;
  country?: string;
  limit?: number;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PhoneNumbersRequest = await req.json();
    const { action } = requestData;

    console.log('telnyx-phone-numbers action:', action, requestData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Telnyx credentials
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID') || '400197fa-ac3b-4052-8c14-6da54bf7e800';

    switch (action) {
      case 'list': {
        // List all phone numbers from database
        const { data: numbers, error } = await supabase
          .from('phone_numbers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            numbers: numbers || [],
            count: numbers?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_config': {
        // Get Telnyx configuration status
        const isConfigured = !!telnyxApiKey;

        return new Response(
          JSON.stringify({
            success: true,
            configured: isConfigured,
            profileId: telnyxMessagingProfileId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test_telnyx_connection': {
        if (!telnyxApiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Telnyx API key not configured'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test Telnyx API connection
        const response = await fetch('https://api.telnyx.com/v2/balance', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to connect to Telnyx API');
        }

        const balanceData = await response.json();

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Telnyx connection successful',
            balance: balanceData.data?.balance
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_available_from_telnyx': {
        if (!telnyxApiKey) {
          throw new Error('Telnyx API key not configured');
        }

        // Fetch numbers from Telnyx messaging profile
        const response = await fetch(
          `https://api.telnyx.com/v2/messaging_profiles/${telnyxMessagingProfileId}/phone_numbers?page[size]=100`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch numbers from Telnyx');
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

      case 'search': {
        if (!telnyxApiKey) {
          throw new Error('Telnyx API key not configured');
        }

        const params = new URLSearchParams({
          'filter[country_code]': requestData.country || 'US',
          'filter[features]': 'sms,voice',
          'filter[limit]': String(requestData.limit || 10),
          'filter[best_effort]': 'false'
        });

        if (requestData.areaCode) {
          params.append('filter[national_destination_code]', requestData.areaCode);
        }

        if (requestData.locality) {
          params.append('filter[locality]', requestData.locality);
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

      case 'purchase': {
        if (!telnyxApiKey) {
          throw new Error('Telnyx API key not configured');
        }

        if (!requestData.phoneNumber) {
          throw new Error('Phone number is required');
        }

        // Order the phone number
        const orderResponse = await fetch(
          'https://api.telnyx.com/v2/number_orders',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone_numbers: [{
                phone_number: requestData.phoneNumber
              }],
              messaging_profile_id: telnyxMessagingProfileId
            })
          }
        );

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.errors?.[0]?.detail || 'Failed to purchase number');
        }

        // Save to database
        const { error: insertError } = await supabase
          .from('phone_numbers')
          .insert({
            phone_number: requestData.phoneNumber,
            friendly_name: 'Purchased Number',
            status: 'purchased',
            user_id: requestData.userId,
            purchased_by: requestData.userId,
            purchased_at: new Date().toISOString(),
            is_active: true,
            capabilities: { sms: true, voice: true, mms: true },
            phone_number_type: 'local',
            country_code: 'US'
          });

        if (insertError) {
          console.error('Error saving number to database:', insertError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Phone number purchased successfully',
            phoneNumber: requestData.phoneNumber
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'release': {
        if (!requestData.phoneNumber) {
          throw new Error('Phone number is required');
        }

        // Update database to mark as released
        const { error: updateError } = await supabase
          .from('phone_numbers')
          .update({
            status: 'released',
            user_id: null,
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('phone_number', requestData.phoneNumber);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Phone number released successfully',
            phoneNumber: requestData.phoneNumber
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in telnyx-phone-numbers:', error);
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
