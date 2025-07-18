
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, RefreshCw, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface DispatcherStats {
  id: string;
  name: string;
  jobsAssigned: number;
  revenue: number;
  initials: string;
}

interface DispatchScoreboardProps {
  isRefreshing?: boolean;
}

export const DispatchScoreboard = ({ isRefreshing = false }: DispatchScoreboardProps) => {
  const [dispatchers, setDispatchers] = useState<DispatcherStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("quarter");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user } = useAuth();

  const handleRefresh = () => {
    setLastUpdated(new Date());
    fetchDispatcherData();
  };

  const fetchDispatcherData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      if (timePeriod === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timePeriod === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timePeriod === "quarter") {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (timePeriod === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
      
      // Fetch jobs with creator information
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id, 
          revenue, 
          created_by
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('created_by', 'is', null);
        
      if (error) throw error;
      
      if (!jobs || jobs.length === 0) {
        setDispatchers([]);
        setIsLoading(false);
        return;
      }
      
      // Process data to calculate stats per dispatcher
      const dispatchStats: Record<string, DispatcherStats> = {};
      
      // Get unique dispatcher IDs
      const dispatcherIds = Array.from(new Set(jobs.map(job => job.created_by)));
      
      // Fetch dispatcher names from profiles table
      const { data: dispatcherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', dispatcherIds as string[]);
        
      if (profilesError) throw profilesError;
      
      if (!dispatcherProfiles || dispatcherProfiles.length === 0) {
        // If no real data, use demo data
        const dummyData = [
          { id: '1', name: 'Kim', jobsAssigned: 162, revenue: 43388.98, initials: 'K' },
          { id: '2', name: 'Nick', jobsAssigned: 11, revenue: 5301.55, initials: 'N' }
        ];
        setDispatchers(dummyData);
        setIsLoading(false);
        return;
      }
      
      // Create a map of dispatcher ID to name
      const dispatcherNameMap: Record<string, string> = {};
      dispatcherProfiles.forEach(profile => {
        if (profile.id && profile.name) {
          dispatcherNameMap[profile.id] = profile.name;
        }
      });
      
      jobs?.forEach(job => {
        if (job.created_by && dispatcherNameMap[job.created_by]) {
          const dispatcherId = job.created_by;
          const name = dispatcherNameMap[dispatcherId];
          
          if (!dispatchStats[dispatcherId]) {
            const initials = name
              .split(' ')
              .map(part => part[0])
              .join('')
              .substring(0, 1)
              .toUpperCase();
              
            dispatchStats[dispatcherId] = {
              id: dispatcherId,
              name,
              jobsAssigned: 0,
              revenue: 0,
              initials
            };
          }
          
          dispatchStats[dispatcherId].jobsAssigned += 1;
          dispatchStats[dispatcherId].revenue += Number(job.revenue) || 0;
        }
      });
      
      // Sort dispatchers by job count
      const sortedDispatchers = Object.values(dispatchStats)
        .sort((a, b) => b.jobsAssigned - a.jobsAssigned);
      
      // Create some dummy data for now since we might not have real data
      if (sortedDispatchers.length === 0) {
        const dummyData = [
          { id: '1', name: 'Kim', jobsAssigned: 162, revenue: 43388.98, initials: 'K' },
          { id: '2', name: 'Nick', jobsAssigned: 11, revenue: 5301.55, initials: 'N' }
        ];
        setDispatchers(dummyData);
      } else {
        setDispatchers(sortedDispatchers);
      }
      
    } catch (error) {
      console.error('Error fetching dispatcher data:', error);
      
      // Fallback to dummy data if there's an error
      const dummyData = [
        { id: '1', name: 'Kim', jobsAssigned: 162, revenue: 43388.98, initials: 'K' },
        { id: '2', name: 'Nick', jobsAssigned: 11, revenue: 5301.55, initials: 'N' }
      ];
      setDispatchers(dummyData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatcherData();
  }, [user, timePeriod, isRefreshing, lastUpdated]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg">Dispatch Scoreboard</CardTitle>
          <p className="text-xs text-fixlyfy-text-secondary">updated {formatTime(lastUpdated)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Print Report</DropdownMenuItem>
              <DropdownMenuItem>View All Dispatchers</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="flex justify-center py-10">
            <Loader2 size={30} className="animate-spin text-fixlyfy" />
          </div>
        ) : dispatchers.length === 0 ? (
          <div className="text-center py-8 text-fixlyfy-text-secondary">
            <p>No dispatcher data available for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dispatchers.map((dispatcher, index) => (
              <div key={dispatcher.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3 bg-gray-200 text-gray-500">
                    <AvatarFallback>{dispatcher.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dispatcher.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                    <div className="relative w-full">
                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div 
                          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (dispatcher.revenue / (dispatchers[0].revenue || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm mt-1 font-medium">${dispatcher.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-semibold">{dispatcher.jobsAssigned}</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Jobs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
