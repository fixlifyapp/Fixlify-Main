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
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { estimateId, sendToClient, customMessage } = await req.json();

    if (!estimateId) {
      throw new Error('Estimate ID is required');
    }

    // Fetch estimate data with separate queries
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .maybeSingle();

    if (estimateError) throw estimateError;
    if (!estimate) throw new Error('Estimate not found');

    // Fetch job and client data
    let job = null;
    let client = null;
    
    if (estimate.job_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', estimate.job_id)
        .maybeSingle();
      if (jobData) job = jobData;
    }

    const clientId = estimate.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      if (clientData) client = clientData;
    }

    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // TEST MODE: If no Mailgun API key, simulate sending
    if (!mailgunApiKey) {
      console.log('🧪 TEST MODE: Simulating email send');
      console.log('To:', client.email);
      console.log('Subject: Estimate #' + estimate.estimate_number);
      console.log('Portal URL:', `${req.headers.get('origin')}/estimate/${estimateId}`);
      
      // Log to estimate_communications table
      await supabase
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          type: 'email',
          recipient_email: client.email,
          subject: `Estimate #${estimate.estimate_number} from Fixlify Services`,
          status: 'test_mode',
          metadata: {
            test_mode: true,
            portal_url: `${req.headers.get('origin')}/estimate/${estimateId}`,
            custom_message: customMessage
          }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'TEST MODE: Email simulated successfully',
          details: {
            to: client.email,
            estimateNumber: estimate.estimate_number,
            portalUrl: `${req.headers.get('origin')}/estimate/${estimateId}`
          }
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PRODUCTION MODE: Send actual email via Mailgun
    // ... (rest of the original code for actual email sending)
    
    throw new Error('Mailgun integration not yet implemented. Use TEST MODE.');

  } catch (error: any) {
    console.error('Error in send-estimate:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
