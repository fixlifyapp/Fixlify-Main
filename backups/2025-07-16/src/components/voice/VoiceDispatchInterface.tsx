import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mic, MicOff, User, MessageSquare, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface VoiceDispatchInterfaceProps {
  onStartCall?: (phoneNumber: string) => void;
  onEndCall?: () => void;
  isCallActive?: boolean;
}

export const VoiceDispatchInterface: React.FC<VoiceDispatchInterfaceProps> = ({
  onStartCall,
  onEndCall,
  isCallActive = false
}) => {
  const { user } = useAuthState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('assistant');
  const [script, setScript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [userPhoneNumbers, setUserPhoneNumbers] = useState<any[]>([]);
  const [selectedFromNumber, setSelectedFromNumber] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserPhoneNumbers();
    }
  }, [user?.id]);
  const fetchUserPhoneNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      setUserPhoneNumbers(data || []);
      if (data && data.length > 0) {
        setSelectedFromNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    }
  };

  const handleStartCall = () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!selectedFromNumber) {
      toast.error('Please configure a phone number in settings first');
      return;
    }

    // Format phone number
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    if (formattedNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (onStartCall) {
      onStartCall(formattedNumber);
    }
    toast.success('Initiating voice call...');
  };
  const handleEndCall = () => {
    if (onEndCall) {
      onEndCall();
    }
    toast.info('Call ended');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? 'Recording stopped' : 'Recording started');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Call Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="from-number">From Number</Label>
            <Select value={selectedFromNumber} onValueChange={setSelectedFromNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select your phone number" />
              </SelectTrigger>
              <SelectContent>
                {userPhoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.phone_number}>
                    {phone.phone_number} {phone.is_primary && '(Primary)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userPhoneNumbers.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No phone numbers configured. Please add one in settings.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone-number">Call To</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isCallActive}
            />
          </div>

          <div>
            <Label htmlFor="voice-selection">AI Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger id="voice-selection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">Professional Assistant</SelectItem>
                <SelectItem value="friendly">Friendly Support</SelectItem>
                <SelectItem value="technical">Technical Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {!isCallActive ? (
              <Button 
                onClick={handleStartCall} 
                className="flex-1"
                disabled={!phoneNumber || !selectedFromNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                Start Call
              </Button>
            ) : (
              <Button 
                onClick={handleEndCall} 
                variant="destructive" 
                className="flex-1"
              >
                <Phone className="mr-2 h-4 w-4" />
                End Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Call Script & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="call-script">Call Script (Optional)</Label>
            <Textarea
              id="call-script"
              placeholder="Enter talking points or script for the AI assistant..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-2">
              {isRecording ? (
                <MicOff className="h-5 w-5 text-red-500" />
              ) : (
                <Mic className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm">
                {isRecording ? 'Recording in progress...' : 'Click to record notes'}
              </span>
            </div>
            <Button
              size="sm"
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={toggleRecording}
            >
              {isRecording ? 'Stop' : 'Record'}
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              AI Behavior Settings
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Professional tone maintained</li>
              <li>• Auto-transcription enabled</li>
              <li>• Call recording for quality</li>
              <li>• Real-time sentiment analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};