
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/RealtimeAudio';

interface VoiceDispatchInterfaceProps {
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

export const VoiceDispatchInterface: React.FC<VoiceDispatchInterfaceProps> = ({
  onCallStart,
  onCallEnd
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioContextRef.current?.close();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setCallStatus('idle');
  };

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to our WebSocket edge function
      const wsUrl = `wss://mqppvcrlvsgrsqelglod.functions.supabase.co/realtime-voice-dispatch`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setCallStatus('connected');
        onCallStart?.();
        
        // Start recording audio
        await startRecording();
        
        toast.success('Voice dispatch connected');
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        if (data.type === 'response.audio.delta') {
          // Play audio response
          setIsSpeaking(true);
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await audioQueueRef.current?.addToQueue(bytes);
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'response.audio_transcript.delta') {
          // Update transcript
          setTranscript(prev => {
            const newTranscript = [...prev];
            if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith('AI: ')) {
              newTranscript[newTranscript.length - 1] += data.delta;
            } else {
              newTranscript.push('AI: ' + data.delta);
            }
            return newTranscript;
          });
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          // User speech transcription
          setTranscript(prev => [...prev, 'User: ' + data.transcript]);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
          toast.error('Voice dispatch error: ' + data.message);
          setCallStatus('error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
        setCallStatus('error');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        cleanup();
        onCallEnd?.();
        toast.info('Call ended');
      };

    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start voice dispatch');
      setCallStatus('error');
    }
  };

  const startRecording = async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isSpeaking) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const endCall = () => {
    cleanup();
    onCallEnd?.();
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'info';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              AI Voice Dispatch
            </CardTitle>
            <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button 
                onClick={startCall}
                disabled={callStatus === 'connecting'}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {callStatus === 'connecting' ? 'Connecting...' : 'Start Voice Dispatch'}
              </Button>
            ) : (
              <Button 
                onClick={endCall}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            )}

            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isRecording ? (
                  <><Mic className="h-4 w-4 text-green-500" /> Recording</>
                ) : (
                  <><MicOff className="h-4 w-4 text-gray-400" /> Mic Off</>
                )}
                
                {isSpeaking ? (
                  <><Volume2 className="h-4 w-4 text-blue-500" /> AI Speaking</>
                ) : (
                  <><VolumeX className="h-4 w-4 text-gray-400" /> AI Idle</>
                )}
              </div>
            )}
          </div>

          {isConnected && (
            <div className="text-sm text-muted-foreground">
              Voice dispatch is active. The AI assistant will help with client lookup and appointment scheduling.
            </div>
          )}
        </CardContent>
      </Card>

      {transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transcript.map((line, index) => (
                <div 
                  key={index} 
                  className={`text-sm ${
                    line.startsWith('AI: ') ? 'text-blue-600' : 'text-green-600'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
