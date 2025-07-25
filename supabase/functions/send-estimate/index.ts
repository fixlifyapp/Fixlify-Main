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

    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/estimate/${portalToken}`;
    
    // Simple email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Estimate ${estimate.estimate_number}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h2>Estimate ${estimate.estimate_number}</h2>
        <p>Dear ${estimate.jobs?.clients?.name || "Valued Customer"},</p>
        <p>${customMessage || `Please find your estimate attached.`}</p>
        <p>Total: $${estimate.total.toFixed(2)}</p>
        <p><a href="${portalLink}">View Estimate Online</a></p>
        <p>Thank you,<br>${companyName}</p>
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
        from: `${companyName} <${companyEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      console.error("[send-estimate] Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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