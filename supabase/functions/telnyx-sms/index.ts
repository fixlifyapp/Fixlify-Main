
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('SMS request:', requestBody);
    
    // Handle document sending
    if (requestBody.documentType && requestBody.documentId) {
      return await handleDocumentSMS(requestBody);
    }
    
    // Handle direct SMS
    const { to, message, from } = requestBody;
    console.log('Sending direct SMS:', { to, message, from });

    const telnyx_api_key = Deno.env.get('TELNYX_API_KEY');
    const telnyx_from_number = from || Deno.env.get('TELNYX_FROM_NUMBER');

    if (!telnyx_api_key || !telnyx_from_number) {
      throw new Error('Telnyx configuration missing');
    }

    // Send SMS via Telnyx
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyx_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyx_from_number,
        to: to,
        text: message,
      }),
    });

    const result = await response.json();
    console.log('Telnyx response:', result);

    if (!response.ok) {
      throw new Error(`Telnyx error: ${result.errors?.[0]?.detail || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully', 
        telnyx_id: result.data?.id,
        result: result.data 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send SMS' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

async function handleDocumentSMS(requestBody: any) {
  const { documentType, documentId, customMessage } = requestBody;
  
  console.log(`📱 Sending ${documentType} ${documentId} via SMS`);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  // Fetch document with client info
  const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
  const { data: document, error: docError } = await supabase
    .from(tableName)
    .select(`
      *,
      jobs!inner(
        *,
        clients!inner(*)
      )
    `)
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    console.error('Document fetch error:', docError);
    throw new Error(`${documentType} not found`);
  }

  const client = document.jobs.clients;
  if (!client?.phone) {
    throw new Error('Client phone number not found');
  }

  // Generate SMS content
  const portalUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.vercel.app') || 'https://yourapp.com'}/${documentType}/${documentId}`;
  
  let smsMessage = `Hi ${client.name}, `;
  if (customMessage) {
    smsMessage += `${customMessage} `;
  }
  smsMessage += `Your ${documentType} is ready: ${portalUrl}`;

  // Send SMS using existing Telnyx logic
  const telnyx_api_key = Deno.env.get('TELNYX_API_KEY');
  const telnyx_from_number = Deno.env.get('TELNYX_FROM_NUMBER');

  if (!telnyx_api_key || !telnyx_from_number) {
    throw new Error('Telnyx configuration missing');
  }

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telnyx_api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: telnyx_from_number,
      to: client.phone,
      text: smsMessage,
    }),
  });

  const result = await response.json();
  console.log('Telnyx response:', result);

  if (!response.ok) {
    throw new Error(`Telnyx error: ${result.errors?.[0]?.detail || 'Unknown error'}`);
  }

  // Log the communication
  try {
    await supabase
      .from(`${documentType}_communications`)
      .insert({
        [documentType === 'estimate' ? 'estimate_id' : 'invoice_id']: documentId,
        client_id: client.id,
        job_id: document.job_id,
        communication_type: 'sms',
        recipient: client.phone,
        message: smsMessage,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          telnyx_response: result.data
        }
      });
  } catch (logError) {
    console.error('Failed to log communication:', logError);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `${documentType} SMS sent successfully`,
      recipient: client.phone,
      telnyx_id: result.data?.id
    }),
    { 
      headers: { 
        'Content-Type': 'application/json'
      } 
    }
  );
}
