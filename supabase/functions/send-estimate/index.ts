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
    console.log('📧 Send estimate email function called')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header')
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError)
      return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { estimateId, recipientEmail, customMessage } = await req.json()
    console.log('📧 Email Request:', { estimateId, recipientEmail, hasCustomMessage: !!customMessage })

    if (!estimateId || !recipientEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Missing estimate ID or recipient email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs(*, clients(*))
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      console.error('❌ Estimate not found:', estimateError)
      return new Response(JSON.stringify({ success: false, error: 'Estimate not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    console.log('📋 Found estimate:', estimate.estimate_number)

    // Generate portal access token
    const portalToken = crypto.randomUUID()
    
    // Update estimate with portal token
    await supabaseAdmin
      .from('estimates')
      .update({ 
        portal_access_token: portalToken,
        sent_at: new Date().toISOString()
      })
      .eq('id', estimateId)

    const portalUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/estimate/${estimateId}?token=${portalToken}`
    
    // Prepare email content
    const clientName = estimate.jobs?.clients?.name || 'Valued Customer';
    
    // Get company settings
    const { data: companyData } = await supabaseAdmin
      .from('profiles')
      .select('company_name')
      .eq('user_id', userData.user.id)
      .single();
    
    const companyName = companyData?.company_name || 'Your Company';
    
    const emailSubject = `Estimate ${estimate.estimate_number} from ${companyName}`;
    const emailBody = `
      <h2>New Estimate from ${companyName}</h2>
      <p>Dear ${clientName},</p>
      
      ${customMessage ? `<p>${customMessage}</p>` : ''}
      
      <p>Please find your estimate attached. You can view and approve it online using the link below:</p>
      
      <p><a href="${portalUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Estimate</a></p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>${companyName} Team</p>
    `;

    // Call send-email function
    const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: emailSubject,
        html: emailBody,
        user_id: userData.user.id
      }
    })

    if (emailError) {
      console.error('❌ Email sending failed:', emailError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email: ' + emailError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!emailResult?.success) {
      console.error('❌ Email service error:', emailResult)
      return new Response(JSON.stringify({ 
        success: false, 
        error: emailResult?.error || 'Email service failed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('✅ Estimate email sent successfully')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Estimate email sent successfully',
      portalUrl: portalUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in send-estimate:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})