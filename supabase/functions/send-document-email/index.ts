import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type DocumentType = 'estimate' | 'invoice';

// Configuration for each document type
const documentConfigs: Record<DocumentType, {
  tableName: string;
  numberField: string;
  primaryColor: string;
  gradientEnd: string;
  headerText: string;
  buttonIcon: string;
  buttonText: string;
  actionText: string;
  footerText: string;
  itemsTitle: string;
  itemsList: string[];
  communicationsTable?: string;
}> = {
  estimate: {
    tableName: 'estimates',
    numberField: 'estimate_number',
    primaryColor: '#667eea',
    gradientEnd: '#764ba2',
    headerText: 'Estimate Ready',
    buttonIcon: '📋',
    buttonText: 'View Estimate Online',
    actionText: 'is ready for your review',
    footerText: 'This estimate is valid for 30 days. Questions? Contact us anytime.',
    itemsTitle: "What's included:",
    itemsList: [
      'Detailed breakdown of services',
      'Transparent pricing',
      'Easy online review and approval'
    ]
  },
  invoice: {
    tableName: 'invoices',
    numberField: 'invoice_number',
    primaryColor: '#28a745',
    gradientEnd: '#20c997',
    headerText: 'Invoice Ready',
    buttonIcon: '💳',
    buttonText: 'View & Pay Invoice Online',
    actionText: 'is ready for payment',
    footerText: 'Need help? Contact us anytime. We appreciate your business!',
    itemsTitle: 'Payment Options:',
    itemsList: [
      'Secure online payment',
      'Multiple payment methods accepted',
      'Instant payment confirmation'
    ],
    communicationsTable: 'invoice_communications'
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[send-document-email] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();

    // Support both new unified API and legacy APIs for backwards compatibility
    let documentType: DocumentType;
    let documentId: string;

    if (body.documentType && body.documentId) {
      // New unified API
      documentType = body.documentType as DocumentType;
      documentId = body.documentId;
    } else if (body.estimateId) {
      // Legacy estimate API
      documentType = 'estimate';
      documentId = body.estimateId;
    } else if (body.invoiceId) {
      // Legacy invoice API
      documentType = 'invoice';
      documentId = body.invoiceId;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Document type and ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { recipientEmail, customMessage } = body;
    const config = documentConfigs[documentType];

    console.log(`[send-document-email] Processing ${documentType}:`, documentId);

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from(config.tableName)
      .select("*")
      .eq("id", documentId)
      .maybeSingle();

    if (docError) {
      console.error(`[send-document-email] Error fetching ${documentType}:`, docError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch ${documentType}`, details: docError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!document) {
      return new Response(
        JSON.stringify({ success: false, error: `${documentType} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch job details if job_id exists
    let job = null;
    if (document.job_id) {
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", document.job_id)
        .maybeSingle();
      job = jobData;
    }

    // Fetch client details
    let client = null;
    const clientId = document.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();
      client = clientData;
    }

    // Generate portal token
    let portalToken = document.portal_access_token;
    if (!portalToken) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      portalToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

      await supabase
        .from(config.tableName)
        .update({ portal_access_token: portalToken })
        .eq("id", documentId);
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const portalLink = `${Deno.env.get("PUBLIC_SITE_URL") || "https://hub.fixlify.app"}/portal/${portalToken}`;

    // Generate personalized email address
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'team';
    const personalizedEmail = `${cleanName}@fixlify.app`;

    const documentNumber = document[config.numberField];
    const documentTotal = document.total?.toFixed(2) || '0.00';

    // Professional email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.headerText} ${documentNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.gradientEnd} 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">${config.headerText}</h1>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${client?.name || "Valued Customer"},</p>

            ${customMessage ? `<p style="font-size: 16px; color: #333; line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid ${config.primaryColor};">${customMessage}</p>` : ''}

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your ${documentType} <strong style="color: ${config.primaryColor};">#${documentNumber}</strong>
              for <strong style="color: ${config.primaryColor};">$${documentTotal}</strong>
              ${config.actionText}.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalLink}"
                 style="background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.gradientEnd} 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        display: inline-block;
                        font-weight: 500;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(${parseInt(config.primaryColor.slice(1, 3), 16)}, ${parseInt(config.primaryColor.slice(3, 5), 16)}, ${parseInt(config.primaryColor.slice(5, 7), 16)}, 0.3);">
                ${config.buttonIcon} ${config.buttonText}
              </a>
              ${companyEmail ? `<div style="margin-top: 15px; font-size: 14px; color: #666;">
                Questions? Contact us at <a href="mailto:${companyEmail}" style="color: ${config.primaryColor}; text-decoration: none;">${companyEmail}</a>
              </div>` : ''}
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">${config.itemsTitle}</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                ${config.itemsList.map(item => `<li>${item}</li>`).join('\n                ')}
              </ul>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Questions? Simply reply to this email or contact us directly.
              ${documentType === 'invoice' ? 'Thank you for choosing us for your project!' : "We're here to help make your project a success."}
            </p>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 16px; color: #333; margin: 0;">
                ${documentType === 'invoice' ? 'Thank you for your business' : 'Best regards'},<br>
                <strong style="color: ${config.primaryColor};">${companyName}</strong>
              </p>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              ${config.footerText}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[send-document-email] Sending ${documentType} email to:`, toEmail);

    // Send email using Mailgun via our edge function
    const mailgunResponse = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: toEmail,
        subject: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber} from ${companyName}`,
        html: emailHtml,
        from: `${companyName} <${personalizedEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error(`[send-document-email] Error sending email:`, errorText);

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
        JSON.stringify({ success: false, error: errorMessage, code: errorCode }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await mailgunResponse.json();
    console.log(`[send-document-email] Email sent successfully:`, emailResult.mailgunId);

    // Log communication for invoices
    if (config.communicationsTable) {
      try {
        await supabase.from(config.communicationsTable).insert({
          invoice_id: documentId,
          type: 'email',
          recipient_email: toEmail,
          content: customMessage || `${documentType} ${documentNumber} sent via email`,
          status: 'sent',
          metadata: {
            portal_url: portalLink,
            client_name: client?.name,
            mailgun_id: emailResult.mailgunId,
            subject: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber} from ${companyName}`
          }
        });
      } catch (logError) {
        console.warn(`[send-document-email] Failed to log communication:`, logError);
      }
    }

    // Update document status
    await supabase
      .from(config.tableName)
      .update({ status: "sent" })
      .eq("id", documentId);

    // Log to job_history for the History tab
    if (document.job_id) {
      try {
        const docTypeCapitalized = documentType.charAt(0).toUpperCase() + documentType.slice(1);
        await supabase.from('job_history').insert({
          job_id: document.job_id,
          type: documentType,
          title: `${docTypeCapitalized} #${documentNumber} Sent`,
          description: `${docTypeCapitalized} for $${documentTotal} sent via email to ${client?.name || toEmail}`,
          user_name: 'System',
          meta: {
            document_id: documentId,
            document_number: documentNumber,
            total: document.total,
            recipient_email: toEmail,
            client_name: client?.name,
            action: 'sent',
            sent_via: 'email',
            portal_url: portalLink
          }
        });
      } catch (historyError) {
        console.warn('[send-document-email] Failed to log to job_history:', historyError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${documentType} sent successfully`,
        emailId: emailResult.mailgunId,
        portalLink: portalLink
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-document-email] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
