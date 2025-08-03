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

  // Initialize Supabase client first
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Wrap EVERYTHING in try-catch
  let rawBody = ''
  try {
    // Get the raw body
    rawBody = await req.text()
    const requestTime = new Date().toISOString()
    
    // Always log that we received something
    console.log(`[${requestTime}] Webhook received, body length: ${rawBody.length}`)
    
    // Try to parse
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      // Log parse error but still return 200
      await supabase.from('sms_webhook_logs').insert({
        event_type: 'parse_error',
        payload: { raw: rawBody.substring(0, 1000), error: e.message },
        error: 'JSON parse failed'
      })
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
        status: 200, // Return 200 to prevent retries
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log receipt
    await supabase.from('sms_webhook_logs').insert({
      event_type: 'webhook_received',
      payload: body,
      error: null
    }).then(() => console.log('Logged to database'))
    .catch(e => console.error('Failed to log:', e))

    // Process async
    processWebhookAsync(body, supabase).catch(e => {
      console.error('Async processing error:', e)
      supabase.from('sms_webhook_logs').insert({
        event_type: 'processing_error',
        payload: { body, error: e.message },
        error: e.message
      })
    })

    // Always return success immediately
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    // Log any error but still return 200
    console.error('Webhook error:', error)
    try {
      await supabase.from('sms_webhook_logs').insert({
        event_type: 'webhook_error',
        payload: { raw: rawBody.substring(0, 1000), error: error.message },
        error: error.message
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200, // Still return 200 to prevent retries
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
async function processWebhookAsync(body: any, supabase: any) {
  try {
    const { data } = body
    
    if (!data) {
      console.log('No data field in webhook body')
      return
    }
    
    // Log event type
    console.log('Event type:', data.event_type)
    
    // Handle message.received events
    if (data.event_type === 'message.received' || data.record_type === 'message') {
      const payload = data.payload || data
      
      // Extract fields with multiple fallbacks
      const text = data.text || payload.text || ''
      const messageId = data.id || payload.id
      
      // Extract phone numbers
      let fromNumber, toNumber
      
      // From number
      if (payload.from?.phone_number) {
        fromNumber = payload.from.phone_number
      } else if (data.from?.phone_number) {
        fromNumber = data.from.phone_number
      }
      
      // To number
      if (payload.to?.[0]?.phone_number) {
        toNumber = payload.to[0].phone_number
      } else if (data.to?.[0]?.phone_number) {
        toNumber = data.to[0].phone_number
      }
      
      const direction = payload.direction || data.direction || 'inbound'
      
      console.log('Message details:', { messageId, text, fromNumber, toNumber, direction })
      
      if (direction === 'inbound' && fromNumber && toNumber) {
        // Find phone owner
        const { data: phoneOwner } = await supabase
          .from('phone_numbers')
          .select('user_id')
          .eq('phone_number', toNumber)
          .single()
        
        if (!phoneOwner) {
          console.log('No user found for phone:', toNumber)
          return
        }
        
        // Find or create conversation
        const { data: existingConv } = await supabase
          .from('sms_conversations')
          .select('*')
          .eq('user_id', phoneOwner.user_id)
          .eq('client_phone', fromNumber)
          .eq('phone_number', toNumber)
          .eq('status', 'active')
          .single()
        
        let conversation = existingConv
        
        if (!conversation) {
          // Check for client
          const { data: client } = await supabase
            .from('clients')
            .select('id, name')
            .eq('phone', fromNumber)
            .eq('user_id', phoneOwner.user_id)
            .single()
          
          let clientId = client?.id
          
          if (!clientId) {
            // Create new client
            const { data: newClient } = await supabase
              .from('clients')
              .insert({
                name: `Unknown (${fromNumber})`,
                phone: fromNumber,
                user_id: phoneOwner.user_id,
                status: 'lead',
                type: 'individual',
                notes: `Auto-created from SMS at ${new Date().toISOString()}`
              })
              .select()
              .single()
            
            clientId = newClient?.id
          }
          
          // Create conversation
          const { data: newConv } = await supabase
            .from('sms_conversations')
            .insert({
              user_id: phoneOwner.user_id,
              client_id: clientId,
              phone_number: toNumber,
              client_phone: fromNumber,
              status: 'active',
              last_message_at: new Date().toISOString(),
              last_message_preview: text.substring(0, 100),
              unread_count: 1
            })
            .select()
            .single()
          
          conversation = newConv
        }
        
        if (!conversation) {
          console.error('Failed to find or create conversation')
          return
        }
        
        // Check for duplicate
        const { data: existing } = await supabase
          .from('sms_messages')
          .select('id')
          .eq('external_id', messageId)
          .single()
        
        if (existing) {
          console.log('Duplicate message, skipping:', messageId)
          return
        }
        
        // Store message
        const { data: message, error: msgError } = await supabase
          .from('sms_messages')
          .insert({
            conversation_id: conversation.id,
            external_id: messageId,
            direction: 'inbound',
            from_number: fromNumber,
            to_number: toNumber,
            content: text,
            status: 'received',
            metadata: data
          })
          .select()
          .single()
        
        if (msgError) {
          console.error('Failed to store message:', msgError)
          throw msgError
        }
        
        console.log('Message stored:', message.id)
        
        // Update conversation
        await supabase
          .from('sms_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: text.substring(0, 100),
            unread_count: (conversation.unread_count || 0) + 1
          })
          .eq('id', conversation.id)
        
        console.log('Conversation updated')
      }
    }
  } catch (error) {
    console.error('Error in processWebhookAsync:', error)
    throw error
  }
}