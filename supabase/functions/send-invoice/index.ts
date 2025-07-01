import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

const createInvoiceEmailTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    clientName,
    invoiceNumber,
    total,
    amountDue,
    invoiceLink,
    portalLink
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Ready for Payment</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center; }
    .logo { max-height: 60px; margin-bottom: 15px; }
    .header-text { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #374151; margin-bottom: 20px; }
    .invoice-card { background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .invoice-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .invoice-number { font-size: 16px; color: #6b7280; margin-bottom: 15px; }
    .invoice-total { font-size: 28px; font-weight: bold; color: #dc2626; margin: 15px 0; }
    .amount-due { font-size: 18px; color: #dc2626; font-weight: bold; margin: 10px 0; }
    .portal-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
    .portal-button:hover { transform: translateY(-2px); }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
      <h1 class="header-text">Invoice Ready for Payment</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${clientName || 'valued customer'},</p>
      
      <p>Thank you for your business! Your invoice is now ready for payment. Please review the details below.</p>
      
      <div class="invoice-card">
        <div class="invoice-title">Invoice Details</div>
        <div class="invoice-number">Invoice #${invoiceNumber}</div>
        <div class="invoice-total">Total: $${total.toFixed(2)}</div>
        <div class="amount-due">Amount Due: $${amountDue.toFixed(2)}</div>
        
        ${portalLink ? `
          <a href="${portalLink}" class="portal-button">View & Pay Online</a>
        ` : `
          <a href="${invoiceLink}" class="portal-button">View Invoice</a>
        `}
      </div>
      
      <p>Best regards,<br>
      <strong>${companyName}</strong></p>
    </div>
    
    <div class="footer">
      <div><strong>${companyName}</strong><br>
      Professional service you can trust</div>
      ${companyPhone ? `<div>📞 ${companyPhone}</div>` : ''}
      ${companyEmail ? `<div>✉️ ${companyEmail}</div>` : ''}
    </div>
  </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // THIS MUST BE FIRST - Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Email Invoice request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No authorization header provided'
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to authenticate user'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('send-invoice - Authenticated user ID:', userData.user.id);

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { invoiceId, recipientEmail, customMessage } = requestBody;

    if (!invoiceId || !recipientEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: invoiceId and recipientEmail'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Processing email for invoice:', invoiceId, 'to email:', recipientEmail);

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        jobs!inner(
          *,
          clients(*)
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice lookup error:', invoiceError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invoice not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('Invoice found:', invoice.invoice_number);
    
    const job = invoice.jobs;
    const client = job?.clients;

    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('send-invoice - Error fetching company settings:', settingsError);
    }

    // Generate client portal login token and create portal link
    let portalLink = '';
    if (client?.email) {
      try {
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });

        if (!tokenError && tokenData) {
          portalLink = `https://hub.fixlify.app/portal/login?token=${tokenData}&redirect=/portal/invoices?id=${invoice.id}`;
          console.log('Portal link generated for client portal');
        }
      } catch (error) {
        console.warn('Failed to generate portal login token:', error);
      }
    }

    const invoiceLink = `https://hub.fixlify.app/invoice/view/${invoice.id}`;

    const companyName = companySettings?.company_name?.trim() || 'Fixlify Services';
    const companyLogo = companySettings?.company_logo_url;
    const companyPhone = companySettings?.company_phone;
    const companyEmail = companySettings?.company_email;

    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);

    let subject, emailBody;
    
    if (customMessage) {
      subject = `Invoice ${invoice.invoice_number} from ${companyName}`;
      emailBody = customMessage;
    } else {
      subject = `Your Invoice ${invoice.invoice_number} is Ready`;
      emailBody = createInvoiceEmailTemplate({
        companyName,
        companyLogo,
        companyPhone,
        companyEmail,
        clientName: client?.name,
        invoiceNumber: invoice.invoice_number,
        total: invoice.total || 0,
        amountDue,
        invoiceLink,
        portalLink
      });
    }

    const fromEmail = `${companyName} <${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}@fixlify.app>`;

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('send-invoice - Mailgun API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Mailgun API key not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('send-invoice - Sending email via Mailgun');
    console.log('send-invoice - FROM:', fromEmail);
    console.log('send-invoice - TO:', recipientEmail);
    console.log('send-invoice - SUBJECT:', subject);

    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', recipientEmail);
    formData.append('subject', subject);
    if (customMessage) {
      formData.append('text', emailBody);
    } else {
      formData.append('html', emailBody);
      formData.append('text', `Hi ${client?.name || 'valued customer'},\n\nYour invoice ${invoice.invoice_number} is ready for payment.\n\nTotal: $${(invoice.total || 0).toFixed(2)}\nAmount Due: $${amountDue.toFixed(2)}\n\nView your invoice: ${invoiceLink}\n${portalLink ? `\nClient Portal: ${portalLink}` : ''}\n\nThank you for your business!\n\n${companyName}`);
    }
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const mailgunUrl = 'https://api.mailgun.net/v3/fixlify.app/messages';
    const basicAuth = btoa(`api:${mailgunApiKey}`);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('send-invoice - Mailgun response status:', mailgunResponse.status);
    console.log('send-invoice - Mailgun response body:', responseText);

    if (!mailgunResponse.ok) {
      console.error('send-invoice - Mailgun send error:', responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Mailgun API error: ${mailgunResponse.status} - ${responseText}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    let mailgunResult;
    try {
      mailgunResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('send-invoice - Error parsing Mailgun response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from Mailgun API'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('send-invoice - Email sent successfully via Mailgun:', mailgunResult);

    // Log email communication
    try {
      await supabaseAdmin
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: subject,
          content: customMessage || `Professional invoice email with portal access sent`,
          status: 'sent',
          invoice_number: invoice.invoice_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: !!portalLink,
          provider_message_id: mailgunResult.id
        });
    } catch (logError) {
      console.warn('Failed to log communication:', logError);
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: mailgunResult.id,
        portalLinkIncluded: !!portalLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
