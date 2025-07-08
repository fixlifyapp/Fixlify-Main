import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  userId?: string;
  template?: string;
  variables?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
  // Document sending fields
  documentType?: 'estimate' | 'invoice';
  documentId?: string;
  sendToClient?: boolean;
  customMessage?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log('Received email request:', emailRequest);
    
    // Handle document sending if documentType and documentId provided
    if (emailRequest.documentType && emailRequest.documentId) {
      return await handleDocumentSending(emailRequest);
    }
    
    // Get Mailgun credentials from environment variables
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const mailgunFrom = Deno.env.get('MAILGUN_FROM_EMAIL') || 'noreply@fixlify.com';
    
    if (!mailgunApiKey || !mailgunDomain) {
      console.error('Missing Mailgun configuration');
      throw new Error('Email service not configured properly');
    }
    
    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let supabase = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }    
    // Build email data
    const from = emailRequest.from || mailgunFrom;
    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', emailRequest.to);
    formData.append('subject', emailRequest.subject);
    
    // Add both HTML and text versions
    if (emailRequest.html) {
      formData.append('html', emailRequest.html);
    }
    if (emailRequest.text) {
      formData.append('text', emailRequest.text);
    } else if (emailRequest.html) {
      // Generate text version from HTML if not provided
      const textVersion = emailRequest.html.replace(/<[^>]*>/g, '');
      formData.append('text', textVersion);
    }
    
    // Add reply-to if provided
    if (emailRequest.replyTo) {
      formData.append('h:Reply-To', emailRequest.replyTo);
    }
    
    // Add attachments if provided
    if (emailRequest.attachments && emailRequest.attachments.length > 0) {
      for (const attachment of emailRequest.attachments) {
        const blob = new Blob([attachment.content], {
          type: attachment.contentType || 'application/octet-stream'
        });
        formData.append('attachment', blob, attachment.filename);
      }
    }
    
    // Send email via Mailgun API
    console.log('Sending email via Mailgun...');
    const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
    
    const mailgunResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });
    
    const responseText = await mailgunResponse.text();
    console.log('Mailgun response:', mailgunResponse.status, responseText);
    
    if (!mailgunResponse.ok) {
      console.error('Mailgun API error:', responseText);
      
      // Log failure if Supabase is available
      if (supabase && emailRequest.userId) {
        try {
          await supabase
            .from('communication_logs')
            .insert({
              user_id: emailRequest.userId,
              type: 'email',
              recipient: emailRequest.to,
              subject: emailRequest.subject,
              message: emailRequest.text || emailRequest.html,
              status: 'failed',
              error: responseText,
              metadata: {
                mailgun_status: mailgunResponse.status,
                from: from
              }
            });
        } catch (logError) {
          console.error('Failed to log email error:', logError);
        }
      }
      
      throw new Error(`Failed to send email: ${responseText}`);
    }    
    const mailgunResult = JSON.parse(responseText);
    
    // Log success if Supabase is available
    if (supabase && emailRequest.userId) {
      try {
        await supabase
          .from('communication_logs')
          .insert({
            user_id: emailRequest.userId,
            type: 'email',
            recipient: emailRequest.to,
            subject: emailRequest.subject,
            message: emailRequest.text || emailRequest.html,
            status: 'sent',
            metadata: {
              mailgun_id: mailgunResult.id,
              from: from
            }
          });
      } catch (logError) {
        console.error('Failed to log email success:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        mailgunId: mailgunResult.id,
        recipient: emailRequest.to
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleDocumentSending(emailRequest: EmailRequest) {
  const { documentType, documentId, customMessage } = emailRequest;
  
  console.log(`📧 Sending ${documentType} ${documentId} via email`);
  
  // Get Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Fetch document with client info
  const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
  const { data: document, error: docError } = await supabase
    .from(tableName)
    .select(`
      *,
      jobs!inner(
        *,
        clients!inner(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    console.error('Document fetch error:', docError);
    throw new Error(`${documentType} not found`);
  }

  const client = document.jobs.clients;
  if (!client?.email) {
    throw new Error('Client email not found');
  }

  // Generate email content
  const subject = `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} from ${document.jobs.company_name || 'Our Company'}`;
  const portalUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.vercel.app') || 'https://yourapp.com'}/${documentType}/${documentId}`;
  
  const html = `
    <h2>${subject}</h2>
    <p>Hello ${client.name},</p>
    ${customMessage ? `<p>${customMessage}</p>` : ''}
    <p>Please click the link below to view your ${documentType}:</p>
    <a href="${portalUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View ${documentType}</a>
    <p>Thank you for your business!</p>
  `;

  // Send email using existing Mailgun logic
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  const mailgunFrom = Deno.env.get('MAILGUN_FROM_EMAIL') || 'noreply@fixlify.com';
  
  if (!mailgunApiKey || !mailgunDomain) {
    throw new Error('Mailgun configuration missing');
  }
  
  const formData = new FormData();
  formData.append('from', mailgunFrom);
  formData.append('to', client.email);
  formData.append('subject', subject);
  formData.append('html', html);
  
  const mailgunResponse = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
    },
    body: formData,
  });
  
  const responseText = await mailgunResponse.text();
  console.log('Mailgun response:', mailgunResponse.status, responseText);
  
  if (!mailgunResponse.ok) {
    throw new Error(`Failed to send email: ${responseText}`);
  }
  
  // Log the communication
  try {
    await supabase
      .from(`${documentType}_communications`)
      .insert({
        [documentType === 'estimate' ? 'estimate_id' : 'invoice_id']: documentId,
        client_id: client.id,
        job_id: document.job_id,
        communication_type: 'email',
        recipient: client.email,
        subject: subject,
        message: html,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          mailgun_response: JSON.parse(responseText)
        }
      });
  } catch (logError) {
    console.error('Failed to log communication:', logError);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `${documentType} sent successfully`,
      recipient: client.email
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
