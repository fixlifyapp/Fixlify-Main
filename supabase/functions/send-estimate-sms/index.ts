
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to format phone numbers for Telnyx
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has + at the beginning, validate and return
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.substring(1);
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return cleaned;
    }
    throw new Error(`Invalid phone number length: ${digitsOnly.length} digits`);
  }
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // Handle different formats
  if (cleaned.length === 10) {
    // US/Canada number without country code
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US/Canada number with country code
    return `+${cleaned}`;
  } else if (cleaned.length >= 11 && cleaned.length <= 15) {
    // International number
    return `+${cleaned}`;
  } else {
    throw new Error(`Invalid phone number format. Expected 10-15 digits, got ${cleaned.length}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS Estimate request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const requestBody = await req.json()
    const { estimateId, recipientPhone, message } = requestBody;

    if (!estimateId || !recipientPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing estimate SMS:', { estimateId, recipientPhone });

    // Format the phone number
    const formattedPhone = formatPhoneNumber(recipientPhone);
    
    // Get estimate with client info
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs!inner(
          id,
          client_id,
          clients!inner(
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      console.error('Estimate not found:', estimateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Estimate not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const client = estimate.jobs.clients;

    // Generate portal access token
    const { data: portalToken, error: portalError } = await supabaseAdmin
      .rpc('generate_portal_access', {
        p_client_id: client.id,
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: true,
          view_jobs: true
        },
        p_hours_valid: 72
      });

    if (portalError || !portalToken) {
      console.error('Portal token generation failed:', portalError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate portal access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const portalLink = `https://hub.fixlify.app/portal/${portalToken}`;

    // Create SMS message
    const estimateTotal = estimate.total || 0;
    
    let smsMessage;
    if (message?.trim()) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (!message.includes('/portal/')) {
        smsMessage = `${message}\n\nView your estimate: ${portalLink}`;
      }
    } else {
      smsMessage = `Hi ${client.name || 'valued customer'}! Your estimate ${estimate.estimate_number} for $${estimateTotal.toFixed(2)} is ready. View and approve it here: ${portalLink}`;
    }

    // Get active phone number for sending
    const { data: phoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active')
      .eq('user_id', userData.user.id)
      .limit(1);

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active phone number found. Please configure a Telnyx phone number first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const fromPhone = phoneNumbers[0].phone_number;
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');

    if (!telnyxApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Telnyx API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Sending SMS via Telnyx...');

    // Send SMS via Telnyx API directly
    const telnyxPayload = {
      from: fromPhone,
      to: formattedPhone,
      text: smsMessage
    };

    const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
    if (messagingProfileId) {
      telnyxPayload.messaging_profile_id = messagingProfileId;
    }

    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telnyxPayload)
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error('Telnyx SMS error:', smsResult);
      throw new Error(smsResult.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }

    console.log('SMS sent successfully:', smsResult.data?.id);

    // Log communication
    await supabaseAdmin
      .from('estimate_communications')
      .insert({
        estimate_id: estimateId,
        communication_type: 'sms',
        recipient: formattedPhone,
        content: smsMessage,
        status: 'sent',
        provider_message_id: smsResult?.data?.id,
        estimate_number: estimate.estimate_number,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
        portal_link_included: true
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsResult?.data?.id,
        portalLink: portalLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in send-estimate-sms:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
