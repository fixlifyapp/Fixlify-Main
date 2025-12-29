import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Assistant SIP address for call transfer (required when AI dispatcher is enabled)
const AI_ASSISTANT_SIP = Deno.env.get('TELNYX_AI_ASSISTANT_SIP');

// Available TTS voices for voicemail
const AVAILABLE_VOICES = {
  // Telnyx Natural HD (Best quality, most natural)
  'Telnyx.NaturalHD.andersen_johan': 'Johan (Telnyx HD)',
  'Telnyx.Natural.abbie': 'Abbie (Telnyx Natural)',
  // AWS Polly Neural (Good quality, many languages)
  'Polly.Matthew-Neural': 'Matthew (AWS Neural)',
  'Polly.Joanna-Neural': 'Joanna (AWS Neural)',
  'Polly.Amy-Neural': 'Amy (AWS Neural - British)',
  'Polly.Brian-Neural': 'Brian (AWS Neural - British)',
  // AWS Polly Standard
  'Polly.Matthew': 'Matthew (AWS Standard)',
  'Polly.Joanna': 'Joanna (AWS Standard)',
  // Azure Neural
  'Azure.en-US-JennyNeural': 'Jenny (Azure Neural)',
  'Azure.en-US-GuyNeural': 'Guy (Azure Neural)',
};

// Default voicemail settings
const DEFAULT_VOICEMAIL = {
  greeting: 'Sorry, we cannot take your call right now. Please leave a message after the beep and we will get back to you as soon as possible.',
  voice: 'Telnyx.NaturalHD.andersen_johan',
  maxLength: 120,
  transcription: true
};

// Generate TeXML response to transfer call to AI Assistant
function generateAITransferTeXML(): string {
  if (!AI_ASSISTANT_SIP) {
    throw new Error('TELNYX_AI_ASSISTANT_SIP environment variable not configured. Required for AI dispatcher.');
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Sip>
      <Uri>${AI_ASSISTANT_SIP}</Uri>
    </Sip>
  </Connect>
</Response>`;
}

// Generate TeXML response with polling loop for real-time control
// Uses short pauses with redirects to check for pending actions
function generateHoldTeXML(callControlId: string, loopCount: number = 0): string {
  const webhookUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/telnyx-voice-webhook';
  const maxLoops = 10; // 10 loops x 3 seconds = 30 seconds max hold time

  // First loop plays greeting, subsequent loops just wait
  const greeting = loopCount === 0
    ? `<Say voice="Polly.Matthew-Neural">Please hold while we connect you to a representative.</Say>`
    : `<Play loops="1">https://mqppvcrlvsgrsqelglod.supabase.co/storage/v1/object/public/audio/hold-music-short.mp3</Play>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${greeting}
  <Pause length="3"/>
  <Redirect>${webhookUrl}?action=check_status&amp;call_control_id=${callControlId}&amp;loop=${loopCount + 1}&amp;max_loops=${maxLoops}</Redirect>
</Response>`;
}

// Generate TeXML response for voicemail
function generateVoicemailTeXML(settings: {
  greeting?: string;
  voice?: string;
  maxLength?: number;
  transcription?: boolean;
}): string {
  const greeting = settings.greeting || DEFAULT_VOICEMAIL.greeting;
  const voice = settings.voice || DEFAULT_VOICEMAIL.voice;
  const maxLength = settings.maxLength || DEFAULT_VOICEMAIL.maxLength;
  const transcription = settings.transcription !== false;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${greeting}</Say>
  <Record
    playBeep="true"
    maxLength="${maxLength}"
    timeout="5"
    transcribe="${transcription}"
    action="${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-voice-webhook?action=voicemail_complete"
  />
  <Say voice="${voice}">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for action parameter (voicemail callback)
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Parse request body - could be JSON or form-urlencoded (TeXML format)
    let event: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // TeXML/Twilio format - parse form data
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        event[key] = value;
      }
      console.log('TeXML format received:', event);
    } else {
      // JSON format
      event = await req.json();
      console.log('JSON format received:', event.data?.event_type || action);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if this is TeXML format (Twilio-style) or Telnyx webhook format
    const isTeXML = event.CallSid || event.From || event.To;

    if (isTeXML) {
      // Handle TeXML format incoming call
      const toNumber = event.To?.replace(/[^\d+]/g, '');
      const fromNumber = event.From;
      const callSid = event.CallSid;

      console.log(`TeXML incoming call: from ${fromNumber} to ${toNumber}`);

      // Check if AI Dispatcher is enabled for this number
      let aiDispatcherEnabled = false;
      let phoneNumberRecord = null;

      if (toNumber) {
        const { data: phoneData } = await supabase
          .from('phone_numbers')
          .select('id, ai_dispatcher_enabled, organization_id, user_id, call_routing')
          .or(`phone_number.eq.${toNumber},phone_number.eq.+${toNumber}`)
          .limit(1);

        phoneNumberRecord = phoneData?.[0] || null;
        aiDispatcherEnabled = phoneNumberRecord?.ai_dispatcher_enabled ?? false;
        console.log(`Phone ${toNumber}: AI Dispatcher = ${aiDispatcherEnabled}`);
      }

      // If AI Dispatcher is ON, transfer to AI Assistant
      if (aiDispatcherEnabled) {
        console.log('Routing call to AI Assistant');

        // Store call as handled by AI
        await supabase.from('telnyx_calls').insert({
          call_control_id: callSid,
          call_leg_id: callSid,
          from_number: fromNumber,
          to_number: toNumber,
          direction: 'incoming',
          status: 'ai_handling',
          started_at: new Date().toISOString(),
          user_id: phoneNumberRecord?.user_id || null,
          organization_id: phoneNumberRecord?.organization_id || null,
          metadata: { routed_to: 'ai_assistant', format: 'texml' }
        });

        // Return TeXML to transfer to AI Assistant
        return new Response(generateAITransferTeXML(), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/xml'
          },
        });
      }

      // AI Dispatcher is OFF - route to live dispatcher
      console.log('Routing call to live dispatcher');

      // Get call routing settings
      const callRouting = phoneNumberRecord?.call_routing || {};
      const ringTimeout = callRouting.ring_timeout_seconds || 30;
      const voicemailEnabled = callRouting.voicemail_enabled !== false;

      // Store incoming call with voicemail settings
      await supabase.from('telnyx_calls').insert({
        call_control_id: callSid,
        call_leg_id: callSid,
        from_number: fromNumber,
        to_number: toNumber,
        direction: 'incoming',
        status: 'ringing',
        started_at: new Date().toISOString(),
        user_id: phoneNumberRecord?.user_id || null,
        organization_id: phoneNumberRecord?.organization_id || null,
        metadata: {
          routed_to: 'live_dispatcher',
          format: 'texml',
          voicemail_enabled: voicemailEnabled,
          voicemail_settings: voicemailEnabled ? {
            greeting: callRouting.voicemail_greeting,
            voice: callRouting.voicemail_voice,
            maxLength: callRouting.voicemail_max_length,
            transcription: callRouting.voicemail_transcription
          } : null
        }
      });

      // Send real-time notification for incoming call (broadcast to global channel)
      await supabase
        .channel('incoming-calls-global')
        .send({
          type: 'broadcast',
          event: 'incoming_call',
          payload: {
            callControlId: callSid,
            from: fromNumber,
            to: toNumber,
            organizationId: phoneNumberRecord?.organization_id || null,
            timestamp: new Date().toISOString()
          }
        });

      // Return TeXML to answer and hold while waiting for dispatcher
      return new Response(generateHoldTeXML(callSid), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml'
        },
      });
    }

    // Handle check_status action - polling loop for real-time control
    if (action === 'check_status') {
      const callControlId = url.searchParams.get('call_control_id');
      const loopCount = parseInt(url.searchParams.get('loop') || '0');
      const maxLoops = parseInt(url.searchParams.get('max_loops') || '10');

      console.log(`Check status: callId=${callControlId}, loop=${loopCount}/${maxLoops}`);

      // Get call record to check for pending actions
      const { data: callRecord } = await supabase
        .from('telnyx_calls')
        .select('status, metadata')
        .eq('call_control_id', callControlId)
        .single();

      const pendingAction = callRecord?.metadata?.pending_action;
      console.log(`Call status: ${callRecord?.status}, pending action: ${pendingAction}`);

      // Handle pending actions
      if (pendingAction === 'hangup') {
        // Clear pending action and hang up
        await supabase
          .from('telnyx_calls')
          .update({
            status: 'declined',
            metadata: { ...callRecord?.metadata, pending_action: null }
          })
          .eq('call_control_id', callControlId);

        return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`, {
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
        });
      }

      if (pendingAction === 'transfer_to_ai') {
        // Clear pending action and transfer to AI
        await supabase
          .from('telnyx_calls')
          .update({
            status: 'ai_handling',
            metadata: { ...callRecord?.metadata, pending_action: null, transferred_to: 'ai_assistant' }
          })
          .eq('call_control_id', callControlId);

        console.log('Transferring to AI Assistant');
        return new Response(generateAITransferTeXML(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
        });
      }

      if (pendingAction === 'answered') {
        // User answered - for now just acknowledge (browser WebRTC would connect separately)
        await supabase
          .from('telnyx_calls')
          .update({
            status: 'active',
            answered_at: new Date().toISOString(),
            metadata: { ...callRecord?.metadata, pending_action: null }
          })
          .eq('call_control_id', callControlId);

        // Send real-time update
        await supabase
          .channel('call-updates-global')
          .send({
            type: 'broadcast',
            event: 'call_answered',
            payload: { callControlId, timestamp: new Date().toISOString() }
          });

        // Continue holding for now (in production would bridge to user)
        return new Response(generateHoldTeXML(callControlId!, loopCount), {
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
        });
      }

      // Check if max loops reached - go to voicemail
      if (loopCount >= maxLoops) {
        console.log('Max loops reached, checking voicemail');
        const voicemailEnabled = callRecord?.metadata?.voicemail_enabled;
        const voicemailSettings = callRecord?.metadata?.voicemail_settings;

        if (voicemailEnabled && voicemailSettings) {
          await supabase
            .from('telnyx_calls')
            .update({ status: 'voicemail' })
            .eq('call_control_id', callControlId);

          return new Response(generateVoicemailTeXML(voicemailSettings), {
            headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
          });
        } else {
          return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">We're sorry, no one is available to take your call. Please try again later.</Say>
  <Hangup/>
</Response>`, {
            headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
          });
        }
      }

      // No pending action - continue hold loop
      return new Response(generateHoldTeXML(callControlId!, loopCount), {
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
      });
    }

    // Handle voicemail action callbacks (legacy)
    if (action === 'no_answer') {
      const callControlId = url.searchParams.get('call_control_id');
      console.log('No answer - checking for voicemail:', callControlId);

      // Get call record to check voicemail settings
      const { data: callRecord } = await supabase
        .from('telnyx_calls')
        .select('metadata')
        .eq('call_control_id', callControlId)
        .single();

      const voicemailEnabled = callRecord?.metadata?.voicemail_enabled;
      const voicemailSettings = callRecord?.metadata?.voicemail_settings;

      if (voicemailEnabled && voicemailSettings) {
        // Update call status to voicemail
        await supabase
          .from('telnyx_calls')
          .update({ status: 'voicemail' })
          .eq('call_control_id', callControlId);

        // Return voicemail TeXML
        console.log('Routing to voicemail with settings:', voicemailSettings);
        return new Response(generateVoicemailTeXML(voicemailSettings), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/xml'
          },
        });
      } else {
        // No voicemail - just hang up
        console.log('No voicemail enabled - hanging up');
        return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">We're sorry, no one is available to take your call. Please try again later.</Say>
  <Hangup/>
</Response>`, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/xml'
          },
        });
      }
    }

    if (action === 'voicemail_complete') {
      const callControlId = url.searchParams.get('call_control_id') || event.data?.payload?.call_control_id;
      const recordingUrl = event.data?.payload?.recording_url || event.RecordingUrl;
      const transcription = event.data?.payload?.transcription_text || event.TranscriptionText;

      console.log('Voicemail recording complete:', { callControlId, recordingUrl });

      // Update call with voicemail recording
      if (callControlId) {
        // First get existing metadata
        const { data: existingCall } = await supabase
          .from('telnyx_calls')
          .select('metadata')
          .eq('call_control_id', callControlId)
          .single();

        const updatedMetadata = {
          ...(existingCall?.metadata || {}),
          voicemail_transcription: transcription || null
        };

        await supabase
          .from('telnyx_calls')
          .update({
            status: 'voicemail_received',
            recording_url: recordingUrl,
            metadata: updatedMetadata
          })
          .eq('call_control_id', callControlId);

        // Send real-time notification for voicemail
        await supabase
          .channel('voicemail-notifications')
          .send({
            type: 'broadcast',
            event: 'new_voicemail',
            payload: {
              callControlId,
              recordingUrl,
              transcription,
              timestamp: new Date().toISOString()
            }
          });
      }

      // Continue with hangup
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml'
        },
      });
    }

    const { data: eventData } = event;
    const payload = eventData.payload;

    switch (eventData.event_type) {
      case 'call.initiated':
        // Handle incoming call
        if (payload.direction === 'incoming') {
          const clientState = payload.client_state ? JSON.parse(payload.client_state) : {};
          const toNumber = payload.to?.replace(/[^\d+]/g, ''); // Clean phone number

          // Check if AI Dispatcher is enabled for this number
          let aiDispatcherEnabled = false;
          let phoneNumberRecord = null;

          if (toNumber) {
            const { data: phoneData } = await supabase
              .from('phone_numbers')
              .select('id, ai_dispatcher_enabled, organization_id, user_id, call_routing')
              .eq('phone_number', toNumber)
              .single();

            phoneNumberRecord = phoneData;
            aiDispatcherEnabled = phoneData?.ai_dispatcher_enabled ?? false;
            console.log(`Phone ${toNumber}: AI Dispatcher = ${aiDispatcherEnabled}`);
          }

          // If AI Dispatcher is ON, transfer to AI Assistant immediately
          if (aiDispatcherEnabled) {
            console.log('Routing call to AI Assistant');

            // Store call as handled by AI
            await supabase.from('telnyx_calls').insert({
              call_control_id: payload.call_control_id,
              call_leg_id: payload.call_leg_id,
              from_number: payload.from,
              to_number: payload.to,
              direction: 'incoming',
              status: 'ai_handling',
              started_at: new Date().toISOString(),
              user_id: phoneNumberRecord?.user_id || clientState.userId || null,
              organization_id: phoneNumberRecord?.organization_id || null,
              metadata: { routed_to: 'ai_assistant' }
            });

            // Return TeXML to transfer to AI Assistant
            return new Response(generateAITransferTeXML(), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml'
              },
            });
          }

          // AI Dispatcher is OFF - route to live dispatcher
          console.log('Routing call to live dispatcher');

          // Get call routing settings
          const callRouting = phoneNumberRecord?.call_routing || {};
          const ringTimeout = callRouting.ring_timeout_seconds || 30;
          const voicemailEnabled = callRouting.voicemail_enabled !== false;

          // Store incoming call with voicemail settings
          await supabase.from('telnyx_calls').insert({
            call_control_id: payload.call_control_id,
            call_leg_id: payload.call_leg_id,
            from_number: payload.from,
            to_number: payload.to,
            direction: 'incoming',
            status: 'ringing',
            started_at: new Date().toISOString(),
            user_id: phoneNumberRecord?.user_id || clientState.userId || null,
            organization_id: phoneNumberRecord?.organization_id || null,
            metadata: {
              routed_to: 'live_dispatcher',
              voicemail_enabled: voicemailEnabled,
              voicemail_settings: voicemailEnabled ? {
                greeting: callRouting.voicemail_greeting,
                voice: callRouting.voicemail_voice,
                maxLength: callRouting.voicemail_max_length,
                transcription: callRouting.voicemail_transcription
              } : null
            }
          });

          // Send real-time notification for incoming call (broadcast to global channel)
          await supabase
            .channel('incoming-calls-global')
            .send({
              type: 'broadcast',
              event: 'incoming_call',
              payload: {
                callControlId: payload.call_control_id,
                from: payload.from,
                to: payload.to,
                organizationId: phoneNumberRecord?.organization_id || null,
                timestamp: new Date().toISOString()
              }
            });

          // Return TeXML to answer and hold while waiting for dispatcher
          // After timeout, redirects to voicemail handler
          return new Response(generateHoldTeXML(payload.call_control_id), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/xml'
            },
          });
        }
        break;

      case 'call.answered':
        // Update call status to active
        await supabase
          .from('telnyx_calls')
          .update({ 
            status: 'active',
            answered_at: new Date().toISOString()
          })
          .eq('call_control_id', payload.call_control_id);

        // Send real-time update (broadcast to global channel)
        await supabase
          .channel('call-updates-global')
          .send({
            type: 'broadcast',
            event: 'call_answered',
            payload: {
              callControlId: payload.call_control_id,
              timestamp: new Date().toISOString()
            }
          });
        break;

      case 'call.hangup':
        // Update call status to ended
        await supabase
          .from('telnyx_calls')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            duration: payload.call_duration_secs || 0
          })
          .eq('call_control_id', payload.call_control_id);

        // Send real-time update (broadcast to global channel)
        await supabase
          .channel('call-updates-global')
          .send({
            type: 'broadcast',
            event: 'call_ended',
            payload: {
              callControlId: payload.call_control_id,
              duration: payload.call_duration_secs || 0,
              timestamp: new Date().toISOString()
            }
          });
        break;

      case 'call.recording.saved':
        // Update call with recording URL
        await supabase
          .from('telnyx_calls')
          .update({ 
            recording_url: payload.recording_urls?.mp3 || null
          })
          .eq('call_control_id', payload.call_control_id);
        break;

      default:
        console.log('Unhandled event type:', eventData.event_type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing voice webhook:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});