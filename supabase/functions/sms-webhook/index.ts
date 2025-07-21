
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('SMS Webhook received:', JSON.stringify(body, null, 2));

    // Log the webhook attempt
    await supabase
      .from('sms_webhook_logs')
      .insert({
        event_type: 'webhook_received',
        payload: body,
        created_at: new Date().toISOString()
      });

    // Check if this is a message event - Telnyx sends the payload directly in the body
    if (body?.record_type !== 'message') {
      console.log('Not a message event, skipping');
      return new Response(JSON.stringify({ success: true, message: 'Not a message event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Extract message data directly from body (not from data.payload)
    const { 
      direction, 
      from, 
      to, 
      text, 
      id: messageId,
      received_at,
      messaging_profile_id 
    } = body;

    console.log('Processing message:', {
      messageId,
      direction,
      from: from?.phone_number,
      to: to?.[0]?.phone_number,
      text,
      received_at
    });

    // Only process inbound messages
    if (direction !== 'inbound') {
      console.log('Not an inbound message, skipping');
      return new Response(JSON.stringify({ success: true, message: 'Not inbound' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Process the message asynchronously but return response immediately
    processInboundMessage(supabase, {
      messageId,
      fromPhone: from?.phone_number,
      toPhone: to?.[0]?.phone_number,
      text,
      receivedAt: received_at,
      messagingProfileId: messaging_profile_id,
      fullPayload: body
    }).catch(error => {
      console.error('Error processing inbound message:', error);
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('SMS webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function processInboundMessage(supabase: any, messageData: any) {
  try {
    console.log('Processing inbound message:', messageData);

    const { messageId, fromPhone, toPhone, text, receivedAt, fullPayload } = messageData;

    if (!fromPhone || !toPhone || !text) {
      console.error('Missing required message data:', { fromPhone, toPhone, text });
      return;
    }

    // Find the phone number in our system
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('phone_number', toPhone)
      .eq('is_active', true)
      .single();

    if (!phoneNumber) {
      console.log(`Phone number ${toPhone} not found in system`);
      return;
    }

    console.log('Found phone number:', phoneNumber);

    // Find or create client
    let clientId = null;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, name, phone')
      .eq('phone', fromPhone)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
      console.log(`Found existing client: ${existingClient.name} (${clientId})`);
    } else {
      // Create new client
      console.log(`Creating new client for ${fromPhone}`);
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: `Contact ${fromPhone}`,
          phone: fromPhone,
          user_id: phoneNumber.purchased_by || phoneNumber.assigned_to,
          created_by: phoneNumber.purchased_by || phoneNumber.assigned_to,
          status: 'active'
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
      } else if (newClient) {
        clientId = newClient.id;
        console.log(`Created new client: ${newClient.name} (${clientId})`);
      }
    }

    // Find or create conversation
    let conversation;
    const { data: existingConversation } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('phone_number_id', phoneNumber.id)
      .eq('client_phone', fromPhone)
      .single();

    if (existingConversation) {
      conversation = existingConversation;
      console.log(`Found existing conversation: ${conversation.id}`);
    } else {
      // Create new conversation
      console.log('Creating new conversation');
      const { data: newConversation, error: convError } = await supabase
        .from('sms_conversations')
        .insert({
          phone_number_id: phoneNumber.id,
          client_id: clientId,
          client_phone: fromPhone,
          client_name: existingClient?.name || `Contact ${fromPhone}`,
          last_message_at: receivedAt || new Date().toISOString(),
          last_message_preview: text.substring(0, 100),
          unread_count: 1,
          status: 'active'
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return;
      }
      
      conversation = newConversation;
      console.log(`Created new conversation: ${conversation.id}`);
    }

    // Store the message
    const { data: storedMessage, error: insertError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        phone_number_id: phoneNumber.id,
        telnyx_message_id: messageId,
        direction: 'inbound',
        from_number: fromPhone,
        to_number: toPhone,
        content: text,
        status: 'received',
        received_at: receivedAt || new Date().toISOString(),
        metadata: fullPayload
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing message:', insertError);
      
      // Log the error
      await supabase
        .from('sms_webhook_logs')
        .insert({
          event_type: 'message_insert_error',
          payload: { messageId, conversationId: conversation.id, error: insertError.message },
          error: insertError.message
        });
      return;
    }

    console.log(`Message stored successfully: ${storedMessage.id}`);

    // Update conversation with latest message info
    await supabase
      .from('sms_conversations')
      .update({
        last_message_at: receivedAt || new Date().toISOString(),
        last_message_preview: text.substring(0, 100),
        unread_count: conversation.unread_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    console.log('Conversation updated successfully');

    // Log successful processing
    await supabase
      .from('sms_webhook_logs')
      .insert({
        event_type: 'message_processed_success',
        payload: { 
          messageId, 
          conversationId: conversation.id, 
          storedMessageId: storedMessage.id,
          fromPhone,
          toPhone,
          text: text.substring(0, 50) + '...'
        }
      });

  } catch (error) {
    console.error('Error in processInboundMessage:', error);
    
    // Log the processing error
    await supabase
      .from('sms_webhook_logs')
      .insert({
        event_type: 'processing_error',
        payload: messageData,
        error: error.message
      });
  }
}
