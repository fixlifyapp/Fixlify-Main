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
    let supabase = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    
    // Get Telnyx configuration from environment
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
    
    // Determine the sender phone number
    let fromPhone = smsRequest.from;
    
    // If no sender provided, fetch user's primary Telnyx phone number
    if (!fromPhone && smsRequest.user_id && supabase) {
      console.log('Fetching user phone number for user:', smsRequest.user_id);
      
      const { data: phoneNumbers } = await supabase
        .from('phone_numbers')
        .select('phone_number')
        .eq('user_id', smsRequest.user_id)
        .eq('status', 'purchased')
        .eq('is_primary', true)
        .limit(1);
      
      if (phoneNumbers && phoneNumbers.length > 0) {
        fromPhone = phoneNumbers[0].phone_number;
        console.log('Using user\'s primary phone number:', fromPhone);
      } else {
        // Fallback: get any purchased number for this user
        const { data: anyPhoneNumbers } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', smsRequest.user_id)
          .eq('status', 'purchased')
          .limit(1);
        
        if (anyPhoneNumbers && anyPhoneNumbers.length > 0) {
          fromPhone = anyPhoneNumbers[0].phone_number;
          console.log('Using user\'s phone number (non-primary):', fromPhone);
        }
      }
    }
    
    // If still no phone number, return error
    if (!fromPhone) {
      console.error('No phone number found for user:', smsRequest.user_id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No phone number configured for SMS sending. Please purchase a phone number first.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if Telnyx is configured
    const isTelnyxConfigured = telnyxApiKey && telnyxMessagingProfileId;
    
    if (isTelnyxConfigured) {
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
          webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-webhook`,
          webhook_failover_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-webhook`,
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
      if (supabase) {
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
        } catch (logError) {
          console.error('Failed to log SMS:', logError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: telnyxResult.data?.id,
          from: fromPhone,
          to: smsRequest.recipientPhone,
          status: 'sent'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
      
    } else {
      // Telnyx not configured - simulate SMS for testing
      console.log('WARNING: Telnyx not configured, simulating SMS send');
      console.log('From:', fromPhone, 'To:', smsRequest.recipientPhone);
      console.log('Message:', smsRequest.message);
      
      const simulatedId = `sim-${Date.now()}`;
      
      // Log the simulated SMS
      if (supabase) {
        try {
          await supabase
            .from('communication_logs')
            .insert({
              user_id: smsRequest.user_id || '00000000-0000-0000-0000-000000000000',
              type: 'sms',
              direction: 'outbound',
              status: 'simulated',
              from_address: fromPhone,
              to_address: smsRequest.recipientPhone,
              content: smsRequest.message,
              metadata: {
                ...smsRequest.metadata,
                simulated: true,
                simulated_id: simulatedId
              }
            });
        } catch (logError) {
          console.error('Failed to log simulated SMS:', logError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: simulatedId,
          from: fromPhone,
          to: smsRequest.recipientPhone,
          status: 'simulated',
          warning: 'Telnyx not configured - SMS simulated only'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
  } catch (error) {
    console.error('Error in telnyx-sms function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
