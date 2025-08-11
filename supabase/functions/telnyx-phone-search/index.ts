import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  areaCode?: string;
  locality?: string;
  country?: string;
  limit?: number;
  refreshFromTelnyx?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const searchRequest: SearchRequest = await req.json();
    console.log('Phone number search request:', searchRequest);    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get Telnyx credentials
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = '400197fa-ac3b-4052-8c14-6da54bf7e800'; // Your profile ID
    
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }
    
    // If refreshFromTelnyx is true, fetch from Telnyx API
    if (searchRequest.refreshFromTelnyx) {
      console.log('Fetching available numbers from Telnyx...');
      
      // First, get numbers from messaging profile
      console.log('Fetching numbers from messaging profile:', telnyxMessagingProfileId);
      
      const profileResponse = await fetch(
        `https://api.telnyx.com/v2/messaging_profiles/${telnyxMessagingProfileId}/phone_numbers?page[size]=100`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Accept': 'application/json',
          },
        }
      );      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log(`Found ${profileData.data?.length || 0} numbers in messaging profile`);
        
        // Process profile numbers
        if (profileData.data && profileData.data.length > 0) {
          for (const profileNumber of profileData.data) {
            // Check if number exists and its status
            const { data: existingNumber } = await supabase
              .from('phone_numbers')
              .select('id, status, user_id')
              .eq('phone_number', profileNumber.phone_number)
              .single();
            
            if (!existingNumber) {
              // Add new number as available
              await supabase
                .from('phone_numbers')
                .insert({
                  phone_number: profileNumber.phone_number,
                  friendly_name: 'Telnyx Number',
                  country_code: profileNumber.country_code || 'US',
                  status: 'available',
                  price: 0, // Free during beta
                  monthly_price: 0,
                  retail_price: 0,
                  retail_monthly_price: 0,
                  capabilities: {
                    sms: true,
                    voice: true,
                    mms: true
                  },
                  phone_number_type: 'local',
                  telnyx_id: profileNumber.id,
                  metadata: {
                    from_profile: true,
                    profile_id: telnyxMessagingProfileId
                  }
                });
            } else if (!existingNumber.user_id && existingNumber.status !== 'purchased') {
              // Update existing number to available if not purchased
              await supabase
                .from('phone_numbers')
                .update({
                  status: 'available',
                  price: 0,
                  monthly_price: 0,
                  retail_price: 0,
                  retail_monthly_price: 0
                })
                .eq('id', existingNumber.id);
            }
          }
        }
      }      
      // Optionally, also search for new available numbers
      if (searchRequest.areaCode || searchRequest.locality) {
        const params = new URLSearchParams({
          'filter[country_code]': searchRequest.country || 'US',
          'filter[features]': 'sms,voice',
          'filter[limit]': '10',
          'filter[best_effort]': 'false'
        });
        
        if (searchRequest.areaCode) {
          params.append('filter[national_destination_code]', searchRequest.areaCode);
        }
        
        if (searchRequest.locality) {
          params.append('filter[locality]', searchRequest.locality);
        }
        
        const searchResponse = await fetch(
          `https://api.telnyx.com/v2/available_phone_numbers?${params}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Accept': 'application/json',
            },
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log(`Found ${searchData.data?.length || 0} new available numbers`);
          
          // Store new available numbers
          if (searchData.data) {
            for (const number of searchData.data) {
              const { data: exists } = await supabase
                .from('phone_numbers')
                .select('id')
                .eq('phone_number', number.phone_number)
                .single();
              
              if (!exists) {
                await supabase
                  .from('phone_numbers')
                  .insert({
                    phone_number: number.phone_number,
                    friendly_name: `${number.locality || 'Available'} Number`,
                    country_code: number.country_code || 'US',
                    region: number.region || '',
                    locality: number.locality || '',
                    capabilities: {
                      sms: number.features?.includes('sms') || false,
                      voice: number.features?.includes('voice') || false,
                      mms: number.features?.includes('mms') || false
                    },
                    phone_number_type: number.phone_number_type || 'local',
                    status: 'available',
                    price: 0,
                    monthly_price: 0,
                    retail_price: 0,
                    retail_monthly_price: 0,
                    area_code: number.national_destination_code || '',
                    telnyx_id: number.id
                  });
              }
            }
          }
        }
      }
    }    
    // Now fetch available numbers from our database
    let query = supabase
      .from('phone_numbers')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(searchRequest.limit || 50);
    
    // Apply filters
    if (searchRequest.areaCode) {
      query = query.ilike('phone_number', `%${searchRequest.areaCode}%`);
    }
    
    if (searchRequest.locality) {
      query = query.ilike('locality', `%${searchRequest.locality}%`);
    }
    
    const { data: availableNumbers, error: fetchError } = await query;
    
    if (fetchError) {
      console.error('Error fetching numbers from database:', fetchError);
      throw fetchError;
    }
    
    // Return the available numbers
    return new Response(
      JSON.stringify({ 
        success: true, 
        numbers: availableNumbers || [],
        count: availableNumbers?.length || 0,
        message: searchRequest.refreshFromTelnyx 
          ? 'Numbers refreshed from Telnyx' 
          : 'Numbers fetched from database',
        profileId: telnyxMessagingProfileId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in phone search function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        numbers: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});