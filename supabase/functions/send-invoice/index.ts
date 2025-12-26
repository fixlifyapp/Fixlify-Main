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
        JSON.stringify({ success: false, error: "Missing Supabase configuration" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    console.log('[send-invoice] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication", details: authError?.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { invoiceId, recipientEmail, customMessage } = body;
    
    if (!invoiceId) {
      return new Response(
        JSON.stringify({ success: false, error: "Invoice ID is required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[send-invoice] Processing invoice:", invoiceId);

    // Get invoice details - using separate queries to avoid inner join failures
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) {
      console.error("[send-invoice] Error fetching invoice:", invoiceError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch invoice", details: invoiceError?.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invoice) {
      return new Response(
        JSON.stringify({ success: false, error: "Invoice not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch job details if job_id exists
    let job = null;
    if (invoice.job_id) {
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", invoice.job_id)
        .maybeSingle();
      job = jobData;
    }

    // Fetch client details
    let client = null;
    const clientId = invoice.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();
      client = clientData;
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
    
    const toEmail = recipientEmail || client?.email;

    if (!toEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipient email address available" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/${portalToken}`;
    
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
        <title>Invoice ${invoice.invoice_number}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Invoice Ready</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${client?.name || "Valued Customer"},</p>
            
            ${customMessage ? `<p style="font-size: 16px; color: #333; line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">${customMessage}</p>` : ''}
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your invoice <strong style="color: #28a745;">#${invoice.invoice_number}</strong> 
              for <strong style="color: #28a745;">$${invoice.total.toFixed(2)}</strong> 
              is ready for payment.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalLink}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: 500;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                💳 View & Pay Invoice Online
              </a>
              ${companyEmail ? `<div style="margin-top: 15px; font-size: 14px; color: #666;">
                Questions? Contact us at <a href="mailto:${companyEmail}" style="color: #28a745; text-decoration: none;">${companyEmail}</a>
              </div>` : ''}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Payment Options:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Secure online payment</li>
                <li>Multiple payment methods accepted</li>
                <li>Instant payment confirmation</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Questions about your invoice? Simply reply to this email or contact us directly. 
              Thank you for choosing us for your project!
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 16px; color: #333; margin: 0;">
                Thank you for your business,<br>
                <strong style="color: #28a745;">${companyName}</strong>
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              Need help? Contact us anytime. We appreciate your business!
            </p>
          </div>
        </div>
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
        from: `${companyName} <${personalizedEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error("[send-invoice] Error sending email:", { 
        status: mailgunResponse.status, 
        statusText: mailgunResponse.statusText,
        error: errorText
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to send email: ${errorText}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        success: false,
        error: "Internal server error",
        message: error.message
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});