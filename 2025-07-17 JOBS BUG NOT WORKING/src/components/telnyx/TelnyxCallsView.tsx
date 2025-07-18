import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TelnyxCall {
  id: string;
  call_control_id: string;
  call_leg_id: string;
  call_session_id: string;
  connection_id: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  state: string;
  start_time: string;
  started_at: string;
  answered_at?: string;
  ended_at?: string;
  duration?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface TelnyxCallsViewProps {
  calls: TelnyxCall[];
  isLoading?: boolean;
}
export const TelnyxCallsView: React.FC<TelnyxCallsViewProps> = ({ calls, isLoading = false }) => {
  const getCallStatusColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'active':
      case 'answered':
        return 'bg-green-500';
      case 'ringing':
        return 'bg-yellow-500';
      case 'ended':
      case 'completed':
        return 'bg-gray-500';
      case 'failed':
      case 'busy':
      case 'no_answer':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  if (!calls || calls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <Phone className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No calls yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Voice calls will appear here when they are made or received
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Recent Calls ({calls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {call.direction === 'outbound' ? (
                      <PhoneOff className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Phone className="h-5 w-5 text-green-500" />
                    )}
                  </div>                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {call.direction === 'outbound' ? call.to : call.from}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {call.direction}
                      </Badge>
                      <Badge className={`${getCallStatusColor(call.state)} text-white`}>
                        {call.state}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {call.started_at
                          ? formatDistanceToNow(new Date(call.started_at), { addSuffix: true })
                          : 'Unknown time'}
                      </span>
                      {call.duration && (
                        <span>Duration: {formatDuration(call.duration)}</span>
                      )}
                    </div>
                  </div>
                </div>
                {call.state === 'failed' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};