
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Call } from '@/types/job';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_call_logs')
        .select(`
          *,
          client:clients(id, name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCalls = data?.map(call => ({
        ...call,
        direction: call.client_phone ? 'inbound' : 'outbound',
        client: call.client || { id: '', name: 'Unknown', phone: call.client_phone }
      })) as Call[];

      setCalls(formattedCalls || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading call history...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Call History</h3>
      {calls.length === 0 ? (
        <p>No calls found.</p>
      ) : (
        <div className="space-y-2">
          {calls.map((call) => (
            <div key={call.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{call.client.name}</p>
                  <p className="text-sm text-gray-600">{call.client.phone}</p>
                  <p className="text-sm text-gray-500">
                    {call.direction} • {new Date(call.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{call.call_status}</p>
                  {call.call_duration && (
                    <p className="text-sm text-gray-500">{call.call_duration}s</p>
                  )}
                </div>
              </div>
              {call.call_summary && (
                <p className="mt-2 text-sm">{call.call_summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallHistory;
