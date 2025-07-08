
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, documentId, recipientEmail, recipientName } = await req.json();
    
    console.log('📧 Sending email for:', { documentType, documentId, recipientEmail });

    // Fetch the document data
    let documentData;
    let documentQuery;
    
    if (documentType === 'estimate') {
      documentQuery = supabase
        .from('estimates')
        .select(`
          *,
          jobs:job_id (
            *,
            clients:client_id (*)
          )
        `)
        .eq('id', documentId)
        .single();
    } else if (documentType === 'invoice') {
      documentQuery = supabase
        .from('invoices')
        .select(`
          *,
          jobs:job_id (
            *,
            clients:client_id (*)
          )
        `)
        .eq('id', documentId)
        .single();
    } else {
      throw new Error(`Invalid document type: ${documentType}`);
    }

    const { data: document, error: documentError } = await documentQuery;
    
    if (documentError) {
      console.error('Document fetch error:', documentError);
      throw new Error(`${documentType} not found`);
    }

    if (!document) {
      throw new Error(`${documentType} not found`);
    }

    console.log('📄 Document found:', document.id);

    // Get Mailgun configuration
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');

    if (!mailgunDomain || !mailgunApiKey) {
      throw new Error('Mailgun configuration missing');
    }

    // Prepare email content
    const documentNumber = documentType === 'estimate' ? document.estimate_number : document.invoice_number;
    const clientName = document.jobs?.clients?.name || recipientName || 'Valued Customer';
    const companyName = document.jobs?.clients?.company || 'Our Company';
    
    const subject = `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${documentNumber}`;
    const portalUrl = `https://be121f52-204f-481a-9959-4f68a3e3bea7.lovableproject.com/portal/${documentType}/${documentId}`;
    
    const emailBody = `
      <h2>Hello ${clientName},</h2>
      <p>Please find your ${documentType} attached.</p>
      <p><strong>${documentType === 'estimate' ? 'Estimate' : 'Invoice'} #:</strong> ${documentNumber}</p>
      <p><strong>Total:</strong> $${document.total}</p>
      <p><a href="${portalUrl}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View ${documentType === 'estimate' ? 'Estimate' : 'Invoice'}</a></p>
      <p>Thank you for your business!</p>
      <p>Best regards,<br>${companyName}</p>
    `;

    // Send email via Mailgun
    const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
    
    const formData = new FormData();
    formData.append('from', `${companyName} <noreply@${mailgunDomain}>`);
    formData.append('to', recipientEmail);
    formData.append('subject', subject);
    formData.append('html', emailBody);

    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error('Mailgun error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const mailgunResult = await mailgunResponse.json();
    console.log('✅ Email sent successfully:', mailgunResult.id);

    // Log the communication
    await supabase.from('communication_logs').insert({
      client_id: document.jobs?.client_id || document.client_id,
      job_id: document.job_id,
      type: 'email',
      direction: 'outbound',
      recipient: recipientEmail,
      subject: subject,
      content: emailBody,
      status: 'sent',
      provider: 'mailgun',
      external_id: mailgunResult.id,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: mailgunResult.id,
        message: 'Email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error sending email:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
