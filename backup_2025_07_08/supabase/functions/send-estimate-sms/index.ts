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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { estimateId, recipientPhone, message: customMessage } = await req.json();

    if (!estimateId || !recipientPhone) {
      throw new Error('Missing required fields: estimateId and recipientPhone');
    }

    // Fetch estimate details - using separate queries to avoid nested query issues
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .maybeSingle();

    if (estimateError) throw estimateError;
    if (!estimate) throw new Error('Estimate not found');
    // Fetch job details if job_id exists
    let job = null;
    if (estimate.job_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', estimate.job_id)
        .maybeSingle();
      job = jobData;
    }

    // Fetch client details
    let client = null;
    const clientId = estimate.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      client = clientData;
    }

    // Generate portal URL
    const authorization = req.headers.get('authorization');
    const baseUrl = authorization?.includes('localhost') 
      ? 'http://localhost:8083' 
      : 'https://fixlify.app';
    const portalUrl = `${baseUrl}/estimate/${estimateId}`;

    // Create message    const messagePrefix = customMessage ? `${customMessage}\n\n` : '';
    const defaultMessage = `Hi ${client?.name || 'there'},\n\nYour estimate #${estimate.estimate_number} for $${estimate.total_amount} is ready to view.\n\nView estimate: ${portalUrl}\n\n- Fixlify Team`;
    const fullMessage = messagePrefix + defaultMessage;

    // Get auth header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Call telnyx-sms function to send the SMS
    const smsResponse = await fetch(`${supabaseUrl}/functions/v1/telnyx-sms`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientPhone,
        message: fullMessage,
        user_id: estimate.user_id,
        metadata: {
          estimate_id: estimateId,
          type: 'estimate_sms',
          portal_url: portalUrl
        }
      })
    });

    if (!smsResponse.ok) {
      const error = await smsResponse.text();
      throw new Error(`Failed to send SMS: ${error}`);    }

    const smsResult = await smsResponse.json();

    // Log the communication
    await supabase.from('estimate_communications').insert({
      estimate_id: estimateId,
      type: 'sms',
      recipient_phone: recipientPhone,
      content: fullMessage,
      status: 'sent',
      metadata: {
        portal_url: portalUrl,
        client_name: client?.name,
        sms_id: smsResult.messageId
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: smsResult.messageId,
        portalUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in send-estimate-sms:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send SMS',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});