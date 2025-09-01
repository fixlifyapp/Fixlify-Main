// AI Assistant Webhook v31 - Complete Variable Support
// This webhook provides ALL dynamic variables to Telnyx AI Assistant

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
    // Use service role key for internal operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get request body
    const body = await req.json().catch(() => ({}));
    console.log('Request body:', JSON.stringify(body));
    
    // Extract phone number from various possible fields
    let callerPhone = null;
    
    // Check different possible field names based on Telnyx documentation
    if (body.data?.payload?.telnyx_end_user_target) {
      callerPhone = body.data.payload.telnyx_end_user_target;
    } else if (body.data?.payload?.from) {
      callerPhone = body.data.payload.from;
    } else if (body.phone_number) {
      callerPhone = body.phone_number;
    } else if (body.from) {
      callerPhone = body.from;
    }
    
    // Extract target phone (business phone)
    let targetPhone = null;
    if (body.data?.payload?.telnyx_agent_target) {
      targetPhone = body.data.payload.telnyx_agent_target;
    } else if (body.to) {
      targetPhone = body.to;
    }
    
    console.log('Caller phone:', callerPhone, 'Target phone:', targetPhone);

    // Get AI dispatcher config based on target phone number
    let config = null;
    
    if (targetPhone) {
      // First try to find config by phone number
      const cleanTarget = targetPhone.replace(/\D/g, '');
      const { data: phoneData } = await supabase
        .from('phone_numbers')
        .select('*, ai_dispatcher_configs(*)')
        .or(`phone_number.eq.${cleanTarget},phone_number.eq.+${cleanTarget},phone_number.eq.+1${cleanTarget}`)
        .limit(1)
        .maybeSingle();
      
      if (phoneData?.ai_dispatcher_configs?.[0]) {
        config = phoneData.ai_dispatcher_configs[0];
        console.log('Found config for phone:', targetPhone);
      }
    }
    
    // Fallback to first enabled config
    if (!config) {
      const { data: configs } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('enabled', true)
        .limit(1);
      
      config = configs?.[0];
    }
    
    // Default config if none found
    if (!config) {
      config = {
        company_name: 'Fixlify Services',
        business_niche: 'Field Service',
        agent_name: 'AI Assistant',
        greeting_message: 'Hello! Thank you for calling. How can I help you today?',
        services_offered: 'HVAC, Plumbing, Electrical',
        hours_of_operation: 'Monday-Friday 9am-6pm',
        additional_info: 'Service call $89 • Emergency +$50 • 90-day warranty',
        agent_personality: 'Be professional and helpful',
        ai_capabilities: 'Schedule appointments, answer questions, provide estimates',
        call_transfer_message: 'Let me transfer you to a specialist who can better assist you.'
      };
    }
    
    // Initialize customer variables
    let isExistingCustomer = false;
    let customerName = '';
    let customerHistory = '';
    let outstandingBalance = 0;
    
    // Try to find existing client by phone number
    if (callerPhone && callerPhone !== 'unknown') {
      // Clean phone number - remove all non-digits
      const cleanPhone = callerPhone.replace(/\D/g, '');
      const phoneVariants = [
        cleanPhone,
        `+${cleanPhone}`,
        `+1${cleanPhone}`,
        cleanPhone.slice(-10), // Last 10 digits
        `+1${cleanPhone.slice(-10)}` // +1 plus last 10 digits
      ];
      
      console.log('Searching for client with phone variants:', phoneVariants);
      
      // Search for client
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .or(phoneVariants.map(p => `phone.eq.${p}`).join(','));
      
      const client = clients?.[0];
      
      if (client) {
        console.log('Found existing client:', client.name || client.id);
        isExistingCustomer = true;
        customerName = client.name || 
                      `${client.first_name || ''} ${client.last_name || ''}`.trim() || 
                      'valued customer';
        
        // Get recent jobs and calculate outstanding balance
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, description, status, revenue, created_at')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });
        
        if (jobs && jobs.length > 0) {
          // Calculate outstanding balance (unpaid jobs)
          const unpaidJobs = jobs.filter(job => 
            job.status === 'pending' || 
            job.status === 'in_progress' || 
            job.status === 'awaiting_payment'
          );
          
          outstandingBalance = unpaidJobs.reduce((sum, job) => {
            return sum + (parseFloat(job.revenue) || 0);
          }, 0);
          
          // Build customer history
          const recentJobs = jobs.slice(0, 3);
          const historyParts = [];
          
          historyParts.push(`${jobs.length} total service${jobs.length !== 1 ? 's' : ''}`);
          
          if (recentJobs.length > 0) {
            const lastJob = recentJobs[0];
            const lastDate = new Date(lastJob.created_at).toLocaleDateString();
            historyParts.push(`last visit ${lastDate}`);
            
            if (lastJob.description) {
              historyParts.push(`for ${lastJob.description.substring(0, 50)}`);
            }
          }
          
          customerHistory = historyParts.join(', ');
        } else {
          customerHistory = 'First time customer';
        }
      }
    }
    
    console.log('Customer info:', {
      isExisting: isExistingCustomer,
      name: customerName,
      balance: outstandingBalance,
      history: customerHistory
    });

    // Build complete response with ALL variables
    const response = {
      // Core business info
      company_name: config.company_name || 'Fixlify Services',
      business_niche: config.business_niche || 'Field Service',
      agent_name: config.agent_name || 'AI Assistant',
      
      // Services and operations
      services_offered: Array.isArray(config.services_offered) 
        ? config.services_offered.join(', ')
        : (typeof config.services_offered === 'string' && config.services_offered.startsWith('['))
        ? JSON.parse(config.services_offered).join(', ')
        : config.services_offered || 'HVAC, Plumbing, Electrical',
      hours_of_operation: config.hours_of_operation || 'Monday-Friday 9am-6pm',
      additional_info: config.additional_info || 'Service call $89 • Emergency +$50',
      
      // AI configuration
      ai_capabilities: config.ai_capabilities || 'Schedule appointments, answer questions, provide estimates',
      agent_personality: config.agent_personality || 'Be professional and helpful',
      
      // Customer information
      is_existing_customer: isExistingCustomer ? 'true' : 'false',
      customer_name: customerName,
      customer_history: customerHistory,
      outstanding_balance: outstandingBalance > 0 ? `$${outstandingBalance.toFixed(2)}` : '$0.00',
      
      // Transfer message
      call_transfer_message: config.call_transfer_message || 'Let me transfer you to a specialist who can better assist you.',
      
      // Greeting (dynamic based on customer status)
      greeting_message: isExistingCustomer && customerName
        ? `Thank you for calling ${config.company_name}. Welcome back, ${customerName}! I'm ${config.agent_name}. How can I help you today?`
        : config.greeting_message || `Thank you for calling ${config.company_name}. I'm ${config.agent_name}. How can I help you today?`,
      
      // Also include greeting for compatibility
      greeting: isExistingCustomer && customerName
        ? `Thank you for calling ${config.company_name}. Welcome back, ${customerName}! I'm ${config.agent_name}. How can I help you today?`
        : config.greeting_message || `Thank you for calling ${config.company_name}. I'm ${config.agent_name}. How can I help you today?`
    };

    console.log('Returning complete response to Telnyx:', JSON.stringify(response));
    
    // Log webhook call
    await supabase
      .from('webhook_logs')
      .insert({
        endpoint: 'ai-assistant-webhook',
        method: 'POST',
        headers: Object.fromEntries(req.headers.entries()),
        body: body,
        response: response,
        status_code: 200
      });
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in webhook:', error);
    
    // Always return 200 with default values to prevent Telnyx errors
    const fallbackResponse = {
      company_name: 'Fixlify Services',
      business_niche: 'Field Service',
      agent_name: 'AI Assistant',
      services_offered: 'HVAC, Plumbing, Electrical',
      hours_of_operation: 'Monday-Friday 9am-6pm',
      additional_info: 'Service call $89',
      ai_capabilities: 'Schedule appointments and answer questions',
      agent_personality: 'Professional and helpful',
      is_existing_customer: 'false',
      customer_name: '',
      customer_history: '',
      outstanding_balance: '$0.00',
      call_transfer_message: 'Let me transfer you to someone who can help.',
      greeting_message: 'Hello! Thank you for calling. How can I help you today?',
      greeting: 'Hello! Thank you for calling. How can I help you today?'
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});