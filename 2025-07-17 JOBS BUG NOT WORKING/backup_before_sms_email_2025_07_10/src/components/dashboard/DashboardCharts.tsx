
import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ReferenceLine
} from 'recharts';

const revenueData = [
  { name: 'Jan', HVAC: 4000, Plumbing: 2400, Electrical: 1400, target: 8500 },
  { name: 'Feb', HVAC: 3000, Plumbing: 1398, Electrical: 2210, target: 8500 },
  { name: 'Mar', HVAC: 2000, Plumbing: 9800, Electrical: 2290, target: 8500 },
  { name: 'Apr', HVAC: 2780, Plumbing: 3908, Electrical: 2000, target: 8500 },
  { name: 'May', HVAC: 1890, Plumbing: 4800, Electrical: 2181, target: 8500 },
  { name: 'Jun', HVAC: 2390, Plumbing: 3800, Electrical: 2500, target: 8500 },
  { name: 'Jul', HVAC: 3490, Plumbing: 4300, Electrical: 2100, target: 8500 },
];

const jobsData = [
  { name: 'Jan', Completed: 40, Scheduled: 24, Canceled: 5, Efficiency: 85 },
  { name: 'Feb', Completed: 30, Scheduled: 18, Canceled: 3, Efficiency: 88 },
  { name: 'Mar', Completed: 20, Scheduled: 38, Canceled: 2, Efficiency: 92 },
  { name: 'Apr', Completed: 27, Scheduled: 39, Canceled: 4, Efficiency: 91 },
  { name: 'May', Completed: 18, Scheduled: 48, Canceled: 6, Efficiency: 89 },
  { name: 'Jun', Completed: 23, Scheduled: 38, Canceled: 3, Efficiency: 94 },
  { name: 'Jul', Completed: 34, Scheduled: 43, Canceled: 4, Efficiency: 92 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-fixlyfy-border rounded shadow-sm">
        <p className="font-bold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Efficiency' ? `${entry.value}%` : entry.name.includes('HVAC') || entry.name.includes('Plumbing') || entry.name.includes('Electrical') ? `$${entry.value}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCharts = () => {
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixlyfy-card">
      <div className="p-6 flex justify-between items-center border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>
      <div className="p-6">
        <Tabs defaultValue="revenue">
          <TabsList className="mb-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} 
                  />
                  <Legend />
                  <ReferenceLine y={8500} stroke="#F59E0B" strokeDasharray="3 3" />
                  <Bar dataKey="HVAC" fill="#8A4DD5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Plumbing" fill="#B084F9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Electrical" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="jobs">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Completed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Scheduled" 
                    stroke="#8A4DD5" 
                    strokeWidth={2}
                    dot={{ fill: '#8A4DD5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Canceled" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Efficiency" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    activeDot={{ r: 6 }}
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
