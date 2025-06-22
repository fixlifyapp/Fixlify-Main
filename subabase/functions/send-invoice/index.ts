import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { createInvoiceEmailTemplate } from './utils/emailTemplate.ts'
import { sendEmailViaMailgun } from './utils/mailgun.ts'
import { generatePortalLink } from './utils/portalLink.ts'
import { fetchInvoiceData, fetchCompanySettings, logEmailCommunication } from './utils/database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Email Invoice request received');
    
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    console.log('send-invoice - Authenticated user ID:', userData.user.id);

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { invoiceId, recipientEmail, customMessage } = requestBody;

    if (!invoiceId || !recipientEmail) {
      throw new Error('Missing required fields: invoiceId and recipientEmail');
    }

    console.log('Processing email for invoice:', invoiceId, 'to email:', recipientEmail);

    // Fetch invoice data
    const invoice = await fetchInvoiceData(supabaseAdmin, invoiceId);
    console.log('Invoice found:', invoice.invoice_number);
    
    const job = invoice.jobs;
    const client = job?.clients;

    // Fetch company settings
    const companySettings = await fetchCompanySettings(supabaseAdmin, userData.user.id);

    // Generate portal link if client has email
    let portalLink = '';
    if (client?.email) {
      portalLink = await generatePortalLink(supabaseAdmin, client.email, invoice.id);
    }

    const invoiceLink = `https://portal.fixlify.app/invoice/view/${invoice.id}`;

    // Prepare email data
    const companyName = companySettings?.company_name?.trim() || 'Fixlify Services';
    const companyLogo = companySettings?.company_logo_url;
    const companyPhone = companySettings?.company_phone;
    const companyEmail = companySettings?.company_email;
    const companyWebsite = companySettings?.company_website;
    const amountDue = (invoice.total || 0) - (invoice.amount_paid || 0);

    // Prepare email content
    let subject, emailBody, textBody;
    
    if (customMessage) {
      subject = `Invoice ${invoice.invoice_number} from ${companyName}`;
      emailBody = customMessage;
      textBody = customMessage;
    } else {
      subject = `Your Invoice ${invoice.invoice_number} is Ready`;
      emailBody = createInvoiceEmailTemplate({
        companyName,
        companyLogo,
        companyPhone,
        companyEmail,
        companyWebsite,
        clientName: client?.name,
        invoiceNumber: invoice.invoice_number,
        total: invoice.total || 0,
        amountDue,
        invoiceLink,
        portalLink
      });
      textBody = `Hi ${client?.name || 'valued customer'},\n\nYour invoice ${invoice.invoice_number} is ready for payment.\n\nTotal: $${(invoice.total || 0).toFixed(2)}\nAmount Due: $${amountDue.toFixed(2)}\n\nView your invoice: ${invoiceLink}\n${portalLink ? `\nClient Portal: ${portalLink}` : ''}\n\nThank you for your business!\n\n${companyName}`;
    }

    const fromEmail = `${companyName} <${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}@fixlify.app>`;

    // Send email via Mailgun
    const mailgunResult = await sendEmailViaMailgun({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: customMessage ? undefined : emailBody,
      text: textBody,
      customMessage: customMessage ? emailBody : undefined
    });

    // Log email communication
    await logEmailCommunication(supabaseAdmin, {
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
