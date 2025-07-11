
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface RepeatWorkData {
  totalJobs: number;
  repeatJobs: number;
  repeatRate: number;
  topReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export const RepeatWorkTracker = () => {
  const [data, setData] = useState<RepeatWorkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRepeatWorkData = async () => {
      if (!user) return;
      
      try {
        // Fetch all jobs
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('*');
          
        if (error) throw error;
        
        if (!jobs) return;
        
        // Group jobs by client and detect potential repeat work
        const clientJobs = jobs.reduce((acc, job) => {
          if (!job.client_id) return acc;
          
          if (!acc[job.client_id]) {
            acc[job.client_id] = [];
          }
          acc[job.client_id].push(job);
          return acc;
        }, {} as Record<string, any[]>);
        
        let repeatJobs = 0;
        const reasons: Record<string, number> = {};
        
        // Analyze each client's jobs for repeats
        Object.values(clientJobs).forEach(clientJobList => {
          clientJobList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          for (let i = 1; i < clientJobList.length; i++) {
            const currentJob = clientJobList[i];
            const previousJob = clientJobList[i - 1];
            
            // Check if jobs are within 30 days and same service type
            const daysDiff = Math.abs(
              new Date(currentJob.created_at).getTime() - new Date(previousJob.created_at).getTime()
            ) / (1000 * 60 * 60 * 24);
            
            const hasSimilarTags = currentJob.tags?.some((tag: string) => 
              previousJob.tags?.includes(tag)
            );
            
            if (daysDiff <= 30 && hasSimilarTags) {
              repeatJobs++;
              
              // Categorize reasons
              if (currentJob.notes?.toLowerCase().includes('callback') || 
                  currentJob.notes?.toLowerCase().includes('follow up')) {
                reasons['Callback/Follow-up'] = (reasons['Callback/Follow-up'] || 0) + 1;
              } else if (currentJob.notes?.toLowerCase().includes('warranty') ||
                        currentJob.notes?.toLowerCase().includes('defect')) {
                reasons['Warranty/Defect'] = (reasons['Warranty/Defect'] || 0) + 1;
              } else if (daysDiff <= 7) {
                reasons['Quick Return'] = (reasons['Quick Return'] || 0) + 1;
              } else {
                reasons['Maintenance'] = (reasons['Maintenance'] || 0) + 1;
              }
            }
          }
        });
        
        const totalJobs = jobs.length;
        const repeatRate = totalJobs > 0 ? (repeatJobs / totalJobs) * 100 : 0;
        
        const topReasons = Object.entries(reasons)
          .map(([reason, count]) => ({
            reason,
            count,
            percentage: repeatJobs > 0 ? (count / repeatJobs) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
        
        setData({
          totalJobs,
          repeatJobs,
          repeatRate,
          topReasons
        });
        
      } catch (error) {
        console.error('Error fetching repeat work data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepeatWorkData();
  }, [user]);
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repeat Work Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No job data available</p>
        </CardContent>
      </Card>
    );
  }
  
  const pieData = data.topReasons.map((reason, index) => ({
    name: reason.reason,
    value: reason.count,
    percentage: reason.percentage
  }));
  
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  
  const getRepeatRateStatus = () => {
    if (data.repeatRate < 5) return { color: 'text-green-600', status: 'Excellent', icon: CheckCircle };
    if (data.repeatRate < 10) return { color: 'text-amber-600', status: 'Good', icon: Wrench };
    return { color: 'text-red-600', status: 'Needs Attention', icon: AlertTriangle };
  };
  
  const status = getRepeatRateStatus();
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
          Repeat Work & Quality
        </CardTitle>
        <Badge variant="outline" className={`${status.color} border-current`}>
          {status.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <p className="text-2xl font-bold text-gray-900">{data.totalJobs}</p>
            <p className="text-sm text-gray-600">Total Jobs</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <p className="text-2xl font-bold text-purple-600">{data.repeatJobs}</p>
            <p className="text-sm text-gray-600">Repeat Jobs</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <status.icon className={`h-5 w-5 ${status.color}`} />
              <p className={`text-2xl font-bold ${status.color}`}>{data.repeatRate.toFixed(1)}%</p>
            </div>
            <p className="text-sm text-gray-600">Repeat Rate</p>
          </div>
        </div>
        
        {/* Quality Indicator */}
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-900">Quality Score</p>
            <p className={`text-sm font-medium ${status.color}`}>
              {100 - data.repeatRate > 95 ? 'Excellent' : 
               100 - data.repeatRate > 90 ? 'Good' : 
               100 - data.repeatRate > 85 ? 'Fair' : 'Poor'}
            </p>
          </div>
          <Progress value={100 - data.repeatRate} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            Lower repeat rates indicate better first-time fix quality
          </p>
        </div>
        
        {/* Reasons Breakdown */}
        {data.topReasons.length > 0 && (
          <div className="bg-white rounded-lg border p-4">
            <h4 className="font-medium text-gray-900 mb-4">Top Repeat Reasons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name) => [`${value} jobs`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {data.topReasons.map((reason, index) => (
                  <div key={reason.reason} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{reason.reason}</span>
                    </div>
                    <span className="text-sm font-medium">{reason.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* AI Insight */}
        {data.repeatRate > 10 && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Quality Alert</p>
                <p className="text-sm text-red-700">
                  High repeat rate detected. Consider additional technician training or quality control measures.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
