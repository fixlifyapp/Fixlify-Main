
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  Star, 
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Target
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface PerformanceMetricsProps {
  timeframe: string;
}

export const PerformanceMetrics = ({ timeframe }: PerformanceMetricsProps) => {
  const performanceData = [
    { week: 'Week 1', completion: 94, satisfaction: 4.7, response: 22, efficiency: 89 },
    { week: 'Week 2', completion: 96, satisfaction: 4.8, response: 18, efficiency: 92 },
    { week: 'Week 3', completion: 92, satisfaction: 4.6, response: 25, efficiency: 87 },
    { week: 'Week 4', completion: 95, satisfaction: 4.9, response: 16, efficiency: 94 }
  ];

  const kpiRadarData = [
    { metric: 'Completion Rate', value: 94.5, fullMark: 100 },
    { metric: 'Customer Satisfaction', value: 96, fullMark: 100 },
    { metric: 'Response Time', value: 85, fullMark: 100 },
    { metric: 'First-Time Fix', value: 87, fullMark: 100 },
    { metric: 'Team Efficiency', value: 91, fullMark: 100 },
    { metric: 'Quality Score', value: 93, fullMark: 100 }
  ];

  const metrics = [
    {
      title: "Job Completion Rate",
      value: 94.5,
      target: 95,
      trend: 2.1,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Average Response Time",
      value: 18,
      target: 20,
      trend: -15.2,
      icon: Clock,
      color: "blue",
      suffix: " min"
    },
    {
      title: "Customer Satisfaction",
      value: 4.8,
      target: 4.5,
      trend: 4.3,
      icon: Star,
      color: "yellow",
      suffix: "/5"
    },
    {
      title: "First-Time Fix Rate",
      value: 87,
      target: 85,
      trend: 5.2,
      icon: Target,
      color: "purple",
      suffix: "%"
    }
  ];

  const teamEfficiency = [
    { name: "Sarah Johnson", jobs: 45, completion: 98, satisfaction: 4.9, efficiency: 95 },
    { name: "Mike Chen", jobs: 38, completion: 92, satisfaction: 4.7, efficiency: 89 },
    { name: "Emily Rodriguez", jobs: 41, completion: 96, satisfaction: 4.8, efficiency: 93 },
    { name: "David Lee", jobs: 35, completion: 89, satisfaction: 4.6, efficiency: 87 },
    { name: "Lisa Wang", jobs: 42, completion: 95, satisfaction: 4.9, efficiency: 94 }
  ];

  const MetricCard = ({ metric }: { metric: any }) => {
    const getProgressColor = () => {
      if (metric.color === 'green') return 'bg-green-500';
      if (metric.color === 'blue') return 'bg-blue-500';
      if (metric.color === 'yellow') return 'bg-yellow-500';
      if (metric.color === 'purple') return 'bg-purple-500';
      return 'bg-gray-500';
    };

    const isOnTarget = metric.title === "Average Response Time" 
      ? metric.value <= metric.target 
      : metric.value >= metric.target;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
            <Badge variant={isOnTarget ? "default" : "destructive"}>
              {isOnTarget ? "On Target" : "Below Target"}
            </Badge>
          </div>
          
          <h3 className="font-medium text-sm text-muted-foreground mb-2">{metric.title}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold">{metric.value}{metric.suffix}</span>
            <span className="text-sm text-muted-foreground">/ {metric.target}{metric.suffix}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progress to Target</span>
              <span>{Math.min(100, (metric.value / metric.target) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(100, (metric.value / metric.target) * 100)} 
              className="h-2"
            />
          </div>
          
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className={`h-3 w-3 ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(metric.trend)}% vs last period
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-xl font-semibold">Performance Metrics</h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#10b981" 
                  name="Completion Rate (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#3b82f6" 
                  name="Satisfaction (1-5)"
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#f59e0b" 
                  name="Efficiency (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={kpiRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Team Member</th>
                  <th className="text-center p-2">Jobs Completed</th>
                  <th className="text-center p-2">Completion Rate</th>
                  <th className="text-center p-2">Satisfaction</th>
                  <th className="text-center p-2">Efficiency Score</th>
                  <th className="text-center p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {teamEfficiency.map((member, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-2">{member.jobs}</td>
                    <td className="text-center p-2">{member.completion}%</td>
                    <td className="text-center p-2">{member.satisfaction}/5</td>
                    <td className="text-center p-2">{member.efficiency}%</td>
                    <td className="text-center p-2">
                      <Badge 
                        variant={member.efficiency >= 90 ? "default" : member.efficiency >= 85 ? "secondary" : "destructive"}
                      >
                        {member.efficiency >= 90 ? "Excellent" : member.efficiency >= 85 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Sarah Johnson</span>
                <Badge className="bg-green-100 text-green-800">98% Completion</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Lisa Wang</span>
                <Badge className="bg-blue-100 text-blue-800">4.9 Satisfaction</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Emily Rodriguez</span>
                <Badge className="bg-purple-100 text-purple-800">93% Efficiency</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-900">Response Time</p>
                <p className="text-sm text-yellow-700">Average 18 min, target is under 15 min</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Weekend Performance</p>
                <p className="text-sm text-orange-700">Lower efficiency on weekends</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-900">Training Needed</p>
                <p className="text-sm text-red-700">2 technicians below 85% efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
