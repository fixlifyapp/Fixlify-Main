import { useState, useEffect, useRef } from 'react';
import { InboundCallNotification } from './InboundCallNotification';
import { ActiveCallInterface } from './ActiveCallInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface IncomingCall {
  callControlId: string;
  from: string;
  to: string;
  timestamp: string;
  organizationId?: string;
}

interface ActiveCall {
  callControlId: string;
  from: string;
  to: string;
  startTime: string;
  status: 'ringing' | 'active' | 'hold';
}

/**
 * Global call listener that provides incoming call notifications
 * across the entire application. Should be rendered once at the app root level.
 */
export const GlobalCallListener = () => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Use refs to access current state in callbacks without adding to deps
  const incomingCallRef = useRef(incomingCall);
  const activeCallRef = useRef(activeCall);

  // Keep refs in sync with state
  useEffect(() => {
    incomingCallRef.current = incomingCall;
    activeCallRef.current = activeCall;
  }, [incomingCall, activeCall]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('[GlobalCallListener] Setting up call subscriptions for user:', user.id);

    // Subscribe to incoming calls
    const incomingChannel = supabase
      .channel('incoming-calls-global')
      .on('broadcast', { event: 'incoming_call' }, (payload) => {
        console.log('[GlobalCallListener] Incoming call received:', payload);
        const callData = payload.payload as IncomingCall;
        setIncomingCall(callData);

        // Play notification sound
        try {
          const audio = new Audio('/sounds/incoming-call.mp3');
          audio.volume = 0.5;
          audio.play().catch(err => console.log('Could not play notification sound:', err));
        } catch (e) {
          console.log('Audio not available');
        }
      })
      .subscribe((status) => {
        console.log('[GlobalCallListener] Incoming calls channel status:', status);
      });

    // Subscribe to call updates
    const updatesChannel = supabase
      .channel('call-updates-global')
      .on('broadcast', { event: 'call_answered' }, (payload) => {
        console.log('[GlobalCallListener] Call answered:', payload);
        const currentIncoming = incomingCallRef.current;
        if (currentIncoming?.callControlId === payload.payload.callControlId) {
          setActiveCall({
            callControlId: currentIncoming.callControlId,
            from: currentIncoming.from,
            to: currentIncoming.to,
            startTime: payload.payload.timestamp,
            status: 'active'
          });
          setIncomingCall(null);
        }
      })
      .on('broadcast', { event: 'call_ended' }, (payload) => {
        console.log('[GlobalCallListener] Call ended:', payload);
        if (activeCallRef.current?.callControlId === payload.payload.callControlId) {
          setActiveCall(null);
        }
        if (incomingCallRef.current?.callControlId === payload.payload.callControlId) {
          setIncomingCall(null);
        }
      })
      .on('broadcast', { event: 'call_action' }, (payload) => {
        console.log('[GlobalCallListener] Call action:', payload);
        if (activeCallRef.current?.callControlId === payload.payload.callControlId) {
          const { action } = payload.payload;
          if (action === 'hold') {
            setActiveCall(prev => prev ? { ...prev, status: 'hold' } : null);
          } else if (action === 'unhold') {
            setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
          }
        }
      })
      .subscribe((status) => {
        console.log('[GlobalCallListener] Call updates channel status:', status);
      });

    return () => {
      console.log('[GlobalCallListener] Cleaning up subscriptions');
      supabase.removeChannel(incomingChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user?.id]);

  const handleAnswerCall = () => {
    // InboundCallNotification handles the API call
    // State will be updated via real-time subscription
    console.log('[GlobalCallListener] Answer button clicked');
  };

  const handleDeclineCall = () => {
    console.log('[GlobalCallListener] Decline button clicked');
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    console.log('[GlobalCallListener] End call clicked');
    setActiveCall(null);
  };

  return (
    <>
      {/* Incoming Call Notification - shows at top-right of screen */}
      <InboundCallNotification
        call={incomingCall}
        onAnswer={handleAnswerCall}
        onDecline={handleDeclineCall}
      />

      {/* Active Call Interface - shows during active calls */}
      <ActiveCallInterface
        call={activeCall}
        onEndCall={handleEndCall}
      />
    </>
  );
};
