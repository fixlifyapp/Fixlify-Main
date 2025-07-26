import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Pause,
  Play,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ActiveCall {
  callControlId: string;
  from: string;
  to: string;
  startTime: string;
  status: 'ringing' | 'active' | 'hold';
}

interface ActiveCallInterfaceProps {
  call: ActiveCall | null;
  onEndCall: () => void;
}

export const ActiveCallInterface = ({
  call,
  onEndCall
}: ActiveCallInterfaceProps) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!call || call.status !== 'active') return;

    const interval = setInterval(() => {
      const startTime = new Date(call.startTime);
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [call]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  const handleCallAction = async (action: string) => {
    if (!call) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action,
          callControlId: call.callControlId
        }
      });

      if (error) throw error;

      if (data.success) {
        switch (action) {
          case 'mute':
            setIsMuted(true);
            toast.info('Microphone muted');
            break;
          case 'unmute':
            setIsMuted(false);
            toast.info('Microphone unmuted');
            break;
          case 'hold':
            setIsOnHold(true);
            toast.info('Call on hold');
            break;
          case 'unhold':
            setIsOnHold(false);
            toast.info('Call resumed');
            break;
          case 'record_start':
            setIsRecording(true);
            toast.info('Recording started');
            break;
          case 'record_stop':
            setIsRecording(false);
            toast.info('Recording stopped');
            break;
          case 'hangup':
            toast.info('Call ended');
            onEndCall();
            break;
        }
      } else {
        throw new Error(data.error || `Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      toast.error(`Failed to ${action}`);
    }
  };

  const toggleMute = () => {
    handleCallAction(isMuted ? 'unmute' : 'mute');
  };

  const toggleHold = () => {
    handleCallAction(isOnHold ? 'unhold' : 'hold');
  };

  const toggleRecording = () => {
    handleCallAction(isRecording ? 'record_stop' : 'record_start');
  };

  const endCall = () => {
    handleCallAction('hangup');
  };

  if (!call) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="w-96 bg-white dark:bg-gray-900 shadow-2xl border-2 border-green-500">
        <div className="p-6">
          {/* Call Status */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">
                {call.status === 'active' ? 'Active Call' : 
                 call.status === 'hold' ? 'On Hold' : 'Connecting...'}
              </span>
            </div>
            <h3 className="font-semibold text-lg">
              {formatPhoneNumber(call.from === call.to ? call.to : call.from)}
            </h3>
            {call.status === 'active' && (
              <p className="text-muted-foreground text-sm">
                {formatDuration(duration)}
              </p>
            )}
          </div>

          {/* Call Controls */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Button
              variant={isMuted ? "default" : "outline"}
              size="sm"
              onClick={toggleMute}
              className={isMuted ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant={isOnHold ? "default" : "outline"}
              size="sm"
              onClick={toggleHold}
              className={isOnHold ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              {isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>

            <Button
              variant={isRecording ? "default" : "outline"}
              size="sm"
              onClick={toggleRecording}
              className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
            >
              <Circle className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          {/* End Call */}
          <Button
            onClick={endCall}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </Card>
    </div>
  );
};