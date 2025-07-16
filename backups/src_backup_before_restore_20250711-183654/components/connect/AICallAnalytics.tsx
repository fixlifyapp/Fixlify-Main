import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  BarChart3, 
  Bot, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Calendar,
  Star,
  Phone,
  TrendingUp,
  Users,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { formatDistanceToNow } from "date-fns";

interface AIAnalytics {
  totalCalls: number;
  resolvedCalls: number;
  transferredCalls: number;
  successRate: number;
  averageCallDuration: number;
  appointmentsScheduled: number;
  customerSatisfactionAverage: number;
  recentCalls: Array<{
    id: string;
    clientPhone: string;
    duration: number;
    status: string;
    resolutionType: string;
    appointmentScheduled: boolean;
    customerSatisfaction: number;
    startedAt: string;
    summary: string;
  }>;
}

export const AICallAnalytics = () => {
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalCalls: 0,
    resolvedCalls: 0,
    transferredCalls: 0,
    successRate: 0,
    averageCallDuration: 0,
    appointmentsScheduled: 0,
    customerSatisfactionAverage: 0,
    recentCalls: []
  });
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-call-analytics', {
        body: { timeframe }
      });

      if (error) {
        console.error('Analytics error:', error);
        // Set default empty analytics instead of throwing
        setAnalytics({
          totalCalls: 0,
          resolvedCalls: 0,
          transferredCalls: 0,
          successRate: 0,
          averageCallDuration: 0,
          appointmentsScheduled: 0,
          customerSatisfactionAverage: 0,
          recentCalls: []
        });
        toast.info("AI call analytics are currently unavailable. Data will be displayed when available.");
      } else {
        setAnalytics(data?.analytics || {
          totalCalls: 0,
          resolvedCalls: 0,
          transferredCalls: 0,
          successRate: 0,
          averageCallDuration: 0,
          appointmentsScheduled: 0,
          customerSatisfactionAverage: 0,
          recentCalls: []
        });
      }
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      // Set default empty analytics
      setAnalytics({
        totalCalls: 0,
        resolvedCalls: 0,
        transferredCalls: 0,
        successRate: 0,
        averageCallDuration: 0,
        appointmentsScheduled: 0,
        customerSatisfactionAverage: 0,
        recentCalls: []
      });
      toast.error("AI call analytics are currently unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
    toast.info("Loading the latest AI call data...");
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getResolutionBadge = (resolutionType: string) => {
    switch (resolutionType) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case 'transferred':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Transferred</Badge>;
      case 'voicemail':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Voicemail</Badge>;
      case 'abandoned':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Abandoned</Badge>;
      default:
        return <Badge variant="outline">{resolutionType}</Badge>;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Timeframe Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Call Analytics
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Monitor how your AI dispatcher is performing with detailed metrics and insights</p>
                </TooltipContent>
              </Tooltip>
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monitor your AI dispatcher performance and customer interactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {isRefreshing ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh analytics data</p>
              </TooltipContent>
            </Tooltip>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-[140px] border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Phone className="h-3 w-3 text-blue-600" />
                </div>
                Total AI Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalCalls}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {analytics.resolvedCalls} resolved
                <ArrowRight className="h-3 w-3 text-yellow-500" />
                {analytics.transferredCalls} transferred
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Success Rate
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of calls resolved by AI without human transfer</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.successRate >= 80 ? 'text-green-600' : analytics.successRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {analytics.successRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                Calls resolved without transfer
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded">
                  <Clock className="h-3 w-3 text-orange-600" />
                </div>
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(analytics.averageCallDuration / 60)}:{(analytics.averageCallDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">
                Average call length
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Calendar className="h-3 w-3 text-purple-600" />
                </div>
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.appointmentsScheduled}</div>
              <div className="text-xs text-muted-foreground">
                Scheduled by AI
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Satisfaction */}
        {analytics.customerSatisfactionAverage > 0 && (
          <Card className="border-yellow-100 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                Customer Satisfaction
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average customer rating based on post-call surveys</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {analytics.customerSatisfactionAverage}/5
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= analytics.customerSatisfactionAverage
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Average customer rating from AI interactions
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent AI Calls */}
        <Card className="border-blue-100 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              Recent AI Calls
              <Badge variant="outline" className="text-xs">
                Last {analytics.recentCalls.length} calls
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentCalls.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto mb-4">
                  <Bot className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">No AI calls yet</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  AI call logs will appear here once your AI dispatcher starts handling customer calls
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">
                            {call.clientPhone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                          </span>
                          <Badge className={call.resolutionType === 'resolved' ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                            {call.resolutionType === 'resolved' ? 'Resolved' : 'Transferred'}
                          </Badge>
                          {call.appointmentScheduled && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              <Calendar className="h-3 w-3 mr-1" />
                              Appointment
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                          </span>
                          <span>{formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}</span>
                          {call.customerSatisfaction && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {call.customerSatisfaction}/5
                            </span>
                          )}
                        </div>
                        {call.summary && (
                          <p className="text-sm text-gray-600 mt-2 max-w-md line-clamp-2">
                            {call.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
