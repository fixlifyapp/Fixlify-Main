import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Generate a secure random token
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { invoiceId, recipientEmail, customMessage } = await req.json();
    
    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Invoice ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("Sending invoice:", invoiceId);

    // Get invoice details with job and client info
    // Fixed: Removed line_items foreign key reference since items are stored in JSONB column
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
      console.error("Error fetching invoice:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate or use existing portal access token
    let portalToken = invoice.portal_access_token;
    if (!portalToken) {
      portalToken = generateToken();
      // Update invoice with new token
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
    const companyPhone = profile?.company_phone || "";
    const companyAddress = profile?.company_address || "";
    const brandColor = profile?.brand_color || "#3b82f6";

    // Use provided email or client email
    const toEmail = recipientEmail || invoice.jobs?.clients?.email;
    
    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: "No recipient email address available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate portal links with token
    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/invoice/${invoiceId}?token=${portalToken}`;
    const paymentLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/pay/${invoiceId}?token=${portalToken}`;

    // Format line items for email - using JSONB items field
    const lineItemsHtml = invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 
      ? invoice.items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description || item.name || 'Service'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.unit_price || item.rate || item.amount || 0).toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.total || ((item.quantity || 1) * (item.unit_price || item.rate || item.amount || 0))).toFixed(2)}</td>
        </tr>
      `).join("") 
      : "";

    // Calculate amount due
    const amountDue = invoice.total - (invoice.amount_paid || 0);
    const isPaid = invoice.payment_status === "paid";

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: ${brandColor}; color: white; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">${companyName}</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Invoice ${invoice.invoice_number}</p>
          </div>          
          <!-- Status Banner -->
          ${isPaid ? `
            <div style="background-color: #10b981; color: white; padding: 12px 24px; text-align: center;">
              <p style="margin: 0; font-weight: 600;">✓ PAID IN FULL</p>
            </div>
          ` : amountDue > 0 ? `
            <div style="background-color: #ef4444; color: white; padding: 12px 24px; text-align: center;">
              <p style="margin: 0; font-weight: 600;">AMOUNT DUE: $${amountDue.toFixed(2)}</p>
            </div>
          ` : ""}
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Dear ${invoice.jobs?.clients?.name || "Valued Customer"},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              ${customMessage || `Thank you for your business. Please find your invoice details below.`}
            </p>
            
            <!-- Invoice Details -->
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">Invoice Details</h2>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
              <p style="margin: 8px 0; color: #6b7280;"><strong>Job:</strong> ${invoice.jobs?.title || "Service Request"}</p>
              ${invoice.jobs?.address ? `<p style="margin: 8px 0; color: #6b7280;"><strong>Service Location:</strong> ${invoice.jobs.address}</p>` : ""}
            </div>            
            <!-- Line Items -->
            ${lineItemsHtml ? `
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
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; color: #374151;">$${(invoice.subtotal || invoice.total).toFixed(2)}</td>
                  </tr>
                  ${invoice.tax_amount ? `
                    <tr>
                      <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">Tax:</td>
                      <td style="padding: 12px; text-align: right; color: #374151;">$${invoice.tax_amount.toFixed(2)}</td>
                    </tr>
                  ` : ""}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">$${invoice.total.toFixed(2)}</td>
                  </tr>                ${invoice.amount_paid > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">Paid:</td>
                    <td style="padding: 12px; text-align: right; color: #10b981;">-$${invoice.amount_paid.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">Amount Due:</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600; color: #ef4444; font-size: 18px;">$${amountDue.toFixed(2)}</td>
                  </tr>
                  ` : ""}
                </tfoot>
              </table>
            ` : `
              <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #6b7280; text-align: center;">No line items added to this invoice</p>
                <p style="margin: 16px 0 0 0; color: #111827; text-align: center; font-size: 18px; font-weight: 600;">Total: $${invoice.total.toFixed(2)}</p>
                ${invoice.amount_paid > 0 ? `
                  <p style="margin: 8px 0 0 0; color: #10b981; text-align: center;">Paid: -$${invoice.amount_paid.toFixed(2)}</p>
                  <p style="margin: 8px 0 0 0; color: #ef4444; text-align: center; font-size: 18px; font-weight: 600;">Amount Due: $${amountDue.toFixed(2)}</p>
                ` : ""}
              </div>
            `}
            
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${portalLink}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 8px;">View Invoice</a>
              ${!isPaid ? `<a href="${paymentLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 8px;">Pay Now</a>` : ""}
            </div>
            
            <!-- Notes -->
            ${invoice.notes ? `
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e;"><strong>Notes:</strong> ${invoice.notes}</p>
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
        subject: `Invoice ${invoice.invoice_number} from ${companyName}${!isPaid ? " - Amount Due: $" + amountDue.toFixed(2) : " - PAID"}`,
        html: emailHtml,
        from: `${companyName} <${companyEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await mailgunResponse.json();

    // Update invoice status to sent (if not already paid)
    if (invoice.status !== "paid") {
      await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId);
    }
    // Log communication
    await supabase
      .from("communication_logs")
      .insert({
        user_id: user.id,
        client_id: invoice.jobs?.client_id,
        job_id: invoice.job_id,
        document_type: "invoice",
        document_id: invoiceId,
        type: "email",
        direction: "outbound",
        status: "sent",
        from_address: companyEmail,
        to_address: toEmail,
        subject: `Invoice ${invoice.invoice_number}`,
        content: emailHtml,
        metadata: {
          invoice_number: invoice.invoice_number,
          total: invoice.total,
          amount_due: amountDue,
          payment_status: invoice.payment_status,
          portal_link: portalLink,
          portal_token: portalToken,
          payment_link: paymentLink,
          mailgun_id: emailResult.mailgunId
        }
      });

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
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});