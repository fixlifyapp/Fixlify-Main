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

  try {
    // CRITICAL: Immediately acknowledge the webhook to prevent retries
    // This prevents Telnyx from sending duplicate webhooks
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    // Clone the request to read the body without consuming it
    const requestClone = req.clone()
    
    // Process the webhook asynchronously after sending the response
    processWebhookAsync(requestClone).catch(error => {
      console.error('Error processing webhook asynchronously:', error)
    })

    // Return the acknowledgment immediately
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
async function processWebhookAsync(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const body = await req.json()
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
      
      // Store the message with external ID for deduplication
      const { data: insertedMessage, error: insertError } = await supabase
        .from('sms_messages')
        .insert({
          external_id: messageId,
          direction: 'inbound',
          from_number: from.phone_number,
          to_number: to[0].phone_number,
          content: text,
          message: text,
          status: 'received',
          raw_data: data,
          metadata: data
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error storing message:', insertError)
        return
      }      
      // Find the conversation
      const { data: conversation } = await supabase
        .from('sms_conversations')
        .select('*')
        .eq('client_phone', from.phone_number)
        .eq('status', 'active')
        .single()
      
      if (conversation) {
        // Update last message time
        await supabase
          .from('sms_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id)
        
        // Check if message contains "DOWN" or similar stop keywords
        const stopKeywords = ['DOWN', 'STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END']
        const messageUpper = text.toUpperCase().trim()
        
        if (stopKeywords.includes(messageUpper)) {
          console.log(`Stop keyword detected: ${messageUpper}`)
          
          // Update conversation status
          await supabase
            .from('sms_conversations')
            .update({ 
              status: 'stopped',
              stopped_at: new Date().toISOString()
            })
            .eq('id', conversation.id)          
          // Log the opt-out
          await supabase
            .from('sms_opt_outs')
            .insert({
              phone_number: from.phone_number,
              conversation_id: conversation.id,
              keyword: messageUpper,
              opted_out_at: new Date().toISOString()
            })
        } else {
          // Regular message - update the SMS message record with conversation ID
          await supabase
            .from('sms_messages')
            .update({
              conversation_id: conversation.id
            })
            .eq('id', insertedMessage.id)
          
          // Update conversation's last message preview
          await supabase
            .from('sms_conversations')
            .update({
              last_message_preview: text.substring(0, 100),
              unread_count: (conversation.unread_count || 0) + 1
            })
            .eq('id', conversation.id)
        }
      } else {
        console.log(`No active conversation found for ${from.phone_number}`)
      }
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