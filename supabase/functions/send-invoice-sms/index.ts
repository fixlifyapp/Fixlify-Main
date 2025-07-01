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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS Invoice request received');
    
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
    const { invoiceId, recipientPhone, message } = requestBody;

    if (!invoiceId || !recipientPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(recipientPhone);
    
    // Validate the formatted phone number
    const phoneDigits = formattedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get invoice with client info
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invoice not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const client = invoice.jobs.clients;

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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate portal access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Use hub.fixlify.app for production portal
    const portalLink = portalToken 
      ? `https://hub.fixlify.app/portal/${portalToken}`
      : `https://hub.fixlify.app/invoice/${invoice.id}`;

    // Create SMS message
    const invoiceTotal = invoice.total || 0;
    const isPaid = invoice.status === 'paid';
    
    let smsMessage;
    if (message) {
      smsMessage = message;
      // Add portal link to custom message if not already included
      if (!message.includes('/portal/')) {
        smsMessage = `${message}\n\nAccess your client portal: ${portalLink}`;
      }
    } else {
      if (isPaid) {
        smsMessage = `Hi ${client.name || 'valued customer'}! Invoice ${invoice.invoice_number} for $${invoiceTotal.toFixed(2)} has been paid. Thank you! View all documents in your portal: ${portalLink}`;
      } else {
        smsMessage = `Hi ${client.name || 'valued customer'}! Invoice ${invoice.invoice_number} for $${invoiceTotal.toFixed(2)} is ready. Pay online in your client portal: ${portalLink}`;
      }
    }

    // Send SMS via telnyx-sms function
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: formattedPhone,
        message: smsMessage,
        client_id: client.id,
        job_id: invoice.job_id,
        user_id: userData.user.id
      }
    });

    if (smsError || !smsData?.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send SMS' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Log communication
    await supabaseAdmin
      .from('invoice_communications')
      .insert({
        invoice_id: invoiceId,
        communication_type: 'sms',
        recipient: formattedPhone,
        content: smsMessage,
        status: 'sent',
        provider_message_id: smsData?.messageId,
        invoice_number: invoice.invoice_number,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
        portal_link_included: true
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsData?.messageId,
        portalLink: portalLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})