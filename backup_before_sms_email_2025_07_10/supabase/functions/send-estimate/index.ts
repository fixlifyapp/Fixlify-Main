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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { estimateId, sendToClient, customMessage } = await req.json();
    console.log('📨 Sending estimate:', { estimateId, sendToClient, customMessage });

    // Get estimate with client info
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        ),
        jobs (
          id,
          title,
          address
        )
      `)
      .eq('id', estimateId)
      .eq('user_id', user.id)
      .single();

    if (estimateError || !estimate) {
      console.error('Estimate fetch error:', estimateError);
      throw new Error('Estimate not found');
    }
    // Check if client has email
    if (!estimate.clients?.email) {
      console.error('❌ Client email not found:', estimate.clients);
      throw new Error('Client email not found. Please add an email address to the client before sending.');
    }

    const clientEmail = estimate.clients.email;
    const clientName = estimate.clients.name;

    console.log('✅ Client info:', { clientName, clientEmail });

    // Get user profile for company info
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, company_phone, company_email, website')
      .eq('id', user.id)
      .single();

    // Generate portal URL
    const portalUrl = `${Deno.env.get('PUBLIC_SITE_URL') || 'https://app.fixlify.com'}/estimate/${estimateId}`;

    // Prepare email content
    const emailSubject = `Estimate #${estimate.estimate_number} from ${profile?.company_name || 'Your Service Provider'}`;
    
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Estimate #${estimate.estimate_number}</h2>
        
        <p>Dear ${clientName},</p>
        
        <p>We've prepared an estimate for your ${estimate.jobs?.title || 'service request'}.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Estimate Details:</h3>
          <p><strong>Job:</strong> ${estimate.jobs?.title || 'Service'}</p>
          ${estimate.jobs?.address ? `<p><strong>Location:</strong> ${estimate.jobs.address}</p>` : ''}
          <p><strong>Total Amount:</strong> $${estimate.total.toFixed(2)}</p>
          ${estimate.valid_until ? `<p><strong>Valid Until:</strong> ${new Date(estimate.valid_until).toLocaleDateString()}</p>` : ''}
        </div>`;

    if (customMessage) {
      emailHtml += `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message from ${profile?.company_name}:</strong></p>
          <p style="margin: 10px 0 0 0;">${customMessage}</p>
        </div>`;
    }
    emailHtml += `
        <div style="margin: 30px 0;">
          <a href="${portalUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Estimate in Portal</a>
        </div>
        
        <p>In the portal, you can:</p>
        <ul>
          <li>View the full estimate details</li>
          <li>Approve or decline the estimate</li>
          <li>Add comments or questions</li>
          <li>Download a PDF copy</li>
        </ul>
        
        ${profile?.company_phone ? `<p>If you have any questions, please call us at ${profile.company_phone}</p>` : ''}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        
        <p style="color: #666; font-size: 14px;">
          ${profile?.company_name || 'Your Service Provider'}<br>
          ${profile?.company_email ? `Email: ${profile.company_email}<br>` : ''}
          ${profile?.company_phone ? `Phone: ${profile.company_phone}<br>` : ''}
          ${profile?.website ? `Website: ${profile.website}` : ''}
        </p>
      </div>
    `;

    const emailText = emailHtml.replace(/<[^>]*>/g, '');

    // Send email using mailgun-email function
    console.log('📧 Calling mailgun-email function...');
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: clientEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        userId: user.id,
        replyTo: profile?.company_email
      }
    });

    if (emailError) {
      console.error('❌ Email sending error:', emailError);
      throw emailError;
    }

    console.log('✅ Email sent successfully:', emailResult);

    // Log the communication
    await supabase
      .from('communication_logs')
      .insert({
        user_id: user.id,
        type: 'email',
        recipient: clientEmail,
        subject: emailSubject,
        message: emailText,
        status: 'sent',
        entity_type: 'estimate',
        entity_id: estimateId,
        metadata: {
          estimate_number: estimate.estimate_number,
          portal_url: portalUrl,
          custom_message: customMessage
        }
      });

    // Update estimate status
    await supabase
      .from('estimates')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', estimateId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Estimate sent successfully',
        portalUrl: portalUrl,
        recipient: clientEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-estimate:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send estimate',
        details: error
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
