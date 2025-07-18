import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      console.error('TELNYX_API_KEY environment variable is not set');
      throw new Error('SMS service not configured. Please contact support.');
    }
    
    // Debug: Log API key info (safely)
    console.log('API Key length:', telnyxApiKey.length);
    console.log('API Key starts with:', telnyxApiKey.substring(0, 3));
    console.log('API Key has spaces:', telnyxApiKey !== telnyxApiKey.trim());

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { recipientPhone, message, user_id, metadata } = await req.json();
    if (!recipientPhone || !message) {
      throw new Error('Missing required fields: recipientPhone and message');
    }

    // Get user's phone number from phone_numbers table
    let fromPhone = null;
    if (user_id) {
      const { data: phoneData } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('user_id', user_id)
        .eq('is_primary', true)
        .single();
      
      if (phoneData) {
        fromPhone = phoneData.phone_number;
      }
    }

    if (!fromPhone) {
      // If no primary phone, try to get any phone for this user
      if (user_id) {
        const { data: anyUserPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', user_id)
          .limit(1)
          .single();
          
        if (anyUserPhone) {
          fromPhone = anyUserPhone.phone_number;
        }
      }
      
      // If still no phone, return error
      if (!fromPhone) {
        throw new Error('No phone number configured. Please add a phone number in Settings.');
      }
    }

    console.log(`Sending SMS from ${fromPhone} to ${recipientPhone}`);

    // Clean the API key just in case
    const cleanApiKey = telnyxApiKey.trim();
    
    // Send SMS via Telnyx
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromPhone,
        to: recipientPhone,
        text: message,
        messaging_profile_id: Deno.env.get('TELNYX_MESSAGING_PROFILE_ID'),
      }),
    });

    const responseText = await telnyxResponse.text();
    console.log('Telnyx response:', telnyxResponse.status, responseText);

    if (!telnyxResponse.ok) {
      console.error('Telnyx error:', responseText);
      throw new Error(`Telnyx API error: ${responseText}`);
    }

    const telnyxResult = JSON.parse(responseText);

    // Log to database
    try {
      await supabase.from('communication_logs').insert({
        user_id: user_id,
        communication_type: 'sms',
        recipient: recipientPhone,
        content: message,
        status: 'sent',
        from_number: fromPhone,
        external_id: telnyxResult.data?.id,
        metadata: {
          telnyx_id: telnyxResult.data?.id,
          ...metadata
        }
      });
    } catch (logError) {
      console.error('Failed to log SMS:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: telnyxResult.data?.id,
        from: fromPhone,
        to: recipientPhone
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in telnyx-sms function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('API_KEY') ? 500 : 400,
      }
    );
  }
});