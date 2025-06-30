
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

    const { invoiceId, recipientEmail, customMessage } = await req.json();

    if (!invoiceId || !recipientEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get invoice details
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
      return new Response(JSON.stringify({ success: false, error: 'Invoice not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const client = invoice.jobs.clients;

    // Generate portal access token
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
      return new Response(JSON.stringify({ success: false, error: 'Failed to generate portal access' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const portalLink = `https://hub.fixlify.app/portal/${portalToken}`;

    // Get company settings
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('company_name, company_email')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';
    const fromEmail = companySettings?.company_email || `${companyName.toLowerCase().replace(/\s+/g, '')}@fixlify.app`;

    // Prepare email content
    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);
    const subject = `Your Invoice ${invoice.invoice_number} from ${companyName}`;
    
    let emailContent;
    if (customMessage) {
      emailContent = `${customMessage}<br><br><a href="${portalLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Invoice</a>`;
    } else {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Invoice is Ready!</h2>
          <p>Hi ${client.name || 'valued customer'},</p>
          <p>Your invoice ${invoice.invoice_number} from ${companyName} is ready for review.</p>
          <p><strong>Amount Due: $${amountDue.toFixed(2)}</strong></p>
          <p style="margin: 30px 0;">
            <a href="${portalLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Invoice</a>
          </p>
          <p>Best regards,<br>${companyName}</p>
        </div>
      `;
    }

    // Send email via Mailgun
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = 'fixlify.app';

    const formData = new FormData();
    formData.append('from', `${companyName} <${fromEmail}>`);
    formData.append('to', recipientEmail);
    formData.append('subject', subject);
    formData.append('html', emailContent);
    formData.append('o:tracking', 'yes');

    const mailgunResponse = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
      },
      body: formData
    });

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      return new Response(JSON.stringify({ success: false, error: `Email failed: ${error}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const mailgunResult = await mailgunResponse.json();

    // Log communication
    await supabaseAdmin.from('invoice_communications').insert({
      invoice_id: invoiceId,
      communication_type: 'email',
      recipient: recipientEmail,
      content: emailContent,
      status: 'sent',
      provider_message_id: mailgunResult.id,
      invoice_number: invoice.invoice_number,
      client_name: client.name,
      client_email: client.email,
      portal_link_included: true
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: mailgunResult.id,
      portalLink: portalLink
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-invoice:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
