import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DocumentType = 'estimate' | 'invoice';

interface DocumentConfig {
  tableName: string;
  numberField: string;
  communicationsTable: string;
  idField: string;
  viewedAtField: string;
  notificationType: string;
}

const documentConfigs: Record<DocumentType, DocumentConfig> = {
  estimate: {
    tableName: 'estimates',
    numberField: 'estimate_number',
    communicationsTable: 'estimate_communications',
    idField: 'estimate_id',
    viewedAtField: 'viewed_at',
    notificationType: 'estimate_viewed'
  },
  invoice: {
    tableName: 'invoices',
    numberField: 'invoice_number',
    communicationsTable: 'invoice_communications',
    idField: 'invoice_id',
    viewedAtField: 'viewed_at',
    notificationType: 'invoice_viewed'
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
    const { accessToken, documentType, documentId } = body;

    if (!accessToken || !documentType || !documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: accessToken, documentType, and documentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = documentConfigs[documentType as DocumentType];
    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Invalid document type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[portal-track-view] Tracking view for ${documentType}:`, documentId);

    // Fetch document and verify access token
    const { data: document, error: docError } = await supabase
      .from(config.tableName)
      .select('*, clients(*)')
      .eq('id', documentId)
      .eq('portal_access_token', accessToken)
      .maybeSingle();

    if (docError) {
      console.error('[portal-track-view] Error fetching document:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify document access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!document) {
      console.error('[portal-track-view] Invalid access token or document not found');
      return new Response(
        JSON.stringify({ error: 'Invalid access token or document not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already viewed (to avoid duplicate notifications)
    const alreadyViewed = document[config.viewedAtField];
    const now = new Date().toISOString();

    // Update viewed_at timestamp
    await supabase
      .from(config.tableName)
      .update({ [config.viewedAtField]: now })
      .eq('id', documentId);

    // Only send notifications on FIRST view
    if (!alreadyViewed) {
      const clientName = document.clients?.name || 'Client';
      const docNumber = document[config.numberField] || document.id.substring(0, 8);
      const total = document.total?.toFixed(2) || '0.00';

      // Log the view in communications
      try {
        await supabase.from(config.communicationsTable).insert({
          [config.idField]: documentId,
          type: 'status_change',
          content: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} viewed by client via portal`,
          status: 'sent',
          metadata: {
            action: 'viewed',
            viewed_via: 'client_portal',
            client_name: clientName,
            timestamp: now
          }
        });
      } catch (logError) {
        console.warn('[portal-track-view] Failed to log communication:', logError);
      }

      // Create notification for the business owner (use user_notifications for real-time bell)
      try {
        const emoji = documentType === 'invoice' ? '👁️' : '📄';
        await supabase.from('user_notifications').insert({
          user_id: document.user_id,
          type: config.notificationType,
          title: `${emoji} ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Viewed`,
          message: `${clientName} viewed ${documentType} #${docNumber} ($${total})`,
          data: {
            [config.idField]: documentId,
            [`${documentType}_number`]: docNumber,
            client_name: clientName,
            total: document.total
          },
          is_read: false
        });
      } catch (notificationError) {
        console.warn('[portal-track-view] Failed to create notification:', notificationError);
      }

      // Add notification to SMS inbox if document was sent via SMS
      try {
        const { data: lastComm } = await supabase
          .from(config.communicationsTable)
          .select('type, recipient_phone, recipient_email')
          .eq(config.idField, documentId)
          .in('type', ['sms', 'email'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[portal-track-view] Last communication:', lastComm);

        if (lastComm?.type === 'sms' && lastComm.recipient_phone) {
          const clientPhone = lastComm.recipient_phone;

          // Find the SMS conversation with this client
          const { data: conversation } = await supabase
            .from('sms_conversations')
            .select('id, phone_number, unread_count')
            .eq('client_phone', clientPhone)
            .eq('user_id', document.user_id)
            .maybeSingle();

          console.log('[portal-track-view] Found conversation:', conversation?.id);

          if (conversation) {
            const emoji = documentType === 'invoice' ? '💳' : '📋';
            const messageContent = `${emoji} ${clientName}\nViewed ${documentType} #${docNumber}\nAmount: $${total}`;

            // Insert "inbound" message from client (system-generated notification)
            await supabase.from('sms_messages').insert({
              conversation_id: conversation.id,
              direction: 'inbound',
              from_number: clientPhone,
              to_number: conversation.phone_number,
              content: messageContent,
              status: 'received',
              metadata: {
                type: config.notificationType,
                [config.idField]: documentId,
                system_generated: true
              }
            });

            // Update conversation preview and unread count
            await supabase
              .from('sms_conversations')
              .update({
                unread_count: (conversation.unread_count || 0) + 1,
                last_message_at: now,
                last_message_preview: `${emoji} Viewed ${documentType} #${docNumber}`
              })
              .eq('id', conversation.id);

            console.log('[portal-track-view] Message added to SMS inbox');
          }
        } else if (lastComm?.type === 'email') {
          // Email notification to business owner
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, company_email, notification_email')
            .eq('id', document.user_id)
            .single();

          const toEmail = profile?.notification_email || profile?.company_email;

          if (toEmail) {
            const emoji = documentType === 'invoice' ? '💳' : '👁️';
            const docTypeCapitalized = documentType.charAt(0).toUpperCase() + documentType.slice(1);
            const gradientColors = documentType === 'invoice'
              ? '#10b981 0%, #059669 100%'
              : '#8b5cf6 0%, #7c3aed 100%';
            const bgColor = documentType === 'invoice' ? '#f0fdf4' : '#f5f3ff';
            const textColor = documentType === 'invoice' ? '#166534' : '#5b21b6';

            const emailHtml = `
              <!DOCTYPE html>
              <html>
              <head><meta charset="UTF-8"></head>
              <body style="font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <div style="background: linear-gradient(135deg, ${gradientColors}); padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">${emoji} ${docTypeCapitalized} Viewed</h1>
                  </div>
                  <div style="padding: 24px;">
                    <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Your ${documentType} has been viewed by the client.</p>
                    <div style="background: ${bgColor}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                      <p style="margin: 0 0 8px; color: ${textColor};"><strong>Client:</strong> ${clientName}</p>
                      <p style="margin: 0 0 8px; color: ${textColor};"><strong>${docTypeCapitalized}:</strong> #${docNumber}</p>
                      <p style="margin: 0; color: ${textColor};"><strong>Amount:</strong> $${total}</p>
                    </div>
                    <p style="font-size: 14px; color: #666;">The client is reviewing your ${documentType}. You may hear from them soon.</p>
                  </div>
                  <div style="background: #f8f9fa; padding: 16px; text-align: center; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #999; margin: 0;">Sent via Fixlify Client Portal</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: toEmail,
                subject: `${emoji} ${docTypeCapitalized} #${docNumber} Viewed by ${clientName}`,
                html: emailHtml,
                from: `Fixlify Notifications <notifications@fixlify.app>`,
                userId: document.user_id
              })
            });

            console.log('[portal-track-view] Email notification sent to:', toEmail);
          }
        }
      } catch (inboxError) {
        console.warn('[portal-track-view] Failed to add inbox/email notification:', inboxError);
      }

      console.log(`[portal-track-view] First view recorded for ${documentType}:`, documentId);
    } else {
      console.log(`[portal-track-view] Repeat view for ${documentType}:`, documentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${documentType} view tracked`,
        firstView: !alreadyViewed,
        viewedAt: now
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[portal-track-view] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
