
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Call {
  id: string;
  direction: "inbound" | "outbound";
  phone_number: string;
  client_name?: string;
  duration?: number;
  status: string;
  created_at: string;
  ai_transcript?: string;
  call_summary?: string;
}

export const CallHistory = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('telnyx_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to match our Call interface
      const transformedCalls: Call[] = (data || []).map(call => ({
        id: call.id,
        direction: (call.direction === 'inbound' || call.direction === 'outbound') ? call.direction : 'inbound',
        phone_number: call.from_number || call.to_number || '',
        client_name: call.client_name || undefined,
        duration: call.call_duration || undefined,
        status: call.call_status || 'unknown',
        created_at: call.created_at,
        ai_transcript: call.ai_transcript || undefined,
        call_summary: call.call_summary || undefined,
      }));

      setCalls(transformedCalls);
    } catch (error) {
      console.error('Error fetching call history:', error);
      toast.error('Failed to load call history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'missed':
      case 'no-answer':
        return 'bg-red-100 text-red-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No call history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${call.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <Phone className={`h-4 w-4 ${call.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{call.phone_number}</span>
                      {call.client_name && (
                        <span className="text-sm text-gray-600">({call.client_name})</span>
                      )}
                      <Badge variant="outline" className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(call.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <span>Duration: {formatDuration(call.duration)}</span>
                      <span className="capitalize">{call.direction}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.ai_transcript && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Transcript
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
