import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  phoneNumber: string;
  userId: string;
  telnyxId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const purchaseRequest: PurchaseRequest = await req.json();
    console.log('Phone purchase request:', purchaseRequest);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);    
    // Get Telnyx credentials
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = '400197fa-ac3b-4052-8c14-6da54bf7e800';
    
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }
    
    // Check if number is already in our messaging profile
    const profileCheckResponse = await fetch(
      `https://api.telnyx.com/v2/messaging_profiles/${telnyxMessagingProfileId}/phone_numbers?filter[phone_number]=${purchaseRequest.phoneNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Accept': 'application/json',
        },
      }
    );
    
    let numberInProfile = false;
    if (profileCheckResponse.ok) {
      const profileData = await profileCheckResponse.json();
      numberInProfile = profileData.data && profileData.data.length > 0;
    }
    
    // If number is not in profile and has telnyxId, try to purchase it first
    if (!numberInProfile && purchaseRequest.telnyxId) {
      console.log('Purchasing number from Telnyx:', purchaseRequest.phoneNumber);
      
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
              phone_number: purchaseRequest.phoneNumber
            }],
            messaging_profile_id: telnyxMessagingProfileId,
            connection_id: '2709100729850660858' // Your connection ID
          })
        }
      );
      
      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        console.error('Failed to purchase number:', error);
        // Continue anyway - number might already be owned
      }
    }    
    // If number is in profile or was just purchased, assign to user
    // Update database to mark as purchased
    const { data: phoneRecord, error: fetchError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('phone_number', purchaseRequest.phoneNumber)
      .single();
    
    if (fetchError || !phoneRecord) {
      // Create record if doesn't exist
      const { error: insertError } = await supabase
        .from('phone_numbers')
        .insert({
          phone_number: purchaseRequest.phoneNumber,
          friendly_name: `My Number`,
          status: 'purchased',
          purchased_by: purchaseRequest.userId,
          user_id: purchaseRequest.userId,
          purchased_at: new Date().toISOString(),
          is_primary: false,
          is_active: true,
          ai_dispatcher_enabled: false,
          capabilities: {
            sms: true,
            voice: true,
            mms: true
          },
          phone_number_type: 'local',
          price: 0,
          monthly_price: 0,
          country_code: 'US',
          telnyx_id: purchaseRequest.telnyxId,
          metadata: {
            profile_id: telnyxMessagingProfileId
          }
        });
      
      if (insertError) {
        throw insertError;
      }
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          status: 'purchased',
          purchased_by: purchaseRequest.userId,
          user_id: purchaseRequest.userId,
          purchased_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', phoneRecord.id);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    // Check if user has any primary number
    const { data: primaryCheck } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('user_id', purchaseRequest.userId)
      .eq('is_primary', true)
      .single();
    
    if (!primaryCheck) {
      // Set this as primary if user has no primary number
      await supabase
        .from('phone_numbers')
        .update({ is_primary: true })
        .eq('phone_number', purchaseRequest.phoneNumber)
        .eq('user_id', purchaseRequest.userId);
    }
    
    // Log the purchase
    await supabase
      .from('communication_logs')
      .insert({
        user_id: purchaseRequest.userId,
        type: 'system',
        direction: 'internal',
        status: 'completed',
        content: `Phone number ${purchaseRequest.phoneNumber} assigned to user`,
        metadata: {
          phone_number: purchaseRequest.phoneNumber,
          action: 'purchase',
          profile_id: telnyxMessagingProfileId
        }
      });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number successfully assigned',
        phoneNumber: purchaseRequest.phoneNumber
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in phone purchase function:', error);
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