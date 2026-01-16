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

type DocumentType = 'estimate' | 'invoice';

interface DocumentConfig {
  tableName: string;
  idField: string;
  numberField: string;
  communicationsTable: string;
  communicationsIdField: string;
  messageType: string;
  actionText: string;
  notFoundError: string;
}

const documentConfigs: Record<DocumentType, DocumentConfig> = {
  estimate: {
    tableName: 'estimates',
    idField: 'estimate_id',
    numberField: 'estimate_number',
    communicationsTable: 'estimate_communications',
    communicationsIdField: 'estimate_id',
    messageType: 'estimate_sms',
    actionText: 'View estimate',
    notFoundError: 'Estimate not found'
  },
  invoice: {
    tableName: 'invoices',
    idField: 'invoice_id',
    numberField: 'invoice_number',
    communicationsTable: 'invoice_communications',
    communicationsIdField: 'invoice_id',
    messageType: 'invoice_sms',
    actionText: 'View & pay invoice',
    notFoundError: 'Invoice not found'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Support both new unified API and legacy API for backwards compatibility
    let documentType: DocumentType;
    let documentId: string;

    if (body.documentType && body.documentId) {
      // New unified API
      documentType = body.documentType as DocumentType;
      documentId = body.documentId;
    } else if (body.estimateId) {
      // Legacy estimate API
      documentType = 'estimate';
      documentId = body.estimateId;
    } else if (body.invoiceId) {
      // Legacy invoice API
      documentType = 'invoice';
      documentId = body.invoiceId;
    } else {
      throw new Error('Missing required fields: documentType/documentId or estimateId/invoiceId');
    }

    const recipientPhone = body.recipientPhone;
    const customMessage = body.customMessage || body.message;

    if (!documentId || !recipientPhone) {
      throw new Error(`Missing required fields: ${documentType}Id and recipientPhone`);
    }

    const config = documentConfigs[documentType];
    if (!config) {
      throw new Error(`Invalid document type: ${documentType}. Must be 'estimate' or 'invoice'`);
    }

    // Fetch document details
    const { data: document, error: documentError } = await supabase
      .from(config.tableName)
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (documentError) throw documentError;
    if (!document) throw new Error(config.notFoundError);

    // Check if document has a portal token, if not generate one
    let portalToken = document.portal_access_token;
    if (!portalToken) {
      portalToken = generateToken();

      // Update document with the new token
      const { error: updateError } = await supabase
        .from(config.tableName)
        .update({ portal_access_token: portalToken })
        .eq('id', documentId);

      if (updateError) {
        console.error(`Error updating ${documentType} token:`, updateError);
        throw new Error('Failed to generate portal access token');
      }
    }

    // Fetch job details if job_id exists
    let job = null;
    if (document.job_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', document.job_id)
        .maybeSingle();
      job = jobData;
    }

    // Fetch client details
    let client = null;
    const clientId = document.client_id || job?.client_id;
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
    const portalUrl = `${baseUrl}/portal/${portalToken}`;

    // Get document number and total
    const documentNumber = document[config.numberField] || document.id.substring(0, 8);
    const totalAmount = document.total || document.total_amount || 0;

    // Create message
    const messagePrefix = customMessage ? `${customMessage}\n\n` : '';
    const defaultMessage = `Hi ${client?.name || 'there'},\n\nYour ${documentType} #${documentNumber} for $${totalAmount} is ready.\n\n${config.actionText}: ${portalUrl}\n\n- Fixlify Team`;
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
        user_id: document.user_id,
        metadata: {
          [config.idField]: documentId,
          type: config.messageType,
          portal_url: portalUrl,
          clientId: clientId,
          clientName: client?.name
        }
      })
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      const errorMsg = smsResult?.error || 'Failed to send SMS';
      throw new Error(errorMsg);
    }

    // Log the communication
    await supabase.from(config.communicationsTable).insert({
      [config.communicationsIdField]: documentId,
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

    // Log to job_history for the History tab
    if (document.job_id) {
      try {
        const docTypeCapitalized = documentType.charAt(0).toUpperCase() + documentType.slice(1);
        await supabase.from('job_history').insert({
          job_id: document.job_id,
          type: documentType,
          title: `${docTypeCapitalized} #${documentNumber} Sent`,
          description: `${docTypeCapitalized} for $${totalAmount} sent via SMS to ${client?.name || recipientPhone}`,
          user_name: 'System',
          meta: {
            [config.idField]: documentId,
            document_number: documentNumber,
            total: totalAmount,
            recipient_phone: recipientPhone,
            client_name: client?.name,
            action: 'sent',
            sent_via: 'sms',
            portal_url: portalUrl
          }
        });
      } catch (historyError) {
        console.warn('Failed to log to job_history:', historyError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        messageId: smsResult.messageId,
        portalUrl,
        documentType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-document-sms:', error);

    // Determine appropriate status code based on error type
    let statusCode = 500;
    const errorMessage = error.message || 'Failed to send SMS';

    if (errorMessage.includes('Missing required') || errorMessage.includes('not found') || errorMessage.includes('Invalid document type')) {
      statusCode = 400;
    } else if (errorMessage.includes('authorization')) {
      statusCode = 401;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
