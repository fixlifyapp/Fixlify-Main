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

    const body = await req.json();
    const { accessToken, invoiceId } = body;

    if (!accessToken || !invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: accessToken and invoiceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-view-invoice] Processing view for invoice:', invoiceId);

    // Validate by directly checking the invoice's portal_access_token
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('id', invoiceId)
      .eq('portal_access_token', accessToken)
      .maybeSingle();

    if (invoiceError) {
      console.error('[portal-view-invoice] Error validating invoice:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invoice) {
      console.error('[portal-view-invoice] Invalid token or invoice not found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already viewed - only send notification on first view
    const isFirstView = !invoice.viewed_at;

    console.log('[portal-view-invoice] Token validated. First view:', isFirstView);

    // Update viewed_at timestamp if first view
    if (isFirstView) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (updateError) {
        console.warn('[portal-view-invoice] Error updating viewed_at:', updateError);
      }
    }

    const clientName = invoice.clients?.name || 'Client';
    const invNumber = invoice.invoice_number || invoice.id.substring(0, 8);
    const total = invoice.total?.toFixed(2) || '0.00';
    const paymentStatus = invoice.payment_status || 'unpaid';

    // Only send notifications on first view
    if (isFirstView) {
      // Log to job_history for the History tab
      try {
        await supabase.from('job_history').insert({
          job_id: invoice.job_id,
          type: 'invoice',
          title: `Invoice #${invNumber} Viewed`,
          description: `${clientName} viewed invoice for $${total} via client portal`,
          user_name: clientName,
          meta: {
            invoice_id: invoiceId,
            invoice_number: invNumber,
            client_name: clientName,
            total: invoice.total,
            payment_status: paymentStatus,
            action: 'viewed',
            viewed_via: 'client_portal'
          }
        });
      } catch (historyError) {
        console.warn('[portal-view-invoice] Failed to log to job_history:', historyError);
      }

      // Log the view in invoice_communications
      try {
        await supabase.from('invoice_communications').insert({
          invoice_id: invoiceId,
          type: 'status_change',
          content: `Invoice viewed by client via portal`,
          status: 'sent',
          metadata: {
            action: 'viewed',
            viewed_via: 'client_portal',
            client_name: clientName,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.warn('[portal-view-invoice] Failed to log communication:', logError);
      }

      // Create notification for the business owner
      try {
        await supabase.from('user_notifications').insert({
          user_id: invoice.user_id,
          type: 'invoice_viewed',
          title: '👁️ Invoice Viewed',
          message: `${clientName} viewed Invoice #${invNumber} ($${total})`,
          data: {
            invoice_id: invoiceId,
            invoice_number: invNumber,
            client_name: clientName,
            total: invoice.total,
            payment_status: paymentStatus
          },
          is_read: false
        });
      } catch (notificationError) {
        console.warn('[portal-view-invoice] Failed to create notification:', notificationError);
      }

      // Add notification to SMS inbox if invoice was sent via SMS
      try {
        const { data: lastComm } = await supabase
          .from('invoice_communications')
          .select('type, recipient_phone, recipient_email')
          .eq('invoice_id', invoiceId)
          .in('type', ['sms', 'email'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[portal-view-invoice] Last communication:', lastComm);

        if (lastComm?.type === 'sms' && lastComm.recipient_phone) {
          const clientPhone = lastComm.recipient_phone;

          // Find the SMS conversation with this client
          const { data: conversation } = await supabase
            .from('sms_conversations')
            .select('id, phone_number, unread_count')
            .eq('client_phone', clientPhone)
            .eq('user_id', invoice.user_id)
            .maybeSingle();

          console.log('[portal-view-invoice] Found conversation:', conversation?.id);

          if (conversation) {
            const messageContent = `👁️ ${clientName}\nViewed invoice #${invNumber}\nAmount: $${total}\nStatus: ${paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}`;

            // Insert "inbound" message from client (system-generated notification)
            await supabase.from('sms_messages').insert({
              conversation_id: conversation.id,
              direction: 'inbound',
              from_number: clientPhone,
              to_number: conversation.phone_number,
              content: messageContent,
              status: 'received',
              metadata: {
                type: 'invoice_viewed',
                invoice_id: invoiceId,
                payment_status: paymentStatus,
                system_generated: true
              }
            });

            // Update conversation preview and unread count
            await supabase
              .from('sms_conversations')
              .update({
                unread_count: (conversation.unread_count || 0) + 1,
                last_message_at: new Date().toISOString(),
                last_message_preview: `👁️ Viewed invoice #${invNumber}`
              })
              .eq('id', conversation.id);

            console.log('[portal-view-invoice] Message added to SMS inbox');
          }
        }
      } catch (inboxError) {
        console.warn('[portal-view-invoice] Failed to add inbox notification:', inboxError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isFirstView ? 'View recorded successfully' : 'Already viewed',
        firstView: isFirstView,
        invoice: {
          id: invoice.id,
          viewed_at: invoice.viewed_at || new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[portal-view-invoice] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
