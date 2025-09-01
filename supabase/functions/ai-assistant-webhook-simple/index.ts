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

  try {
    const body = await req.json()
    console.log('Webhook called:', new Date().toISOString())
    
    // Extract phone numbers
    const calledNumber = body.data?.payload?.to || body.to || '+14375249932'
    const callerNumber = body.data?.payload?.from || body.from || ''
    
    // Get current time in Toronto
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
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Default variables
    let variables = {
      agent_name: 'Sarah',
      company_name: 'Nicks appliance repair',
      business_niche: 'Appliance Repair',
      hours_of_operation: 'Monday-Friday 9am-6pm',
      services_offered: 'Refrigerator, Washer, Dryer, Dishwasher, Oven',
      diagnostic_fee: '$75',
      emergency_fee: '$50',
      current_date: torontoDate,
      current_time: torontoTime,
      greeting: 'Thank you for calling Nicks appliance repair. I\'m Sarah. How can I help you today?',
      customer_name: '',
      customer_status: 'new',
      is_existing_customer: 'false',
      // Simple conversation instructions
      instructions: 'CRITICAL: Always respond to the customer. Never be silent. If you hear silence, ask if they are still there. Always offer to help schedule an appointment or answer questions about appliance repair.'
    }
    
    // Try to get config from database
    try {
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
          variables.agent_name = aiConfig.agent_name || 'Sarah'
          variables.company_name = aiConfig.company_name || 'Nicks appliance repair'
          variables.business_niche = aiConfig.business_type || 'Appliance Repair'
          variables.diagnostic_fee = aiConfig.diagnostic_fee ? `$${aiConfig.diagnostic_fee}` : '$75'
          variables.emergency_fee = aiConfig.emergency_surcharge ? `$${aiConfig.emergency_surcharge}` : '$50'
          
          // Parse services
          let servicesText = 'Refrigerator, Washer, Dryer, Dishwasher, Oven'
          if (aiConfig.services_offered) {
            if (typeof aiConfig.services_offered === 'string') {
              servicesText = aiConfig.services_offered
            } else if (Array.isArray(aiConfig.services_offered)) {
              servicesText = aiConfig.services_offered.join(', ')
            }
          }
          variables.services_offered = servicesText
          
          // Check for existing customer
          if (callerNumber) {
            const cleanCallerNumber = callerNumber.replace(/[^0-9]/g, '')
            const { data: clientData } = await supabase
              .from('clients')
              .select('name')
              .or(`phone.like.%${cleanCallerNumber.slice(-10)}%,phone.like.%${cleanCallerNumber.slice(-7)}%`)
              .single()
            
            if (clientData) {
              const firstName = clientData.name ? clientData.name.split(' ')[0] : ''
              variables.customer_name = firstName
              variables.customer_status = 'existing'
              variables.is_existing_customer = 'true'
              variables.greeting = `Thank you for calling ${variables.company_name}, ${firstName}! Welcome back. I'm ${variables.agent_name}. How can I help you today?`
            } else {
              variables.greeting = `Thank you for calling ${variables.company_name}. I'm ${variables.agent_name}. How can I help with your appliance today?`
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting config:', error)
    }
    
    // Return response for Telnyx
    return new Response(
      JSON.stringify({
        dynamic_variables: variables
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Webhook error:', error)
    
    // Return default response even on error
    return new Response(
      JSON.stringify({
        dynamic_variables: {
          agent_name: 'Sarah',
          company_name: 'Nicks appliance repair',
          greeting: 'Thank you for calling. How can I help you today?',
          instructions: 'Always respond to the customer. Never be silent.'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})