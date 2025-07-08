
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Clock, User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: string;
  client_phone: string;
  call_status: string;
  call_duration: number | null;
  started_at: string;
  ended_at: string | null;
  ai_transcript: string | null;
  call_summary: string | null;
  customer_intent: string | null;
  appointment_scheduled: boolean | null;
  direction: 'inbound' | 'outbound';
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const CallHistory = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_call_logs')
        .select(`
          *,
          client:clients!inner(id, name, phone)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to match our Call interface
      const transformedCalls = (data || []).map(call => ({
        ...call,
        direction: call.direction === 'inbound' ? 'inbound' : 'outbound' as 'inbound' | 'outbound'
      }));

      setCalls(transformedCalls);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'answered':
        return 'bg-blue-500';
      case 'no-answer':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-orange-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-6">Loading call history...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Call History</h2>
        <Button onClick={fetchCalls} variant="outline">
          <Phone className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {calls.map((call) => (
          <Card key={call.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-5 h-5" />
                  <div>
                    <CardTitle className="text-lg">
                      {call.client?.name || 'Unknown Caller'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {call.client_phone}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(call.call_status)}>
                  {call.call_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDuration(call.call_duration)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{call.direction}</span>
                </div>
                <div className="text-sm">
                  <strong>Started:</strong> {formatDistanceToNow(new Date(call.started_at))} ago
                </div>
                {call.appointment_scheduled && (
                  <Badge variant="secondary">
                    Appointment Scheduled
                  </Badge>
                )}
              </div>

              {call.customer_intent && (
                <div className="mb-3">
                  <strong className="text-sm">Intent:</strong>
                  <p className="text-sm text-muted-foreground">{call.customer_intent}</p>
                </div>
              )}

              {call.call_summary && (
                <div className="mb-3">
                  <strong className="text-sm">Summary:</strong>
                  <p className="text-sm text-muted-foreground">{call.call_summary}</p>
                </div>
              )}

              {call.ai_transcript && (
                <details className="mt-3">
                  <summary className="cursor-pointer flex items-center space-x-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>View Transcript</span>
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs whitespace-pre-wrap">
                      {call.ai_transcript}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}

        {calls.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No calls found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CallHistory;
