
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, documentId, recipientPhone, customMessage } = await req.json();
    
    console.log('📱 Sending SMS for:', { documentType, documentId, recipientPhone });

    // Fetch the document data
    let documentData;
    let documentQuery;
    
    if (documentType === 'estimate') {
      documentQuery = supabase
        .from('estimates')
        .select(`
          *,
          jobs:job_id (
            *,
            clients:client_id (*)
          )
        `)
        .eq('id', documentId)
        .single();
    } else if (documentType === 'invoice') {
      documentQuery = supabase
        .from('invoices')
        .select(`
          *,
          jobs:job_id (
            *,
            clients:client_id (*)
          )
        `)
        .eq('id', documentId)
        .single();
    } else {
      throw new Error(`Invalid document type: ${documentType}`);
    }

    const { data: document, error: documentError } = await documentQuery;
    
    if (documentError) {
      console.error('Document fetch error:', documentError);
      throw new Error(`${documentType} not found`);
    }

    if (!document) {
      throw new Error(`${documentType} not found`);
    }

    console.log('📄 Document found:', document.id);

    // Get Telnyx configuration
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxFromNumber = Deno.env.get('TELNYX_FROM_NUMBER');

    if (!telnyxApiKey || !telnyxFromNumber) {
      throw new Error('Telnyx configuration missing');
    }

    // Prepare SMS content
    const documentNumber = documentType === 'estimate' ? document.estimate_number : document.invoice_number;
    const clientName = document.jobs?.clients?.name || 'Valued Customer';
    const companyName = document.jobs?.clients?.company || 'Our Company';
    const portalUrl = `https://be121f52-204f-481a-9959-4f68a3e3bea7.lovableproject.com/portal/${documentType}/${documentId}`;
    
    const smsMessage = customMessage || `Hi ${clientName}, your ${documentType} ${documentNumber} for $${document.total} is ready. View it here: ${portalUrl} - ${companyName}`;

    // Send SMS via Telnyx
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyxFromNumber,
        to: recipientPhone,
        text: smsMessage,
      }),
    });

    if (!telnyxResponse.ok) {
      const errorText = await telnyxResponse.text();
      console.error('Telnyx error:', errorText);
      throw new Error(`Failed to send SMS: ${errorText}`);
    }

    const telnyxResult = await telnyxResponse.json();
    console.log('✅ SMS sent successfully:', telnyxResult.data.id);

    // Log the communication
    await supabase.from('communication_logs').insert({
      client_id: document.jobs?.client_id || document.client_id,
      job_id: document.job_id,
      type: 'sms',
      direction: 'outbound',
      recipient: recipientPhone,
      content: smsMessage,
      status: 'sent',
      provider: 'telnyx',
      external_id: telnyxResult.data.id,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: telnyxResult.data.id,
        message: 'SMS sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error sending SMS:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
