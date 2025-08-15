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
      scheduling_rules: 'Same-day service available',
      // Client information
      customer_name: '',
      customer_status: 'new',
      customer_history: '',
      last_service_date: '',
      preferred_technician: '',
      outstanding_balance: '$0',
      customer_notes: '',
      is_existing_customer: 'false',
      // Additional info
      additional_info: ''
    }

    // Client lookup variables
    let clientInfo = null
    let phoneUserID = null
    
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
        phoneUserID = phoneData.user_id
        
        // First, try to find client by caller's phone number
        if (callerNumber && phoneUserID) {
          const cleanCallerNumber = callerNumber.replace(/[^0-9]/g, '')
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('created_by', phoneUserID)
            .or(`phone.like.%${cleanCallerNumber.slice(-10)}%,phone.like.%${cleanCallerNumber.slice(-7)}%`)
            .single()
          
          if (!clientError && clientData) {
            console.log('Found existing client:', clientData.name)
            clientInfo = clientData
            
            // Get recent job history
            const { data: recentJobs } = await supabase
              .from('jobs')
              .select('device_model, device_issue, status, created_at, revenue')
              .eq('client_id', clientData.id)
              .order('created_at', { ascending: false })
              .limit(3)
            
            let historyText = ''
            if (recentJobs && recentJobs.length > 0) {
              historyText = recentJobs.map(job => {
                const date = new Date(job.created_at).toLocaleDateString()
                return `${date}: ${job.device_model} - ${job.device_issue} (${job.status})`
              }).join('; ')
            }
            
            // Calculate outstanding balance from unpaid jobs
            const { data: unpaidJobs } = await supabase
              .from('jobs')
              .select('revenue')
              .eq('client_id', clientData.id)
              .in('status', ['new', 'in_progress', 'awaiting_parts', 'ready_for_pickup'])
            
            let totalBalance = 0
            if (unpaidJobs) {
              totalBalance = unpaidJobs.reduce((sum, job) => sum + (job.revenue || 0), 0)
            }
            
            // Update variables with client info - use first name only
            const firstName = clientData.name ? clientData.name.split(' ')[0] : ''
            variables.customer_name = firstName
            variables.customer_full_name = clientData.name || ''
            variables.customer_status = 'existing'
            variables.customer_history = historyText || 'No recent service history'
            variables.last_service_date = recentJobs && recentJobs.length > 0 
              ? new Date(recentJobs[0].created_at).toLocaleDateString() 
              : 'No recent services'
            variables.outstanding_balance = totalBalance > 0 ? `$${totalBalance.toFixed(2)}` : '$0'
            variables.customer_notes = clientData.notes || ''
            variables.is_existing_customer = 'true'
          }
        }
        
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
          
          // Build contextual greeting based on client status
          let greeting = ''
          if (clientInfo) {
            // Personalized greeting for existing client - use first name only
            const firstName = clientInfo.name ? clientInfo.name.split(' ')[0] : 'valued customer'
            greeting = `Thank you for calling ${aiConfig.company_name || 'our company'}, ${firstName}! Welcome back. How can I help you today?`
          } else {
            // Standard greeting for new clients - process template
            let templateGreeting = aiConfig.greeting_message || 
                                 aiConfig.business_greeting || 
                                 aiConfig.dynamic_variables?.greeting ||
                                 `Thank you for calling ${aiConfig.company_name || 'our company'}. I'm ${aiConfig.agent_name || 'your assistant'}. How can I help you today?`
            
            // Replace ALL possible variables in greeting template (both formats)
            greeting = templateGreeting
              // Double curly braces format {{variable}}
              .replace(/\{\{company_name\}\}/g, aiConfig.company_name || 'our company')
              .replace(/\{\{agent_name\}\}/g, aiConfig.agent_name || 'Assistant')
              .replace(/\{\{business_niche\}\}/g, aiConfig.business_type || aiConfig.business_niche || 'service')
              .replace(/\{\{services_offered\}\}/g, servicesText)
              .replace(/\{\{current_time\}\}/g, torontoTime)
              .replace(/\{\{current_date\}\}/g, torontoDate)
              .replace(/\{\{day_of_week\}\}/g, dayOfWeek)
              .replace(/\{\{hours_of_operation\}\}/g, aiConfig.hours_of_operation || 'Monday-Friday 9am-6pm')
              .replace(/\{\{business_phone\}\}/g, phoneData?.phone_number || calledNumber || '')
              // Single curly braces format {variable} for backward compatibility
              .replace(/\{company_name\}/g, aiConfig.company_name || 'our company')
              .replace(/\{agent_name\}/g, aiConfig.agent_name || 'Assistant')
              .replace(/\{business_niche\}/g, aiConfig.business_type || aiConfig.business_niche || 'service')
              .replace(/\{business_type\}/g, aiConfig.business_type || aiConfig.business_niche || 'service')
              .replace(/\{services_offered\}/g, servicesText)
              .replace(/\{current_time\}/g, torontoTime)
              .replace(/\{current_date\}/g, torontoDate)
              .replace(/\{day_of_week\}/g, dayOfWeek)
              .replace(/\{time_of_day\}/g, torontoTime.includes('AM') ? 'morning' : torontoTime.includes('PM') && parseInt(torontoTime.split(':')[0]) < 5 ? 'afternoon' : 'evening')
              .replace(/\{hours_of_operation\}/g, aiConfig.hours_of_operation || 'Monday-Friday 9am-6pm')
              .replace(/\{business_phone\}/g, phoneData?.phone_number || calledNumber || '')
          }
          
          // Build enhanced instructions with client context and psychology
          let baseInstructions = aiConfig.instructions || ''
          let enhancedInstructions = ''
          
          if (clientInfo) {
            const firstName = clientInfo.name ? clientInfo.name.split(' ')[0] : 'valued customer'
            enhancedInstructions = `## 🎯 EXISTING CLIENT DETECTED: ${firstName}
- Full Name: ${clientInfo.name || 'Not on file'}
- Phone: ${clientInfo.phone || 'Not on file'}
- Email: ${clientInfo.email || 'Not on file'}
- Address: ${clientInfo.address ? `${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state}` : 'Not on file'}
- Recent history: ${variables.customer_history}
- Outstanding balance: ${variables.outstanding_balance}
- Client notes: ${clientInfo.notes || 'None'}

## 🧠 PSYCHOLOGICAL APPROACH FOR EXISTING CLIENT
- Use their FIRST NAME (${firstName}) naturally 2-3 times during conversation
- Never confuse agent name (${aiConfig.agent_name}) with customer name (${firstName})
- Reference their past positive experiences ("Last time we fixed your...")
- Create FOMO: "We have a special promotion for loyal customers like you"
- Use social proof: "Many of our repeat clients in your area..."
- If balance exists, frame as investment: "protecting your previous repair investment"

## 💡 CONVERSION STRATEGIES
- Upsell maintenance packages: "Since we know your system well..."
- Create urgency without pressure: "I can lock in our current rate for you"
- Use assumptive close: "When would be the best time - morning or afternoon?"
- Offer exclusive loyalty benefits they "qualify for" as existing client

${baseInstructions}`
          } else {
            enhancedInstructions = `## 🎯 NEW CLIENT OPPORTUNITY

## 🧠 PSYCHOLOGICAL TRIGGERS FOR CONVERSION
1. **Reciprocity**: Offer free estimate or diagnostic (they'll feel obligated to book)
2. **Authority**: Mention certifications, years of experience, specialized training
3. **Social Proof**: "We service over 500 homes in your neighborhood"
4. **Scarcity**: "We have only 2 appointments left this week"
5. **Loss Aversion**: "Delaying could lead to more expensive repairs"
6. **Trust Building**: "We're family-owned and local since [year]"

## 💬 MARKETING LANGUAGE PATTERNS
- Use "investment" instead of "cost"
- Say "when" not "if" (assumptive language)
- Create micro-commitments: "Can I ask you a quick question about..."
- Use benefit-focused language: "This will save you..." not "This costs..."
- Power words: Guaranteed, Proven, Exclusive, Limited, Premium

## 🎯 OBJECTION HANDLING
- Price concern → Focus on value, warranty, preventing bigger issues
- Time concern → Offer flexible scheduling, emphasize quick service
- Trust concern → Mention guarantee, insurance, local reputation
- Decision delay → Create urgency with limited availability

## 📞 CALL FLOW FOR MAXIMUM CONVERSION
1. Build rapport quickly (match their energy/tone)
2. Ask discovery questions to find pain points
3. Agitate the problem subtly (consequences of not fixing)
4. Present solution as obvious choice
5. Handle objections with empathy + logic
6. Close with alternative choice: "Morning or afternoon?"
7. Confirm and create anticipation for service

${baseInstructions}`
          }
          
          // Set actual values with Toronto timezone and enhanced fields
          variables = {
            ...variables, // Keep client info if found
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
            emergency_hours: aiConfig.emergency_hours || '24/7 emergency service',
            instructions: enhancedInstructions,
            additional_info: aiConfig.additional_info || ''
          }
        }
      }
    }

    // Log for debugging
    await supabase.from('webhook_logs').insert({
      webhook_name: 'ai-assistant-webhook',
      request_body: body,
      response_body: { 
        dynamic_variables: variables,
        client_detected: clientInfo ? clientInfo.name : 'none'
      },
      created_at: new Date().toISOString()
    })

    console.log('=== CLIENT DETECTION ===')
    console.log('Client found:', clientInfo ? clientInfo.name : 'No existing client')
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
          hourly_rate: '$125',
          customer_name: '',
          customer_status: 'new',
          customer_history: '',
          is_existing_customer: 'false',
          additional_info: ''
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})