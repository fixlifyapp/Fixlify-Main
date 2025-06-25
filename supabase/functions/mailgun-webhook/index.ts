import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse form data (Mailgun sends webhooks as form data)
    const formData = await req.formData()
    const signature = formData.get('signature') as string
    const timestamp = formData.get('timestamp') as string
    const token = formData.get('token') as string
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(signature, timestamp, token)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Parse event data
    const event = formData.get('event') as string
    const messageId = formData.get('Message-Id') as string
    const recipient = formData.get('recipient') as string
    
    // Handle different event types
    switch (event) {
      case 'delivered':
        await updateEmailStatus(supabase, messageId, 'delivered', {
          deliveredAt: timestamp
        })
        break
        
      case 'opened':
        await trackEmailEvent(supabase, messageId, 'opened', {
          recipient,
          timestamp,
          ip: formData.get('ip'),
          userAgent: formData.get('user-agent'),
          deviceType: formData.get('device-type')
        })
        break
        
      case 'clicked':
        await trackEmailEvent(supabase, messageId, 'clicked', {
          recipient,
          timestamp,
          url: formData.get('url'),
          ip: formData.get('ip'),
          userAgent: formData.get('user-agent')
        })
        break
        
      case 'bounced':
      case 'failed':
        await updateEmailStatus(supabase, messageId, 'failed', {
          reason: formData.get('reason'),
          code: formData.get('code'),
          error: formData.get('error')
        })
        break
        
      case 'unsubscribed':
        await handleUnsubscribe(supabase, recipient)
        break
        
      case 'complained':
        await handleComplaint(supabase, recipient)
        break
    }

    // Log raw webhook for debugging
    const webhookData = {}
    formData.forEach((value, key) => {
      webhookData[key] = value
    })
    
    await supabase.from('webhook_logs').insert({
      provider: 'mailgun',
      event_type: event,
      payload: webhookData,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing Mailgun webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function verifyWebhookSignature(signature: string, timestamp: string, token: string): Promise<boolean> {
  const apiKey = Deno.env.get('MAILGUN_API_KEY') ?? ''
  const value = timestamp + token
  
  const hash = await createHash('sha256')
    .update(value + apiKey)
    .digest('hex')
  
  return hash === signature
}

async function updateEmailStatus(supabase: any, messageId: string, status: string, additionalData?: any) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...(additionalData && { metadata: additionalData })
  }
  
  const { error } = await supabase
    .from('communication_logs')
    .update(updateData)
    .eq('external_id', messageId)
    .eq('type', 'email')
    
  if (error) {
    console.error('Error updating email status:', error)
  }
}

async function trackEmailEvent(supabase: any, messageId: string, eventType: string, eventData: any) {
  const { error } = await supabase
    .from('email_events')
    .insert({
      message_id: messageId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date(parseInt(eventData.timestamp) * 1000).toISOString(),
      created_at: new Date().toISOString()
    })
    
  if (error) {
    console.error('Error tracking email event:', error)
  }
}

async function handleUnsubscribe(supabase: any, email: string) {
  // Update customer preferences
  const { error } = await supabase
    .from('customer_preferences')
    .upsert({
      email,
      email_opt_out: true,
      email_opt_out_date: new Date().toISOString()
    })
    
  if (error) {
    console.error('Error handling unsubscribe:', error)
  }
}

async function handleComplaint(supabase: any, email: string) {
  // Mark email as complained and potentially block future sends
  const { error } = await supabase
    .from('email_complaints')
    .insert({
      email,
      complained_at: new Date().toISOString()
    })
    
  if (error) {
    console.error('Error handling complaint:', error)
  }
}
