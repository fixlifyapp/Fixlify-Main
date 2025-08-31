import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
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

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_email")
      .eq("id", user.id)
      .single();

    const testEmail = user.email; // Send test to user's own email
    const companyName = profile?.company_name || "Test Company";
    const companyEmail = profile?.company_email || "test@fixlify.app";

    // Test email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fixlify Email Test</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Email Configuration Test</h1>
        <p>This is a test email from Fixlify to verify email sending functionality.</p>
        
        <h2>Configuration Details:</h2>
        <ul>
          <li><strong>Sent to:</strong> ${testEmail}</li>
          <li><strong>From Company:</strong> ${companyName}</li>
          <li><strong>Company Email:</strong> ${companyEmail}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>
        
        <p>If you received this email, your Mailgun configuration is working correctly!</p>
      </body>
      </html>
    `;

    // Send test email using mailgun-email function
    const mailgunResponse = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: testEmail,
        subject: `Fixlify Email Test - ${new Date().toLocaleString()}`,
        html: emailHtml,
        from: `${companyName} <${companyEmail}>`,
        replyTo: companyEmail,
        userId: user.id
      })
    });

    const result = await mailgunResponse.json();
    const status = mailgunResponse.ok ? 'success' : 'failed';

    // Log the test
    await supabase
      .from("communication_logs")
      .insert({
        user_id: user.id,
        type: "email",
        direction: "outbound",
        status: status,
        from_address: companyEmail,
        to_address: testEmail,
        subject: "Fixlify Email Test",
        content: emailHtml,
        metadata: {
          test: true,
          result: result,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: mailgunResponse.ok,
        status: status,
        result: result,
        testDetails: {
          to: testEmail,
          from: `${companyName} <${companyEmail}>`,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: mailgunResponse.ok ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in test-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
