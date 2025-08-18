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
    const { assistant_id, phone_number, update_tools } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    // Get current assistant config
    const getResponse = await fetch(`https://api.telnyx.com/v2/ai/assistants/${assistant_id}`, {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
      }
    });
    
    const currentAssistant = await getResponse.json();    console.log('Current assistant config:', currentAssistant);
    
    // Update with correct tools configuration
    const updateData = {
      ...currentAssistant.data,
      tools: [
        {
          type: "webhook",
          name: "book_appointment",
          description: "Book an appointment for the customer",
          url: `${supabaseUrl}/functions/v1/ai-appointment-handler`,
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          parameters: {
            action: "book_appointment",
            client_phone: "{{caller_phone}}",
            client_name: "{{customer_name}}",
            date: "{{appointment_date}}",
            time: "{{appointment_time}}",
            service_type: "{{service_type}}",
            issue_description: "{{issue_description}}"
          }
        },
        {
          type: "webhook",  
          name: "check_availability",
          description: "Check available appointment slots",
          url: `${supabaseUrl}/functions/v1/ai-appointment-handler`,          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          parameters: {
            action: "check_availability",
            date: "{{check_date}}",
            service_type: "{{service_type}}"
          }
        },
        {
          type: "built_in",
          name: "hangup"
        }
      ]
    };
    
    // Update the assistant
    const updateResponse = await fetch(`https://api.telnyx.com/v2/ai/assistants/${assistant_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const updatedAssistant = await updateResponse.json();
    
    if (!updateResponse.ok) {      throw new Error(`Failed to update assistant: ${JSON.stringify(updatedAssistant)}`);
    }
    
    console.log('Updated assistant:', updatedAssistant);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'AI Assistant webhook URLs updated successfully!',
      assistant_id: assistant_id,
      tools: updateData.tools
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