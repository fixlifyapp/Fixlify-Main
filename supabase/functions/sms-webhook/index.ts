import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Verify Telnyx webhook signature
async function verifyTelnyx(payload: string, signature: string | null): Promise<boolean> {
  const webhookSecret = Deno.env.get('TELNYX_WEBHOOK_SECRET')
  
  // If no secret configured, log warning but allow in dev
  if (!webhookSecret) {
    console.warn('TELNYX_WEBHOOK_SECRET not configured - webhook verification disabled')
    return true // Only for development, set to false in production
  }
  
  if (!signature) {
    console.error('No signature provided in request')
    return false
  }
  
  // Telnyx uses HMAC-SHA256 for webhook signatures
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
  return signature === expectedSignature
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await req.text()
    
    // Verify webhook signature (if in production)
    const signature = req.headers.get('x-telnyx-signature')
    const isValid = await verifyTelnyx(rawBody, signature)
    
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // CRITICAL: Immediately acknowledge the webhook to prevent retries
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    // Process the webhook asynchronously after sending response
    processWebhookAsync(rawBody).catch(error => {
      console.error('Error processing webhook asynchronously:', error)
    })

    return response
  } catch (error) {
    console.error('Error in SMS webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processWebhookAsync(rawBody: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const body = JSON.parse(rawBody)
  console.log('Received Telnyx webhook:', JSON.stringify(body, null, 2))

  const { data } = body
  
  // Handle different event types
  if (data?.record_type === 'message') {
    const { direction, from, to, text, id: messageId } = data.payload
    
    // DEDUPLICATION: Check for duplicate messages using message ID
    const { data: existingMessage } = await supabase
      .from('sms_messages')
      .select('id')
      .eq('external_id', messageId)
      .single()
    
    if (existingMessage) {
      console.log(`Duplicate message detected and ignored: ${messageId}`)
      return // Skip processing duplicate
    }
    
    // Process incoming messages
    if (direction === 'inbound') {
      console.log(`Incoming SMS from ${from.phone_number} to ${to[0].phone_number}: ${text}`)
      
      // Find which user owns the receiving phone number
      const { data: phoneOwner } = await supabase
        .from('phone_numbers')
        .select('user_id')
        .eq('phone_number', to[0].phone_number)
        .single()
      
      if (!phoneOwner) {
        console.log(`No user found for phone number ${to[0].phone_number}`)
        return
      }
      
      // Find or create conversation
      let conversation = null
      
      // First try to find existing conversation
      const { data: existingConversation } = await supabase
        .from('sms_conversations')
        .select('*')
        .eq('user_id', phoneOwner.user_id)
        .eq('client_phone', from.phone_number)
        .eq('phone_number', to[0].phone_number)
        .eq('status', 'active')
        .single()
      
      if (existingConversation) {
        conversation = existingConversation
      } else {
        // Check if this is a known client
        let clientId = null
        const { data: client } = await supabase
          .from('clients')
          .select('id, name')
          .eq('phone', from.phone_number)
          .eq('user_id', phoneOwner.user_id)
          .single()
        
        if (client) {
          clientId = client.id
        } else {
          // Create a new client for unknown numbers
          console.log(`Creating new client for unknown number: ${from.phone_number}`)
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: `Unknown (${from.phone_number})`,
              phone: from.phone_number,
              user_id: phoneOwner.user_id,
              status: 'lead',
              type: 'individual',
              notes: `Auto-created from SMS received at ${new Date().toISOString()}`
            })
            .select()
            .single()
          
          if (clientError) {
            console.error('Error creating client:', clientError)
            // Continue without client_id
          } else if (newClient) {
            clientId = newClient.id
            console.log(`Created new client for ${from.phone_number} with ID: ${clientId}`)
          }
        }
        
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('sms_conversations')
          .insert({
            user_id: phoneOwner.user_id,
            client_id: clientId,
            phone_number: to[0].phone_number,
            client_phone: from.phone_number,
            status: 'active',
            last_message_at: new Date().toISOString(),
            last_message_preview: text.substring(0, 100),
            unread_count: 1
          })
          .select()
          .single()
        
        if (convError) {
          console.error('Error creating conversation:', convError)
          return
        }
        
        conversation = newConversation
        console.log(`Created new conversation: ${conversation.id}`)
      }
      
      // Store the message
      const { data: storedMessage, error: insertError } = await supabase
        .from('sms_messages')
        .insert({
          conversation_id: conversation.id,
          external_id: messageId,
          direction: 'inbound',
          from_number: from.phone_number,
          to_number: to[0].phone_number,
          content: text,
          status: 'received',
          metadata: data
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error storing message:', insertError)
        // Log to webhook_logs table
        await supabase
          .from('sms_webhook_logs')
          .insert({
            event_type: 'message_insert_error',
            payload: { messageId, conversationId: conversation.id, error: insertError.message },
            error: insertError.message
          })
        return
      }
      
      console.log(`Message stored with ID: ${storedMessage.id}`)
      
      // Update conversation
      await supabase
        .from('sms_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: text.substring(0, 100),
          unread_count: (conversation.unread_count || 0) + 1
        })
        .eq('id', conversation.id)
      
      console.log(`Message stored and conversation updated`)
      
    } else if (direction === 'outbound') {
      // Handle delivery reports
      const { to_status } = data.payload
      
      if (to_status) {
        for (const status of to_status) {
          console.log(`Message ${messageId} to ${status.phone_number}: ${status.status}`)
          
          // Update message status
          await supabase
            .from('sms_messages')
            .update({
              status: status.status,
              updated_at: new Date().toISOString()
            })
            .eq('external_id', messageId)
        }
      }
    }
  }
}