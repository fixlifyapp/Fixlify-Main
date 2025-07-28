import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogRequest {
  type: 'email' | 'sms';
  to: string;
  from?: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  userId: string;
  metadata?: any;
  errorMessage?: string;
  documentType?: 'estimate' | 'invoice';
  documentId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      type, 
      to, 
      from, 
      content, 
      status, 
      userId, 
      metadata = {}, 
      errorMessage,
      documentType,
      documentId 
    }: LogRequest = await req.json();

    // Log to communication_logs table
    const { data: logData, error: logError } = await supabase
      .from('communication_logs')
      .insert({
        user_id: userId,
        type,
        direction: 'outbound',
        from_address: from || (type === 'email' ? 'noreply@fixlify.app' : 'system'),
        to_address: to,
        content: content.substring(0, 1000), // Limit content length
        status,
        metadata: {
          ...metadata,
          document_type: documentType,
          document_id: documentId,
          error_message: errorMessage,
          logged_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging communication:', logError);
    }

    // Additional logging based on type
    if (type === 'email') {
      await logEmailSpecific(supabase, {
        to,
        from: from || 'noreply@fixlify.app',
        content,
        status,
        userId,
        metadata,
        errorMessage
      });
    } else if (type === 'sms') {
      await logSMSSpecific(supabase, {
        to,
        content,
        status,
        userId,
        metadata,
        errorMessage
      });
    }

    // Update document communication tracking if applicable
    if (documentType && documentId) {
      await updateDocumentCommunicationTracking(supabase, {
        documentType,
        documentId,
        communicationType: type,
        status,
        sentAt: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        logId: logData?.id,
        message: 'Communication logged successfully' 
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in enhanced-communication-logger:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to log communication' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function logEmailSpecific(supabase: any, data: any) {
  try {
    await supabase.from('email_logs').insert({
      user_id: data.userId,
      to_email: data.to,
      from_email: data.from,
      subject: data.metadata?.subject || 'Document Notification',
      body: data.content,
      status: data.status,
      error_message: data.errorMessage,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Error logging email specific data:', error);
  }
}

async function logSMSSpecific(supabase: any, data: any) {
  try {
    await supabase.from('sms_logs').insert({
      user_id: data.userId,
      to_phone: data.to,
      message: data.content,
      status: data.status,
      error_message: data.errorMessage,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Error logging SMS specific data:', error);
  }
}

async function updateDocumentCommunicationTracking(supabase: any, data: any) {
  try {
    const tableName = data.documentType === 'estimate' ? 'estimate_communications' : 'invoice_communications';
    
    await supabase.from(tableName).insert({
      [`${data.documentType}_id`]: data.documentId,
      communication_type: data.communicationType,
      status: data.status,
      sent_at: data.sentAt,
      metadata: {
        logged_via: 'enhanced-communication-logger',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating document communication tracking:', error);
  }
}

serve(handler);