import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, userId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user profile and business context
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_niche, role')
      .eq('id', userId)
      .single();

    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('company_name, business_type, business_niche')
      .eq('user_id', userId)
      .single();

    // Build enhanced context for automation
    const enhancedContext = {
      businessType: profile?.business_niche || companySettings?.business_niche || 'General Service',
      companyName: companySettings?.company_name || 'Your Company',
      userRole: profile?.role || 'owner',
      currentPage: context.page || 'automations',
      intent: context.intent || 'workflow_generation',
      ...context
    };

    // Create specialized prompts for automation creation
    const systemPrompt = createAutomationSystemPrompt(enhancedContext);
    const userPrompt = createAutomationUserPrompt(prompt, enhancedContext);

    console.log('Calling OpenAI for automation assistance...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response to extract structured workflow data
    const parsedResponse = parseAutomationResponse(aiResponse, enhancedContext);

    // Log the interaction for learning
    await supabase
      .from('ai_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: 'automation_workflow',
        content: aiResponse,
        context: {
          prompt,
          businessType: enhancedContext.businessType,
          intent: enhancedContext.intent,
          generatedWorkflow: parsedResponse.workflow
        }
      });

    return new Response(JSON.stringify({
      response: parsedResponse.response,
      suggestions: parsedResponse.suggestions,
      workflow: parsedResponse.workflow,
      templates: parsedResponse.templates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in automation-ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createAutomationSystemPrompt(context: any): string {
  return `You are an expert automation consultant specializing in ${context.businessType} businesses. 

Your role is to help users create intelligent workflows that automate their business processes. You understand:

BUSINESS CONTEXT:
- Business Type: ${context.businessType}
- Company: ${context.companyName}
- User Role: ${context.userRole}

AUTOMATION CAPABILITIES:
- Triggers: Job events, payment events, client events, time-based triggers
- Actions: Send emails/SMS, create tasks, update job status, assign technicians
- Conditions: If/then logic, field comparisons, multi-condition branching
- Variables: Dynamic content using job, client, and company data

RESPONSE FORMAT:
Always respond with practical, actionable automation advice. Include:
1. Clear explanation of the automation workflow
2. Specific trigger and action recommendations
3. Variable suggestions for personalization
4. Best practices for the business type

Be conversational but professional. Focus on ROI and time-saving benefits.`;
}

function createAutomationUserPrompt(prompt: string, context: any): string {
  return `User request: "${prompt}"

Context:
- Business: ${context.businessType}
- Intent: ${context.intent}
- Page: ${context.currentPage}

Please help them create an automation workflow that addresses their request. Be specific about:
1. What trigger to use
2. What actions to include
3. What variables to use for personalization
4. Why this automation will benefit their business

If appropriate, suggest 3-4 related automation ideas they might also find useful.`;
}

function parseAutomationResponse(aiResponse: string, context: any): any {
  const lines = aiResponse.split('\n');
  let workflow = null;
  const suggestions = [];
  const templates = [];

  // Extract workflow information
  const workflowMatch = aiResponse.match(/WORKFLOW:\s*(.+?)(?:\n|$)/i);
  if (workflowMatch) {
    workflow = {
      name: workflowMatch[1].trim(),
      trigger: extractTriggerFromResponse(aiResponse),
      steps: extractStepsFromResponse(aiResponse),
      businessType: context.businessType
    };
  }

  // Extract suggestions
  const suggestionMatches = aiResponse.match(/(?:SUGGESTIONS?|IDEAS?|RECOMMENDATIONS?):\s*\n((?:[-•]\s*.+\n?)+)/i);
  if (suggestionMatches) {
    const suggestionLines = suggestionMatches[1].split('\n');
    suggestionLines.forEach(line => {
      const cleaned = line.replace(/^[-•]\s*/, '').trim();
      if (cleaned) suggestions.push(cleaned);
    });
  }

  // Generate template suggestions based on business type
  const businessTemplates = generateBusinessTypeTemplates(context.businessType);
  templates.push(...businessTemplates);

  return {
    response: aiResponse,
    suggestions: suggestions.length > 0 ? suggestions.slice(0, 4) : generateDefaultSuggestions(context.businessType),
    workflow,
    templates: templates.slice(0, 3)
  };
}

function extractTriggerFromResponse(response: string): any {
  const triggerPatterns = [
    { pattern: /job\s+(?:completed|finished|done)/i, type: 'job_completed' },
    { pattern: /invoice\s+(?:overdue|unpaid)/i, type: 'invoice_overdue' },
    { pattern: /(?:new\s+)?job\s+(?:created|scheduled|booked)/i, type: 'job_created' },
    { pattern: /payment\s+(?:received|made)/i, type: 'payment_received' },
    { pattern: /appointment\s+(?:scheduled|booked)/i, type: 'job_scheduled' },
    { pattern: /client\s+(?:added|created|new)/i, type: 'client_created' }
  ];

  for (const { pattern, type } of triggerPatterns) {
    if (pattern.test(response)) {
      return { type, config: getDefaultTriggerConfig(type) };
    }
  }

  return { type: 'job_completed', config: {} };
}

function extractStepsFromResponse(response: string): any[] {
  const steps = [];
  let stepId = 1;

  // Check for email actions
  if (/send\s+(?:an?\s+)?email/i.test(response)) {
    steps.push({
      id: `step-${stepId++}`,
      type: 'action',
      name: 'Send Email',
      config: {
        actionType: 'email',
        subject: extractEmailSubject(response),
        message: extractEmailMessage(response)
      }
    });
  }

  // Check for SMS actions
  if (/send\s+(?:an?\s+)?(?:sms|text|message)/i.test(response)) {
    steps.push({
      id: `step-${stepId++}`,
      type: 'action',
      name: 'Send SMS',
      config: {
        actionType: 'sms',
        message: extractSMSMessage(response)
      }
    });
  }

  // Check for task creation
  if (/create\s+(?:a\s+)?task/i.test(response)) {
    steps.push({
      id: `step-${stepId++}`,
      type: 'action',
      name: 'Create Task',
      config: {
        actionType: 'task',
        title: 'Follow up required',
        description: 'Generated by automation'
      }
    });
  }

  // Check for delays
  if (/wait|delay|after\s+\d+/i.test(response)) {
    const delayMatch = response.match(/(?:wait|delay|after)\s+(\d+)\s*(hour|day|minute)/i);
    if (delayMatch) {
      steps.push({
        id: `step-${stepId++}`,
        type: 'delay',
        name: 'Wait',
        config: {
          delayValue: parseInt(delayMatch[1]),
          delayType: delayMatch[2].toLowerCase() + 's'
        }
      });
    }
  }

  return steps;
}

function extractEmailSubject(response: string): string {
  const subjectMatch = response.match(/subject[:\s]+["']([^"']+)["']/i);
  if (subjectMatch) return subjectMatch[1];

  if (/follow[\s-]?up/i.test(response)) return 'Thank you for choosing {{company.name}}!';
  if (/overdue|payment/i.test(response)) return 'Payment Reminder - Invoice #{{invoice.number}}';
  if (/appointment|confirmation/i.test(response)) return 'Appointment Confirmation';
  
  return 'Update from {{company.name}}';
}

function extractEmailMessage(response: string): string {
  const messageMatch = response.match(/message[:\s]+["']([^"']+)["']/i);
  if (messageMatch) return messageMatch[1];

  return `Hi {{client.firstName}},\n\nThis is an automated message from {{company.name}}.\n\nBest regards,\nYour {{company.name}} Team`;
}

function extractSMSMessage(response: string): string {
  const smsMatch = response.match(/(?:sms|text)[:\s]+["']([^"']+)["']/i);
  if (smsMatch) return smsMatch[1];

  return 'Hi {{client.firstName}}, update from {{company.name}}';
}

function getDefaultTriggerConfig(triggerType: string): any {
  switch (triggerType) {
    case 'invoice_overdue':
      return { days: 7 };
    case 'job_scheduled':
      return { hoursAhead: 24 };
    default:
      return {};
  }
}

function generateDefaultSuggestions(businessType: string): string[] {
  const basesSuggestions = [
    "Send follow-up emails after job completion",
    "Remind clients about overdue payments",
    "Create tasks when new jobs are scheduled",
    "Send appointment confirmations automatically"
  ];

  const businessSpecific: Record<string, string[]> = {
    'HVAC Services': [
      "Send seasonal maintenance reminders",
      "Alert technicians when parts arrive",
      "Schedule filter replacement reminders",
      "Send emergency service notifications"
    ],
    'Plumbing Services': [
      "Send pipe inspection reminders",
      "Alert for emergency plumbing calls",
      "Schedule annual maintenance visits",
      "Send water heater service reminders"
    ],
    'Electrical Services': [
      "Send electrical safety inspection reminders",
      "Alert for code compliance updates",
      "Schedule panel upgrade consultations",
      "Send surge protector maintenance alerts"
    ]
  };

  return businessSpecific[businessType] || basesSuggestions;
}

function generateBusinessTypeTemplates(businessType: string): any[] {
  const templates = [
    {
      id: 'post-service-followup',
      name: 'Post-Service Follow-up',
      description: 'Thank customers and request feedback after service completion',
      trigger: 'Job Completed',
      actions: ['Send Email', 'Request Review'],
      category: 'Customer Service'
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      description: 'Automatically remind clients about overdue invoices',
      trigger: 'Invoice Overdue',
      actions: ['Send Email', 'Send SMS'],
      category: 'Finance'
    },
    {
      id: 'appointment-confirmation',
      name: 'Appointment Confirmation',
      description: 'Confirm appointments 24 hours in advance',
      trigger: 'Job Scheduled',
      actions: ['Send SMS', 'Send Email'],
      category: 'Scheduling'
    }
  ];

  // Add business-specific templates
  if (businessType === 'HVAC Services') {
    templates.push({
      id: 'seasonal-maintenance',
      name: 'Seasonal Maintenance Reminder',
      description: 'Remind customers about seasonal HVAC maintenance',
      trigger: 'Time-Based',
      actions: ['Send Email', 'Create Task'],
      category: 'Maintenance'
    });
  }

  return templates;
}