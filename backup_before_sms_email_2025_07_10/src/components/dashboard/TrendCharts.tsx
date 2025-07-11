import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { TimePeriod } from "@/pages/Dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { Loader2 } from "lucide-react";

interface TrendChartsProps {
  timePeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
  isRefreshing?: boolean;
}

// Mock data for the charts - in a real application, this would come from your database
const revenueData = [
  { name: 'Week 1', HVAC: 4000, Plumbing: 2400, Electrical: 1400, target: 8500 },
  { name: 'Week 2', HVAC: 3000, Plumbing: 1398, Electrical: 2210, target: 8500 },
  { name: 'Week 3', HVAC: 2000, Plumbing: 9800, Electrical: 2290, target: 8500 },
  { name: 'Week 4', HVAC: 2780, Plumbing: 3908, Electrical: 2000, target: 8500 },
];

const jobStatusData = [
  { name: 'Week 1', Scheduled: 14, 'In Progress': 8, Completed: 20 },
  { name: 'Week 2', Scheduled: 12, 'In Progress': 10, Completed: 22 },
  { name: 'Week 3', Scheduled: 15, 'In Progress': 7, Completed: 25 },
  { name: 'Week 4', Scheduled: 16, 'In Progress': 9, Completed: 28 },
];

const conversionData = [
  { name: 'Estimate Sent', value: 100 },
  { name: 'Viewed', value: 82 },
  { name: 'Approved', value: 65 },
  { name: 'Invoiced', value: 60 },
  { name: 'Paid', value: 55 },
];

const technicianData = [
  { name: 'John D.', jobs: 24, value: 12500 },
  { name: 'Sarah M.', jobs: 18, value: 10200 },
  { name: 'Robert K.', jobs: 16, value: 8700 },
  { name: 'Emily L.', jobs: 14, value: 7500 },
  { name: 'Michael P.', jobs: 12, value: 6300 },
];

const COLORS = ['#8A4DD5', '#B084F9', '#3B82F6', '#10B981', '#F59E0B'];

export const TrendCharts = ({ timePeriod, dateRange, isRefreshing = false }: TrendChartsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [technicianFilter, setTechnicianFilter] = useState('jobs');
  const [serviceFilter, setServiceFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading data based on time period
    setIsLoading(true);
    
    // In a real application, this would fetch data from your API based on the time period
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [timePeriod, dateRange, user, isRefreshing]);

  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (name === 'target') return [`Target: $${value}`, name];
    return [`$${value.toLocaleString()}`, name];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Trend Analytics</CardTitle>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            {isLoading || isRefreshing ? (
              <Skeleton className="h-9 w-[120px]" />
            ) : (
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="jobs">Jobs by Status</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="technicians">Technician Performance</TabsTrigger>
          </TabsList>
          
          {isLoading || isRefreshing ? (
            <div className="h-[350px] w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
            </div>
          ) : (
            <>
              <TabsContent value="revenue">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `$${value}`} 
                      />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <ReferenceLine y={8500} stroke="#F59E0B" strokeDasharray="3 3" />
                      <Line 
                        type="monotone" 
                        dataKey="HVAC" 
                        stroke="#8A4DD5" 
                        strokeWidth={2}
                        dot={{ fill: '#8A4DD5', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Plumbing" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Electrical" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="jobs">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Scheduled" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="In Progress" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Completed" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="conversion">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value} units`, 'Count']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8A4DD5" 
                        label={{ position: 'right', formatter: (val: any) => `${val}%` }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="technicians">
                <div className="flex justify-end mb-4">
                  <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobs">By Jobs Count</SelectItem>
                      <SelectItem value="value">By Job Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={technicianData} 
                      layout={technicianFilter === 'jobs' ? 'vertical' : undefined}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        horizontal={technicianFilter === 'jobs' ? false : true} 
                        vertical={technicianFilter === 'jobs' ? true : false} 
                      />
                      {technicianFilter === 'jobs' ? (
                        <>
                          <XAxis type="number" axisLine={false} tickLine={false} />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                          />
                        </>
                      ) : (
                        <>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `$${value}`} 
                          />
                        </>
                      )}
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (name === 'jobs') return [`${value} jobs`, 'Jobs Completed'];
                          return [`$${value.toLocaleString()}`, 'Revenue'];
                        }}
                      />
                      <Bar 
                        dataKey={technicianFilter} 
                        fill="#8A4DD5" 
                        radius={[4, 4, 0, 0]} 
                        label={technicianFilter === 'jobs' ? { position: 'right' } : undefined} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
