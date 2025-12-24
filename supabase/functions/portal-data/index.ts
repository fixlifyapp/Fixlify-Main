import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalDataRequest {
  accessToken?: string;
  action?: 'generate_token' | 'validate_token' | 'get_data';
  client_id?: string;
  permissions?: {
    view_jobs: boolean;
    view_invoices: boolean;
    view_estimates: boolean;
    make_payments: boolean;
  };
  expires_in_days?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PortalDataRequest = await req.json();
    const { accessToken, action, client_id, permissions, expires_in_days } = requestData;

    console.log('portal-data request:', { action, client_id, hasToken: !!accessToken });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different actions
    if (action === 'generate_token') {
      if (!client_id) {
        throw new Error('Client ID is required');
      }

      // Generate a secure access token
      const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (expires_in_days || 7));

      // Create portal access record
      const { data: portalAccess, error: insertError } = await supabase
        .from('client_portal_access')
        .insert({
          client_id,
          access_token: token,
          permissions: permissions || {
            view_jobs: true,
            view_invoices: true,
            view_estimates: true,
            make_payments: false
          },
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate the portal URL
      const portalUrl = `${supabaseUrl.replace('.supabase.co', '.vercel.app')}/portal?token=${token}`;

      return new Response(
        JSON.stringify({
          success: true,
          token,
          portalUrl,
          expiresAt: expiresAt.toISOString(),
          permissions: portalAccess.permissions
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default behavior: get portal data using access token
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // Validate the access token
    const { data: portalAccess, error: accessError } = await supabase
      .from('client_portal_access')
      .select('*, clients(*)')
      .eq('access_token', accessToken)
      .eq('is_active', true)
      .single();

    if (accessError || !portalAccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired access token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if token is expired
    if (new Date(portalAccess.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access token has expired'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const clientId = portalAccess.client_id;
    const clientPermissions = portalAccess.permissions || {};

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    // Get jobs if permitted
    let jobs = [];
    if (clientPermissions.view_jobs !== false) {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      jobs = jobsData || [];
    }

    // Get estimates if permitted
    let estimates = [];
    if (clientPermissions.view_estimates !== false) {
      const { data: estimatesData } = await supabase
        .from('job_estimates')
        .select('*, jobs(title)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      estimates = estimatesData || [];
    }

    // Get invoices if permitted
    let invoices = [];
    if (clientPermissions.view_invoices !== false) {
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*, jobs(title)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      invoices = invoicesData || [];
    }

    // Get company settings for branding
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('company_name, company_logo_url, company_tagline, support_email, support_phone')
      .eq('user_id', client.user_id)
      .single();

    // Update last accessed timestamp
    await supabase
      .from('client_portal_access')
      .update({ last_accessed: new Date().toISOString() })
      .eq('access_token', accessToken);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          client,
          jobs,
          estimates,
          invoices,
          permissions: clientPermissions,
          company: companySettings
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in portal-data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
