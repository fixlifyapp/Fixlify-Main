
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

interface TechnicianStats {
  id: string;
  name: string;
  revenue: number;
  jobCount: number;
  initials: string;
}

interface TechScoreboardProps {
  isRefreshing?: boolean;
}

export const TechScoreboard = ({ isRefreshing = false }: TechScoreboardProps) => {
  const [technicians, setTechnicians] = useState<TechnicianStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("month");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user } = useAuth();

  const handleRefresh = () => {
    setLastUpdated(new Date());
    fetchTechnicianData();
  };

  const fetchTechnicianData = async () => {
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
      
      // Fetch jobs with technician ids
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id, 
          revenue, 
          status,
          technician_id
        `)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .eq('status', 'completed')
        .not('technician_id', 'is', null);
        
      if (error) throw error;
      
      if (!jobs || jobs.length === 0) {
        setTechnicians([]);
        setIsLoading(false);
        return;
      }
      
      // Process data to calculate stats per technician
      const techStats: Record<string, TechnicianStats> = {};
      
      // Get unique technician IDs
      const techIds = Array.from(new Set(jobs.map(job => job.technician_id)));
      
      // Fetch technician names
      const { data: techProfiles, error: techError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', techIds as string[]);
        
      if (techError) throw techError;
      
      if (!techProfiles || techProfiles.length === 0) {
        setTechnicians([]);
        setIsLoading(false);
        return;
      }
      
      // Create a map of technician ID to name
      const techNameMap: Record<string, string> = {};
      techProfiles.forEach(tech => {
        if (tech.id && tech.name) {
          techNameMap[tech.id] = tech.name;
        }
      });
      
      jobs?.forEach(job => {
        if (job.technician_id && techNameMap[job.technician_id]) {
          const techId = job.technician_id;
          const name = techNameMap[techId];
          
          if (!techStats[techId]) {
            const initials = name
              .split(' ')
              .map(part => part[0])
              .join('')
              .substring(0, 1)
              .toUpperCase();
              
            techStats[techId] = {
              id: techId,
              name,
              revenue: 0,
              jobCount: 0,
              initials
            };
          }
          
          techStats[techId].revenue += Number(job.revenue) || 0;
          techStats[techId].jobCount += 1;
        }
      });
      
      // Sort technicians by revenue
      const sortedTechs = Object.values(techStats)
        .sort((a, b) => b.revenue - a.revenue);
      
      setTechnicians(sortedTechs);
    } catch (error) {
      console.error('Error fetching technician data:', error);
      setTechnicians([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, [user, timePeriod, isRefreshing, lastUpdated]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg">Tech Scoreboard</CardTitle>
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
              <DropdownMenuItem>View All Technicians</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="flex justify-center py-10">
            <Loader2 size={30} className="animate-spin text-fixlyfy" />
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-8 text-fixlyfy-text-secondary">
            <p>No completed jobs for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {technicians.map((tech, index) => (
              <div key={tech.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3 bg-gray-200 text-gray-500">
                    <AvatarFallback>{tech.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{tech.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                    <div className="relative w-full">
                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div 
                          className="absolute top-0 left-0 h-2 bg-fixlyfy/80 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (tech.revenue / (technicians[0].revenue || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm mt-1 font-medium">${tech.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-semibold">{tech.jobCount}</p>
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
