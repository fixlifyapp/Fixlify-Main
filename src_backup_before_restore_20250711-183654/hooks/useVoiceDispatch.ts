
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/RealtimeAudio';

interface VoiceDispatchState {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  callStatus: 'idle' | 'connecting' | 'connected' | 'error';
  transcript: string[];
}

export const useVoiceDispatch = () => {
  const [state, setState] = useState<VoiceDispatchState>({
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    callStatus: 'idle',
    transcript: []
  });

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  const updateState = useCallback((updates: Partial<VoiceDispatchState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const cleanup = useCallback(() => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioContextRef.current?.close();
    
    setState({
      isConnected: false,
      isRecording: false,
      isSpeaking: false,
      callStatus: 'idle',
      transcript: []
    });
  }, []);

  const startVoiceDispatch = useCallback(async () => {
    try {
      updateState({ callStatus: 'connecting' });
      
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to WebSocket
      const wsUrl = `wss://mqppvcrlvsgrsqelglod.functions.supabase.co/realtime-voice-dispatch`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('Voice dispatch connected');
        updateState({ 
          isConnected: true, 
          callStatus: 'connected' 
        });
        
        // Start recording
        await startRecording();
        toast.success('Voice dispatch started');
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'response.audio.delta') {
          updateState({ isSpeaking: true });
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await audioQueueRef.current?.addToQueue(bytes);
        } else if (data.type === 'response.audio.done') {
          updateState({ isSpeaking: false });
        } else if (data.type === 'response.audio_transcript.delta') {
          setState(prev => {
            const newTranscript = [...prev.transcript];
            if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith('AI: ')) {
              newTranscript[newTranscript.length - 1] += data.delta;
            } else {
              newTranscript.push('AI: ' + data.delta);
            }
            return { ...prev, transcript: newTranscript };
          });
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          setState(prev => ({
            ...prev,
            transcript: [...prev.transcript, 'User: ' + data.transcript]
          }));
        }
      };

      wsRef.current.onerror = () => {
        toast.error('Voice dispatch connection error');
        updateState({ callStatus: 'error' });
      };

      wsRef.current.onclose = () => {
        cleanup();
        toast.info('Voice dispatch ended');
      };

    } catch (error) {
      console.error('Voice dispatch error:', error);
      toast.error('Failed to start voice dispatch');
      updateState({ callStatus: 'error' });
    }
  }, [updateState, cleanup]);

  const startRecording = useCallback(async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !state.isSpeaking) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await recorderRef.current.start();
      updateState({ isRecording: true });
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to access microphone');
    }
  }, [state.isSpeaking, updateState]);

  const stopVoiceDispatch = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    ...state,
    startVoiceDispatch,
    stopVoiceDispatch
  };
};
