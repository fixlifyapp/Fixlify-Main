import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN') || 'mg.fixlify.com';
    
    if (!mailgunApiKey) {
      throw new Error('MAILGUN_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { invoiceId, sendToClient, customMessage } = await req.json();

    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    // Fetch invoice data with separate queries to avoid nested query issues
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    // Fetch job data if job_id exists
    let job = null;
    if (invoice.job_id) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', invoice.job_id)
        .maybeSingle();
      
      if (!jobError && jobData) {
        job = jobData;
      }
    }

    // Fetch client data
    let client = null;
    const clientId = invoice.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (!clientError && clientData) {
        client = clientData;
      }
    }

    // Check for email in multiple places
    const clientEmail = client?.email || invoice.client_email || invoice.email;
    const clientName = client?.name || invoice.client_name || 'Valued Customer';
    const clientPhone = client?.phone || invoice.client_phone || '';

    if (!clientEmail) {
      console.error('No email found. Checked:', {
        clientEmail: client?.email,
        invoiceClientEmail: invoice.client_email,
        invoiceEmail: invoice.email,
        clientId: clientId,
        hasClient: !!client
      });
      throw new Error('Client email not found');
    }

    // Get company info from the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, phone')
      .eq('id', invoice.user_id)
      .single();

    const companyName = profile?.company_name || 'Fixlify Services';
    const portalUrl = `${req.headers.get('origin') || 'https://app.fixlify.com'}/invoice/${invoiceId}`;

    // Prepare email content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoice.invoice_number}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
      .button { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #22c55e; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${companyName}</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Invoice Ready for Payment</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello ${clientName},</h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Your invoice is ready for review. Please find the details below:
              </p>
              
              <!-- Invoice Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding-bottom: 5px;">Invoice Number:</td>
                        <td align="right" style="color: #333333; font-size: 14px; font-weight: bold; padding-bottom: 5px;">#${invoice.invoice_number}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding-bottom: 5px;">Amount Due:</td>
                        <td align="right" style="color: #22c55e; font-size: 20px; font-weight: bold; padding-bottom: 5px;">$${(invoice.total || 0).toFixed(2)}</td>
                      </tr>
                      ${invoice.due_date ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Due Date:</td>
                        <td align="right" style="color: #333333; font-size: 14px;">${new Date(invoice.due_date).toLocaleDateString()}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              ${customMessage ? `
              <div style="background-color: #e7f5ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">${customMessage}</p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" class="button" style="display: inline-block; padding: 16px 32px; background-color: #22c55e; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">View & Pay Invoice</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; text-align: center;">
                Or copy this link: <a href="${portalUrl}" style="color: #22c55e;">${portalUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                Thank you for your business!
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                ${companyName}<br>
                ${profile?.phone || 'Contact us for assistance'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `Invoice #${invoice.invoice_number} - ${companyName}

Hello ${clientName},

Your invoice is ready for review.

Invoice Details:
- Invoice Number: #${invoice.invoice_number}
- Amount Due: $${(invoice.total || 0).toFixed(2)}
${invoice.due_date ? `- Due Date: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}

${customMessage || ''}

View and pay your invoice: ${portalUrl}

Thank you for your business!

${companyName}
${profile?.phone || ''}`;

    // Send email via Mailgun
    const form = new FormData();
    form.append('from', `${companyName} <noreply@${mailgunDomain}>`);
    form.append('to', clientEmail);
    form.append('subject', `Invoice #${invoice.invoice_number} from ${companyName}`);
    form.append('text', emailText);
    form.append('html', emailHtml);

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: form,
      }
    );

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const mailgunResult = await mailgunResponse.json();

    // Log the communication
    await supabase.from('invoice_communications').insert({
      invoice_id: invoiceId,
      communication_type: 'email',
      recipient: clientEmail,
      subject: `Invoice #${invoice.invoice_number} from ${companyName}`,
      content: emailHtml,
      status: 'sent',
      external_id: mailgunResult.id,
      provider_message_id: mailgunResult.id,
      invoice_number: invoice.invoice_number,
      client_name: clientName,
      client_email: clientEmail,
      client_id: client?.id || clientId,
      portal_link_included: true
    });

    // Update invoice status if needed
    if (invoice.status === 'draft' && sendToClient) {
      await supabase
        .from('invoices')
        .update({ status: 'sent', sent_date: new Date().toISOString() })
        .eq('id', invoiceId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice sent successfully',
        messageId: mailgunResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-invoice function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});