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
    // Remove the + to check digit count
    const digitsOnly = cleaned.substring(1);
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return cleaned;
    }
    // Invalid length even with +
    throw new Error(`Invalid phone number length: ${digitsOnly.length} digits. Phone numbers should be 10-15 digits.`);
  }
  
  // Remove leading zeros (common in some countries)
  cleaned = cleaned.replace(/^0+/, '');
  
  // Check different formats
  if (cleaned.length === 10) {
    // 10 digits - assume US/Canada number without country code
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // 11 digits starting with 1 - US/Canada number with country code
    return `+${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('34')) {
    // 11 digits starting with 34 - Spain number with country code
    return `+${cleaned}`;
  } else if (cleaned.length === 9 && (cleaned.startsWith('6') || cleaned.startsWith('7'))) {
    // 9 digits starting with 6 or 7 - likely Spanish mobile without country code
    return `+34${cleaned}`;
  } else if (cleaned.length >= 11 && cleaned.length <= 15) {
    // International number - add + if not present
    // Common patterns:
    // 34XXXXXXXXX (Spain - 11 digits)
    // 44XXXXXXXXXX (UK - 12 digits)
    // 49XXXXXXXXXXX (Germany - 12-13 digits)
    return `+${cleaned}`;
  } else {
    throw new Error(`Invalid phone number format. Phone should have 10-15 digits. Got ${cleaned.length} digits.`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 Telnyx SMS edge function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { recipientPhone, message, client_id, job_id, user_id } = await req.json();
    console.log('📱 SMS Request:', { recipientPhone, messageLength: message?.length });

    if (!recipientPhone || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing phone number or message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Format phone number for Telnyx with better error handling
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(recipientPhone);
      console.log('📱 Phone formatting:', { original: recipientPhone, formatted: formattedPhone });
    } catch (formatError) {
      console.error('❌ Phone formatting error:', formatError.message);
      return new Response(JSON.stringify({ 
        success: false, 
        error: formatError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get an active phone number for this user or any available one
    const { data: phoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .eq('status', 'active')
      .limit(1);

    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.error('❌ No active phone numbers found');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active phone number available. Please configure a Telnyx phone number first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const fromPhone = phoneNumbers[0].phone_number;
    console.log('📱 Using sender phone:', fromPhone);

    // Get Telnyx API key
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    // Check if API key exists
    if (!telnyxApiKey) {
      console.error('❌ TELNYX_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SMS service not configured. Please contact support.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('📱 Sending SMS from', fromPhone, 'to', formattedPhone);
    console.log('📱 Message preview:', message.substring(0, 50) + '...');
    
    // Prepare Telnyx message payload
    const telnyxPayload = {
      from: fromPhone,
      to: formattedPhone,
      text: message
    };
    
    // Add messaging profile ID if available
    const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
    if (messagingProfileId) {
      telnyxPayload.messaging_profile_id = messagingProfileId;
    }
    
    // Send SMS via Telnyx
    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telnyxPayload)
    });

    const responseText = await smsResponse.text();
    console.log('📱 Telnyx response status:', smsResponse.status);
    
    if (!smsResponse.ok) {
      console.error('❌ Telnyx SMS error:', responseText);
      
      // Parse error for better user feedback
      let errorMessage = 'SMS sending failed';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].title || errorData.errors[0].detail || errorMessage;
        }
      } catch (e) {
        errorMessage = `SMS service error: ${smsResponse.status}`;
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const smsResult = JSON.parse(responseText);
    console.log('✅ SMS sent successfully:', smsResult.data.id);

    // Log the SMS in messages table
    try {
      await supabaseAdmin.from('messages').insert({
        sender: fromPhone,
        recipient: formattedPhone,
        body: message,
        direction: 'outbound',
        status: 'sent',
        message_sid: smsResult.data.id,
        user_id: userData.user.id,
        conversation_id: null,
        client_id: client_id || null,
        job_id: job_id || null
      });
      console.log('✅ Message logged to database');
    } catch (logError) {
      console.warn('⚠️ Failed to log message:', logError);
      // Don't fail the request if logging fails
    }

    // Also log in communication_logs if we have client_id (for compatibility)
    if (client_id) {
      try {
        await supabaseAdmin
          .from('communication_logs')
          .insert({
            client_id,
            job_id,
            type: 'sms',
            direction: 'outbound',
            phone_number: formattedPhone,
            message: message,
            status: 'sent',
            telnyx_message_id: smsResult.data?.id,
            metadata: { telnyx_response: smsResult }
          });
      } catch (logErr) {
        console.warn('⚠️ Failed to log to communication_logs:', logErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: smsResult.data.id,
      from: fromPhone,
      to: formattedPhone,
      formattedPhone: formattedPhone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in telnyx-sms:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
