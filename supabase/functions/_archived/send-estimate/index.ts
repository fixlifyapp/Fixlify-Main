import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  console.log(`[send-estimate] ${req.method} request received`);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Log environment variables existence (not values)
    console.log('[send-estimate] Environment check:', {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      hasMailgunKey: !!Deno.env.get("MAILGUN_API_KEY")
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[send-estimate] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    console.log('[send-estimate] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('[send-estimate] Auth result:', { 
      hasUser: !!user, 
      error: authError?.message 
    });
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('[send-estimate] Request body:', { 
      hasEstimateId: !!body.estimateId,
      hasRecipientEmail: !!body.recipientEmail 
    });
    
    const { estimateId, recipientEmail, customMessage } = body;
    
    if (!estimateId) {
      return new Response(
        JSON.stringify({ error: "Estimate ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[send-estimate] Processing estimate:", estimateId);
    
    // Get estimate details with job and client info
    const { data: estimate, error: estimateError } = await supabase
      .from("estimates")
      .select(`
        *,
        jobs!inner(
          *,
          clients!inner(*)
        )
      `)
      .eq("id", estimateId)
      .single();

    if (estimateError || !estimate) {
      console.error("[send-estimate] Error fetching estimate:", estimateError);
      return new Response(
        JSON.stringify({ error: "Estimate not found", details: estimateError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[send-estimate] Estimate found:", estimate.estimate_number);
    
    // Generate portal token
    let portalToken = estimate.portal_access_token;
    if (!portalToken) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      portalToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      await supabase
        .from("estimates")
        .update({ portal_access_token: portalToken })
        .eq("id", estimateId);
    }
    
    // Get user profile for company info
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_email, company_phone, company_address, brand_color")
      .eq("id", user.id)
      .single();
      
    const companyName = profile?.company_name || "Your Service Company";
    
    // Generate dynamic company email if not set
    let companyEmail = profile?.company_email;
    if (!companyEmail && profile?.company_name) {
      const formattedName = profile.company_name
        .toLowerCase()
        .trim()
        .replace(/[\s\-&+.,()]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 30) || 'support';
      companyEmail = `${formattedName}@fixlify.app`;
    } else if (!companyEmail) {
      companyEmail = "noreply@fixlify.app";
    }
    
    const toEmail = recipientEmail || estimate.jobs?.clients?.email;
    
    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: "No recipient email address available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use fixlify.app as default (hub.fixlify.app was not properly configured)
    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://fixlify.app"}/portal/${portalToken}`;
    
    // Generate personalized email address
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'team';
    const personalizedEmail = `${cleanName}@fixlify.app`;
    
    // Professional email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${estimate.estimate_number}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Estimate Ready</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${estimate.jobs?.clients?.name || "Valued Customer"},</p>
            
            ${customMessage ? `<p style="font-size: 16px; color: #333; line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">${customMessage}</p>` : ''}
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your estimate <strong style="color: #667eea;">#${estimate.estimate_number}</strong> 
              for <strong style="color: #667eea;">$${estimate.total.toFixed(2)}</strong> 
              is ready for your review.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: 500;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                📋 View Estimate Online
              </a>
              ${companyEmail ? `<div style="margin-top: 15px; font-size: 14px; color: #666;">
                Questions? Contact us at <a href="mailto:${companyEmail}" style="color: #667eea; text-decoration: none;">${companyEmail}</a>
              </div>` : ''}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">What's included:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Detailed breakdown of services</li>
                <li>Transparent pricing</li>
                <li>Easy online review and approval</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Have questions? Simply reply to this email or call us directly. 
              We're here to help make your project a success.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 16px; color: #333; margin: 0;">
                Best regards,<br>
                <strong style="color: #667eea;">${companyName}</strong>
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              This estimate is valid for 30 days. Questions? Contact us anytime.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log("[send-estimate] Sending email to:", toEmail);
    
    // Send email using Mailgun via our edge function
    const mailgunResponse = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: toEmail,
        subject: `Estimate ${estimate.estimate_number} from ${companyName}`,
        html: emailHtml,
        from: `${companyName} <${personalizedEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error("[send-estimate] Error sending email:", errorText);

      // Parse error response to provide user-friendly message
      let errorMessage = "Failed to send email";
      let errorCode = "EMAIL_FAILED";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.code === "MAILGUN_SUBSCRIPTION_CANCELED") {
          errorMessage = "Email service is temporarily unavailable. Please try SMS or contact support.";
          errorCode = errorData.code;
        } else {
          errorMessage = errorData.error || errorData.message || errorText;
        }
      } catch {
        errorMessage = errorText;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: errorCode
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await mailgunResponse.json();
    console.log("[send-estimate] Email sent successfully:", emailResult.mailgunId);
    
    // Update estimate status
    await supabase
      .from("estimates")
      .update({ status: "sent" })
      .eq("id", estimateId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Estimate sent successfully",
        emailId: emailResult.mailgunId,
        portalLink: portalLink
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("[send-estimate] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});