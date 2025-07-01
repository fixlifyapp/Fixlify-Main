import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { createProfessionalEstimateTemplate } from '../_shared/professional-email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

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
          make_payments: false
        },
        p_hours_valid: 72,
        p_domain_restriction: 'hub.fixlify.app'
      });

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
    formData.append('text', `Your estimate #${estimate.estimate_number} is ready. Total: $${(estimate.total || 0).toFixed(2)}. View at: ${portalLink}`);

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
        content: customMessage || 'Estimate email sent',
        status: 'sent',
        provider_message_id: result.id
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.id
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