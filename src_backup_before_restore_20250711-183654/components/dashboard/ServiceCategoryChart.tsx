
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Define colors for the chart
const COLORS = ['#8A4DD5', '#B084F9', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#E5E7EB'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333">
        {`${payload.name}: ${value}%`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-fixlyfy-border rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export const ServiceCategoryChart = () => {
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [satisfactionData, setFeedbackData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch jobs for service category data
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*');
          
        if (jobsError) throw jobsError;
        
        // Group jobs by service type
        const serviceCounts: Record<string, number> = {};
        let totalJobs = 0;
        
        (jobs || []).forEach(job => {
          if (job.tags && job.tags.length > 0) {
            job.tags.forEach((tag: string) => {
              if (!serviceCounts[tag]) {
                serviceCounts[tag] = 0;
              }
              serviceCounts[tag]++;
              totalJobs++;
            });
          } else if (job.service) {
            if (!serviceCounts[job.service]) {
              serviceCounts[job.service] = 0;
            }
            serviceCounts[job.service]++;
            totalJobs++;
          } else {
            if (!serviceCounts["Other"]) {
              serviceCounts["Other"] = 0;
            }
            serviceCounts["Other"]++;
            totalJobs++;
          }
        });
        
        // Convert to percentage and format for chart
        const serviceChartData = Object.entries(serviceCounts)
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / totalJobs) * 100),
            color: COLORS[index % COLORS.length]
          }))
          .filter(item => item.value > 0) // Only include non-zero items
          .sort((a, b) => b.value - a.value); // Sort by value desc
        
        setServiceData(serviceChartData.length > 0 ? serviceChartData : [
          { name: 'No Data', value: 100, color: '#E5E7EB' }
        ]);
        
        // Since we don't have satisfaction data yet, generate mock data
        // This would be replaced with actual satisfaction data once available
        setFeedbackData([
          { name: 'Very Satisfied', value: 62, color: '#10B981' },
          { name: 'Satisfied', value: 28, color: '#3B82F6' },
          { name: 'Neutral', value: 7, color: '#F59E0B' },
          { name: 'Unsatisfied', value: 3, color: '#EF4444' }
        ]);
        
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Set default data in case of error
        setServiceData([{ name: 'No Data', value: 100, color: '#E5E7EB' }]);
        setFeedbackData([{ name: 'No Data', value: 100, color: '#E5E7EB' }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Service Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="service">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="service">Service Categories</TabsTrigger>
            <TabsTrigger value="satisfaction">Customer Satisfaction</TabsTrigger>
          </TabsList>
          <TabsContent value="service" className="h-[300px]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    activeShape={renderActiveShape}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          <TabsContent value="satisfaction" className="h-[300px]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    activeShape={renderActiveShape}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
