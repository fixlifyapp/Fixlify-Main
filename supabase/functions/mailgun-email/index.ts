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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log('Received email request for:', emailRequest.to);
    
    // Get Mailgun API key (the only global setting we need)
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    
    // For testing purposes, if Mailgun is not configured, we'll simulate the email
    const isTestMode = !mailgunApiKey;
    
    if (isTestMode) {
      console.log('WARNING: Mailgun not configured, running in test mode');
    }
    
    // Initialize Supabase client for user data and logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let supabase = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    
    // Get user-specific email settings
    let userEmailDomain = 'fixlify.app';
    let fromEmail = emailRequest.from || 'noreply@fixlify.app';
    
    if (supabase && emailRequest.userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, company_email')
          .eq('id', emailRequest.userId)
          .single();
          
        if (profile?.company_name) {
          // Generate dynamic email based on company name
          const formattedCompanyName = profile.company_name
            .toLowerCase()
            .trim()
            .replace(/[\s\-&+.,()]+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 30) || 'support';
          
          fromEmail = emailRequest.from || `${formattedCompanyName}@fixlify.app`;
        }
        
        // Use company_email if they have one set
        if (profile?.company_email && !emailRequest.from) {
          fromEmail = profile.company_email;
        }
      } catch (error) {
        console.log('Could not fetch user profile, using default email');
      }
    }    
    // Build email data with dynamic from address
    const formData = new FormData();
    formData.append('from', fromEmail);
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
    
    // Send email via Mailgun API or simulate in test mode
    console.log('Sending email via Mailgun...');
    
    let mailgunResult;
    
    if (isTestMode) {
      // Simulate successful email send in test mode
      console.log('TEST MODE: Simulating email send to:', emailRequest.to);
      console.log('Subject:', emailRequest.subject);
      console.log('From:', fromEmail);
      
      mailgunResult = {
        id: `test-${Date.now()}@fixlify.com`,
        message: 'Test mode - email simulated'
      };
      
      // Log the simulated email
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
                test_mode: true,
                mailgun_id: mailgunResult.id,
                  from: fromEmail
              }
            });
        } catch (logError) {
          console.error('Failed to log test email:', logError);
        }
      }
    } else {
      // Real Mailgun API call using fixlify.app domain
      const mailgunUrl = `https://api.mailgun.net/v3/fixlify.app/messages`;
      
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
                  from: fromEmail
                }
              });
          } catch (logError) {
            console.error('Failed to log email error:', logError);
          }
        }
        
        throw new Error(`Failed to send email: ${responseText}`);
      }
      
      mailgunResult = JSON.parse(responseText);
      
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
                  from: fromEmail
              }
            });
        } catch (logError) {
          console.error('Failed to log email success:', logError);
        }
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
