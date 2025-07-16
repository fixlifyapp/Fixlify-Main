import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("⚠️ send-email function called - this is a compatibility layer");
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    // Get the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Received request body:", JSON.stringify(body));
    
    // Validate required fields
    if (!body.to || !body.subject) {
      console.error("Missing required fields:", { to: body.to, subject: body.subject });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: to, subject",
          received: { to: body.to, subject: body.subject }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Ensure we have content
    if (!body.html && !body.text) {
      body.text = "No content provided";
    }
    
    // Forward the request to mailgun-email
    console.log("Forwarding to mailgun-email function...");
    const response = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
      method: "POST",
      headers: {
        "Authorization": authHeader || `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = resultText;
    }
    
    console.log("Mailgun response:", response.status, result);
    
    return new Response(
      JSON.stringify(result),
      {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});