
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
    const { invoiceId, method, recipient } = await req.json()
    
    if (!invoiceId || !method || !recipient) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'invoiceId, method, and recipient are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get invoice with client info
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
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
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError)
      return new Response(
        JSON.stringify({ 
          error: 'Invoice not found', 
          details: invoiceError?.message || 'No invoice found with the given ID' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client info - try from invoice first, then from job
    let client = invoice.clients
    if (!client && invoice.jobs?.clients) {
      client = invoice.jobs.clients
    }
    
    if (!client) {
      console.error('No client found for invoice:', invoiceId)
      return new Response(
        JSON.stringify({ 
          error: 'Client information not found', 
          details: 'No client associated with this invoice' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending invoice:', {
      invoiceId,
      method,
      recipient,
      clientName: client.name,
      invoiceTotal: invoice.total
    })

    if (method === 'email') {
      const result = await sendInvoiceEmail(invoice, client, recipient)
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
      }
    } else if (method === 'sms') {
      const result = await sendInvoiceSMS(invoice, client, recipient)
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
    await supabase.from('invoice_communications').insert({
      invoice_id: invoiceId,
      client_id: client.id,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      communication_type: method,
      recipient: recipient,
      status: 'sent',
      invoice_number: invoice.invoice_number,
      sent_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invoice sent via ${method} to ${recipient}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-invoice function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendInvoiceEmail(invoice: any, client: any, recipient: string) {
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
  
  if (!mailgunApiKey || !mailgunDomain) {
    console.error('Mailgun configuration missing')
    return { success: false, error: 'Email service not configured' }
  }

  const subject = `Invoice ${invoice.invoice_number} - Payment Due`
  const html = `
    <h2>Invoice #${invoice.invoice_number}</h2>
    <p>Dear ${client.name},</p>
    <p>Please find your invoice details below:</p>
    <p><strong>Total Amount:</strong> $${invoice.total}</p>
    <p><strong>Due Date:</strong> ${invoice.due_date || 'Upon receipt'}</p>
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

async function sendInvoiceSMS(invoice: any, client: any, recipient: string) {
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
  const telnyxFromNumber = Deno.env.get('TELNYX_FROM_NUMBER')
  
  if (!telnyxApiKey || !telnyxFromNumber) {
    console.error('Telnyx configuration missing')
    return { success: false, error: 'SMS service not configured' }
  }

  const message = `Invoice #${invoice.invoice_number} - Amount Due: $${invoice.total}. Due: ${invoice.due_date || 'Upon receipt'}. Thank you!`

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
