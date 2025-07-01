import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Clean, professional email template that works in all email clients
const createProfessionalEstimateTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    companyAddress,
    clientName,
    estimateNumber,
    total,
    portalLink,
    validUntil
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate from ${companyName}</title>
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
      .button { padding: 12px 24px !important; font-size: 16px !important; }
      .header { padding: 30px 20px !important; }
      h1 { font-size: 24px !important; }
      .amount { font-size: 32px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="header" style="background-color: #5B21B6; padding: 40px 30px; text-align: center;">
              ${companyLogo ? `
                <img src="${companyLogo}" alt="${companyName}" style="max-height: 60px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
              ` : ''}
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Estimate Ready</h1>
              <p style="color: #E9D5FF; font-size: 16px; margin: 0;">Professional Service Estimate</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1F2937; margin: 0 0 20px 0;">Hi ${clientName || 'Valued Customer'} 👋</p>
              
              <p style="color: #4B5563; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for considering ${companyName} for your service needs. We've prepared a detailed estimate for your review.
              </p>
              
              <!-- Estimate Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; border-radius: 8px; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                      ESTIMATE #${estimateNumber}
                    </p>
                    <p class="amount" style="color: #5B21B6; font-size: 36px; font-weight: 700; margin: 0 0 10px 0;">
                      $${total.toFixed(2)}
                    </p>
                    ${validUntil ? `
                      <p style="color: #6B7280; font-size: 14px; margin: 0;">
                        Valid until: ${validUntil}
                      </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 0 20px 0;">
                    <a href="${portalLink}" class="button" style="display: inline-block; background-color: #5B21B6; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      View Client Portal
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="text-align: center; color: #6B7280; font-size: 14px; margin: 0 0 30px 0;">
                Access your client portal to view all estimates, invoices, and account details
              </p>
              
              <!-- What's Next -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #1F2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">What's Available in Your Portal?</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">View all your estimates and invoices</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Track job progress and history</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Make payments and view payment history</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Download documents and receipts</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 40px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <h3 style="color: #1F2937; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">${companyName}</h3>
              ${companyAddress ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">${companyAddress}</p>` : ''}
              ${companyPhone ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">📞 ${companyPhone}</p>` : ''}
              ${companyEmail ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">✉️ ${companyEmail}</p>` : ''}
              
              <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Powered by <a href="https://fixlify.com" style="color: #5B21B6; text-decoration: none;">Fixlify</a> • Business Automation Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const requestBody = await req.json();
    const { estimateId, recipientEmail, customMessage } = requestBody;

    if (!estimateId || !recipientEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get estimate with client info
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs!inner(
          id,
          client_id,
          clients!inner(*)
        )
      `)
      .eq('id', estimateId)
      .single();

    if (estimateError || !estimate) {
      return new Response(
        JSON.stringify({ success: false, error: 'Estimate not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const client = estimate.jobs?.clients;

    // Get company settings
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const companyName = companySettings?.company_name || 'Fixlify Services';
    const companyEmail = companySettings?.company_email || userData.user.email || '';
    const companyPhone = companySettings?.company_phone || '';
    const companyAddress = companySettings?.company_address || '';
    const companyLogo = companySettings?.company_logo_url;

    // Generate portal token
    const { data: portalToken } = await supabaseAdmin
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

    // Use hub.fixlify.app for production portal
    const portalLink = portalToken 
      ? `https://hub.fixlify.app/portal/${portalToken}`
      : `https://hub.fixlify.app/estimate/${estimate.id}`;

    // Create email HTML
    const emailHtml = createProfessionalEstimateTemplate({
      companyName,
      companyLogo,
      companyPhone,
      companyEmail,
      companyAddress,
      clientName: client?.name || 'Valued Customer',
      estimateNumber: estimate.estimate_number,
      total: estimate.total || 0,
      portalLink,
      validUntil: estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString() : null
    });

    // Send via Mailgun
    const formData = new FormData();
    formData.append('from', `${companyName} <estimates@fixlify.app>`);
    formData.append('to', recipientEmail);
    formData.append('subject', `Your Estimate #${estimate.estimate_number} from ${companyName}`);
    formData.append('html', emailHtml);
    formData.append('text', `Your estimate #${estimate.estimate_number} is ready. Total: $${(estimate.total || 0).toFixed(2)}. View your client portal at: ${portalLink}`);

    const mailgunResponse = await fetch('https://api.mailgun.net/v3/fixlify.app/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
      },
      body: formData
    });

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      console.error('Mailgun error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const result = await mailgunResponse.json();

    // Log communication
    await supabaseAdmin
      .from('estimate_communications')
      .insert({
        estimate_id: estimateId,
        communication_type: 'email',
        recipient: recipientEmail,
        subject: `Your Estimate #${estimate.estimate_number} from ${companyName}`,
        content: customMessage || 'Estimate email sent with portal access',
        status: 'sent',
        provider_message_id: result.id,
        portal_link_included: true
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.id,
        portalLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})