
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, User, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Type for appointment data
interface AppointmentData {
  service_type?: string;
  scheduled_date?: string;
  preferred_time?: string;
  client_name?: string;
  is_emergency?: boolean;
  [key: string]: any;
}

export const TelnyxCallsView = () => {
  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['telnyx-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'connected': return 'success';
      case 'answered': return 'info';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to safely parse appointment data
  const parseAppointmentData = (data: any): AppointmentData | null => {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as AppointmentData;
      } catch {
        return null;
      }
    }
    if (typeof data === 'object') {
      return data as AppointmentData;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading calls...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Calls Yet</h3>
            <p className="text-muted-foreground">
              AI calls will appear here once you start receiving them.
            </p>
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
          Recent AI Calls ({calls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.map((call) => {
            const appointmentData = parseAppointmentData(call.appointment_data);
            
            return (
              <div key={call.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{call.phone_number}</span>
                    </div>
                    <Badge variant={getStatusColor(call.call_status) as any}>
                      {call.call_status}
                    </Badge>
                    {call.appointment_scheduled && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Appointment Scheduled
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">To Number:</span>
                    <p className="font-medium">{call.to_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{formatDuration(call.call_duration)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Direction:</span>
                    <p className="font-medium capitalize">{call.direction}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">
                      {new Date(call.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {appointmentData && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <h4 className="font-medium text-green-800 mb-2">Appointment Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {appointmentData.service_type && (
                        <div>
                          <span className="text-green-600">Service:</span>
                          <p className="font-medium">{appointmentData.service_type}</p>
                        </div>
                      )}
                      {appointmentData.scheduled_date && (
                        <div>
                          <span className="text-green-600">Date:</span>
                          <p className="font-medium">{appointmentData.scheduled_date}</p>
                        </div>
                      )}
                      {appointmentData.preferred_time && (
                        <div>
                          <span className="text-green-600">Time:</span>
                          <p className="font-medium">{appointmentData.preferred_time}</p>
                        </div>
                      )}
                      {appointmentData.client_name && (
                        <div>
                          <span className="text-green-600">Client:</span>
                          <p className="font-medium">{appointmentData.client_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {call.ai_transcript && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">Conversation Transcript</h4>
                    <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {call.ai_transcript}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
