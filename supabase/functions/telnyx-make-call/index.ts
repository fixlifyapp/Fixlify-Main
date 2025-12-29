import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, from, userId, clientId } = await req.json();

    // Get configuration from environment (required)
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxConnectionId = Deno.env.get('TELNYX_CONNECTION_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY environment variable not configured');
    }

    if (!telnyxConnectionId) {
      throw new Error('TELNYX_CONNECTION_ID environment variable not configured. Set it in Supabase secrets.');
    }

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine the caller phone number
    // Priority: explicit from > organization primary > organization any > user primary > user any
    let callerNumber = from;

    if (!callerNumber && userId) {
      console.log('Fetching phone number for user:', userId);

      // Get user's organization first
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      // Priority 1: Organization's primary number
      if (profile?.organization_id) {
        const { data: orgPrimaryPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('organization_id', profile.organization_id)
          .in('status', ['active', 'purchased'])
          .eq('is_primary', true)
          .limit(1);

        if (orgPrimaryPhone && orgPrimaryPhone.length > 0) {
          callerNumber = orgPrimaryPhone[0].phone_number;
          console.log('Using organization primary phone:', callerNumber);
        }

        // Priority 2: Organization's any active number
        if (!callerNumber) {
          const { data: orgAnyPhone } = await supabase
            .from('phone_numbers')
            .select('phone_number')
            .eq('organization_id', profile.organization_id)
            .in('status', ['active', 'purchased'])
            .limit(1);

          if (orgAnyPhone && orgAnyPhone.length > 0) {
            callerNumber = orgAnyPhone[0].phone_number;
            console.log('Using organization phone (non-primary):', callerNumber);
          }
        }
      }

      // Priority 3: User's primary phone (legacy)
      if (!callerNumber) {
        const { data: userPrimaryPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', userId)
          .in('status', ['active', 'purchased'])
          .eq('is_primary', true)
          .limit(1);

        if (userPrimaryPhone && userPrimaryPhone.length > 0) {
          callerNumber = userPrimaryPhone[0].phone_number;
          console.log('Using user primary phone (legacy):', callerNumber);
        }
      }

      // Priority 4: User's any phone (legacy)
      if (!callerNumber) {
        const { data: userAnyPhone } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('user_id', userId)
          .in('status', ['active', 'purchased'])
          .limit(1);

        if (userAnyPhone && userAnyPhone.length > 0) {
          callerNumber = userAnyPhone[0].phone_number;
          console.log('Using user phone (legacy, non-primary):', callerNumber);
        }
      }
    }

    if (!callerNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No phone number available for making calls',
        suggestions: [
          'Purchase a phone number in Settings → Phone Numbers',
          'Set a primary phone number for the organization',
          'Explicitly pass a "from" phone number in the request'
        ]
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure E.164 format for phone numbers
    const toE164Number = toE164(to);
    const fromE164Number = toE164(callerNumber);

    console.log('Making call from:', fromE164Number, 'to:', toE164Number);

    // Make the call via Telnyx Call Control API
    const callResponse = await fetch('https://api.telnyx.com/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection_id: telnyxConnectionId,
        to: toE164Number,
        from: fromE164Number,
        webhook_url: `${supabaseUrl}/functions/v1/telnyx-voice-webhook`,
        webhook_url_method: 'POST',
        record: 'record-from-answer',
        record_format: 'mp3',
        record_max_length: 3600,
        billing_group_id: null,
        client_state: JSON.stringify({ userId, clientId, type: 'outbound' })
      }),
    });

    if (!callResponse.ok) {
      const error = await callResponse.text();
      throw new Error(`Telnyx API error: ${error}`);
    }

    const callData = await callResponse.json();
    console.log('Call initiated:', callData);

    // Store call record in database
    const { error: dbError } = await supabase
      .from('telnyx_calls')
      .insert({
        call_control_id: callData.data.call_control_id,
        call_leg_id: callData.data.call_leg_id,
        user_id: userId,
        client_id: clientId,
        from_number: fromE164Number,
        to_number: toE164Number,
        direction: 'outbound',
        status: 'ringing',
        started_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      callControlId: callData.data.call_control_id,
      callLegId: callData.data.call_leg_id,
      status: 'ringing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error making call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});