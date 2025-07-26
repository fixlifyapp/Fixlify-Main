import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { OutboundCallDialog } from './OutboundCallDialog';
import { InboundCallNotification } from './InboundCallNotification';
import { ActiveCallInterface } from './ActiveCallInterface';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface IncomingCall {
  callControlId: string;
  from: string;
  to: string;
  timestamp: string;
}

interface ActiveCall {
  callControlId: string;
  from: string;
  to: string;
  startTime: string;
  status: 'ringing' | 'active' | 'hold';
}

interface UnifiedCallManagerProps {
  phoneNumber?: string;
  clientName?: string;
  showDialButton?: boolean;
}

export const UnifiedCallManager = ({
  phoneNumber,
  clientName,
  showDialButton = true
}: UnifiedCallManagerProps) => {
  const { user } = useAuth();
  const [showOutboundDialog, setShowOutboundDialog] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to incoming calls
    const incomingChannel = supabase
      .channel('incoming-calls')
      .on('broadcast', { event: 'incoming_call' }, (payload) => {
        console.log('Incoming call received:', payload);
        setIncomingCall(payload.payload as IncomingCall);
      })
      .subscribe();

    // Subscribe to call updates
    const updatesChannel = supabase
      .channel('call-updates')
      .on('broadcast', { event: 'call_answered' }, (payload) => {
        console.log('Call answered:', payload);
        if (incomingCall?.callControlId === payload.payload.callControlId) {
          setActiveCall({
            callControlId: incomingCall.callControlId,
            from: incomingCall.from,
            to: incomingCall.to,
            startTime: payload.payload.timestamp,
            status: 'active'
          });
          setIncomingCall(null);
        }
      })
      .on('broadcast', { event: 'call_ended' }, (payload) => {
        console.log('Call ended:', payload);
        if (activeCall?.callControlId === payload.payload.callControlId) {
          setActiveCall(null);
        }
        if (incomingCall?.callControlId === payload.payload.callControlId) {
          setIncomingCall(null);
        }
      })
      .on('broadcast', { event: 'call_action' }, (payload) => {
        console.log('Call action:', payload);
        if (activeCall?.callControlId === payload.payload.callControlId) {
          const { action } = payload.payload;
          if (action === 'hold') {
            setActiveCall(prev => prev ? { ...prev, status: 'hold' } : null);
          } else if (action === 'unhold') {
            setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(incomingChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user?.id, incomingCall, activeCall]);

  const handleMakeCall = () => {
    setShowOutboundDialog(true);
  };

  const handleAnswerCall = () => {
    // Call answered, InboundCallNotification handles the API call
    // State will be updated via real-time subscription
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  return (
    <>
      {/* Call Button */}
      {showDialButton && (
        <Button
          onClick={handleMakeCall}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Call
        </Button>
      )}

      {/* Outbound Call Dialog */}
      <OutboundCallDialog
        open={showOutboundDialog}
        onClose={() => setShowOutboundDialog(false)}
        defaultNumber={phoneNumber}
        clientName={clientName}
      />

      {/* Incoming Call Notification */}
      <InboundCallNotification
        call={incomingCall}
        onAnswer={handleAnswerCall}
        onDecline={handleDeclineCall}
      />

      {/* Active Call Interface */}
      <ActiveCallInterface
        call={activeCall}
        onEndCall={handleEndCall}
      />
    </>
  );
};