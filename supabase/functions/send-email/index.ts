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
  content: string;
  userId: string;
  clientId?: string;
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

    const { to, subject, content, userId, clientId, metadata }: SendEmailRequest = await req.json();

    if (!to || !subject || !content || !userId) {
      throw new Error('Missing required fields: to, subject, content, userId');
    }

    // Get user's email settings for from address
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('business_email, display_name, business_name')
      .eq('id', userId)
      .single();

    const fromEmail = userProfile?.business_email || 'noreply@fixlify.com';
    const fromName = userProfile?.display_name || userProfile?.business_name || 'Fixlify';

    console.log(`Sending email from ${fromEmail} to ${to}`);

    // Get Mailgun credentials
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN') || 'mg.fixlify.com';

    if (!mailgunApiKey) {
      throw new Error('Mailgun API key not configured');
    }

    // Prepare email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top: 20px; padding: 20px; background: #f1f3f4; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Sent via Fixlify Connect Center
          </p>
        </div>
      </div>
    `;

    // Prepare form data for Mailgun
    const formData = new FormData();
    formData.append('from', `${fromName} <${fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', htmlContent);
    formData.append('text', content);

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
        content: content,
        status: 'sent',
        external_id: mailgunResult.id,
        client_id: clientId,
        metadata: {
          mailgun_id: mailgunResult.id,
          from_name: fromName,
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