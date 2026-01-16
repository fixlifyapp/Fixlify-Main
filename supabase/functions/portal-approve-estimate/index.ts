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

    console.log('[portal-approve-estimate] Processing approval for estimate:', estimateId);

    // Validate by directly checking the estimate's portal_access_token
    // This bypasses the client_portal_access table validation since estimate tokens
    // are stored directly on the estimates table
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*, clients(*)')
      .eq('id', estimateId)
      .eq('portal_access_token', accessToken)
      .maybeSingle();

    if (estimateError) {
      console.error('[portal-approve-estimate] Error validating estimate:', estimateError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!estimate) {
      console.error('[portal-approve-estimate] Invalid token or estimate not found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-approve-estimate] Token validated for estimate:', estimate.id);

    // Check if estimate is already approved
    if (estimate.status === 'approved') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Estimate is already approved',
          estimate: { id: estimate.id, status: 'approved' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update estimate status to approved
    const { data: updatedEstimate, error: updateError } = await supabase
      .from('estimates')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', estimateId)
      .select()
      .single();

    if (updateError) {
      console.error('[portal-approve-estimate] Error updating estimate:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to approve estimate' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[portal-approve-estimate] Estimate approved successfully:', estimateId);

    const clientName = estimate.clients?.name || 'Client';
    const estNumber = estimate.estimate_number || estimate.id.substring(0, 8);
    const total = estimate.total?.toFixed(2) || '0.00';

    // Log to job_history for the History tab
    try {
      await supabase.from('job_history').insert({
        job_id: estimate.job_id,
        type: 'estimate',
        title: `Estimate #${estNumber} Approved`,
        description: `${clientName} approved estimate for $${total} via client portal`,
        user_name: clientName,
        meta: {
          estimate_id: estimateId,
          estimate_number: estNumber,
          client_name: clientName,
          total: estimate.total,
          action: 'approved',
          approved_via: 'client_portal'
        }
      });
    } catch (historyError) {
      console.warn('[portal-approve-estimate] Failed to log to job_history:', historyError);
    }

    // Log the approval in estimate_communications
    try {
      await supabase.from('estimate_communications').insert({
        estimate_id: estimateId,
        type: 'status_change',
        content: `Estimate approved by client via portal`,
        status: 'sent',
        metadata: {
          action: 'approved',
          approved_via: 'client_portal',
          client_name: estimate.clients?.name,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('[portal-approve-estimate] Failed to log communication:', logError);
      // Don't fail the request if logging fails
    }

    // Create notification for the business owner (use user_notifications for real-time bell)
    try {
      await supabase.from('user_notifications').insert({
        user_id: estimate.user_id,
        type: 'estimate_approved',
        title: '✅ Estimate Approved!',
        message: `${estimate.clients?.name || 'Client'} approved Estimate #${estimate.estimate_number || estimate.id.substring(0, 8)} ($${estimate.total?.toFixed(2) || '0.00'})`,
        data: {
          estimate_id: estimateId,
          estimate_number: estimate.estimate_number,
          client_name: estimate.clients?.name,
          total: estimate.total
        },
        is_read: false
      });
    } catch (notificationError) {
      console.warn('[portal-approve-estimate] Failed to create notification:', notificationError);
      // Don't fail the request if notification fails
    }

    // Add notification based on how estimate was sent (SMS or Email)
    try {
      // Check how the estimate was originally sent
      const { data: lastComm } = await supabase
        .from('estimate_communications')
        .select('type, recipient_phone, recipient_email')
        .eq('estimate_id', estimateId)
        .in('type', ['sms', 'email'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[portal-approve-estimate] Last communication:', lastComm);

      if (lastComm?.type === 'sms' && lastComm.recipient_phone) {
        // SMS notification to inbox
        const clientPhone = lastComm.recipient_phone;

        // Find the SMS conversation with this client
        const { data: conversation } = await supabase
          .from('sms_conversations')
          .select('id, phone_number, unread_count')
          .eq('client_phone', clientPhone)
          .eq('user_id', estimate.user_id)
          .maybeSingle();

        console.log('[portal-approve-estimate] Found conversation:', conversation?.id);

        if (conversation) {
          const messageContent = `📋 ${clientName}\nApproved estimate #${estNumber}\nAmount: $${total}`;

          // Insert "inbound" message from client (system-generated notification)
          await supabase.from('sms_messages').insert({
            conversation_id: conversation.id,
            direction: 'inbound',
            from_number: clientPhone,
            to_number: conversation.phone_number,
            content: messageContent,
            status: 'received',
            metadata: {
              type: 'estimate_approved',
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
              last_message_preview: `📋 Approved estimate #${estNumber}`
            })
            .eq('id', conversation.id);

          console.log('[portal-approve-estimate] Message added to SMS inbox');
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
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✅ Estimate Approved!</h1>
                </div>
                <div style="padding: 24px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Great news! Your estimate has been approved.</p>
                  <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 0 0 8px; color: #166534;"><strong>Client:</strong> ${clientName}</p>
                    <p style="margin: 0 0 8px; color: #166534;"><strong>Estimate:</strong> #${estNumber}</p>
                    <p style="margin: 0; color: #166534;"><strong>Amount:</strong> $${total}</p>
                  </div>
                  <p style="font-size: 14px; color: #666;">You can now proceed with scheduling the work.</p>
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
              subject: `✅ Estimate #${estNumber} Approved by ${clientName}`,
              html: emailHtml,
              from: `Fixlify Notifications <notifications@fixlify.app>`,
              userId: estimate.user_id
            })
          });

          console.log('[portal-approve-estimate] Email notification sent to:', toEmail);
        }
      }
    } catch (inboxError) {
      console.warn('[portal-approve-estimate] Failed to add inbox/email notification:', inboxError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estimate approved successfully',
        estimate: {
          id: updatedEstimate.id,
          status: updatedEstimate.status,
          approved_at: updatedEstimate.approved_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[portal-approve-estimate] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
