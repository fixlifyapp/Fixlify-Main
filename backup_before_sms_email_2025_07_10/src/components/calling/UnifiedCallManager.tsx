import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Phone, 
  PhoneOff, 
  PhoneIncoming,
  PhoneOutgoing,
  Mic, 
  MicOff, 
  Bot, 
  User,
  Clock,
  Zap,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TELNYX_CONFIG } from '@/config/telnyx';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CallState {
  id?: string;
  callControlId?: string;
  fromNumber: string;
  toNumber: string;
  direction: 'inbound' | 'outbound';
  status: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ending' | 'ended';
  startTime?: Date;
  duration: number;
  isMuted: boolean;
  isAICall: boolean;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface UnifiedCallManagerProps {
  onCallStateChange?: (state: CallState | null) => void;
  defaultToNumber?: string;
  defaultClientId?: string;
}

export const UnifiedCallManager: React.FC<UnifiedCallManagerProps> = ({ 
  onCallStateChange,
  defaultToNumber = '',
  defaultClientId
}) => {
  const [callState, setCallState] = useState<CallState | null>(null);
  const [ownedNumbers, setOwnedNumbers] = useState<any[]>([]);
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>('');
  const [toNumber, setToNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  const [aiDispatcherEnabled, setAiDispatcherEnabled] = useState<boolean>(false);
  const [updatingAiDispatcher, setUpdatingAiDispatcher] = useState<boolean>(false);
  
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (defaultToNumber) {
      setToNumber(defaultToNumber);
    }
  }, [defaultToNumber]);

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadOwnedNumbers();
    setupCallSubscriptions();
    
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (callState?.status === 'connected' && callState.startTime) {
      durationInterval.current = setInterval(() => {
        setCallState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            duration: Math.floor((Date.now() - (prev.startTime?.getTime() || 0)) / 1000)
          };
        });
      }, 1000);
    } else if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  }, [callState?.status]);

  useEffect(() => {
    onCallStateChange?.(callState);
  }, [callState, onCallStateChange]);

  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'owned')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOwnedNumbers(data || []);
      if (data && data.length > 0) {
        setSelectedFromNumber(data[0].phone_number);
        setAiDispatcherEnabled(data[0].ai_dispatcher_enabled || false);
      }
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const setupTelnyxNumber = async () => {
    try {
      toast.info('Setting up your Telnyx phone number...');
      
      const { data, error } = await supabase.functions.invoke('setup-telnyx-number');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Phone number configured successfully!');
        // Reload phone numbers
        await loadOwnedNumbers();
      } else {
        throw new Error(data?.error || 'Failed to setup phone number');
      }
    } catch (error) {
      console.error('Error setting up Telnyx number:', error);
      toast.error('Failed to setup phone number. Please check your configuration.');
    }
  };

  const testTelnyxConnection = async () => {
    try {
      toast.info('Testing Telnyx API connection...');
      
      const { data, error } = await supabase.functions.invoke('test-telnyx-connection');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message);
      } else {
        throw new Error(data?.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing Telnyx connection:', error);
      toast.error(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const setupCallSubscriptions = () => {
    subscriptionRef.current = supabase
      .channel('unified-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telnyx_calls'
        },
        async (payload) => {
          const newCall = payload.new as any;
          
          if (newCall.direction === 'inbound' && newCall.status === 'initiated') {
            // Find client by phone number
            const client = await findClientByPhone(newCall.from_number);
            
            setIncomingCallData({
              ...newCall,
              client
            });
            setShowIncomingCall(true);
            
            // Show notification
            const clientName = client?.name || formatPhoneNumber(newCall.from_number);
            toast.info(`Incoming call from ${clientName}`, {
              duration: 15000,
              action: {
                label: "Answer",
                onClick: () => answerIncomingCall(newCall)
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'telnyx_calls'
        },
        (payload) => {
          const updatedCall = payload.new as any;
          
          if (callState && updatedCall.call_control_id === callState.callControlId) {
            if (updatedCall.status === 'completed' || updatedCall.status === 'failed') {
              endCall();
            } else if (updatedCall.status === 'connected' || updatedCall.status === 'answered') {
              setCallState(prev => prev ? { ...prev, status: 'connected' } : null);
            }
          }
        }
      )
      .subscribe();
  };

  const findClientByPhone = async (phoneNumber: string) => {
    if (!phoneNumber) return null;
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`);
      
      if (error) {
        console.error('Error searching for client:', error);
        return null;
      }
      
      return clients && clients.length > 0 ? clients[0] : null;
    } catch (error) {
      console.error('Error finding client by phone:', error);
      return null;
    }
  };

  const initiateCall = async (isAICall: boolean = false) => {
    if (!selectedFromNumber || !toNumber) {
      toast.error("Please select a from number and enter a to number");
      return;
    }

    try {
      setCallState({
        fromNumber: selectedFromNumber,
        toNumber: toNumber,
        direction: 'outbound',
        status: 'connecting',
        duration: 0,
        isMuted: false,
        isAICall,
        startTime: new Date()
      });

      // Get connection ID from the selected phone number
      const phoneNumber = ownedNumbers.find(n => n.phone_number === selectedFromNumber);
      const connectionId = phoneNumber?.connection_id || TELNYX_CONFIG.DEFAULT_CONNECTION_ID;

      if (!connectionId) {
        throw new Error('No Telnyx connection ID configured. Please set VITE_TELNYX_CONNECTION_ID in your environment variables.');
      }

      // Initiate call via Telnyx
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: 'call',
          to: toNumber,
          from: selectedFromNumber,
          clientId: null,
          connectionId: connectionId
        }
      });

      if (error) throw error;

      if (data?.success) {
        const client = await findClientByPhone(toNumber);
        
        setCallState(prev => prev ? {
          ...prev,
          id: data.data?.id,
          callControlId: data.data?.call_control_id,
          status: 'connected',
          client
        } : null);
        
        toast.success(`${isAICall ? 'AI call' : 'Call'} initiated`);
      } else {
        throw new Error(data?.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call');
      setCallState(null);
    }
  };

  const answerIncomingCall = async (callData: any) => {
    try {
      setShowIncomingCall(false);
      
      setCallState({
        id: callData.id,
        callControlId: callData.call_control_id,
        fromNumber: callData.from_number,
        toNumber: callData.to_number,
        direction: 'inbound',
        status: 'connected',
        duration: 0,
        isMuted: false,
        isAICall: callData.ai_enabled || false,
        startTime: new Date(),
        client: callData.client
      });

      // Update call status in database
      await supabase
        .from('telnyx_calls')
        .update({ 
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('call_control_id', callData.call_control_id);

      toast.success("Call answered");
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const declineIncomingCall = () => {
    setShowIncomingCall(false);
    setIncomingCallData(null);
    toast.info("Call declined");
  };

  const toggleMute = async () => {
    if (!callState || !callState.callControlId) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: callState.isMuted ? 'unmute' : 'mute',
          call_control_id: callState.callControlId
        }
      });

      if (error) throw error;

      setCallState(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
      toast.success(callState.isMuted ? "Unmuted" : "Muted");
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle mute');
    }
  };

  const endCall = async () => {
    if (!callState || !callState.callControlId) return;

    try {
      setCallState(prev => prev ? { ...prev, status: 'ending' } : null);

      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: 'hangup',
          call_control_id: callState.callControlId
        }
      });

      if (error) throw error;

      // Update call record
      await supabase
        .from('telnyx_calls')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_seconds: callState.duration
        })
        .eq('call_control_id', callState.callControlId);

      toast.success("Call ended");
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    } finally {
      setCallState(null);
      setToNumber('');
    }
  };

  const toggleAiDispatcher = async () => {
    if (!selectedFromNumber) return;
    
    setUpdatingAiDispatcher(true);
    const newStatus = !aiDispatcherEnabled;
    
    try {
      // Update AI dispatcher status
      const { data, error } = await supabase.functions.invoke('manage-ai-dispatcher', {
        body: {
          action: newStatus ? 'enable' : 'disable',
          phoneNumber: selectedFromNumber
        }
      });

      if (error) throw error;

      // Update local state
      setAiDispatcherEnabled(newStatus);
      setOwnedNumbers(prev => prev.map(num => 
        num.phone_number === selectedFromNumber 
          ? { ...num, ai_dispatcher_enabled: newStatus }
          : num
      ));

      toast.success(
        newStatus 
          ? 'AI Dispatcher enabled - Incoming calls will be handled by AI'
          : 'AI Dispatcher disabled - You will handle calls manually'
      );
    } catch (error) {
      console.error('Error toggling AI dispatcher:', error);
      toast.error('Failed to update AI dispatcher settings');
    } finally {
      setUpdatingAiDispatcher(false);
    }
  };

  // Update when selected phone number changes
  useEffect(() => {
    const selectedNumber = ownedNumbers.find(n => n.phone_number === selectedFromNumber);
    if (selectedNumber) {
      setAiDispatcherEnabled(selectedNumber.ai_dispatcher_enabled || false);
    }
  }, [selectedFromNumber, ownedNumbers]);

  if (loading) {
    return (
      <Card className="border-fixlyfy-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading phone system...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Main Call Interface */}
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Unified Calling System
            </div>
            {callState && (
              <Badge variant={callState.status === 'connected' ? 'default' : 'secondary'}>
                {callState.status === 'connected' ? 'Active Call' : callState.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!callState ? (
            <>
              {ownedNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Phone Numbers Found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click below to configure your Telnyx phone number
                  </p>
                  <div className="space-y-2">
                    <Button onClick={setupTelnyxNumber} className="gap-2 w-full">
                      <Zap className="h-4 w-4" />
                      Setup Telnyx Number (+1-437-524-9932)
                    </Button>
                    <Button onClick={testTelnyxConnection} variant="outline" className="gap-2 w-full">
                      <Zap className="h-4 w-4" />
                      Test Telnyx Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Number</label>
                    <Select value={selectedFromNumber} onValueChange={setSelectedFromNumber}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your phone number" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownedNumbers.map((number) => (
                          <SelectItem key={number.id} value={number.phone_number}>
                            <div className="flex items-center gap-2">
                              <Zap size={14} className="text-blue-600" />
                              {formatPhoneNumber(number.phone_number)}
                              {number.ai_dispatcher_enabled && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  AI Enabled
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedFromNumber && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <Label htmlFor="ai-dispatcher" className="text-sm font-medium cursor-pointer">
                            AI Dispatcher
                          </Label>
                        </div>
                        <Switch
                          id="ai-dispatcher"
                          checked={aiDispatcherEnabled}
                          onCheckedChange={toggleAiDispatcher}
                          disabled={updatingAiDispatcher}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">To Number</label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={toNumber}
                      onChange={(e) => setToNumber(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => initiateCall(false)}
                      disabled={!selectedFromNumber || !toNumber}
                      className="flex-1"
                    >
                      <Phone size={16} className="mr-2" />
                      Call
                    </Button>
                    
                    <Button 
                      onClick={() => initiateCall(true)}
                      disabled={!selectedFromNumber || !toNumber}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Bot size={16} className="mr-2" />
                      AI Call
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Active Call Display */}
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      {callState.direction === 'inbound' ? (
                        <PhoneIncoming className="h-5 w-5 text-green-600" />
                      ) : (
                        <PhoneOutgoing className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {callState.client?.name || formatPhoneNumber(
                            callState.direction === 'inbound' ? callState.fromNumber : callState.toNumber
                          )}
                        </span>
                        {callState.client && (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <User className="h-3 w-3 mr-1" />
                            Client
                          </Badge>
                        )}
                        {callState.isAICall && (
                          <Badge variant="secondary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPhoneNumber(
                          callState.direction === 'inbound' ? callState.fromNumber : callState.toNumber
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {formatDuration(callState.duration)}
                    </div>
                    <Badge 
                      variant={callState.status === 'connected' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {callState.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleMute}
                    className={`rounded-full w-12 h-12 ${callState.isMuted ? 'bg-red-100 border-red-300' : ''}`}
                  >
                    {callState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </Button>
                  
                  <Button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16"
                    disabled={callState.status === 'ending'}
                  >
                    <PhoneOff size={24} />
                  </Button>
                </div>

                {callState.isAICall && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      AI Assistant is handling this call
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Call Dialog */}
      <Dialog open={showIncomingCall} onOpenChange={setShowIncomingCall}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Volume2 size={48} className="mx-auto text-blue-500" />
            </div>
            
            <h3 className="text-xl font-semibold">Incoming Call</h3>
            
            {incomingCallData && (
              <>
                <div>
                  <p className="text-lg font-medium">
                    {incomingCallData.client?.name || formatPhoneNumber(incomingCallData.from_number)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatPhoneNumber(incomingCallData.from_number)}
                  </p>
                  {incomingCallData.client && (
                    <Badge variant="default" className="mt-2">
                      <User className="h-3 w-3 mr-1" />
                      Known Client
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={declineIncomingCall}
                    variant="destructive"
                    className="rounded-full w-16 h-16"
                  >
                    <PhoneOff size={24} />
                  </Button>
                  
                  <Button
                    onClick={() => answerIncomingCall(incomingCallData)}
                    className="bg-green-600 hover:bg-green-700 rounded-full w-16 h-16"
                  >
                    <Phone size={24} />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
