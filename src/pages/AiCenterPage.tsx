
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, Phone, Zap, TrendingUp, Clock, Play, Square } from "lucide-react";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";
import { VoiceDispatchInterface } from "@/components/voice/VoiceDispatchInterface";
import { AutomationEngineStatus } from "@/components/automations/AutomationEngineStatus";
import { AutomationProcessorProvider } from "@/contexts/AutomationProcessorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const AiCenterPage = () => {
  const [activeTab, setActiveTab] = useState("calls");
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Fetch real Telnyx calls data with real-time updates
  const { data: callsData = [], isLoading: callsLoading, refetch } = useQuery({
    queryKey: ['ai-center-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_calls')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Subscribe to real-time call updates
  useEffect(() => {
    const channel = supabase
      .channel('telnyx-calls-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telnyx_calls'
        },
        () => {
          console.log('Telnyx call updated, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Fetch AI analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['ai-analytics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-ai-call-analytics', {
          body: { timeframe: 'today' }
        });
        
        if (error) throw error;
        return data?.analytics || null;
      } catch (error) {
        console.error('Error fetching AI analytics:', error);
        return null;
      }
    }
  });

  // Calculate real metrics from calls data
  const todayCalls = callsData.filter(call => {
    const callDate = new Date(call.started_at);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  });

  const completedCalls = callsData.filter(call => call.call_status === 'completed');
  const successRate = callsData.length > 0 ? Math.round((completedCalls.length / callsData.length) * 100) : 0;
  
  const averageDuration = callsData.length > 0 
    ? callsData.reduce((sum, call) => sum + (call.call_duration || 0), 0) / callsData.length 
    : 0;
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const appointmentsScheduled = callsData.filter(call => call.appointment_scheduled).length;

  const handleVoiceTest = () => {
    if (isTestingVoice) {
      setIsTestingVoice(false);
      toast.info("Voice test ended");
    } else {
      setIsTestingVoice(true);
      toast.success("Voice test started - try speaking!");
    }
  };

  return (
    <AutomationProcessorProvider>
      <PageLayout>
        <div className="container mx-auto py-6">
          {/* Automation Engine Status */}
          <AutomationEngineStatus />
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Center</h1>
              <p className="text-muted-foreground">
                Monitor and manage all AI-powered features and interactions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleVoiceTest}
                variant={isTestingVoice ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isTestingVoice ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isTestingVoice ? "Stop Test" : "Test Voice AI"}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Overview Cards with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Calls Today</p>
                  <p className="text-2xl font-bold">
                    {callsLoading ? '...' : todayCalls.length}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {callsLoading ? '...' : `${successRate}%`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {callsLoading ? '...' : formatDuration(averageDuration)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold">
                    {callsLoading ? '...' : appointmentsScheduled}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Test Interface */}
        {isTestingVoice && (
          <div className="mb-6">
            <VoiceDispatchInterface 
              onCallStart={() => toast.success("Voice test connected")}
              onCallEnd={() => {
                setIsTestingVoice(false);
                toast.info("Voice test ended");
              }}
            />
          </div>
        )}

        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone size={16} />
              AI Calls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp size={16} />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calls" className="mt-0">
            <TelnyxCallsView />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                  </div>
                ) : analyticsData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-2xl font-bold text-blue-600">{analyticsData.totalCalls}</h3>
                        <p className="text-sm text-muted-foreground">Total Calls</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <h3 className="text-2xl font-bold text-green-600">{analyticsData.resolvedCalls}</h3>
                        <p className="text-sm text-muted-foreground">Resolved by AI</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <h3 className="text-2xl font-bold text-orange-600">{analyticsData.appointmentsScheduled}</h3>
                        <p className="text-sm text-muted-foreground">Appointments Scheduled</p>
                      </div>
                    </div>
                    
                    {analyticsData.recentCalls && analyticsData.recentCalls.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Recent Call Performance</h4>
                        <div className="space-y-2">
                          {analyticsData.recentCalls.slice(0, 5).map((call, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{call.clientPhone}</p>
                                <p className="text-sm text-muted-foreground">{call.summary}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={call.status === 'resolved' ? 'default' : 'destructive'}>
                                  {call.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(call.duration)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
                    <p className="text-muted-foreground">
                      Analytics will appear once you have AI call activity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </PageLayout>
    </AutomationProcessorProvider>
  );
};

export default AiCenterPage;
