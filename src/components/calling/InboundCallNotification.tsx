import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profiles';

interface IncomingCall {
  callControlId: string;
  from: string;
  to: string;
  timestamp: string;
  organizationId?: string | null;
}

interface InboundCallNotificationProps {
  call: IncomingCall | null;
  onAnswer: () => void;
  onDecline: () => void;
}

// Roles that can answer calls
const CALL_ANSWERING_ROLES = ['admin', 'dispatcher', 'owner'];

export const InboundCallNotification = ({
  call,
  onAnswer,
  onDecline
}: InboundCallNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || '');

  // Check if user has permission to answer calls
  const canAnswerCalls = profile?.role && CALL_ANSWERING_ROLES.includes(profile.role);

  useEffect(() => {
    if (call) {
      setIsVisible(true);
      // Play ringtone sound
      playRingtone();
    } else {
      setIsVisible(false);
      stopRingtone();
    }
  }, [call]);

  const playRingtone = () => {
    // Create audio element for ringtone
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...'; // Base64 ringtone
    audio.loop = true;
    audio.play().catch(console.error);
    
    // Store reference for cleanup
    (window as any).ringtoneAudio = audio;
  };

  const stopRingtone = () => {
    const audio = (window as any).ringtoneAudio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      delete (window as any).ringtoneAudio;
    }
  };

  const handleAnswer = async () => {
    if (!call) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action: 'answer',
          callControlId: call.callControlId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Call answered');
        onAnswer();
      } else {
        throw new Error(data.error || 'Failed to answer call');
      }
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }

    stopRingtone();
  };

  const handleDecline = async () => {
    if (!call) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action: 'hangup',
          callControlId: call.callControlId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.info('Call declined');
        onDecline();
      } else {
        throw new Error(data.error || 'Failed to decline call');
      }
    } catch (error) {
      console.error('Error declining call:', error);
      toast.error('Failed to decline call');
    }

    stopRingtone();
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  // Don't show notification if user doesn't have permission
  if (!call || !isVisible || !canAnswerCalls) return null;

  const handleTransferToAI = async () => {
    if (!call) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action: 'transfer_to_ai',
          callControlId: call.callControlId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Call transferred to AI Assistant');
        onDecline();
      } else {
        throw new Error(data.error || 'Failed to transfer call');
      }
    } catch (error) {
      console.error('Error transferring to AI:', error);
      toast.error('Failed to transfer call to AI');
    }

    stopRingtone();
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
      {/* Pulsating ring effect */}
      <div className="absolute inset-0 rounded-xl bg-green-500/20 animate-ping" />
      <div className="absolute inset-0 rounded-xl bg-green-500/10 animate-[ping_1.5s_ease-in-out_infinite_0.5s]" />
      <Card className="relative w-80 bg-white dark:bg-gray-900 shadow-2xl border-2 border-green-500 ring-4 ring-green-500/30">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Incoming Call</h3>
              <p className="text-muted-foreground">
                {formatPhoneNumber(call.from)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <PhoneOff className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button
              onClick={handleAnswer}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-1" />
              Answer
            </Button>
          </div>

          <Button
            onClick={handleTransferToAI}
            variant="outline"
            size="sm"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Bot className="h-4 w-4 mr-2" />
            Send to AI
          </Button>
        </div>
      </Card>
    </div>
  );
};