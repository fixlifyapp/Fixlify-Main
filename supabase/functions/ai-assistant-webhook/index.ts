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
    
    // Get Toronto timezone date/time
    const torontoDate = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Toronto",
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const torontoTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Toronto",
      hour: '2-digit',
      minute: '2-digit'
    })
    const dayOfWeek = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Toronto",
      weekday: 'long'
    })
    
    // Default values
    let variables = {
      agent_name: 'Assistant',
      company_name: 'Our Company',
      hours_of_operation: 'Monday-Friday 9am-6pm',
      services_offered: 'Professional services',
      business_phone: calledNumber || '',
      current_date: torontoDate,
      current_time: torontoTime,
      day_of_week: dayOfWeek,
      greeting: 'Thank you for calling. How can I help you today?',
      caller_number: callerNumber || 'unknown',
      business_niche: 'Professional services',
      capabilities: 'General service capabilities',
      diagnostic_fee: '$89',
      emergency_fee: '$150',
      hourly_rate: '$125',
      service_area: 'Greater Toronto Area',
      payment_methods: 'Credit Card, Cash, E-Transfer',
      warranty_info: '90-day parts and labor warranty',
      scheduling_rules: 'Same-day service available'
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
          
          // Set actual values with Toronto timezone and enhanced fields
          variables = {
            agent_name: aiConfig.agent_name || 'Assistant',
            company_name: aiConfig.company_name || 'Our Company',
            hours_of_operation: aiConfig.hours_of_operation || 'Monday-Friday 9am-6pm',
            services_offered: servicesText,
            business_phone: phoneData.phone_number || calledNumber,
            current_date: torontoDate,
            current_time: torontoTime,
            day_of_week: dayOfWeek,
            greeting: greeting,
            caller_number: callerNumber || 'unknown',
            business_niche: aiConfig.business_type || 'Professional services',
            // Enhanced capability fields
            capabilities: aiConfig.capabilities || 'General service capabilities',
            diagnostic_fee: aiConfig.diagnostic_fee ? `$${aiConfig.diagnostic_fee}` : '$89',
            emergency_fee: aiConfig.emergency_surcharge ? `$${aiConfig.emergency_surcharge}` : '$150',
            hourly_rate: aiConfig.hourly_rate ? `$${aiConfig.hourly_rate}` : '$125',
            service_area: aiConfig.service_area || 'Greater Toronto Area',
            payment_methods: aiConfig.payment_methods || 'Credit Card, Cash, E-Transfer',
            warranty_info: aiConfig.warranty_info || '90-day parts and labor warranty',
            scheduling_rules: aiConfig.scheduling_rules || 'Same-day service available',
            emergency_hours: aiConfig.emergency_hours || '24/7 emergency service'
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
    
    // Return default in correct format with Toronto time
    const torontoDate = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Toronto",
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const torontoTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Toronto",
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return new Response(
      JSON.stringify({
        dynamic_variables: {
          agent_name: 'Assistant',
          company_name: 'Our Company',
          hours_of_operation: 'Monday-Friday 9am-6pm',
          services_offered: 'Professional services',
          business_phone: '',
          current_date: torontoDate,
          current_time: torontoTime,
          greeting: 'Thank you for calling. How can I help you today?',
          capabilities: 'General service capabilities',
          diagnostic_fee: '$89',
          emergency_fee: '$150',
          hourly_rate: '$125'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})