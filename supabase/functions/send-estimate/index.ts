import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

const createEstimateEmailTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    clientName,
    estimateNumber,
    total,
    portalLink,
    companyAddress,
    companyWebsite
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate is Ready</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height: 80px; margin-bottom: 20px;">` : ''}
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Invoice Ready for Payment</h1>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${clientName || 'valued customer'},</p>
      <p>Thank you for your business! Your estimate is now ready for review.</p>
      
      <div style="background-color: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
        <div style="font-size: 16px; color: #6b7280; margin-bottom: 15px;">Estimate #${estimateNumber}</div>
        <div style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 15px 0;">Total: $${total.toFixed(2)}</div>
        ${portalLink ? `
          <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0;">
            View Your Estimate
          </a>
        ` : ''}
      </div>
      
      <p>Best regards,<br><strong>${companyName}</strong></p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <strong>${companyName}</strong><br>
      ${companyPhone ? `📞 ${companyPhone}<br>` : ''}
      ${companyEmail ? `✉️ ${companyEmail}` : ''}
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
    console.log('📧 Email Estimate request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
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
      console.error('❌ Failed to authenticate user:', userError);
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

    const requestBody = await req.json()
    console.log('📧 Request body received:', { estimateId: requestBody.estimateId, recipientEmail: requestBody.recipientEmail });
    
    const { estimateId, recipientEmail, customMessage } = requestBody;

    if (!estimateId || !recipientEmail) {
      console.error('❌ Missing required fields:', { estimateId: !!estimateId, recipientEmail: !!recipientEmail });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: estimateId and recipientEmail'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('🔍 Processing email for estimate:', estimateId, 'to email:', recipientEmail);

    // Get estimate details with job and client info
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

    // Get company settings
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (settingsError) {
      console.warn('⚠️ Error fetching company settings:', settingsError);
    }

    const companyName = companySettings?.company_name || 'Fixlify Services';
    const companyEmail = companySettings?.company_email || userData.user.email || '';
    const companyPhone = companySettings?.company_phone || '';
    const companyLogo = companySettings?.company_logo_url;
    const companyWebsite = companySettings?.company_website;

    // Generate portal access token for the client
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

    console.log('✅ Portal access token generated');

    // Use local estimate page for now until hub.fixlify.app is properly deployed  
    const portalLink = `http://localhost:8080/estimate/${estimate.id}`;

    // Create email HTML
    const emailHtml = createEstimateEmailTemplate({
      companyName,
      companyEmail,
      companyPhone,
      companyLogo,
      companyWebsite,
      clientName: client?.name || 'Valued Customer',
      estimateNumber: estimate.estimate_number,
      total: estimate.total || 0,
      portalLink
    });

    // Check Mailgun configuration
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    if (!mailgunApiKey) {
      console.error('❌ Mailgun API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please contact support.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const mailgunDomain = 'fixlify.app';
    const fromEmail = `${companyName} <estimates@${mailgunDomain}>`;

    console.log('📧 Sending email via Mailgun...');
    console.log('📧 From:', fromEmail);
    console.log('📧 To:', recipientEmail);
    console.log('📧 Domain:', mailgunDomain);

    // Send email via Mailgun
    const formData = new FormData();
    formData.append('from', fromEmail);
    formData.append('to', recipientEmail);
    formData.append('subject', `Your Estimate #${estimate.estimate_number} is Ready - ${companyName}`);
    formData.append('html', emailHtml);
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
    const basicAuth = btoa(`api:${mailgunApiKey}`);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      },
      body: formData
    });

    const responseText = await mailgunResponse.text();
    console.log('📧 Mailgun response status:', mailgunResponse.status);
    console.log('📧 Mailgun response body:', responseText);

    if (!mailgunResponse.ok) {
      console.error('❌ Mailgun send error:', responseText);
      
      // Provide specific error messages based on status code
      let errorMessage = 'Failed to send email';
      if (mailgunResponse.status === 401) {
        errorMessage = 'Email service authentication failed. Please contact support.';
      } else if (mailgunResponse.status === 403) {
        errorMessage = 'Email domain not authorized. Please contact support.';
      } else if (mailgunResponse.status === 400) {
        errorMessage = 'Invalid email format or missing required fields.';
      } else if (mailgunResponse.status >= 500) {
        errorMessage = 'Email service temporarily unavailable. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `${errorMessage} (Status: ${mailgunResponse.status})`
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
      console.error('❌ Error parsing Mailgun response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from email service'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('✅ Email sent successfully via Mailgun:', mailgunResult);

    // Log email communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'email',
          recipient: recipientEmail,
          subject: `Your Estimate #${estimate.estimate_number} is Ready - ${companyName}`,
          content: customMessage || `Professional estimate email with portal access sent`,
          status: 'sent',
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          portal_link_included: true,
          provider_message_id: mailgunResult.id
        });
      console.log('✅ Email communication logged successfully');
    } catch (logError) {
      console.warn('⚠️ Failed to log communication:', logError);
    }

    console.log('✅ Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: mailgunResult.id,
        portalLink: portalLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in send-estimate function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
