import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateMessageRequest {
  messageType: string;
  context: string;
  userInput?: string;
  hasUserInput?: boolean;
  variables: Array<{ name: string; label: string; type?: string }>;
  companyInfo: {
    businessType: string;
    tone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageType, context, userInput, hasUserInput, variables, companyInfo }: GenerateMessageRequest = await req.json();
    
    console.log('Generating AI message with:', { messageType, context, hasUserInput, companyInfo });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Create simple variable list for essential variables only
    const essentialVariables = ['{{client.firstName}}', '{{job.title}}', '{{company.name}}', '{{job.status}}'];
    
    let prompt = '';
    let isEmail = messageType === 'professional';
    
    if (hasUserInput && userInput) {
      // Improve user's existing message
      if (isEmail) {
        prompt = `Take this email message and improve it by adding appropriate variables where they make sense:

Original message: "${userInput}"

Available variables: ${essentialVariables.join(', ')}

Improve the message to be more professional and add variables where appropriate. 

Format your response as JSON:
{
  "subject": "Improved email subject",
  "message": "Improved email body with variables"
}`;
      } else {
        prompt = `Take this SMS message and improve it by adding appropriate variables where they make sense:

Original message: "${userInput}"

Available variables: ${essentialVariables.join(', ')}

Keep it under 160 characters and add variables where appropriate.

Format your response as JSON:
{
  "message": "Improved SMS with variables"
}`;
      }
    } else {
      // Generate new message
      if (isEmail) {
        prompt = `Generate a professional email for a ${companyInfo.businessType}. 

Context: ${context || 'General business communication'}
Tone: ${companyInfo.tone}
Use these variables: ${essentialVariables.join(', ')}

Please generate:
1. A subject line
2. An email body that uses the variables appropriately

Format your response as JSON:
{
  "subject": "Email subject here",
  "message": "Email body here"
}

Make the message professional and relevant to the business context.`;
      } else {
        prompt = `Generate a ${companyInfo.tone} SMS message for a ${companyInfo.businessType}.
        
Context: ${context || 'General business communication'}
Use these variables: ${essentialVariables.join(', ')}

Keep it under 160 characters and use the variables appropriately.

Format your response as JSON:
{
  "message": "SMS message here"
}`;
      }
    }

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional business communication assistant. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      console.log('Generated message:', parsedResponse);
      
      return new Response(
        JSON.stringify(parsedResponse),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback: return the response as a simple message
      return new Response(
        JSON.stringify({
          message: aiResponse,
          subject: isEmail ? 'Generated Subject' : undefined
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

  } catch (error: any) {
    console.error('Error in generate-ai-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);