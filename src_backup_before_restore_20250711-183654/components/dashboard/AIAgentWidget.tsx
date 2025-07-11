
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Phone, TrendingUp, Settings, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useNavigate } from "react-router-dom";

interface AIAgentStats {
  todaysCalls: number;
  appointmentsToday: number;
  activeCalls: number;
  successRate: number;
}

export const AIAgentWidget = () => {
  const navigate = useNavigate();
  const { config, loading: configLoading } = useAIAgentConfig();
  const [stats, setStats] = useState<AIAgentStats>({
    todaysCalls: 0,
    appointmentsToday: 0,
    activeCalls: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data: callsData } = await supabase
        .from('telnyx_calls')
        .select('id, appointment_scheduled, call_status, created_at')
        .gte('created_at', today);

      if (callsData) {
        const todaysCalls = callsData.length;
        const appointmentsToday = callsData.filter(call => call.appointment_scheduled).length;
        const activeCalls = callsData.filter(call => 
          ['initiated', 'ringing', 'in-progress'].includes(call.call_status)
        ).length;
        
        const successRate = todaysCalls > 0 
          ? Math.round((appointmentsToday / todaysCalls) * 100)
          : 0;

        setStats({
          todaysCalls,
          appointmentsToday,
          activeCalls,
          successRate
        });
      }
    } catch (error) {
      console.error("Error fetching AI agent stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Set up real-time sync
  useRealtimeSync({
    tables: ['telnyx_calls', 'ai_agent_configs'],
    onUpdate: fetchStats,
    enabled: true
  });

  if (configLoading || isLoading) {
    return (
      <Card className="border-fixlyfy-border">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">AI Agent Not Configured</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set up your Telnyx AI agent to start automated calling
            </p>
            <Button 
              onClick={() => navigate('/connect?tab=ai-settings')}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure AI Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-fixlyfy-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Agent
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={config.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {config.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/connect?tab=ai-dashboard')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Phone className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-xs text-gray-600">Today's Calls</p>
              <p className="text-lg font-bold text-blue-600">{stats.todaysCalls}</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs text-gray-600">Success Rate</p>
              <p className="text-lg font-bold text-green-600">{stats.successRate}%</p>
            </div>
          </div>

          {/* Active Status */}
          {stats.activeCalls > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800">
                  {stats.activeCalls} Active Call{stats.activeCalls > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Business Info */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">Business Niche</p>
            <p className="font-medium">{config.business_niche}</p>
            
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Diagnostic: ${config.diagnostic_price}</span>
              <span>Emergency: +${config.emergency_surcharge}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate('/connect?tab=ai-analytics')}
            >
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/connect?tab=ai-settings')}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
