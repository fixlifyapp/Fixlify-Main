
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface ReportsChartsProps {
  period: string;
  isLoading?: boolean;
  revenueByMonth?: { month: string; revenue: number; }[];
  jobsByStatus?: { [key: string]: number; };
}

const defaultRevenueData = [
  { name: 'Jan', HVAC: 8500, Plumbing: 4200, Electrical: 3400 },
  { name: 'Feb', HVAC: 7200, Plumbing: 3800, Electrical: 4100 },
  { name: 'Mar', HVAC: 6500, Plumbing: 6200, Electrical: 3900 },
  { name: 'Apr', HVAC: 7800, Plumbing: 5400, Electrical: 4600 },
  { name: 'May', HVAC: 9200, Plumbing: 6800, Electrical: 5100 },
  { name: 'Jun', HVAC: 10500, Plumbing: 7200, Electrical: 6400 },
  { name: 'Jul', HVAC: 12800, Plumbing: 7900, Electrical: 5800 },
];

const defaultJobsData = [
  { name: 'Jan', Completed: 48, Scheduled: 28, Canceled: 5 },
  { name: 'Feb', Completed: 42, Scheduled: 24, Canceled: 4 },
  { name: 'Mar', Completed: 38, Scheduled: 32, Canceled: 3 },
  { name: 'Apr', Completed: 52, Scheduled: 38, Canceled: 6 },
  { name: 'May', Completed: 58, Scheduled: 42, Canceled: 7 },
  { name: 'Jun', Completed: 64, Scheduled: 48, Canceled: 5 },
  { name: 'Jul', Completed: 72, Scheduled: 52, Canceled: 8 },
];

const defaultServiceBreakdownData = [
  { name: 'HVAC', value: 45, color: '#8A4DD5' },
  { name: 'Plumbing', value: 30, color: '#B084F9' },
  { name: 'Electrical', value: 15, color: '#3B82F6' },
  { name: 'Other', value: 10, color: '#E5E7EB' },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 5} dy={8} textAnchor="middle" fill="#333">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#666">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export const ReportsCharts = ({ 
  period, 
  isLoading, 
  revenueByMonth, 
  jobsByStatus 
}: ReportsChartsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Convert revenueByMonth to chart format if available
  const revenueData = revenueByMonth 
    ? revenueByMonth.map(item => ({ name: item.month, Revenue: item.revenue }))
    : defaultRevenueData;

  // Convert jobsByStatus to chart format if available
  const serviceBreakdownData = jobsByStatus
    ? Object.entries(jobsByStatus).map(([name, value], index) => ({
        name,
        value,
        color: [
          '#8A4DD5',
          '#B084F9',
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#E5E7EB'
        ][index % 6]
      }))
    : defaultServiceBreakdownData;

  if (isLoading) {
    return (
      <div className="fixlyfy-card">
        <div className="p-6 border-b border-fixlyfy-border">
          <h2 className="text-lg font-medium">Performance Analytics</h2>
        </div>
        <div className="p-6">
          <Skeleton className="h-[350px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Performance Analytics</h2>
      </div>
      <div className="p-6">
        <Tabs defaultValue="revenue">
          <TabsList className="mb-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="services">Service Breakdown</TabsTrigger>
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
                    formatter={(value) => [`$${value}`, undefined]} 
                    cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} 
                  />
                  <Legend />
                  {revenueByMonth ? (
                    <Bar dataKey="Revenue" fill="#8A4DD5" radius={[4, 4, 0, 0]} />
                  ) : (
                    <>
                      <Bar dataKey="HVAC" fill="#8A4DD5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Plumbing" fill="#B084F9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Electrical" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="jobs">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defaultJobsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} />
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
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="services">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={serviceBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    dataKey="value"
                    onMouseEnter={handlePieEnter}
                  >
                    {serviceBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
