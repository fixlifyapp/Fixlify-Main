import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// IMPORTANT: This webhook is PUBLIC - no JWT verification for Telnyx compatibility
serve(async (req) => {
  // Fast CORS response
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json()
    console.log('=== TELNYX PUBLIC WEBHOOK CALLED ===')
    
    // Extract phone numbers
    let calledNumber = body.to || body.data?.payload?.to || body.data?.payload?.telnyx_agent_target
    let callerNumber = body.from || body.data?.payload?.from || body.data?.payload?.telnyx_end_user_target
    
    // Get timezone info
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

    // Default variables
    let variables = {
      agent_name: 'Sarah',
      company_name: 'Nicks appliance repair',
      hours_of_operation: 'Monday-Friday 9am-6pm',
      services_offered: 'Refrigerator, Washer, Dryer, Dishwasher, Oven',
      business_phone: calledNumber || '+14375249932',
      current_date: torontoDate,
      current_time: torontoTime,
      day_of_week: dayOfWeek,
      greeting: 'Thank you for calling Nicks appliance repair. I\'m Sarah, your AI assistant. What appliance needs service today?',
      caller_number: callerNumber || 'unknown',
      business_niche: 'Appliance Repair',
      capabilities: 'Schedule appointments, provide quotes, answer questions about appliance repairs',
      diagnostic_fee: '$75',
      emergency_fee: '$50',
      hourly_rate: '$100',
      service_area: 'Greater Toronto Area',
      payment_methods: 'Credit Card, Cash, E-Transfer',
      warranty_info: '90-day parts and labor warranty',
      scheduling_rules: 'Same-day service available',
      customer_name: '',
      customer_status: 'new',
      customer_history: '',
      is_existing_customer: 'false'
    }

    // Try to get config from database
    if (calledNumber) {
      const { data: phoneData } = await supabase
        .from('phone_numbers')
        .select('id, phone_number')
        .eq('phone_number', calledNumber)
        .single()

      if (phoneData) {
        const { data: aiConfig } = await supabase
          .from('ai_dispatcher_configs')
          .select('*')
          .eq('phone_number_id', phoneData.id)
          .single()

        if (aiConfig) {
          // Use config values
          variables.agent_name = aiConfig.agent_name || variables.agent_name
          variables.company_name = aiConfig.company_name || variables.company_name
          variables.business_niche = aiConfig.business_type || variables.business_niche
          variables.diagnostic_fee = aiConfig.diagnostic_fee ? `$${aiConfig.diagnostic_fee}` : variables.diagnostic_fee
          variables.emergency_fee = aiConfig.emergency_surcharge ? `$${aiConfig.emergency_surcharge}` : variables.emergency_fee
          
          // Process greeting template
          let greeting = aiConfig.greeting_message || variables.greeting
          greeting = greeting
            .replace(/{{company_name}}/g, variables.company_name)
            .replace(/{{agent_name}}/g, variables.agent_name)
            .replace(/{company_name}/g, variables.company_name)
            .replace(/{agent_name}/g, variables.agent_name)
          variables.greeting = greeting
        }
      }
    }

    // Check for existing client
    if (callerNumber) {
      const cleanCallerNumber = callerNumber.replace(/[^0-9]/g, '')
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .or(`phone.like.%${cleanCallerNumber.slice(-10)}%,phone.like.%${cleanCallerNumber.slice(-7)}%`)
        .single()
      
      if (clientData) {
        const firstName = clientData.name ? clientData.name.split(' ')[0] : ''
        variables.customer_name = firstName
        variables.customer_status = 'existing'
        variables.is_existing_customer = 'true'
        variables.greeting = `Thank you for calling ${variables.company_name}, ${firstName}! Welcome back. How can I help you today?`
      }
    }

    console.log('Returning variables:', variables)
    
    return new Response(
      JSON.stringify({
        dynamic_variables: variables
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
    
    // Return defaults on error
    return new Response(
      JSON.stringify({
        dynamic_variables: {
          agent_name: 'Sarah',
          company_name: 'Nicks appliance repair',
          greeting: 'Thank you for calling. How can I help you today?',
          current_date: new Date().toLocaleDateString(),
          current_time: new Date().toLocaleTimeString(),
          services_offered: 'Appliance repair services'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})
