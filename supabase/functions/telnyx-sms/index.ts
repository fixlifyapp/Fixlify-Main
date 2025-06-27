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
    console.log('📱 Telnyx SMS request received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('📱 SMS request body received:', { 
      recipientPhone: requestBody.recipientPhone, 
      messageLength: requestBody.message?.length,
      clientId: requestBody.client_id,
      jobId: requestBody.job_id,
      userId: requestBody.user_id,
      conversationId: requestBody.conversation_id
    });
    
    const { 
      recipientPhone, 
      message, 
      client_id, 
      job_id,
      user_id,
      conversation_id
    } = requestBody;

    if (!recipientPhone || !message) {
      console.error('❌ Missing required fields:', { recipientPhone: !!recipientPhone, message: !!message });
      throw new Error('Missing required fields: recipientPhone and message');
    }

    // Validate phone number format
    const cleanedPhone = recipientPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      console.error('❌ Invalid phone number format:', recipientPhone);
      throw new Error('Invalid phone number format. Please enter a valid 10-digit phone number.');
    }

    console.log('🔍 Getting active Telnyx phone number...');
    
    // Get the sending phone number - try to find user-specific number if user_id provided
    let telnyxQuery = supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id')
      .eq('status', 'active');
    
    if (user_id) {
      // First try to find a phone number owned by this user
      const { data: userPhoneNumbers } = await telnyxQuery.eq('user_id', user_id).limit(1);
      if (userPhoneNumbers && userPhoneNumbers.length > 0) {
        console.log('✅ Found user-specific phone number:', userPhoneNumbers[0].phone_number);
        const fromNumber = userPhoneNumbers[0].phone_number;
        return await sendSMSAndStore(supabaseAdmin, fromNumber, recipientPhone, message, message, client_id, job_id, user_id, conversation_id);
      }
    }
    
    // If no user-specific number found, get any active number
    const { data: telnyxNumbers, error: telnyxError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1);

    console.log('📱 Telnyx query result:', { 
      numbersFound: telnyxNumbers?.length || 0, 
      error: telnyxError?.message 
    });

    if (telnyxError) {
      console.error('❌ Database error querying Telnyx numbers:', telnyxError);
      throw new Error('Failed to retrieve SMS service configuration. Please contact support.');
    }

    if (!telnyxNumbers || telnyxNumbers.length === 0) {
      console.error('❌ No active Telnyx phone number found');
      throw new Error('SMS service not configured. Please contact support to set up SMS functionality.');
    }

    const fromNumber = telnyxNumbers[0].phone_number;
    const sendingUserId = user_id || telnyxNumbers[0].user_id;
    console.log('✅ Using phone number for SMS:', fromNumber, 'for user:', sendingUserId);

    // Process the message - moved inside function
    return await sendSMSAndStore(supabaseAdmin, fromNumber, recipientPhone, message, message, client_id, job_id, sendingUserId, conversation_id);

  } catch (error) {
    console.error('❌ Error in telnyx-sms function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function sendSMSAndStore(supabaseAdmin: any, fromNumber: string, recipientPhone: string, originalMessage: string, _unused: string, client_id?: string, job_id?: string, user_id?: string, conversation_id?: string) {
  // Check Telnyx API key
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
  if (!telnyxApiKey) {
    console.error('❌ Telnyx API key not configured');
    throw new Error('SMS service not configured. Please contact support.');
  }

  // Process the message
  let finalMessage = originalMessage;
  
  if (job_id && !originalMessage.includes('hub.fixlify.app/portal/') && !originalMessage.includes('hub.fixlify.app/approve/')) {
    console.log('🔗 Adding job portal link for job:', job_id);
    const jobPortalLink = `https://hub.fixlify.app/client/${job_id}`;
    finalMessage = `${originalMessage}\n\nView details: ${jobPortalLink}`;
    console.log('✅ Job portal link added to message');
  }

  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
  const formatForTelnyx = (phone: string) => {
    const cleaned = cleanPhone(phone);
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  };

  const formattedFromPhone = formatForTelnyx(fromNumber);
  const formattedToPhone = formatForTelnyx(recipientPhone);

  console.log('📱 Sending SMS...');
  console.log('📱 From:', formattedFromPhone);
  console.log('📱 To:', formattedToPhone);
  console.log('📱 Message length:', finalMessage.length);

  const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telnyxApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: formattedFromPhone,
      to: formattedToPhone,
      text: finalMessage
    })
  });

  const responseText = await telnyxResponse.text();
  console.log('📱 Telnyx response status:', telnyxResponse.status);
  console.log('📱 Telnyx response body:', responseText);

  if (!telnyxResponse.ok) {
    console.error('❌ Telnyx API error:', responseText);
    
    let errorMessage = 'Failed to send SMS';
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].detail || errorMessage;
      }
    } catch (parseError) {
      console.warn('⚠️ Could not parse Telnyx error response');
    }
    
    // Provide specific error messages based on status code
    if (telnyxResponse.status === 401) {
      errorMessage = 'SMS service authentication failed. Please contact support.';
    } else if (telnyxResponse.status === 403) {
      errorMessage = 'SMS service access denied. Please contact support.';
    } else if (telnyxResponse.status === 400) {
      errorMessage = 'Invalid phone number or message format.';
    } else if (telnyxResponse.status >= 500) {
      errorMessage = 'SMS service temporarily unavailable. Please try again later.';
    }
    
    throw new Error(`${errorMessage} (Status: ${telnyxResponse.status})`);
  }

  let telnyxResult;
  try {
    telnyxResult = JSON.parse(responseText);
  } catch (parseError) {
    console.error('❌ Error parsing Telnyx response:', parseError);
    throw new Error('Invalid response from SMS service');
  }

  console.log('✅ SMS sent successfully via Telnyx:', telnyxResult.data?.id);

  // Now store the outbound message in the database
  if (client_id && user_id) {
    console.log('📝 Storing outbound message in database...');
    
    try {
      let finalConversationId = conversation_id;
      
      // If no conversation_id provided, find or create one
      if (!finalConversationId) {
        // Find or create conversation
        let conversation;
        const conversationQuery = supabaseAdmin
          .from('conversations')
          .select('*')
          .eq('client_id', client_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Add job_id condition only if it's provided
        if (job_id) {
          conversationQuery.eq('job_id', job_id);
        } else {
          conversationQuery.is('job_id', null);
        }
        
        const { data: existingConversation, error: convError } = await conversationQuery.maybeSingle();

        if (convError) {
          console.error('❌ Error finding conversation:', convError);
        }

        if (existingConversation) {
          conversation = existingConversation;
          finalConversationId = conversation.id;
          console.log('✅ Using existing conversation:', conversation.id);
        } else {
          console.log('📝 Creating new conversation for outbound SMS');
          const { data: newConversation, error: newConvError } = await supabaseAdmin
            .from('conversations')
            .insert({
              client_id: client_id,
              job_id: job_id || null, // Allow null for connect center messages
              status: 'active',
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (newConvError) {
            console.error('❌ Error creating conversation:', newConvError);
          } else if (newConversation) {
            conversation = newConversation;
            finalConversationId = newConversation.id;
            console.log('✅ Created new conversation:', conversation.id);
          }
        }
      }

      // Update conversation timestamp if we have a conversation
      if (finalConversationId) {
        await supabaseAdmin
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', finalConversationId);
      }

      // Store the outbound message
      if (finalConversationId) {
        const { data: savedMessage, error: messageError } = await supabaseAdmin
          .from('messages')
          .insert({
            conversation_id: finalConversationId,
            body: finalMessage,
            direction: 'outbound',
            sender: formattedFromPhone,
            recipient: formattedToPhone,
            status: 'sent',
            message_sid: telnyxResult.data?.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (messageError) {
          console.error('❌ Error storing outbound message:', messageError);
        } else {
          console.log('✅ Outbound message stored successfully:', savedMessage.id);
        }
      }
    } catch (storeError) {
      console.error('❌ Error storing outbound message:', storeError);
      // Don't throw here - SMS was sent successfully, storage is secondary
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'SMS sent successfully',
      messageId: telnyxResult.data?.id,
      finalMessage: finalMessage
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}
