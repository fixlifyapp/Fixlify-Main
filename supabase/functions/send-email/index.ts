import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  content?: string; // Legacy support
  userId: string;
  clientId?: string;
  conversationId?: string;
  metadata?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, subject, html, text, content, userId, clientId, conversationId, metadata }: SendEmailRequest = await req.json();

    if (!to || !subject || !userId) {
      throw new Error('Missing required fields: to, subject, userId');
    }

    // Use content as fallback for text if not provided
    const textContent = text || content || '';
    const htmlContent = html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          ${textContent.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top: 20px; padding: 20px; background: #f1f3f4; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Sent via Fixlify Connect Center
          </p>
        </div>
      </div>
    `;

    // Get user's company email settings
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('company_email_address, company_name, company_email, mailgun_domain')
      .eq('user_id', userId)
      .single();

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('company_email_address, company_name, email, name')
      .eq('user_id', userId)
      .single();

    // Determine from email address - prioritize company email address
    let fromEmail = 'noreply@fixlify.app';
    let fromName = 'Fixlify';
    
    if (companySettings?.company_email_address) {
      fromEmail = companySettings.company_email_address;
      fromName = companySettings.company_name || 'Fixlify';
    } else if (userProfile?.company_email_address) {
      fromEmail = userProfile.company_email_address;
      fromName = userProfile.company_name || userProfile.name || 'Fixlify';
    } else if (companySettings?.company_email) {
      fromEmail = companySettings.company_email;
      fromName = companySettings.company_name || 'Fixlify';
    }

    console.log(`Sending email from ${fromEmail} to ${to}`);

    // Get Mailgun credentials
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = companySettings?.mailgun_domain || Deno.env.get('MAILGUN_DOMAIN') || 'mg.fixlify.com';

    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    // Prepare form data for Mailgun
    const formData = new FormData();
    formData.append('from', `${fromName} <${fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', htmlContent);
    formData.append('text', textContent);

    // Send email via Mailgun
    const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
    
    const emailResponse = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Mailgun error: ${errorText}`);
    }

    const mailgunResult = await emailResponse.json();
    console.log("Email sent successfully:", mailgunResult);

    // Store email message if conversationId is provided
    if (conversationId) {
      try {
        await supabase
          .from('email_messages')
          .insert({
            conversation_id: conversationId,
            user_id: userId,
            direction: 'outbound',
            from_email: fromEmail,
            to_email: to,
            subject: subject,
            body: textContent,
            html_body: htmlContent,
            is_read: true,
            email_id: mailgunResult.id,
            status: 'sent',
            metadata: {
              mailgun_id: mailgunResult.id,
              from_name: fromName,
              ...metadata
            }
          });

        // Update conversation
        await supabase
          .from('email_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: textContent.substring(0, 100),
            unread_count: 0, // Reset since we sent it
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      } catch (msgError) {
        console.error('Failed to store email message:', msgError);
      }
    }

    // Log to communication_logs table
    try {
      await supabase.from('communication_logs').insert({
        user_id: userId,
        communication_type: 'email',
        direction: 'outbound',
        from_address: fromEmail,
        to_address: to,
        recipient: to,
        subject: subject,
        content: textContent,
        status: 'sent',
        external_id: mailgunResult.id,
        client_id: clientId,
        metadata: {
          mailgun_id: mailgunResult.id,
          from_name: fromName,
          conversation_id: conversationId,
          ...metadata
        }
      });
    } catch (logError) {
      console.error('Failed to log email to database:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: mailgunResult.id,
      message: 'Email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
