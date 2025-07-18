
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, PhoneOff, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CALL_CONFIG = {
  CONNECTION_ID: 'default-connection',
  WEBHOOK_BASE_URL: 'https://your-webhook-url.com',
  DEFAULT_CALL_TIMEOUT: 30000,
  MAX_CALL_DURATION: 300000,
  AUDIO_FORMAT: 'wav',
  SAMPLE_RATE: 8000,
  DEFAULT_AI_VOICE: 'alloy',
  AI_VOICE_SPEED: '1.0',
  AI_VOICE_PITCH: '1.0',
};

interface CallSession {
  id: string;
  phone_number: string;
  status: 'idle' | 'calling' | 'connected' | 'ended';
  call_control_id?: string;
  started_at?: string;
  ended_at?: string;
}

export const UnifiedCallManager = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfigs, setAiConfigs] = useState<any[]>([]);

  useEffect(() => {
    fetchAiConfigs();
  }, []);

  const fetchAiConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAiConfigs(data || []);
    } catch (error) {
      console.error('Error fetching AI configs:', error);
    }
  };

  const initiateCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Create call session
      const session: CallSession = {
        id: `call-${Date.now()}`,
        phone_number: phoneNumber,
        status: 'calling',
        started_at: new Date().toISOString(),
      };

      setCallSession(session);

      // Here you would integrate with your actual calling service
      // For now, we'll simulate a call
      setTimeout(() => {
        setCallSession(prev => prev ? { ...prev, status: 'connected', call_control_id: CALL_CONFIG.CONNECTION_ID } : null);
        toast.success('Call connected!');
      }, 2000);

    } catch (error: any) {
      console.error('Error initiating call:', error);
      toast.error(`Failed to initiate call: ${error.message}`);
      setCallSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = async () => {
    if (!callSession) return;

    setIsLoading(true);
    try {
      setCallSession(prev => prev ? { 
        ...prev, 
        status: 'ended',
        ended_at: new Date().toISOString()
      } : null);

      toast.success('Call ended');

      // Reset after a short delay
      setTimeout(() => {
        setCallSession(null);
        setPhoneNumber('');
      }, 2000);

    } catch (error: any) {
      console.error('Error ending call:', error);
      toast.error(`Failed to end call: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calling':
        return 'bg-yellow-500';
      case 'connected':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calling':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <Phone className="w-4 h-4" />;
      case 'ended':
        return <PhoneOff className="w-4 h-4" />;
      default:
        return <PhoneCall className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Call Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!!callSession}
            />
          </div>

          <div className="flex space-x-3">
            {!callSession ? (
              <Button 
                onClick={initiateCall} 
                disabled={isLoading || !phoneNumber.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PhoneCall className="w-4 h-4 mr-2" />
                )}
                Start Call
              </Button>
            ) : (
              <Button 
                onClick={endCall}
                variant="destructive"
                disabled={isLoading || callSession.status === 'ended'}
                className="flex-1"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            )}
          </div>

          {callSession && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Call Status</span>
                <Badge className={getStatusColor(callSession.status)}>
                  {getStatusIcon(callSession.status)}
                  <span className="ml-2 capitalize">{callSession.status}</span>
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <div><strong>Phone:</strong> {callSession.phone_number}</div>
                <div><strong>Started:</strong> {new Date(callSession.started_at!).toLocaleTimeString()}</div>
                {callSession.call_control_id && (
                  <div><strong>Control ID:</strong> {callSession.call_control_id}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>AI Configurations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiConfigs.length > 0 ? (
            <div className="space-y-3">
              {aiConfigs.map((config) => (
                <div key={config.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config.agent_name}</h4>
                      <p className="text-sm text-muted-foreground">{config.business_niche}</p>
                    </div>
                    <Badge variant={config.is_active ? 'default' : 'secondary'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No AI configurations found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedCallManager;
