import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Phone, 
  PhoneOff,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface CallMetrics {
  totalCalls: number;
  completedCalls: number;
  totalDuration: number;
  averageDuration: number;
  missedCalls: number;
  answerRate: number;
}

interface CallRecord {
  id: string;
  call_control_id: string;
  from_number: string;
  to_number: string;
  direction: 'inbound' | 'outbound';
  status: string;
  duration: number;
  started_at: string;
  ended_at: string;
  recording_url?: string;
}

export const CallAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<CallMetrics>({
    totalCalls: 0,
    completedCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    missedCalls: 0,
    answerRate: 0
  });
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    if (user?.id) {
      fetchCallAnalytics();
    }
  }, [user?.id, dateRange]);

  const fetchCallAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch call data
      const { data: calls, error } = await supabase
        .from('telnyx_calls')
        .select('*')
        .eq('user_id', user?.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Calculate metrics
      const totalCalls = calls?.length || 0;
      const completedCalls = calls?.filter(call => call.status === 'completed').length || 0;
      const totalDuration = calls?.reduce((sum, call) => sum + (call.duration || 0), 0) || 0;
      const averageDuration = completedCalls > 0 ? totalDuration / completedCalls : 0;
      const missedCalls = calls?.filter(call => 
        call.direction === 'inbound' && call.status !== 'completed'
      ).length || 0;
      const answerRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

      setMetrics({
        totalCalls,
        completedCalls,
        totalDuration,
        averageDuration,
        missedCalls,
        answerRate
      });

      setRecentCalls(calls?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching call analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  const getStatusBadge = (status: string, direction: string) => {
    if (status === 'completed') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (direction === 'inbound' && status !== 'completed') {
      return <Badge variant="destructive">Missed</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const exportData = async () => {
    // Export call data to CSV
    const csvContent = [
      ['Date', 'Time', 'Direction', 'Number', 'Duration', 'Status'],
      ...recentCalls.map(call => [
        new Date(call.started_at).toLocaleDateString(),
        new Date(call.started_at).toLocaleTimeString(),
        call.direction,
        call.direction === 'inbound' ? call.from_number : call.to_number,
        formatDuration(call.duration || 0),
        call.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call-analytics-${dateRange}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Call Analytics</h2>
          <p className="text-muted-foreground">
            Performance insights and call metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Calls</p>
              <p className="text-2xl font-bold">{metrics.totalCalls}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Answer Rate</p>
              <p className="text-2xl font-bold">{metrics.answerRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{formatDuration(metrics.averageDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <PhoneOff className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Missed Calls</p>
              <p className="text-2xl font-bold">{metrics.missedCalls}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Calls Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Calls</h3>
          <div className="space-y-3">
            {recentCalls.length > 0 ? (
              recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      call.direction === 'inbound' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {formatPhoneNumber(
                          call.direction === 'inbound' ? call.from_number : call.to_number
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(call.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatDuration(call.duration || 0)}
                    </span>
                    {getStatusBadge(call.status, call.direction)}
                    {call.recording_url && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No calls found for the selected period
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};