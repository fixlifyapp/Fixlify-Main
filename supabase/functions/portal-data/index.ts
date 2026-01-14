import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Access token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Portal data request for token:", accessToken.substring(0, 10) + "...");

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the access token using the validate_portal_access function
    const { data: validationResult, error: validationError } = await supabase.rpc(
      'validate_portal_access',
      { p_access_token: accessToken }
    );

    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Failed to validate access token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validationResult?.valid) {
      console.log("Token validation failed:", validationResult?.error);
      return new Response(
        JSON.stringify({ error: validationResult?.error || "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = validationResult.client_id;
    const permissions = validationResult.permissions || {
      view_estimates: true,
      view_invoices: true,
      make_payments: false
    };

    console.log("Token validated for client:", clientId);

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error("Client fetch error:", clientError);
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get company settings for the client's organization
    let company = null;
    if (client.organization_id) {
      const { data: companyData } = await supabase
        .from('company_settings')
        .select('*')
        .eq('organization_id', client.organization_id)
        .single();
      company = companyData;
    }

    // Get jobs for this client
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: false });

    // Get estimates for this client (if permitted)
    let estimates: any[] = [];
    if (permissions.view_estimates) {
      const { data: estimatesData } = await supabase
        .from('estimates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      estimates = estimatesData || [];
    }

    // Get invoices for this client (if permitted)
    let invoices: any[] = [];
    if (permissions.view_invoices) {
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      invoices = invoicesData || [];
    }

    // Get payments for this client
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // Calculate totals
    const totals = {
      estimates: {
        count: estimates.length,
        value: estimates.reduce((sum, est) => sum + (parseFloat(est.total?.toString() || '0')), 0)
      },
      invoices: {
        count: invoices.length,
        value: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0)
      },
      paid: {
        count: invoices.filter(inv => inv.payment_status === 'paid').length,
        value: invoices.filter(inv => inv.payment_status === 'paid')
          .reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0)
      },
      pending: {
        count: invoices.filter(inv => inv.payment_status !== 'paid').length,
        value: invoices.filter(inv => inv.payment_status !== 'paid')
          .reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0)
      }
    };

    // Return portal data
    const portalData = {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
        zip: client.zip
      },
      company: company ? {
        name: company.company_name,
        email: company.company_email,
        phone: company.company_phone,
        website: company.website,
        address: company.address,
        city: company.city,
        state: company.state,
        zip: company.zip,
        business_hours: company.business_hours
      } : null,
      jobs: jobs || [],
      estimates,
      invoices,
      payments: payments || [],
      permissions,
      totals
    };

    console.log("Returning portal data for client:", client.name);

    return new Response(
      JSON.stringify(portalData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Portal data error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
