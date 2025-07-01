import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // THIS MUST BE FIRST - Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS Invoice request received');
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

    console.log('📱 Request body received:', { invoiceId: requestBody.invoiceId, recipientPhone: requestBody.recipientPhone });
    
    const { invoiceId, recipientPhone, message } = requestBody;

    if (!invoiceId || !recipientPhone) {
      console.error('❌ Missing required fields:', { invoiceId: !!invoiceId, recipientPhone: !!recipientPhone });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: invoiceId and recipientPhone'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('🔍 Processing SMS for invoice:', invoiceId, 'to phone:', recipientPhone);

    // Validate phone number format
    const cleanedPhone = recipientPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
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

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
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
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('❌ Invoice lookup error:', invoiceError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invoice not found: ${invoiceError?.message || 'Unknown error'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('✅ Invoice found:', invoice.invoice_number);

    const client = invoice.jobs.clients;

    // Generate portal access token instead of approval token
    console.log('🔄 Generating portal access token...');
    
    const { data: portalToken, error: portalError } = await supabaseAdmin
      .rpc('generate_portal_access', {
        p_client_id: client.id,
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        },
        p_hours_valid: 72,
        p_domain_restriction: 'hub.fixlify.app'
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

    console.log('✅ Portal access token generated:', portalToken);

    const portalLink = `https://hub.fixlify.app/portal/${portalToken}`;
    console.log('🔗 Portal link:', portalLink);

    // Get company settings for branding
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('company_name')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';

    // Create SMS message with portal link
    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (!message.includes('hub.fixlify.app/portal/')) {
        smsMessage = `${message}\n\nView your invoice: ${portalLink}`;
      }
    } else {
      smsMessage = `Hi ${client.name || 'valued customer'}! Your invoice ${invoice.invoice_number} from ${companyName} is ready. Amount Due: $${amountDue.toFixed(2)}. View your invoice: ${portalLink}`;
    }

    console.log('📱 SMS message prepared, length:', smsMessage.length);

    // Use telnyx-sms function for sending
    console.log('🔄 Calling telnyx-sms function...');
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: smsMessage,
        client_id: client.id,
        job_id: invoice.job_id,
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
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'sms',
          recipient: recipientPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: smsData?.messageId,
          invoice_number: invoice.invoice_number,
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
        smsContent: smsMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in send-invoice-sms function:', error);
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
