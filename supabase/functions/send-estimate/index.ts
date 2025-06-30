
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

    const { estimateId, recipientEmail, customMessage } = await req.json();

    if (!estimateId || !recipientEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get estimate details
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
      return new Response(JSON.stringify({ success: false, error: 'Estimate not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const client = estimate.jobs.clients;

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
    const estimateTotal = estimate.total || 0;
    const subject = `Your Estimate ${estimate.estimate_number} from ${companyName}`;
    
    let emailContent;
    if (customMessage) {
      emailContent = `${customMessage}<br><br><a href="${portalLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Estimate</a>`;
    } else {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Estimate is Ready!</h2>
          <p>Hi ${client.name || 'valued customer'},</p>
          <p>Your estimate ${estimate.estimate_number} from ${companyName} is ready for review.</p>
          <p><strong>Total: $${estimateTotal.toFixed(2)}</strong></p>
          <p style="margin: 30px 0;">
            <a href="${portalLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Estimate</a>
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
    await supabaseAdmin.from('estimate_communications').insert({
      estimate_id: estimateId,
      communication_type: 'email',
      recipient: recipientEmail,
      content: emailContent,
      status: 'sent',
      provider_message_id: mailgunResult.id,
      estimate_number: estimate.estimate_number,
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
    console.error('Error in send-estimate:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
