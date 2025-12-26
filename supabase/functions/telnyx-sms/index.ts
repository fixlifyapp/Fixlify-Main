import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  recipientPhone: string;
  message: string;
  from?: string; // Optional, will be auto-selected if not provided
  user_id?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const smsRequest: SMSRequest = await req.json();
    console.log('Received SMS request:', smsRequest);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get Telnyx configuration from environment
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
    
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }
    
    // Determine the sender phone number
    let fromPhone = smsRequest.from;
    
    // If no sender provided, fetch user's primary phone number
    if (!fromPhone && smsRequest.user_id) {
      console.log('Fetching user phone number for user:', smsRequest.user_id);
      
      // First try to get primary phone number (check both 'active' and 'purchased' status)
      const { data: phoneNumbers } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('user_id', smsRequest.user_id)
        .in('status', ['active', 'purchased'])
        .eq('is_primary', true)
        .limit(1);
      
      if (phoneNumbers && phoneNumbers.length > 0) {
        fromPhone = phoneNumbers[0].phone_number;
        console.log('Using user\'s primary phone number:', fromPhone);
      } else {
        // Fallback: get any active/purchased number for this user
        const { data: anyPhoneNumbers } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', smsRequest.user_id)
          .in('status', ['active', 'purchased'])
          .limit(1);
        
        if (anyPhoneNumbers && anyPhoneNumbers.length > 0) {
          fromPhone = anyPhoneNumbers[0].phone_number;
          console.log('Using user\'s phone number (non-primary):', fromPhone);
        }
      }
    }
    
    // If still no phone number, check if organization has a default number
    if (!fromPhone && smsRequest.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', smsRequest.user_id)
        .single();
      
      if (profile?.organization_id) {
        const { data: orgPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('organization_id', profile.organization_id)
          .in('status', ['active', 'purchased'])
          .eq('is_primary', true)
          .limit(1);
        
        if (orgPhone && orgPhone.length > 0) {
          fromPhone = orgPhone[0].phone_number;
          console.log('Using organization\'s phone number:', fromPhone);
        }
      }
    }
    
    // If still no phone number, return error with helpful message
    if (!fromPhone) {
      console.error('No phone number found for user:', smsRequest.user_id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No phone number configured. Please purchase a phone number in Settings → Phone Numbers.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Sending SMS via Telnyx API');
    console.log('From:', fromPhone, 'To:', smsRequest.recipientPhone);
    
    // Send SMS via Telnyx API
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromPhone,
        to: smsRequest.recipientPhone,
        text: smsRequest.message,
        messaging_profile_id: telnyxMessagingProfileId,
        webhook_url: `${supabaseUrl}/functions/v1/telnyx-webhook`,
        webhook_failover_url: `${supabaseUrl}/functions/v1/telnyx-webhook`,
        use_profile_webhooks: false
      }),
    });
    
    const telnyxResult = await telnyxResponse.json();
    
    if (!telnyxResponse.ok) {
      console.error('Telnyx API error:', telnyxResult);
      throw new Error(telnyxResult.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }
    
    console.log('SMS sent successfully via Telnyx:', telnyxResult.data?.id);
    
    // Log the SMS in database
    try {
      await supabase
        .from('communication_logs')
        .insert({
          user_id: smsRequest.user_id || '00000000-0000-0000-0000-000000000000',
          type: 'sms',
          direction: 'outbound',
          status: 'sent',
          from_address: fromPhone,
          to_address: smsRequest.recipientPhone,
          content: smsRequest.message,
          metadata: {
            ...smsRequest.metadata,
            telnyx_message_id: telnyxResult.data?.id,
            messaging_profile_id: telnyxMessagingProfileId
          }
        });
      
      console.log('SMS logged in database');
    } catch (dbError) {
      console.error('Failed to log SMS in database:', dbError);
      // Don't fail the request if logging fails
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: telnyxResult.data?.id,
        from: fromPhone,
        to: smsRequest.recipientPhone
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in telnyx-sms function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 200, // Return 200 so caller can read error body
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});