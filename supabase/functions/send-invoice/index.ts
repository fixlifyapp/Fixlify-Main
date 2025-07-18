import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  console.log(`[send-invoice] ${req.method} request received`);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[send-invoice] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    console.log('[send-invoice] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { invoiceId, recipientEmail, customMessage } = body;
    
    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Invoice ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[send-invoice] Processing invoice:", invoiceId);
    
    // Get invoice details with job and client info
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        jobs!inner(
          *,
          clients!inner(*)
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("[send-invoice] Error fetching invoice:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found", details: invoiceError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate portal token
    let portalToken = invoice.portal_access_token;
    if (!portalToken) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      portalToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      await supabase
        .from("invoices")
        .update({ portal_access_token: portalToken })
        .eq("id", invoiceId);
    }
    
    // Get user profile for company info
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_email, company_phone, company_address, brand_color")
      .eq("id", user.id)
      .single();
      
    const companyName = profile?.company_name || "Your Service Company";
    const companyEmail = profile?.company_email || "noreply@fixlify.app";
    const toEmail = recipientEmail || invoice.jobs?.clients?.email;
    
    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: "No recipient email address available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/invoice/${portalToken}`;
    
    // Simple email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h2>Invoice ${invoice.invoice_number}</h2>
        <p>Dear ${invoice.jobs?.clients?.name || "Valued Customer"},</p>
        <p>${customMessage || `Please find your invoice attached.`}</p>
        <p>Total: $${invoice.total.toFixed(2)}</p>
        <p><a href="${portalLink}">View and Pay Invoice Online</a></p>
        <p>Thank you,<br>${companyName}</p>
      </body>
      </html>
    `;
    
    console.log("[send-invoice] Sending email to:", toEmail);
    
    // Send email using Mailgun via our edge function
    const mailgunResponse = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: toEmail,
        subject: `Invoice ${invoice.invoice_number} from ${companyName}`,
        html: emailHtml,
        from: `${companyName} <${companyEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      console.error("[send-invoice] Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await mailgunResponse.json();
    console.log("[send-invoice] Email sent successfully:", emailResult.mailgunId);
    
    // Update invoice status
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invoice sent successfully",
        emailId: emailResult.mailgunId,
        portalLink: portalLink
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("[send-invoice] Unexpected error:", error);
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