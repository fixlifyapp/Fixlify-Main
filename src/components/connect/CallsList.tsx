
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Clock, User, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { UnifiedCallManager } from "@/components/calling/UnifiedCallManager";

interface Call {
  id: string;
  from_number: string;
  to_number: string;
  duration: number;
  status: string;
  created_at: string;
}

export const CallsList = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, [user?.id]);

  const fetchCalls = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch from telnyx_calls table first, fallback to call_logs
      const { data: telnyxCalls, error: telnyxError } = await supabase
        .from('telnyx_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (telnyxError) {
        console.warn('Telnyx calls table error, falling back to call_logs:', telnyxError);
        
        const { data: legacyCalls, error: legacyError } = await supabase
          .from('call_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (legacyError) throw legacyError;
        
        const callsData = legacyCalls?.map(call => ({
          id: call.id,
          from_number: call.phone_number || 'Unknown',
          to_number: call.phone_number || 'Unknown', 
          duration: call.duration || 0,
          status: call.status || 'unknown',
          created_at: call.created_at
        })) || [];
        setCalls(callsData);
      } else {
        const callsData = telnyxCalls?.map((call: any) => ({
          id: call.id,
          from_number: call.caller_phone || 'Unknown',
          to_number: call.direction === 'outbound' ? 'Outbound Call' : call.caller_phone || 'Unknown',
          duration: call.duration || 0,
          status: call.call_status || 'unknown',
          created_at: call.created_at
        })) || [];
        setCalls(callsData);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calls...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Recent Calls
          </div>
          <UnifiedCallManager showDialButton={true} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No calls found</p>
            </div>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{call.from_number}</p>
                    <p className="text-sm text-gray-500">to {call.to_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(call.duration || 0)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    call.status === 'completed' ? 'bg-green-100 text-green-800' :
                    call.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {call.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
