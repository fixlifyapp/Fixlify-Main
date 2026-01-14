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
    const { accessToken, estimateId, reason } = body;

    if (!accessToken || !estimateId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: accessToken and estimateId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-decline-estimate] Processing decline for estimate:', estimateId);

    // Verify the access token belongs to this estimate
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*, clients(*)')
      .eq('id', estimateId)
      .eq('portal_access_token', accessToken)
      .maybeSingle();

    if (estimateError) {
      console.error('[portal-decline-estimate] Error fetching estimate:', estimateError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify estimate access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!estimate) {
      console.error('[portal-decline-estimate] Invalid access token or estimate not found');
      return new Response(
        JSON.stringify({ error: 'Invalid access token or estimate not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if estimate is already declined
    if (estimate.status === 'declined') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Estimate is already declined',
          estimate: { id: estimate.id, status: 'declined' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update estimate status to declined
    const { data: updatedEstimate, error: updateError } = await supabase
      .from('estimates')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: reason || null
      })
      .eq('id', estimateId)
      .select()
      .single();

    if (updateError) {
      console.error('[portal-decline-estimate] Error updating estimate:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to decline estimate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-decline-estimate] Estimate declined successfully:', estimateId);

    const clientName = estimate.clients?.name || 'Client';
    const estNumber = estimate.estimate_number || estimate.id.substring(0, 8);
    const total = estimate.total?.toFixed(2) || '0.00';

    // Log the decline in estimate_communications
    try {
      await supabase.from('estimate_communications').insert({
        estimate_id: estimateId,
        type: 'status_change',
        content: `Estimate declined by client via portal${reason ? `. Reason: ${reason}` : ''}`,
        status: 'sent',
        metadata: {
          action: 'declined',
          declined_via: 'client_portal',
          client_name: clientName,
          reason: reason || null,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('[portal-decline-estimate] Failed to log communication:', logError);
    }

    // Create notification for the business owner (use user_notifications for real-time bell)
    try {
      await supabase.from('user_notifications').insert({
        user_id: estimate.user_id,
        type: 'estimate_declined',
        title: '❌ Estimate Declined',
        message: `${clientName} declined Estimate #${estNumber} ($${total})${reason ? ` - "${reason}"` : ''}`,
        data: {
          estimate_id: estimateId,
          estimate_number: estNumber,
          client_name: clientName,
          total: estimate.total,
          reason: reason || null
        },
        is_read: false
      });
    } catch (notificationError) {
      console.warn('[portal-decline-estimate] Failed to create notification:', notificationError);
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

      console.log('[portal-decline-estimate] Last communication:', lastComm);

      if (lastComm?.type === 'sms' && lastComm.recipient_phone) {
        const clientPhone = lastComm.recipient_phone;

        // Find the SMS conversation with this client
        const { data: conversation } = await supabase
          .from('sms_conversations')
          .select('id, phone_number, unread_count')
          .eq('client_phone', clientPhone)
          .eq('user_id', estimate.user_id)
          .maybeSingle();

        console.log('[portal-decline-estimate] Found conversation:', conversation?.id);

        if (conversation) {
          const messageContent = `❌ ${clientName}\nDeclined estimate #${estNumber}\nAmount: $${total}${reason ? `\nReason: "${reason}"` : ''}`;

          // Insert "inbound" message from client (system-generated notification)
          await supabase.from('sms_messages').insert({
            conversation_id: conversation.id,
            direction: 'inbound',
            from_number: clientPhone,
            to_number: conversation.phone_number,
            content: messageContent,
            status: 'received',
            metadata: {
              type: 'estimate_declined',
              estimate_id: estimateId,
              reason: reason || null,
              system_generated: true
            }
          });

          // Update conversation preview and unread count
          await supabase
            .from('sms_conversations')
            .update({
              unread_count: (conversation.unread_count || 0) + 1,
              last_message_at: new Date().toISOString(),
              last_message_preview: `❌ Declined estimate #${estNumber}`
            })
            .eq('id', conversation.id);

          console.log('[portal-decline-estimate] Message added to SMS inbox');
        }
      } else if (lastComm?.type === 'email') {
        // Email notification to business owner
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, company_email, notification_email')
          .eq('id', estimate.user_id)
          .single();

        const toEmail = profile?.notification_email || profile?.company_email;
        const companyName = profile?.company_name || 'Your Company';

        if (toEmail) {
          // Send email notification via mailgun-email function
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; padding: 20px;">
              <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">❌ Estimate Declined</h1>
                </div>
                <div style="padding: 24px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Your estimate has been declined by the client.</p>
                  <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 0 0 8px; color: #991b1b;"><strong>Client:</strong> ${clientName}</p>
                    <p style="margin: 0 0 8px; color: #991b1b;"><strong>Estimate:</strong> #${estNumber}</p>
                    <p style="margin: 0${reason ? ' 0 8px' : ''}; color: #991b1b;"><strong>Amount:</strong> $${total}</p>
                    ${reason ? `<p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> "${reason}"</p>` : ''}
                  </div>
                  <p style="font-size: 14px; color: #666;">Consider following up with the client to understand their concerns.</p>
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
              subject: `❌ Estimate #${estNumber} Declined by ${clientName}`,
              html: emailHtml,
              from: `Fixlify Notifications <notifications@fixlify.app>`,
              userId: estimate.user_id
            })
          });

          console.log('[portal-decline-estimate] Email notification sent to:', toEmail);
        }
      }
    } catch (inboxError) {
      console.warn('[portal-decline-estimate] Failed to add inbox/email notification:', inboxError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estimate declined successfully',
        estimate: {
          id: updatedEstimate.id,
          status: updatedEstimate.status,
          declined_at: updatedEstimate.declined_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[portal-decline-estimate] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
