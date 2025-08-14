import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify Telnyx webhook signature
function verifyTelnyxSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): boolean {
  if (!signature || !timestamp) return false;
  
  try {
    // Telnyx uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const data = encoder.encode(`${timestamp}.${payload}`);
    const key = encoder.encode(secret);
    
    // Create HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedSignature = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Telnyx sends signature as "v1=<signature>"
    const expectedSignature = `v1=${calculatedSignature}`;
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// OpenAI integration for AI responses
async function generateAIResponse(
  userMessage: string,
  context: any,
  supabase: any
): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.error('OpenAI API key not configured');
    return 'I apologize, but I am unable to process your request at the moment.';
  }

  try {
    // Get AI configuration
    const { data: aiConfig } = await supabase
      .from('ai_dispatcher_configs')
      .select('*')
      .eq('is_active', true)
      .single();

    const systemPrompt = aiConfig?.system_prompt || `You are a helpful AI assistant for Fixlify repair shop. Help customers with their repair inquiries, appointment scheduling, and service questions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig?.model || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...context.messages,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I need a moment to process that.';
  } catch (error) {
    console.error('AI Response generation error:', error);
    return 'I apologize, but I am having trouble processing your request. Please try again.';
  }
}

// Main handler for Telnyx MCP webhook events
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('Received webhook body:', rawBody);
    
    // Parse the webhook event
    const event = JSON.parse(rawBody);
    console.log('Telnyx MCP Event:', event);

    // Verify webhook signature if configured
    const webhookSecret = Deno.env.get('MCP_WEBHOOK_SECRET') || Deno.env.get('mcp_webhook_secret');
    if (webhookSecret) {
      const signature = req.headers.get('telnyx-signature');
      const timestamp = req.headers.get('telnyx-timestamp');
      
      // Only verify if signature headers are present
      if (signature && timestamp) {
        const isValid = await verifyTelnyxSignature(rawBody, signature, timestamp, webhookSecret);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return new Response('Unauthorized', { status: 401 });
        }
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types based on Telnyx webhook structure
    const eventType = event.data?.event_type || event.event_type;
    
    switch (eventType) {
      case 'call.initiated':
        return await handleCallInitiated(event, supabase);
      
      case 'call.answered':
        return await handleCallAnswered(event, supabase);
      
      case 'call.hangup':
        return await handleCallHangup(event, supabase);
        
      case 'call.speak.ended':
        return await handleSpeakEnded(event, supabase);
        
      case 'call.gather.ended':
        return await handleGatherEnded(event, supabase);
        
      default:
        console.log('Unhandled event type:', eventType);
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Event received' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('MCP Handler Error:', error);
    return new Response(JSON.stringify({ 
      error: true,
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Handle call initiated event
async function handleCallInitiated(event: any, supabase: any) {
  console.log('Call initiated:', event.data);
  
  const callId = event.data.payload?.call_control_id;
  const from = event.data.payload?.from;
  const to = event.data.payload?.to;
  
  // Get AI configuration
  const { data: aiConfig } = await supabase
    .from('ai_dispatcher_configs')
    .select('*')
    .eq('is_active', true)
    .single();
  
  // Log call start
  await supabase
    .from('ai_dispatcher_call_logs')
    .insert({
      call_id: callId,
      from_number: from,
      to_number: to,
      status: 'initiated',
      started_at: new Date().toISOString()
    });
  
  // Answer the call with Telnyx Call Control commands
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
  
  if (telnyxApiKey && callId) {
    // Answer call using Telnyx API
    const answerResponse = await fetch(`https://api.telnyx.com/v2/calls/${callId}/actions/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook_url: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler`
      })
    });
    
    console.log('Answer response:', await answerResponse.json());
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    action: 'answered' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle call answered event
async function handleCallAnswered(event: any, supabase: any) {
  console.log('Call answered:', event.data);
  
  const callId = event.data.payload?.call_control_id;
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
  
  // Get AI configuration
  const { data: aiConfig } = await supabase
    .from('ai_dispatcher_configs')
    .select('*')
    .eq('is_active', true)
    .single();
  
  const greeting = aiConfig?.greeting || 
    'Hello! Thank you for calling Fixlify. How can I help you today?';
  
  // Update call status
  await supabase
    .from('ai_dispatcher_call_logs')
    .update({ status: 'answered' })
    .eq('call_id', callId);
  
  // Send speak command via Telnyx API
  if (telnyxApiKey && callId) {
    const speakResponse = await fetch(`https://api.telnyx.com/v2/calls/${callId}/actions/speak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: greeting,
        voice: aiConfig?.voice_id || 'Polly.Joanna',
        language: aiConfig?.language || 'en-US'
      })
    });
    
    console.log('Speak response:', await speakResponse.json());
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    action: 'speaking' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle speak ended event - start gathering input
async function handleSpeakEnded(event: any, supabase: any) {
  console.log('Speak ended:', event.data);
  
  const callId = event.data.payload?.call_control_id;
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
  
  // Get AI configuration
  const { data: aiConfig } = await supabase
    .from('ai_dispatcher_configs')
    .select('*')
    .eq('is_active', true)
    .single();
  
  // Start gathering speech input using Telnyx API
  if (telnyxApiKey && callId) {
    const gatherResponse = await fetch(`https://api.telnyx.com/v2/calls/${callId}/actions/gather`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        minimum_digits: 0,
        maximum_digits: 0,
        timeout_millis: 10000,
        inter_digit_timeout_millis: 3000,
        initial_timeout_millis: 5000,
        terminating_digit: '#',
        valid_digits: '0123456789*#',
        speech: {
          enabled: true,
          language: aiConfig?.language || 'en-US',
          hints: ['yes', 'no', 'help', 'service', 'repair', 'appointment', 'status']
        }
      })
    });
    
    console.log('Gather response:', await gatherResponse.json());
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    action: 'gathering' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle gather ended event - process user input
async function handleGatherEnded(event: any, supabase: any) {
  console.log('Gather ended:', event.data);
  
  const callId = event.data.payload?.call_control_id;
  const digits = event.data.payload?.digits;
  const speechResult = event.data.payload?.speech_result;
  const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
  
  // Get conversation context
  const { data: callLog } = await supabase
    .from('ai_dispatcher_call_logs')
    .select('*')
    .eq('call_id', callId)
    .single();
  
  const context = {
    messages: callLog?.conversation_history || [],
    callId,
    customerPhone: event.data.payload?.from
  };
  
  let userMessage = '';
  
  // Process speech or DTMF input
  if (speechResult) {
    userMessage = speechResult;
  } else if (digits) {
    userMessage = `User pressed: ${digits}`;
  }
  
  if (!userMessage) {
    // No input received - ask again
    if (telnyxApiKey && callId) {
      await fetch(`https://api.telnyx.com/v2/calls/${callId}/actions/speak`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: "I didn't catch that. Could you please repeat?",
          voice: 'Polly.Joanna',
          language: 'en-US'
        })
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      action: 'retry' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Generate AI response
  const aiResponse = await generateAIResponse(userMessage, context, supabase);
  
  // Update conversation history
  const updatedHistory = [
    ...context.messages,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: aiResponse }
  ];
  
  await supabase
    .from('ai_dispatcher_call_logs')
    .update({ 
      conversation_history: updatedHistory,
      last_activity: new Date().toISOString()
    })
    .eq('call_id', callId);
  
  // Speak the AI response
  if (telnyxApiKey && callId) {
    await fetch(`https://api.telnyx.com/v2/calls/${callId}/actions/speak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: aiResponse,
        voice: 'Polly.Joanna',
        language: 'en-US'
      })
    });
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    action: 'responded' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle call hangup event
async function handleCallHangup(event: any, supabase: any) {
  console.log('Call ended:', event.data);
  
  const callId = event.data.payload?.call_control_id;
  const hangupCause = event.data.payload?.hangup_cause;
  
  // Update call log
  await supabase
    .from('ai_dispatcher_call_logs')
    .update({ 
      status: 'completed',
      ended_at: new Date().toISOString(),
      hangup_cause: hangupCause
    })
    .eq('call_id', callId);
  
  return new Response(JSON.stringify({ 
    success: true,
    action: 'completed' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}