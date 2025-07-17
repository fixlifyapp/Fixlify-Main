import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { invoiceId, recipientPhone, message: customMessage } = await req.json();

    if (!invoiceId || !recipientPhone) {
      throw new Error('Missing required fields: invoiceId and recipientPhone');
    }

    // Fetch invoice details - using separate queries to avoid nested query issues
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    // Check if invoice has a portal token, if not generate one
    let portalToken = invoice.portal_access_token;
    if (!portalToken) {
      portalToken = generateToken();
      
      // Update invoice with the new token
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ portal_access_token: portalToken })
        .eq('id', invoiceId);
        
      if (updateError) {
        console.error('Error updating invoice token:', updateError);
        throw new Error('Failed to generate portal access token');
      }
    }

    // Fetch job details if job_id exists
    let job = null;
    if (invoice.job_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', invoice.job_id)
        .maybeSingle();
      job = jobData;
    }

    // Fetch client details
    let client = null;
    const clientId = invoice.client_id || job?.client_id;
    if (clientId) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      client = clientData;
    }

    // Generate portal URL with token
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://hub.fixlify.app';
    const portalUrl = `${baseUrl}/portal/invoice/${portalToken}`;

    // Create message
    const messagePrefix = customMessage ? `${customMessage}\n\n` : '';
    const defaultMessage = `Hi ${client?.name || 'there'},\n\nYour invoice #${invoice.invoice_number} for $${invoice.total_amount} is ready.\n\nView & pay invoice: ${portalUrl}\n\n- Fixlify Team`;
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
        user_id: invoice.user_id,
        metadata: {
          invoice_id: invoiceId,
          type: 'invoice_sms',
          portal_url: portalUrl
        }
      })
    });

    if (!smsResponse.ok) {
      const error = await smsResponse.text();
      throw new Error(`Failed to send SMS: ${error}`);
    }

    const smsResult = await smsResponse.json();

    // Log the communication
    await supabase.from('invoice_communications').insert({
      invoice_id: invoiceId,
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
    console.error('Error in send-invoice-sms:', error);
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
