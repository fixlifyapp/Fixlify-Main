import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse Telnyx webhook
    const body = await req.json();
    console.log('Telnyx AI Assistant webhook:', body);
    
    // Extract call details from Telnyx
    const payload = body?.data?.payload || {};
    const dialedNumber = payload.telnyx_agent_target;
    const callerNumber = payload.telnyx_end_user_target;
    const callId = payload.call_control_id;
    
    console.log(`Call from ${callerNumber} to ${dialedNumber}`);
    
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Look up business settings based on the dialed number
    const { data: phoneConfig } = await supabase
      .from('phone_numbers')
      .select(`*, user_id`)
      .eq('phone_number', dialedNumber)
      .single();
    
    if (!phoneConfig) {
      console.error('Phone number not found');
      return new Response(JSON.stringify({
        dynamic_variables: {
          business_name: 'Fixlify Repair Shop',
          greeting: 'Hello! Thank you for calling.',
          error: 'Configuration not found'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get AI dispatcher configuration
    const { data: aiConfig } = await supabase
      .from('ai_dispatcher_configs')
      .select('*')
      .eq('user_id', phoneConfig.user_id)
      .eq('is_active', true)
      .single();    
    // Build dynamic variables for the AI Assistant
    const dynamicVariables = {
      // Business Information
      business_name: aiConfig?.company_name || 'Fixlify Repair Shop',
      business_phone: dialedNumber,
      hours_of_operation: 'Monday-Friday 9am-6pm, Saturday 10am-4pm',
      
      // AI Configuration
      agent_name: aiConfig?.agent_name || 'AI Assistant',
      greeting: aiConfig?.greeting || 'Thank you for calling. How can I help you today?',
      voice_id: aiConfig?.voice_id || 'Polly.Joanna',
      language: aiConfig?.language || 'en-US',
      
      // Services
      services_offered: 'Phone repair, Computer repair, Tablet repair',
      
      // Customer Information
      caller_number: callerNumber,
      
      // Real-time Information
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString(),
      
      // Features
      enable_status_check: 'true',
      enable_appointment_booking: 'true',
      
      // Call Metadata
      call_id: callId,
      conversation_id: `conv_${callId}_${Date.now()}`
    };    
    // Log the call
    await supabase
      .from('ai_dispatcher_call_logs')
      .insert({
        call_id: callId,
        conversation_id: dynamicVariables.conversation_id,
        from_number: callerNumber,
        to_number: dialedNumber,
        status: 'initiated',
        dynamic_variables: dynamicVariables,
        started_at: new Date().toISOString()
      });
    
    // Return dynamic variables to Telnyx
    return new Response(JSON.stringify({
      dynamic_variables: dynamicVariables,
      conversation: {
        metadata: {
          user_id: phoneConfig.user_id,
          source: 'inbound_call'
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      dynamic_variables: {
        business_name: 'Fixlify',
        greeting: 'Hello! Thank you for calling.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});