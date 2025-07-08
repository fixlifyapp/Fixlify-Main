
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { estimateId, method, recipient } = await req.json()
    
    if (!estimateId || !method || !recipient) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'estimateId, method, and recipient are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get estimate with client info
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        ),
        jobs (
          id,
          title,
          client_id,
          clients (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      console.error('Error fetching estimate:', estimateError)
      return new Response(
        JSON.stringify({ 
          error: 'Estimate not found', 
          details: estimateError?.message || 'No estimate found with the given ID' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client info - try from estimate first, then from job
    let client = estimate.clients
    if (!client && estimate.jobs?.clients) {
      client = estimate.jobs.clients
    }
    
    if (!client) {
      console.error('No client found for estimate:', estimateId)
      return new Response(
        JSON.stringify({ 
          error: 'Client information not found', 
          details: 'No client associated with this estimate' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending estimate:', {
      estimateId,
      method,
      recipient,
      clientName: client.name,
      estimateTotal: estimate.total
    })

    if (method === 'email') {
      const result = await sendEstimateEmail(estimate, client, recipient)
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
      }
    } else if (method === 'sms') {
      const result = await sendEstimateSMS(estimate, client, recipient)
      if (!result.success) {
        throw new Error(result.error || 'Failed to send SMS')
      }
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid send method', 
          details: 'Method must be either "email" or "sms"' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the communication
    await supabase.from('estimate_communications').insert({
      estimate_id: estimateId,
      client_id: client.id,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      communication_type: method,
      recipient: recipient,
      status: 'sent',
      estimate_number: estimate.estimate_number,
      sent_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Estimate sent via ${method} to ${recipient}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-estimate function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendEstimateEmail(estimate: any, client: any, recipient: string) {
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
  
  if (!mailgunApiKey || !mailgunDomain) {
    console.error('Mailgun configuration missing')
    return { success: false, error: 'Email service not configured' }
  }

  const subject = `Estimate ${estimate.estimate_number} from ${Deno.env.get('COMPANY_NAME') || 'Our Company'}`
  const html = `
    <h2>Estimate #${estimate.estimate_number}</h2>
    <p>Dear ${client.name},</p>
    <p>Please find your estimate details below:</p>
    <p><strong>Total Amount:</strong> $${estimate.total}</p>
    <p>Thank you for your business!</p>
  `

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: `noreply@${mailgunDomain}`,
        to: recipient,
        subject: subject,
        html: html,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mailgun API error:', errorText)
      return { success: false, error: `Email service error: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

async function sendEstimateSMS(estimate: any, client: any, recipient: string) {
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
  const telnyxFromNumber = Deno.env.get('TELNYX_FROM_NUMBER')
  
  if (!telnyxApiKey || !telnyxFromNumber) {
    console.error('Telnyx configuration missing')
    return { success: false, error: 'SMS service not configured' }
  }

  const message = `Estimate #${estimate.estimate_number} - Total: $${estimate.total}. Thank you for your business!`

  try {
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyxFromNumber,
        to: recipient,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Telnyx API error:', errorText)
      return { success: false, error: `SMS service error: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error('SMS sending error:', error)
    return { success: false, error: error.message }
  }
}
