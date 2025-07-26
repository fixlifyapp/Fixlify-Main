import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Phone,
  PhoneMissed,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConferenceParticipant {
  id: string;
  callControlId: string;
  phoneNumber: string;
  name?: string;
  status: 'connecting' | 'connected' | 'muted' | 'hold' | 'disconnected';
  joinedAt: string;
  isMuted?: boolean;
  isOnHold?: boolean;
}

interface ConferenceCallProps {
  conferenceId: string;
  onEndConference: () => void;
}

export const ConferenceCall = ({ conferenceId, onEndConference }: ConferenceCallProps) => {
  const [participants, setParticipants] = useState<ConferenceParticipant[]>([]);
  const [newParticipantNumber, setNewParticipantNumber] = useState('');
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [conferenceStatus, setConferenceStatus] = useState<'active' | 'ended'>('active');

  const addParticipant = async () => {
    if (!newParticipantNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsAddingParticipant(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Call the edge function to add participant to conference
      const { data, error } = await supabase.functions.invoke('telnyx-conference-control', {
        body: {
          action: 'add_participant',
          conferenceId,
          phoneNumber: newParticipantNumber.trim(),
          userId: userData.user?.id
        }
      });

      if (error) throw error;

      const newParticipant: ConferenceParticipant = {
        id: data.participantId,
        callControlId: data.callControlId,
        phoneNumber: newParticipantNumber.trim(),
        status: 'connecting',
        joinedAt: new Date().toISOString()
      };

      setParticipants(prev => [...prev, newParticipant]);
      setNewParticipantNumber('');
      toast.success('Adding participant to conference...');
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      const { data: userData } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action: 'hangup',
          callControlId: participant.callControlId,
          userId: userData.user?.id
        }
      });

      setParticipants(prev => prev.filter(p => p.id !== participantId));
      toast.success('Participant removed from conference');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const muteParticipant = async (participantId: string) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      const action = participant.isMuted ? 'unmute' : 'mute';
      const { data: userData } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('telnyx-call-control', {
        body: {
          action,
          callControlId: participant.callControlId,
          userId: userData.user?.id
        }
      });

      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, isMuted: !p.isMuted, status: p.isMuted ? 'connected' : 'muted' }
          : p
      ));

      toast.success(`Participant ${action}d`);
    } catch (error) {
      console.error('Error muting participant:', error);
      toast.error('Failed to change participant mute status');
    }
  };

  const endConference = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // End all participant calls
      await Promise.all(
        participants.map(participant =>
          supabase.functions.invoke('telnyx-call-control', {
            body: {
              action: 'hangup',
              callControlId: participant.callControlId,
              userId: userData.user?.id
            }
          })
        )
      );

      setConferenceStatus('ended');
      onEndConference();
      toast.success('Conference ended');
    } catch (error) {
      console.error('Error ending conference:', error);
      toast.error('Failed to end conference');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'connected':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'muted':
        return <MicOff className="w-4 h-4 text-red-500" />;
      case 'hold':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
      case 'disconnected':
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connecting: 'secondary',
      connected: 'default',
      muted: 'destructive',
      hold: 'outline',
      disconnected: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Conference Call</h3>
              <p className="text-sm text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Badge variant={conferenceStatus === 'active' ? 'default' : 'secondary'}>
            {conferenceStatus}
          </Badge>
        </div>

        {/* Add Participant */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number"
              value={newParticipantNumber}
              onChange={(e) => setNewParticipantNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
            />
            <Button 
              onClick={addParticipant}
              disabled={isAddingParticipant || !newParticipantNumber.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-3 mb-6">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(participant.status)}
                <div>
                  <p className="font-medium">
                    {participant.name || participant.phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(participant.status)}
                
                {participant.status === 'connected' || participant.status === 'muted' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => muteParticipant(participant.id)}
                    >
                      {participant.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participant.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          
          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No participants in conference yet
            </div>
          )}
        </div>

        {/* Conference Controls */}
        <div className="flex justify-center">
          <Button
            variant="destructive"
            onClick={endConference}
            disabled={conferenceStatus === 'ended'}
          >
            <PhoneMissed className="h-4 w-4 mr-2" />
            End Conference
          </Button>
        </div>
      </div>
    </Card>
  );
};