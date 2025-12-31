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

// Convert phone number to E.164 format (+1XXXXXXXXXX)
function toE164(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // If already in E.164 format
  if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
    return phoneNumber;
  }

  const cleaned = phoneNumber.replace(/\D/g, '');

  // Handle 10-digit numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Handle 11-digit numbers starting with 1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // Return as-is if already has country code
  if (cleaned.length > 11) {
    return `+${cleaned}`;
  }

  return phoneNumber;
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
    
    // Get Telnyx configuration from environment (required)
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');

    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY environment variable not configured');
    }

    if (!telnyxMessagingProfileId) {
      throw new Error('TELNYX_MESSAGING_PROFILE_ID environment variable not configured. Set it in Supabase secrets.');
    }
    
    // Determine the sender phone number with detailed tracking for error reporting
    // Priority: explicit from > organization primary > organization any > user primary > user any
    let fromPhone = smsRequest.from;
    let userPhoneFound = false;
    let orgPhoneFound = false;
    let profileHasOrg = false;

    // If no sender provided, fetch organization's primary phone number first (new priority)
    if (!fromPhone && smsRequest.user_id) {
      console.log('Fetching phone number for user:', smsRequest.user_id);

      // Get user's organization first
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', smsRequest.user_id)
        .single();

      profileHasOrg = !!profile?.organization_id;

      // Priority 1: Organization's primary number (pool_status = 'assigned')
      if (profile?.organization_id) {
        const { data: orgPrimaryPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('organization_id', profile.organization_id)
          .in('status', ['active', 'purchased'])
          .eq('is_primary', true)
          .limit(1);

        if (orgPrimaryPhone && orgPrimaryPhone.length > 0) {
          fromPhone = orgPrimaryPhone[0].phone_number;
          orgPhoneFound = true;
          console.log('Using organization\'s primary phone number:', fromPhone);
        }

        // Priority 2: Organization's any active number
        if (!fromPhone) {
          const { data: orgAnyPhone } = await supabase
            .from('phone_numbers')
            .select('phone_number')
            .eq('organization_id', profile.organization_id)
            .in('status', ['active', 'purchased'])
            .limit(1);

          if (orgAnyPhone && orgAnyPhone.length > 0) {
            fromPhone = orgAnyPhone[0].phone_number;
            orgPhoneFound = true;
            console.log('Using organization\'s phone number (non-primary):', fromPhone);
          }
        }
      }

      // Priority 3: User's primary phone number (legacy support)
      if (!fromPhone) {
        const { data: userPrimaryPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', smsRequest.user_id)
          .in('status', ['active', 'purchased'])
          .eq('is_primary', true)
          .limit(1);

        if (userPrimaryPhone && userPrimaryPhone.length > 0) {
          fromPhone = userPrimaryPhone[0].phone_number;
          userPhoneFound = true;
          console.log('Using user\'s primary phone number (legacy):', fromPhone);
        }
      }

      // Priority 4: User's any phone number (legacy support)
      if (!fromPhone) {
        const { data: userAnyPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', smsRequest.user_id)
          .in('status', ['active', 'purchased'])
          .limit(1);

        if (userAnyPhone && userAnyPhone.length > 0) {
          fromPhone = userAnyPhone[0].phone_number;
          userPhoneFound = true;
          console.log('Using user\'s phone number (legacy, non-primary):', fromPhone);
        }
      }
    }

    // If still no phone number, return detailed error with suggestions
    if (!fromPhone) {
      console.error('No phone number found for user:', smsRequest.user_id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No phone number available for sending SMS',
          user_id: smsRequest.user_id,
          suggestions: [
            'Purchase a phone number in Settings → Phone Numbers',
            'Set a primary phone number for the organization',
            'Explicitly pass a "from" phone number in the request'
          ],
          debug: {
            user_phone_found: userPhoneFound,
            org_phone_found: orgPhoneFound,
            profile_has_org: profileHasOrg
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Ensure E.164 format for phone numbers
    const fromE164 = toE164(fromPhone);
    const toE164Number = toE164(smsRequest.recipientPhone);

    console.log('Sending SMS via Telnyx API');
    console.log('From:', fromE164, 'To:', toE164Number);

    // Send SMS via Telnyx API
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromE164,
        to: toE164Number,
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
          from_address: fromE164,
          to_address: toE164Number,
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
        from: fromE164,
        to: toE164Number
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
        status: 400, // Return proper error status
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});