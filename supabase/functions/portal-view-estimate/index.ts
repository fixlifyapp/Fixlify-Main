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
    const { accessToken, estimateId } = body;

    if (!accessToken || !estimateId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: accessToken and estimateId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-view-estimate] Processing view for estimate:', estimateId);

    // Validate by directly checking the estimate's portal_access_token
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*, clients(*)')
      .eq('id', estimateId)
      .eq('portal_access_token', accessToken)
      .maybeSingle();

    if (estimateError) {
      console.error('[portal-view-estimate] Error validating estimate:', estimateError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!estimate) {
      console.error('[portal-view-estimate] Invalid token or estimate not found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already viewed - only send notification on first view
    const isFirstView = !estimate.viewed_at;

    console.log('[portal-view-estimate] Token validated. First view:', isFirstView);

    // Update viewed_at timestamp if first view
    if (isFirstView) {
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', estimateId);

      if (updateError) {
        console.warn('[portal-view-estimate] Error updating viewed_at:', updateError);
      }
    }

    const clientName = estimate.clients?.name || 'Client';
    const estNumber = estimate.estimate_number || estimate.id.substring(0, 8);
    const total = estimate.total?.toFixed(2) || '0.00';

    // Only send notifications on first view
    if (isFirstView) {
      // Log to job_history for the History tab
      try {
        await supabase.from('job_history').insert({
          job_id: estimate.job_id,
          type: 'estimate',
          title: `Estimate #${estNumber} Viewed`,
          description: `${clientName} viewed estimate for $${total} via client portal`,
          user_name: clientName,
          meta: {
            estimate_id: estimateId,
            estimate_number: estNumber,
            client_name: clientName,
            total: estimate.total,
            action: 'viewed',
            viewed_via: 'client_portal'
          }
        });
      } catch (historyError) {
        console.warn('[portal-view-estimate] Failed to log to job_history:', historyError);
      }

      // Log the view in estimate_communications
      try {
        await supabase.from('estimate_communications').insert({
          estimate_id: estimateId,
          type: 'status_change',
          content: `Estimate viewed by client via portal`,
          status: 'sent',
          metadata: {
            action: 'viewed',
            viewed_via: 'client_portal',
            client_name: clientName,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.warn('[portal-view-estimate] Failed to log communication:', logError);
      }

      // Create notification for the business owner
      try {
        await supabase.from('user_notifications').insert({
          user_id: estimate.user_id,
          type: 'estimate_viewed',
          title: '👁️ Estimate Viewed',
          message: `${clientName} viewed Estimate #${estNumber} ($${total})`,
          data: {
            estimate_id: estimateId,
            estimate_number: estNumber,
            client_name: clientName,
            total: estimate.total
          },
          is_read: false
        });
      } catch (notificationError) {
        console.warn('[portal-view-estimate] Failed to create notification:', notificationError);
      }

      // Add notification to SMS inbox if estimate was sent via SMS
      try {
        const { data: lastComm } = await supabase
          .from('estimate_communications')
          .select('type, recipient_phone, recipient_email')
          .eq('estimate_id', estimateId)
          .in('type', ['sms', 'email'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[portal-view-estimate] Last communication:', lastComm);

        if (lastComm?.type === 'sms' && lastComm.recipient_phone) {
          const clientPhone = lastComm.recipient_phone;

          // Find the SMS conversation with this client
          const { data: conversation } = await supabase
            .from('sms_conversations')
            .select('id, phone_number, unread_count')
            .eq('client_phone', clientPhone)
            .eq('user_id', estimate.user_id)
            .maybeSingle();

          console.log('[portal-view-estimate] Found conversation:', conversation?.id);

          if (conversation) {
            const messageContent = `👁️ ${clientName}\nViewed estimate #${estNumber}\nAmount: $${total}`;

            // Insert "inbound" message from client (system-generated notification)
            await supabase.from('sms_messages').insert({
              conversation_id: conversation.id,
              direction: 'inbound',
              from_number: clientPhone,
              to_number: conversation.phone_number,
              content: messageContent,
              status: 'received',
              metadata: {
                type: 'estimate_viewed',
                estimate_id: estimateId,
                system_generated: true
              }
            });

            // Update conversation preview and unread count
            await supabase
              .from('sms_conversations')
              .update({
                unread_count: (conversation.unread_count || 0) + 1,
                last_message_at: new Date().toISOString(),
                last_message_preview: `👁️ Viewed estimate #${estNumber}`
              })
              .eq('id', conversation.id);

            console.log('[portal-view-estimate] Message added to SMS inbox');
          }
        }
      } catch (inboxError) {
        console.warn('[portal-view-estimate] Failed to add inbox notification:', inboxError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isFirstView ? 'View recorded successfully' : 'Already viewed',
        firstView: isFirstView,
        estimate: {
          id: estimate.id,
          viewed_at: estimate.viewed_at || new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[portal-view-estimate] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
