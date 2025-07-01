import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { corsHeaders } from './cors.ts'

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Handle different number formats
  if (cleaned.length === 10) {
    // North American number without country code - add +1
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // North American number with 1 prefix - add +
    return `+${cleaned}`;
  } else if (cleaned.length > 10 && !cleaned.startsWith('1')) {
    // International number - just add +
    return `+${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    // Already has + prefix
    return cleaned;
  } else {
    // Default: assume it needs + prefix
    return `+${cleaned}`;
  }
}

serve(async (req) => {
  // THIS MUST BE FIRST - Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS Estimate request received');
    console.log('📱 Request method:', req.method);
    console.log('📱 Request headers:', Object.fromEntries(req.headers.entries()));
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('❌ Failed to authenticate user:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid authentication token'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('✅ User authenticated:', userData.user.id);

    let requestBody;
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('📱 Request body received:', { estimateId: requestBody.estimateId, recipientPhone: requestBody.recipientPhone });
    
    const { estimateId, recipientPhone, message } = requestBody;

    if (!estimateId || !recipientPhone) {
      console.error('❌ Missing required fields:', { estimateId: !!estimateId, recipientPhone: !!recipientPhone });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: estimateId and recipientPhone'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('🔍 Processing SMS for estimate:', estimateId, 'to phone:', recipientPhone);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(recipientPhone);
    console.log('📱 Original phone:', recipientPhone);
    console.log('📱 Formatted phone:', formattedPhone);

    // Validate the formatted phone number
    const phoneDigits = formattedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      console.error('❌ Invalid phone number format:', recipientPhone);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid phone number format. Please enter a valid 10-digit phone number.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

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
      console.error('❌ Estimate lookup error:', estimateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Estimate not found: ${estimateError?.message || 'Unknown error'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('✅ Estimate found:', estimate.estimate_number);

    const client = estimate.jobs.clients;

    // Generate portal access token
    console.log('🔄 Generating portal access token...');
    
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
      console.error('❌ Failed to generate portal token:', portalError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to generate portal access token: ${portalError?.message || 'Unknown error'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('✅ Portal access token generated');

    // Use the full client portal URL
    const baseUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080';
    const portalLink = `${baseUrl}/portal/${portalToken}`;

    // Create SMS message with portal link
    const estimateTotal = estimate.total || 0;
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (!message.includes('/portal/')) {
        smsMessage = `${message}\n\nAccess your client portal: ${portalLink}`;
      }
    } else {
      smsMessage = `Hi ${client.name || 'valued customer'}! Your estimate ${estimate.estimate_number} for $${estimateTotal.toFixed(2)} is ready. Access your client portal to view all documents: ${portalLink}`;
    }

    console.log('📱 SMS message prepared, length:', smsMessage.length);

    // Use telnyx-sms function for sending with formatted phone
    console.log('🔄 Calling telnyx-sms function...');
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: formattedPhone, // Use the formatted phone number
        message: smsMessage,
        client_id: client.id,
        job_id: estimate.job_id,
        user_id: userData.user.id
      }
    });

    console.log('📱 Telnyx-sms response:', { success: smsData?.success, error: smsError });

    if (smsError) {
      console.error('❌ Error from telnyx-sms:', smsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SMS service error: ${smsError.message || 'Failed to send SMS'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!smsData?.success) {
      console.error('❌ SMS sending failed:', smsData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SMS sending failed: ${smsData?.error || 'Unknown error'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Log SMS communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'sms',
          recipient: formattedPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: smsData?.messageId,
          estimate_number: estimate.estimate_number,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone,
          portal_link_included: true
        });
      console.log('✅ SMS communication logged successfully');
    } catch (logError) {
      console.warn('⚠️ Failed to log communication:', logError);
    }

    console.log('✅ SMS sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsData?.messageId,
        portalLink: portalLink,
        smsContent: smsMessage,
        formattedPhone: formattedPhone
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in send-estimate-sms function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})