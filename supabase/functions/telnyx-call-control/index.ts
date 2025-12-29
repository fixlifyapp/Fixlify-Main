import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * TeXML Call Control Function
 *
 * For TeXML-based calls, we can't use Telnyx Call Control API directly.
 * Instead, we set a "pending_action" in the database which the webhook's
 * polling loop will pick up and execute via TeXML response.
 *
 * Supported actions:
 * - answer: Mark call as answered (triggers call bridging in webhook)
 * - hangup: End the call
 * - transfer_to_ai: Transfer call to AI Assistant
 * - hold/unhold: Toggle hold state (for active calls)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, callControlId } = await req.json();

    if (!callControlId) {
      throw new Error('callControlId is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`TeXML Call Control: action=${action}, callId=${callControlId}`);

    // Get current call record
    const { data: callRecord, error: fetchError } = await supabase
      .from('telnyx_calls')
      .select('status, metadata')
      .eq('call_control_id', callControlId)
      .single();

    if (fetchError) {
      console.error('Error fetching call:', fetchError);
      throw new Error(`Call not found: ${callControlId}`);
    }

    // Map action to pending_action for webhook processing
    let pendingAction: string | null = null;
    let immediateUpdate: Record<string, any> = {};

    switch (action) {
      case 'answer':
        pendingAction = 'answered';
        break;

      case 'hangup':
        pendingAction = 'hangup';
        break;

      case 'transfer_to_ai':
        pendingAction = 'transfer_to_ai';
        break;

      case 'hold':
        // For hold/unhold, we update status immediately
        immediateUpdate = { status: 'hold' };
        break;

      case 'unhold':
        immediateUpdate = { status: 'active' };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update the call record
    const updateData: Record<string, any> = {};

    if (pendingAction) {
      // Set pending action for webhook to process
      updateData.metadata = {
        ...callRecord?.metadata,
        pending_action: pendingAction,
        pending_action_at: new Date().toISOString()
      };
    }

    if (Object.keys(immediateUpdate).length > 0) {
      Object.assign(updateData, immediateUpdate);
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('telnyx_calls')
        .update(updateData)
        .eq('call_control_id', callControlId);

      if (updateError) {
        console.error('Error updating call:', updateError);
        throw new Error('Failed to update call');
      }
    }

    // Send real-time update for immediate feedback
    await supabase
      .channel('call-updates-global')
      .send({
        type: 'broadcast',
        event: 'call_action',
        payload: {
          callControlId,
          action,
          status: pendingAction ? 'pending' : 'applied',
          timestamp: new Date().toISOString()
        }
      });

    console.log(`Action ${action} queued for call ${callControlId}`);

    return new Response(JSON.stringify({
      success: true,
      action,
      status: pendingAction ? 'queued' : 'applied',
      message: pendingAction
        ? `Action "${action}" queued - will be processed on next webhook poll (within 3 seconds)`
        : `Action "${action}" applied immediately`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error controlling call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
