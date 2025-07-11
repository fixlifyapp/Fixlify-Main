
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Phone, TrendingUp, Users, Clock, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { toast } from "sonner";

interface AIAgentMetrics {
  totalCalls: number;
  appointmentsScheduled: number;
  averageCallDuration: number;
  successRate: number;
  todaysCalls: number;
  activeCalls: number;
}

export const AIAgentDashboard = () => {
  const { config, loading: configLoading, toggleActive } = useAIAgentConfig();
  const [metrics, setMetrics] = useState<AIAgentMetrics>({
    totalCalls: 0,
    appointmentsScheduled: 0,
    averageCallDuration: 0,
    successRate: 0,
    todaysCalls: 0,
    activeCalls: 0
  });
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Get total calls from Telnyx calls table using correct column names
      const { data: totalCallsData } = await supabase
        .from('telnyx_calls')
        .select('id, call_duration, call_status, created_at, to_number')
        .order('created_at', { ascending: false });

      if (totalCallsData) {
        const totalCalls = totalCallsData.length;
        const completedCalls = totalCallsData.filter(call => call.call_status === 'completed');
        const averageCallDuration = completedCalls.length > 0 
          ? completedCalls.reduce((sum, call) => sum + (call.call_duration || 0), 0) / completedCalls.length
          : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todaysCalls = totalCallsData.filter(call => 
          call.created_at.startsWith(today)
        ).length;
        
        const activeCalls = totalCallsData.filter(call => 
          ['initiated', 'ringing', 'streaming'].includes(call.call_status)
        ).length;
        
        // For now, set appointments to 0 since we don't have that field in telnyx_calls
        const appointmentsScheduled = 0;
        const successRate = totalCalls > 0 ? 50 : 0; // Placeholder calculation

        setMetrics({
          totalCalls,
          appointmentsScheduled,
          averageCallDuration: Math.round(averageCallDuration),
          successRate: Math.round(successRate),
          todaysCalls,
          activeCalls
        });

        // Set recent calls for monitoring
        setRecentCalls(totalCallsData.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching AI agent metrics:", error);
      toast.error("Failed to load AI agent metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Set up real-time sync for calls
  useRealtimeSync({
    tables: ['telnyx_calls', 'ai_agent_configs'],
    onUpdate: fetchMetrics,
    enabled: true
  });

  const handleToggleAgent = async () => {
    try {
      await toggleActive();
      toast.success(`AI Agent ${config?.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling AI agent:', error);
      toast.error('Failed to toggle AI agent status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'initiated': 'bg-blue-100 text-blue-800',
      'ringing': 'bg-yellow-100 text-yellow-800',
      'streaming': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (configLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status and Controls */}
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Agent Status
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={config?.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {config?.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              <Button
                onClick={handleToggleAgent}
                variant={config?.is_active ? "destructive" : "default"}
                size="sm"
              >
                {config?.is_active ? "Deactivate" : "Activate"} Agent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {config ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Business Niche</p>
                <p className="text-lg font-semibold">{config.business_niche}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Diagnostic Price</p>
                <p className="text-lg font-semibold">${config.diagnostic_price}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Surcharge</p>
                <p className="text-lg font-semibold">${config.emergency_surcharge}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">AI Agent not configured</p>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Agent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Calls</p>
                <p className="text-xl font-bold">{metrics.totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Appointments</p>
                <p className="text-xl font-bold">{metrics.appointmentsScheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Success Rate</p>
                <p className="text-xl font-bold">{metrics.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Duration</p>
                <p className="text-xl font-bold">{Math.floor(metrics.averageCallDuration / 60)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-600">Today's Calls</p>
                <p className="text-xl font-bold">{metrics.todaysCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Active Calls</p>
                <p className="text-xl font-bold">{metrics.activeCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Call Activity */}
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Recent AI Call Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent AI calls</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Phone className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{call.to_number || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(call.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(call.call_status)}>
                      {call.call_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
