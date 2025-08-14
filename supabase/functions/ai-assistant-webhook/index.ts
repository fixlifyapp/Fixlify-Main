import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json()
    console.log('=== TELNYX WEBHOOK CALLED ===')
    console.log('Request:', JSON.stringify(body, null, 2))
    
    // Extract phone numbers from Telnyx request
    let calledNumber = body.to || 
                       body.data?.payload?.to || 
                       body.data?.payload?.telnyx_agent_target
    let callerNumber = body.from || 
                       body.data?.payload?.from || 
                       body.data?.payload?.telnyx_end_user_target
    
    console.log('Called:', calledNumber, 'Caller:', callerNumber)
    // Default values
    let variables = {
      agent_name: 'Assistant',
      company_name: 'Our Company',
      hours_of_operation: 'Monday-Friday 9am-6pm',
      services_offered: 'Professional services',
      business_phone: calledNumber || '',
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      greeting: 'Thank you for calling. How can I help you today?',
      caller_number: callerNumber || 'unknown'
    }

    if (calledNumber) {
      const cleanNumber = calledNumber.replace(/[^0-9]/g, '')
      const last10Digits = cleanNumber.slice(-10)
      const last4Digits = cleanNumber.slice(-4)
      
      // Find phone number in database
      const { data: phoneData, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('id, phone_number, user_id')
        .or(`phone_number.eq.${calledNumber},phone_number.like.%${last4Digits}`)
        .single()

      if (!phoneError && phoneData) {
        console.log('Found phone:', phoneData.phone_number)
        
        // Get AI config
        const { data: aiConfig } = await supabase
          .from('ai_dispatcher_configs')
          .select('*')
          .eq('phone_number_id', phoneData.id)
          .single()
        if (aiConfig) {
          console.log('Found config for:', aiConfig.agent_name, '/', aiConfig.company_name)
          
          // Parse services
          let servicesText = 'Professional services'
          if (aiConfig.services_offered) {
            try {
              if (typeof aiConfig.services_offered === 'string') {
                try {
                  const services = JSON.parse(aiConfig.services_offered)
                  servicesText = Array.isArray(services) ? services.join(', ') : services
                } catch {
                  servicesText = aiConfig.services_offered
                }
              } else if (Array.isArray(aiConfig.services_offered)) {
                servicesText = aiConfig.services_offered.join(', ')
              }
            } catch {
              servicesText = String(aiConfig.services_offered || 'Professional services')
            }
          }
          
          // Build greeting
          let greeting = aiConfig.greeting_message || 
                        aiConfig.business_greeting || 
                        aiConfig.dynamic_variables?.greeting ||
                        `Thank you for calling ${aiConfig.company_name || 'our company'}. How can I help you today?`
          
          // Set actual values
          variables = {
            agent_name: aiConfig.agent_name || 'Assistant',
            company_name: aiConfig.company_name || 'Our Company',            hours_of_operation: aiConfig.hours_of_operation || 'Monday-Friday 9am-6pm',
            services_offered: servicesText,
            business_phone: phoneData.phone_number || calledNumber,
            current_date: new Date().toLocaleDateString(),
            current_time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            greeting: greeting,
            caller_number: callerNumber || 'unknown'
          }
        }
      }
    }

    // Log for debugging
    await supabase.from('webhook_logs').insert({
      webhook_name: 'ai-assistant-webhook',
      request_body: body,
      response_body: { dynamic_variables: variables },
      created_at: new Date().toISOString()
    })

    console.log('=== RETURNING TELNYX FORMAT ===')
    console.log(JSON.stringify({ dynamic_variables: variables }, null, 2))
    
    // IMPORTANT: Telnyx expects response in this exact format!
    // Must be wrapped in "dynamic_variables" object
    return new Response(
      JSON.stringify({
        dynamic_variables: variables,
        // Optional: memory and conversation fields can be added here
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    // Return default in correct format
    return new Response(
      JSON.stringify({
        dynamic_variables: {
          agent_name: 'Assistant',
          company_name: 'Our Company',
          hours_of_operation: 'Monday-Friday 9am-6pm',
          services_offered: 'Professional services',
          business_phone: '',
          current_date: new Date().toLocaleDateString(),
          current_time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          greeting: 'Thank you for calling. How can I help you today?'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})