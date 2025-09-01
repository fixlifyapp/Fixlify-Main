import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get timezone-aware date/time
function getLocalDateTime(timezone = 'America/Toronto') {
  const now = new Date()
  
  return {
    date: now.toLocaleDateString("en-US", {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: now.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    }),
    dayOfWeek: now.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: 'long'
    }),
    timeOfDay: (() => {
      const hour = parseInt(now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
      }))
      if (hour < 12) return 'morning'
      if (hour < 17) return 'afternoon'
      return 'evening'
    })()
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('AI Assistant Webhook called - v1.0-public')
  
  try {
    // Parse the request body
    const body = await req.json()
    console.log('Request received from:', body.caller || 'unknown')
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the phone number from the request
    const phoneNumber = body.to || body.phone_number || '+14375249932'
    
    // Look up AI dispatcher config
    let config = null
    try {
      const { data: phoneData } = await supabase
        .from('phone_numbers')
        .select('*, ai_dispatcher_configs!inner(*)')
        .eq('phone_number', phoneNumber)
        .eq('ai_dispatcher_enabled', true)
        .single()
      
      if (phoneData?.ai_dispatcher_configs) {
        config = phoneData.ai_dispatcher_configs
      }
    } catch (err) {
      console.log('No config found for phone:', phoneNumber)
    }
    
    // Get date/time info
    const datetime = getLocalDateTime()
    
    // Try to lookup client by phone number
    let clientInfo = {
      customer_name: '',
      customer_status: 'new',
      customer_history: '',
      last_service_date: '',
      outstanding_balance: '$0',
      customer_notes: '',
      is_existing_customer: 'false'
    }
    
    if (body.caller) {
      try {
        const { data: client } = await supabase
          .from('clients')
          .select('*, jobs(*)')
          .eq('phone', body.caller)
          .single()
        
        if (client) {
          clientInfo = {
            customer_name: client.name || '',
            customer_status: 'existing',
            customer_history: client.jobs?.length ? `${client.jobs.length} previous services` : 'No service history',
            last_service_date: client.jobs?.[0]?.created_at || '',
            outstanding_balance: '$0', // Calculate if needed
            customer_notes: client.notes || '',
            is_existing_customer: 'true'
          }
        }
      } catch (err) {
        console.log('Client lookup error:', err)
      }
    }
    
    // Build dynamic variables (all template variables that Telnyx might use)
    const dynamicVariables = {
      // Core identifiers
      agent_name: config?.agent_name || 'Sarah',
      company_name: config?.company_name || 'Our Service Company',
      business_niche: config?.business_niche || 'Professional Services',
      
      // Time information  
      current_date: datetime.date,
      current_time: datetime.time,
      day_of_week: datetime.dayOfWeek,
      time_of_day: datetime.timeOfDay,
      
      // Business information
      hours_of_operation: config?.hours_of_operation || 'Monday-Friday 9am-6pm',
      services_offered: config?.services_offered || 'Professional services',
      business_phone: config?.business_phone || phoneNumber,
      service_area: config?.service_area || 'Greater Toronto Area',
      
      // Pricing
      diagnostic_fee: config?.diagnostic_fee ? `$${config.diagnostic_fee}` : '$89',
      emergency_surcharge: config?.emergency_surcharge ? `$${config.emergency_surcharge}` : '$50',
      hourly_rate: config?.hourly_rate ? `$${config.hourly_rate}` : '$125',
      
      // Service specifics
      capabilities: config?.capabilities || 'Schedule appointments, answer questions, provide quotes',
      payment_methods: config?.payment_methods || 'Credit Card, Cash, E-Transfer',
      warranty_info: config?.warranty_info || '90-day warranty on all work',
      emergency_hours: config?.emergency_hours || '24/7 emergency service available',
      
      // Client information
      ...clientInfo,
      
      // Additional
      greeting: config?.greeting_message || `Thank you for calling {{company_name}}. I'm {{agent_name}}, your AI assistant. How can I help you today?`
    }
    
    // Process the greeting to replace any template variables
    if (dynamicVariables.greeting) {
      dynamicVariables.greeting = dynamicVariables.greeting
        .replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const trimmedKey = key.trim()
          return dynamicVariables[trimmedKey] || match
        })
    }
    
    // Return only dynamic variables for Telnyx
    // Telnyx uses these to replace template variables in the AI Assistant settings
    const response = {
      dynamic_variables: dynamicVariables
    }
    
    console.log('Returning dynamic variables for:', config?.company_name || 'default')
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    
    // Return default response on error
    const datetime = getLocalDateTime()
    return new Response(JSON.stringify({
      dynamic_variables: {
        agent_name: 'Assistant',
        company_name: 'Our Company',
        business_niche: 'Services',
        current_date: datetime.date,
        current_time: datetime.time,
        greeting: 'Hello, thank you for calling. How can I help you today?'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
