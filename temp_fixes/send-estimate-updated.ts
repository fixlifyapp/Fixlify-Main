import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "No authorization header"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "Invalid authentication"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Parse request body
    const { estimateId, recipientEmail, customMessage } = await req.json();
    if (!estimateId) {
      return new Response(JSON.stringify({
        error: "Estimate ID is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Sending estimate:", estimateId);
    // Get estimate details with job and client info
    const { data: estimate, error: estimateError } = await supabase.from("estimates").select(`
        *,
        jobs!inner(
          *,
          clients!inner(*)
        ),
        line_items!line_items_parent_id_fkey(*)
      `).eq("id", estimateId).single();
    if (estimateError || !estimate) {
      console.error("Error fetching estimate:", estimateError);
      return new Response(JSON.stringify({
        error: "Estimate not found"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Get user profile for company info
    const { data: profile } = await supabase.from("profiles").select("company_name, company_email, company_phone, company_address, brand_color").eq("id", user.id).single();
    const companyName = profile?.company_name || "Your Service Company";
    const companyEmail = profile?.company_email || "noreply@fixlify.app";
    const companyPhone = profile?.company_phone || "";
    const companyAddress = profile?.company_address || "";
    const brandColor = profile?.brand_color || "#3b82f6";
    // Use provided email or client email
    const toEmail = recipientEmail || estimate.jobs?.clients?.email;
    if (!toEmail) {
      return new Response(JSON.stringify({
        error: "No recipient email address available"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Generate portal link
    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://app.fixlify.com"}/portal/estimate/${estimateId}`;
    // Format line items for email
    const lineItemsHtml = estimate.line_items?.map((item)=>`
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>
    `).join("") || "";
    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${estimate.estimate_number}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: ${brandColor}; color: white; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">${companyName}</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Estimate ${estimate.estimate_number}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Dear ${estimate.jobs?.clients?.name || "Valued Customer"},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              ${customMessage || `Thank you for your interest in our services. Please find your estimate details below.`}
            </p>
            
            <!-- Estimate Details -->
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">Estimate Details</h2>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Estimate #:</strong> ${estimate.estimate_number}</p>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Date:</strong> ${new Date(estimate.created_at).toLocaleDateString()}</p>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Job:</strong> ${estimate.jobs?.title || "Service Request"}</p>
              ${estimate.jobs?.address ? `<p style="margin: 8px 0; color: #6b7280;"><strong>Service Location:</strong> ${estimate.jobs.address}</p>` : ""}
            </div>
            
            <!-- Line Items -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Description</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">$${estimate.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${portalLink}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Estimate Online</a>
            </div>
            
            <!-- Notes -->
            ${estimate.notes ? `
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e;"><strong>Notes:</strong> ${estimate.notes}</p>
              </div>
            ` : ""}
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Thank you for your business!</p>
              <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${companyName}</p>
              ${companyPhone ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Phone: ${companyPhone}</p>` : ""}
              ${companyEmail ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Email: ${companyEmail}</p>` : ""}
              ${companyAddress ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${companyAddress}</p>` : ""}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
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
      console.error("Error sending email:", error);
      return new Response(JSON.stringify({
        error: "Failed to send email",
        details: error
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const emailResult = await mailgunResponse.json();
    // Update estimate status to sent
    await supabase.from("estimates").update({
      status: "sent"
    }).eq("id", estimateId);
    // Log communication
    await supabase.from("communication_logs").insert({
      user_id: user.id,
      client_id: estimate.jobs?.client_id,
      job_id: estimate.job_id,
      document_type: "estimate",
      document_id: estimateId,
      type: "email",
      direction: "outbound",
      status: "sent",
      from_address: companyEmail,
      to_address: toEmail,
      subject: `Estimate ${estimate.estimate_number}`,
      content: emailHtml,
      metadata: {
        estimate_number: estimate.estimate_number,
        total: estimate.total,
        portal_link: portalLink,
        mailgun_id: emailResult.mailgunId
      }
    });
    return new Response(JSON.stringify({
      success: true,
      message: "Estimate sent successfully",
      emailId: emailResult.mailgunId
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error sending estimate:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
