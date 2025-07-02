import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { accessToken } = await req.json()
    
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    console.log('🔐 Loading portal data for token:', accessToken.substring(0, 10) + '...')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // First check if there's an active session for this token
    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('portal_sessions')
      .select('client_id, permissions, expires_at')
      .eq('access_token', accessToken)
      .eq('is_active', true)
      .single()

    let clientId = null
    let permissions = null

    if (sessionData && !sessionError) {
      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        console.error('❌ Session has expired')
        throw new Error('Session has expired')
      }
      
      clientId = sessionData.client_id
      permissions = sessionData.permissions
      
      console.log('✅ Valid session found for client:', clientId)
    } else {
      // No active session, check client_portal_access table
      console.log('No active session, checking portal access token...')
      
      const { data: accessData, error: accessError } = await supabaseClient
        .from('client_portal_access')
        .select('client_id, permissions, expires_at')
        .eq('access_token', accessToken)
        .single()

      if (accessError || !accessData) {
        console.error('❌ Invalid or expired access token')
        throw new Error('Invalid or expired access token')
      }

      // Check if token is expired
      if (new Date(accessData.expires_at) < new Date()) {
        console.error('❌ Access token has expired')
        throw new Error('Access token has expired')
      }

      clientId = accessData.client_id
      permissions = accessData.permissions || {
        view_estimates: true,
        view_invoices: true,
        view_jobs: true,
        pay_invoices: true,
        approve_estimates: true
      }

      // Create a session for this access token
      await supabaseClient
        .from('portal_sessions')
        .insert({
          access_token: accessToken,
          client_id: clientId,
          permissions: permissions,
          expires_at: accessData.expires_at,
          is_active: true
        })

      console.log('✅ Valid access token for client:', clientId)
    }

    // Get client data
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.error('❌ Client not found:', clientId)
      throw new Error('Client not found')
    }

    // Get estimates if permitted
    let estimates = []
    if (permissions.view_estimates !== false) {
      const { data: estimatesData, error: estimatesError } = await supabaseClient
        .from('estimates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!estimatesError && estimatesData) {
        estimates = estimatesData
      }
    }

    // Get invoices if permitted
    let invoices = []
    if (permissions.view_invoices !== false) {
      const { data: invoicesData, error: invoicesError } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!invoicesError && invoicesData) {
        invoices = invoicesData
      }
    }

    // Get jobs
    let jobs = []
    if (permissions.view_jobs !== false) {
      const { data: jobsData, error: jobsError } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!jobsError && jobsData) {
        jobs = jobsData
      }
    }

    // Get company settings (use service role for this)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: companySettings, error: companyError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    let company = null
    if (companySettings) {
      company = {
        name: companySettings.company_name,
        email: companySettings.company_email,
        phone: companySettings.company_phone,
        website: companySettings.company_website,
        address: companySettings.company_address,
        city: companySettings.company_city,
        state: companySettings.company_state,
        zip: companySettings.company_zip
      }
    }

    // Calculate totals
    const totals = {
      estimates: {
        count: estimates.length,
        value: estimates.reduce((sum, est) => sum + (est.total || 0), 0)
      },
      invoices: {
        count: invoices.length,
        value: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
      },
      paid: {
        count: invoices.filter(inv => inv.payment_status === 'paid').length,
        value: invoices.filter(inv => inv.payment_status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
      },
      pending: {
        count: invoices.filter(inv => inv.payment_status !== 'paid').length,
        value: invoices.filter(inv => inv.payment_status !== 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
      }
    }

    // Update last accessed time if session exists
    if (sessionData) {
      await supabaseClient
        .from('portal_sessions')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('access_token', accessToken)
    }

    const responseData = {
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
      company,
      jobs: jobs || [],
      estimates,
      invoices,
      permissions,
      totals
    }

    console.log('✅ Portal data loaded successfully')

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error loading portal data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to load portal data'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
