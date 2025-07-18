
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { estimate_id, client_email, client_name, client_phone } = await req.json();
    console.log('Sending estimate:', { estimate_id, client_email });

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*, jobs(client_id, clients(name, email, phone))')
      .eq('id', estimate_id)
      .single();

    if (estimateError || !estimate) {
      console.error('Error fetching estimate:', estimateError);
      throw new Error('Estimate not found');
    }

    const mailgun_api_key = Deno.env.get('MAILGUN_API_KEY');
    const mailgun_domain = Deno.env.get('MAILGUN_DOMAIN');

    if (!mailgun_api_key || !mailgun_domain) {
      throw new Error('Mailgun configuration missing');
    }

    // Create email content
    const emailSubject = `Estimate ${estimate.estimate_number} from Your Service Company`;
    const emailContent = `
      <h2>Estimate ${estimate.estimate_number}</h2>
      <p>Dear ${client_name || estimate.jobs?.clients?.name || 'Valued Customer'},</p>
      <p>Please find your estimate attached below:</p>
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <h3>Estimate Details</h3>
        <p><strong>Estimate Number:</strong> ${estimate.estimate_number}</p>
        <p><strong>Total Amount:</strong> $${estimate.total}</p>
        <p><strong>Status:</strong> ${estimate.status}</p>
        ${estimate.description ? `<p><strong>Description:</strong> ${estimate.description}</p>` : ''}
      </div>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Your Service Team</p>
    `;

    // Send email via Mailgun
    const formData = new FormData();
    formData.append('from', `Your Service Company <noreply@${mailgun_domain}>`);
    formData.append('to', client_email || estimate.jobs?.clients?.email || '');
    formData.append('subject', emailSubject);
    formData.append('html', emailContent);

    const response = await fetch(`https://api.mailgun.net/v3/${mailgun_domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgun_api_key}`)}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Mailgun response:', result);

    if (!response.ok) {
      throw new Error(`Mailgun error: ${result.message || 'Unknown error'}`);
    }

    // Log the communication
    await supabase.from('estimate_communications').insert({
      estimate_id: estimate.id,
      estimate_number: estimate.estimate_number,
      client_id: estimate.client_id,
      client_name: client_name || estimate.jobs?.clients?.name,
      client_email: client_email || estimate.jobs?.clients?.email,
      client_phone: client_phone || estimate.jobs?.clients?.phone,
      communication_type: 'email',
      recipient: client_email || estimate.jobs?.clients?.email || '',
      subject: emailSubject,
      content: emailContent,
      status: 'sent',
      external_id: result.id,
      provider_message_id: result.id,
      portal_link_included: false,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Estimate sent successfully', mailgun_id: result.id }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending estimate:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send estimate' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
