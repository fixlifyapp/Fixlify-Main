
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')!;
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')!;
    const mailgunFromEmail = Deno.env.get('MAILGUN_FROM_EMAIL') || 'noreply@fixlify.com';
    const mailgunFromName = Deno.env.get('MAILGUN_FROM_NAME') || 'Fixlify';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, subject, html, text, replyTo, userId, clientId, jobId, templateId } = await req.json();

    if (!to || !subject || (!html && !text)) {
      throw new Error('Missing required fields: to, subject, and either html or text');
    }

    // Get user's company email
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('company_email, company_name')
      .eq('user_id', userId)
      .single();

    const fromEmail = companySettings?.company_email || mailgunFromEmail;
    const fromName = companySettings?.company_name || mailgunFromName;

    // Send email via Mailgun
    const formData = new FormData();
    formData.append('from', `${fromName} <${fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    
    if (html) {
      formData.append('html', html);
    }
    if (text) {
      formData.append('text', text);
    }
    if (replyTo) {
      formData.append('h:Reply-To', replyTo);
    }

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      }
    );

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      throw new Error(`Mailgun error: ${error}`);
    }

    const mailgunResult = await mailgunResponse.json();

    // Store email in database
    const emailRecord = {
      client_id: clientId,
      job_id: jobId,
      subject: subject,
      body: html || text,
      direction: 'outgoing',
      status: 'sent',
      user_id: userId,
      message_id: mailgunResult.id,
      template_id: templateId,
      metadata: {
        mailgun_id: mailgunResult.id,
        sent_at: new Date().toISOString()
      }
    };

    const { error: dbError } = await supabase
      .from('email_conversations')
      .insert(emailRecord);

    if (dbError) {
      console.error('Error storing email:', dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: mailgunResult.id,
        message: 'Email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
