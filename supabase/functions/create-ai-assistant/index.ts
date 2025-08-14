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
    const { phone_number, user_id, business_config } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get or create AI dispatcher config
    const { data: aiConfig } = await supabase
      .from('ai_dispatcher_configs')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('user_id', user_id)
      .single();
    
    const config = aiConfig || business_config;
    
    // Create AI Assistant via Telnyx API
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    const assistantConfig = {
      name: `${config.business_name} AI Assistant`,
      model: "anthropic/claude-3-haiku",
      voice: {
        provider: "telnyx",
        model: "KokoroTTS",
        voice_id: config.voice_id || "Heart"
      },
      instructions: `You are ${config.agent_name} for ${config.business_name}.
        Hours: ${config.hours_of_operation}
        Services: ${config.services_offered?.join(', ')}
        
        Help customers with appointments, repair status, and questions.
        Be professional and friendly.`,
      greeting: config.greeting_message || `Thank you for calling ${config.business_name}. How can I help you?`,
      dynamic_variables_webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-assistant-webhook`,
      tools: [
        {
          type: "webhook",
          name: "book_appointment",
          description: "Book appointment",
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/book-appointment`,
          method: "POST"
        },
        {
          type: "built_in",
          name: "hangup"
        }
      ],
      channels: ["voice"]
    };
    
    // Create assistant
    const response = await fetch('https://api.telnyx.com/v2/ai/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });
    
    const assistant = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to create assistant');
    }
    
    // Assign phone to assistant
    await fetch(`https://api.telnyx.com/v2/phone_numbers/${phone_number}/voice_settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: assistant.data.id
      })
    });
    
    // Save assistant ID to database
    await supabase
      .from('phone_numbers')
      .update({
        ai_assistant_id: assistant.data.id,
        ai_dispatcher_enabled: true
      })
      .eq('phone_number', phone_number);
    
    return new Response(JSON.stringify({
      success: true,
      assistant_id: assistant.data.id,
      message: 'AI Assistant created and configured!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});