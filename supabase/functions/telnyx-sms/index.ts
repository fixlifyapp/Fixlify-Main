
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { recipientPhone, message, client_id, job_id, user_id } = await req.json();

    if (!recipientPhone || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing phone number or message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Format phone number for Telnyx (ensure +1 prefix for US numbers)
    let formattedPhone = recipientPhone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Get an active phone number for this user or any available one
    const { data: phoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .eq('status', 'active')
      .limit(1);

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active phone number available. Please configure a Telnyx phone number first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const fromPhone = phoneNumbers[0].phone_number;

    // Send SMS via Telnyx
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    const smsResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromPhone,
        to: formattedPhone,
        text: message,
        messaging_profile_id: Deno.env.get('TELNYX_MESSAGING_PROFILE_ID')
      })
    });

    if (!smsResponse.ok) {
      const error = await smsResponse.text();
      console.error('Telnyx SMS error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `SMS failed: ${error}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const smsResult = await smsResponse.json();

    // Log the SMS
    await supabaseAdmin.from('messages').insert({
      from: fromPhone,
      to: formattedPhone,
      content: message,
      direction: 'outbound',
      status: 'sent',
      provider_message_id: smsResult.data.id,
      user_id: userData.user.id,
      client_id: client_id,
      job_id: job_id,
      phone_number_id: phoneNumbers[0].id
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: smsResult.data.id,
      from: fromPhone,
      to: formattedPhone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in telnyx-sms:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
