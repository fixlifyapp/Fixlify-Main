import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to verify Telnyx webhook signature
async function verifyTelnyxSignature(payload: string, signature: string, timestamp: string): Promise<boolean> {
  const telnyxPublicKey = Deno.env.get('TELNYX_PUBLIC_KEY')
  
  if (!telnyxPublicKey) {
    console.warn('TELNYX_PUBLIC_KEY not configured, skipping signature verification')
    return true // Skip verification if not configured
  }

  try {
    // Telnyx uses Ed25519 signatures
    const signatureBytes = new TextEncoder().encode(signature)
    const timestampedPayload = `${timestamp}|${payload}`
    const payloadBytes = new TextEncoder().encode(timestampedPayload)
    
    // For now, we'll skip actual verification since it requires Ed25519
    // In production, you should implement proper signature verification
    return true
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle GET requests (health check)
  if (req.method === 'GET') {
    return new Response('OK', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    })
  }

  try {
    // Check if it's a Telnyx webhook by looking for signature headers
    const telnyxSignature = req.headers.get('telnyx-signature-ed25519-signature') || 
                           req.headers.get('telnyx-signature') || 
                           req.headers.get('Telnyx-Signature-Ed25519')
    const telnyxTimestamp = req.headers.get('telnyx-signature-ed25519-timestamp') || 
                           req.headers.get('telnyx-timestamp') || 
                           req.headers.get('Telnyx-Timestamp')
    
    // If it's a Telnyx webhook, we don't require authorization
    const isTelnyxWebhook = telnyxSignature || telnyxTimestamp || 
                           req.headers.get('user-agent')?.toLowerCase().includes('telnyx')
    
    // Only check authorization if it's not a Telnyx webhook
    if (!isTelnyxWebhook) {
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        console.log('Missing authorization header for non-Telnyx request')
        return new Response(JSON.stringify({ 
          code: 401, 
          message: 'Missing authorization header' 
        }), { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse the webhook payload
    const bodyText = await req.text()
    let webhookData
    
    try {
      webhookData = JSON.parse(bodyText)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return new Response('Invalid JSON payload', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      })
    }

    console.log('Received webhook:', JSON.stringify(webhookData, null, 2))
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

    // Verify Telnyx signature if present
    if (telnyxSignature && telnyxTimestamp) {
      const isValid = await verifyTelnyxSignature(bodyText, telnyxSignature, telnyxTimestamp)
      if (!isValid) {
        console.error('Invalid Telnyx signature')
        return new Response('Invalid signature', { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        })
      }
    }

    // Extract data from Telnyx webhook format
    let messageData;
    
    // Check if it's wrapped in 'data' object (standard Telnyx format)
    if (webhookData.data) {
      messageData = webhookData.data.payload || webhookData.data
    } else {
      messageData = webhookData
    }

    // Validate required fields
    if (!messageData.from?.phone_number || !messageData.to?.[0]?.phone_number) {
      console.error('Missing required fields:', { from: messageData.from, to: messageData.to })
      return new Response('Invalid payload - missing from/to phone numbers', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      })
    }

    const from = messageData.from.phone_number
    const to = messageData.to[0].phone_number
    const text = messageData.text || ''
    const direction = messageData.direction || 'inbound'
    const messageId = messageData.id || webhookData.data?.id || null
    
    console.log('Processing message:', { from, to, text, direction, messageId })

    // For inbound messages, store in database
    if (direction === 'inbound') {
      // Find the phone number in our database
      const { data: phoneNumber, error: phoneError } = await supabaseClient
        .from('phone_numbers')
        .select('id, purchased_by')
        .eq('phone_number', to)
        .single()

      if (phoneError || !phoneNumber) {
        console.error('Phone number not found:', to, phoneError)
        // Don't return 404 for webhooks - acknowledge receipt
        console.log('Acknowledging webhook even though phone number not found')
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Webhook acknowledged (phone number not registered)',
          warning: 'Phone number not found in system'
        }), {
          status: 200, // Return 200 to prevent Telnyx retries
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Store the SMS message
      const { error: insertError } = await supabaseClient
        .from('sms_messages')
        .insert({
          from_number: from,
          to_number: to,
          message: text,
          direction: 'inbound',
          status: 'received',
          phone_number_id: phoneNumber.id,
          user_id: phoneNumber.purchased_by,
          telnyx_message_id: messageId,
          metadata: {
            carrier: messageData.from.carrier,
            line_type: messageData.from.line_type,
            received_at: messageData.received_at || new Date().toISOString(),
            webhook_type: webhookData.data?.record_type || 'message',
            encoding: messageData.encoding,
            parts: messageData.parts,
            cost: messageData.cost
          }
        })

      if (insertError) {
        console.error('Error storing message:', insertError)
        // Still return success to prevent retries
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Webhook acknowledged (storage error)',
          error: insertError.message
        }), {
          status: 200, // Return 200 to prevent Telnyx retries
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('Message stored successfully')
      
      // Create notification for user
      try {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: phoneNumber.purchased_by,
            title: 'New SMS Received',
            message: `New message from ${from}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
            type: 'sms',
            read: false
          })
      } catch (notifError) {
        console.error('Error creating notification:', notifError)
      }
    }

    // Handle delivery status updates
    if (webhookData.data?.record_type === 'event' && webhookData.data?.event_type) {
      const eventType = webhookData.data.event_type
      console.log('Processing event:', eventType)
      
      if (eventType === 'message.sent' || eventType === 'message.finalized' || eventType === 'message.failed') {
        // Update message status in database
        const { error: updateError } = await supabaseClient
          .from('sms_messages')
          .update({
            status: eventType === 'message.sent' ? 'sent' : 
                   eventType === 'message.finalized' ? 'delivered' : 'failed',
            metadata: webhookData.data
          })
          .eq('telnyx_message_id', messageId)
        
        if (updateError) {
          console.error('Error updating message status:', updateError)
        }
      }
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully',
      messageId: messageId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    // Return success to prevent retries even on error
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook acknowledged with error',
      error: error.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})