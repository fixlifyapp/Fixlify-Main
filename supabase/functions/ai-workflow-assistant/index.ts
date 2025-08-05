import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  type: 'suggest_workflows' | 'generate_trigger' | 'recommend_actions' | 'create_template';
  context: {
    businessType?: string;
    currentWorkflows?: any[];
    userInput?: string;
    trigger?: any;
    industry?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context }: AIRequest = await req.json();
    console.log('AI Assistant Request:', { type, context });

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'suggest_workflows':
        systemPrompt = `You are an AI automation expert. Suggest 3-5 practical workflow automations for a ${context.businessType || 'service business'}. 
        Return ONLY a JSON array of workflow suggestions with this exact structure:
        [
          {
            "name": "Workflow Name",
            "description": "Brief description",
            "trigger": "trigger_type",
            "actions": ["action1", "action2"],
            "benefits": "Why this helps the business"
          }
        ]`;
        userPrompt = `Suggest automation workflows for a ${context.businessType || 'service business'}. Focus on practical, time-saving automations.`;
        break;

      case 'generate_trigger':
        systemPrompt = `You are an AI assistant that converts natural language into automation triggers. 
        Return ONLY a JSON object with this structure:
        {
          "trigger_type": "job_created|invoice_sent|payment_received|appointment_scheduled|customer_created",
          "conditions": {},
          "description": "Human-readable description"
        }`;
        userPrompt = `Convert this to an automation trigger: "${context.userInput}"`;
        break;

      case 'recommend_actions':
        systemPrompt = `You are an AI assistant that recommends automation actions based on triggers.
        Return ONLY a JSON array of recommended actions:
        [
          {
            "type": "send_email|send_sms|create_task|update_status|generate_invoice",
            "description": "What this action does",
            "config": {},
            "priority": "high|medium|low"
          }
        ]`;
        userPrompt = `Recommend automation actions for this trigger: ${JSON.stringify(context.trigger)}`;
        break;

      case 'create_template':
        systemPrompt = `You are an AI assistant that creates workflow templates for ${context.industry || 'service businesses'}.
        Return ONLY a JSON object with this structure:
        {
          "name": "Template Name",
          "description": "Template description",
          "category": "customer_service|sales|operations|finance",
          "workflow": {
            "trigger": {},
            "actions": [],
            "conditions": {}
          }
        }`;
        userPrompt = `Create a workflow template for: ${context.userInput}`;
        break;

      default:
        throw new Error('Invalid request type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Try to parse as JSON, fallback to text if needed
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (e) {
      result = { text: aiResponse, raw: true };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI workflow assistant:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});