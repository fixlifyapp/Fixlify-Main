import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let callControlId: string | null = null;
  let userId: string | null = null;

  socket.onopen = () => {
    console.log('WebSocket connection opened for voice bridge');
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Voice bridge received:', data.type);

      switch (data.type) {
        case 'join_call':
          callControlId = data.callControlId;
          userId = data.userId;
          
          // Verify user has access to this call
          const { data: callData, error } = await supabase
            .from('telnyx_calls')
            .select('*')
            .eq('call_control_id', callControlId)
            .eq('user_id', userId)
            .single();

          if (error || !callData) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Unauthorized access to call'
            }));
            socket.close();
            return;
          }

          socket.send(JSON.stringify({
            type: 'joined',
            callControlId,
            callData
          }));
          break;

        case 'webrtc_offer':
          // Handle WebRTC offer from client
          console.log('Received WebRTC offer');
          
          // In a real implementation, this would be forwarded to Telnyx
          // For now, we'll simulate the response
          socket.send(JSON.stringify({
            type: 'webrtc_answer',
            answer: {
              type: 'answer',
              sdp: 'simulated_sdp_answer'
            }
          }));
          break;

        case 'webrtc_answer':
          // Handle WebRTC answer from client
          console.log('Received WebRTC answer');
          break;

        case 'ice_candidate':
          // Handle ICE candidate from client
          console.log('Received ICE candidate');
          
          // Forward to Telnyx or other peer
          socket.send(JSON.stringify({
            type: 'ice_candidate',
            candidate: data.candidate
          }));
          break;

        case 'audio_data':
          // Handle real-time audio data
          // This would be forwarded to Telnyx Call Control API
          console.log('Received audio data chunk');
          break;

        case 'call_action':
          // Handle call control actions (mute, hold, etc.)
          if (callControlId) {
            const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
            
            if (telnyxApiKey) {
              try {
                const actionEndpoint = `https://api.telnyx.com/v2/calls/${callControlId}/actions/${data.action}`;
                
                const telnyxResponse = await fetch(actionEndpoint, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${telnyxApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: data.params ? JSON.stringify(data.params) : undefined
                });

                if (telnyxResponse.ok) {
                  socket.send(JSON.stringify({
                    type: 'action_result',
                    action: data.action,
                    success: true
                  }));
                } else {
                  throw new Error(`Telnyx API error: ${await telnyxResponse.text()}`);
                }
              } catch (error) {
                socket.send(JSON.stringify({
                  type: 'action_result',
                  action: data.action,
                  success: false,
                  error: error.message
                }));
              }
            }
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing voice bridge message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  };

  socket.onclose = () => {
    console.log('Voice bridge WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('Voice bridge WebSocket error:', error);
  };

  return response;
});