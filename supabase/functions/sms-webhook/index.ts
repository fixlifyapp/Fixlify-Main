import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get the raw body
    const rawBody = await req.text()
    
    // Log the webhook receipt immediately
    console.log('=== SMS WEBHOOK RECEIVED ===')
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    console.log('Body:', rawBody)
    
    // Parse the body
    const body = JSON.parse(rawBody)
    
    // Log to a debug table for inspection
    await supabase
      .from('sms_webhook_logs')
      .insert({
        event_type: 'webhook_received',
        payload: body,
        error: null
      })
    
    // CRITICAL: Immediately acknowledge the webhook
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    // Process the webhook asynchronously
    processWebhookAsync(rawBody, supabase).catch(error => {
      console.error('Error processing webhook:', error)
      supabase
        .from('sms_webhook_logs')
        .insert({
          event_type: 'processing_error',
          payload: { body, error: error.message },
          error: error.message
        })
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
async function processWebhookAsync(rawBody: string, supabase: any) {
  const body = JSON.parse(rawBody)
  console.log('Processing webhook body:', JSON.stringify(body, null, 2))

  const { data } = body
  
  // Log what we're looking for
  console.log('Event type:', data?.event_type)
  console.log('Record type:', data?.record_type)
  
  // Handle different event types and payload structures
  if (data?.event_type === 'message.received' || data?.record_type === 'message') {
    console.log('Processing inbound message')
    
    // Extract message details - handle different payload structures
    let messageId, text, fromNumber, toNumber, direction
    
    // Check multiple possible locations for the data
    const payload = data.payload || data
    
    // Extract text from multiple possible locations
    text = data.text || payload.text || data.payload?.text || ''
    
    // Extract ID
    messageId = data.id || payload.id || data.payload?.id
    
    // Extract phone numbers
    if (data.from && typeof data.from === 'object') {
      fromNumber = data.from.phone_number
    } else if (payload.from && typeof payload.from === 'object') {
      fromNumber = payload.from.phone_number
    } else {
      fromNumber = data.from || payload.from
    }
    
    if (data.to && Array.isArray(data.to) && data.to[0]) {
      toNumber = data.to[0].phone_number
    } else if (payload.to && Array.isArray(payload.to) && payload.to[0]) {
      toNumber = payload.to[0].phone_number
    } else {
      toNumber = data.to || payload.to
    }
    
    direction = data.direction || payload.direction || 'inbound'
    
    console.log('Extracted values:')
    console.log('- Message ID:', messageId)
    console.log('- Text:', text)
    console.log('- From:', fromNumber)
    console.log('- To:', toNumber)
    console.log('- Direction:', direction)
    
    // Only process inbound messages
    if (direction === 'inbound' && fromNumber && toNumber) {
      console.log(`Processing inbound SMS from ${fromNumber} to ${toNumber}`)
      
      // Find which user owns the receiving phone number
      const { data: phoneOwner, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('user_id')
        .eq('phone_number', toNumber)
        .single()
      
      if (phoneError || !phoneOwner) {
        console.error('Phone owner lookup error:', phoneError)
        console.log(`No user found for phone number ${toNumber}`)
        return
      }
      
      console.log('Found phone owner:', phoneOwner.user_id)
      
      // Find or create conversation
      let conversation = null
      
      // First try to find existing conversation
      const { data: existingConversation, error: convError } = await supabase
        .from('sms_conversations')
        .select('*')
        .eq('user_id', phoneOwner.user_id)
        .eq('client_phone', fromNumber)
        .eq('phone_number', toNumber)
        .eq('status', 'active')
        .single()
      
      if (convError && convError.code !== 'PGRST116') {
        console.error('Conversation lookup error:', convError)
      }
      
      if (existingConversation) {
        conversation = existingConversation
        console.log(`Found existing conversation: ${conversation.id}`)
      } else {
        console.log('Creating new conversation...')
        
        // Check if this is a known client
        let clientId = null
        const { data: client } = await supabase
          .from('clients')
          .select('id, name')
          .eq('phone', fromNumber)
          .eq('user_id', phoneOwner.user_id)
          .single()
        
        if (client) {
          clientId = client.id
          console.log('Found existing client:', client.name)
        } else {
          // Create a new client for unknown numbers
          console.log(`Creating new client for unknown number: ${fromNumber}`)
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: `Unknown (${fromNumber})`,
              phone: fromNumber,
              user_id: phoneOwner.user_id,
              status: 'lead',
              type: 'individual',
              notes: `Auto-created from SMS received at ${new Date().toISOString()}`
            })
            .select()
            .single()
          
          if (clientError) {
            console.error('Error creating client:', clientError)
          } else if (newClient) {
            clientId = newClient.id
            console.log(`Created new client with ID: ${clientId}`)
          }
        }
        
        // Create new conversation
        const { data: newConversation, error: newConvError } = await supabase
          .from('sms_conversations')
          .insert({
            user_id: phoneOwner.user_id,
            client_id: clientId,
            phone_number: toNumber,
            client_phone: fromNumber,
            status: 'active',
            last_message_at: new Date().toISOString(),
            last_message_preview: text?.substring(0, 100) || '',
            unread_count: 1
          })
          .select()
          .single()
        
        if (newConvError) {
          console.error('Error creating conversation:', newConvError)
          return
        }
        
        conversation = newConversation
        console.log(`Created new conversation: ${conversation.id}`)
      }
      
      // Store the message
      console.log('Storing message...')
      const { data: storedMessage, error: insertError } = await supabase
        .from('sms_messages')
        .insert({
          conversation_id: conversation.id,
          external_id: messageId,
          direction: 'inbound',
          from_number: fromNumber,
          to_number: toNumber,
          content: text || '',
          status: 'received',
          metadata: data
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error storing message:', insertError)
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
      const { error: updateError } = await supabase
        .from('sms_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: text?.substring(0, 100) || '',
          unread_count: (conversation.unread_count || 0) + 1
        })
        .eq('id', conversation.id)
      
      if (updateError) {
        console.error('Error updating conversation:', updateError)
      } else {
        console.log(`Conversation updated successfully`)
      }
      
    } else {
      console.log('Not processing - either not inbound or missing data')
    }
  } else {
    console.log('Unknown event type:', data?.event_type || 'none')
  }
}