
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  DollarSign, 
  Star,
  TrendingUp,
  Award,
  Calendar,
  Target
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface TeamPerformanceProps {
  timeframe: string;
}

export const TeamPerformance = ({ timeframe }: TeamPerformanceProps) => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Technician",
      avatar: "SJ",
      jobsCompleted: 45,
      revenue: 18750,
      satisfaction: 4.9,
      efficiency: 95,
      hoursWorked: 160,
      onTimeRate: 98,
      skills: ["HVAC", "Electrical", "Plumbing"]
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "HVAC Specialist",
      avatar: "MC",
      jobsCompleted: 38,
      revenue: 15200,
      satisfaction: 4.7,
      efficiency: 89,
      hoursWorked: 155,
      onTimeRate: 92,
      skills: ["HVAC", "Maintenance"]
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Plumbing Expert",
      avatar: "ER",
      jobsCompleted: 41,
      revenue: 16450,
      satisfaction: 4.8,
      efficiency: 93,
      hoursWorked: 158,
      onTimeRate: 96,
      skills: ["Plumbing", "General Repair"]
    },
    {
      id: 4,
      name: "David Lee",
      role: "Electrical Technician",
      avatar: "DL",
      jobsCompleted: 35,
      revenue: 14000,
      satisfaction: 4.6,
      efficiency: 87,
      hoursWorked: 152,
      onTimeRate: 89,
      skills: ["Electrical", "Safety"]
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Junior Technician",
      avatar: "LW",
      jobsCompleted: 42,
      revenue: 16800,
      satisfaction: 4.9,
      efficiency: 94,
      hoursWorked: 162,
      onTimeRate: 94,
      skills: ["General Maintenance", "HVAC"]
    }
  ];

  const weeklyPerformance = [
    { week: 'W1', sarah: 12, mike: 9, emily: 10, david: 8, lisa: 11 },
    { week: 'W2', sarah: 11, mike: 10, emily: 11, david: 9, lisa: 10 },
    { week: 'W3', sarah: 10, mike: 8, emily: 9, david: 7, lisa: 9 },
    { week: 'W4', sarah: 12, mike: 11, emily: 11, david: 11, lisa: 12 }
  ];

  const skillDistribution = [
    { skill: 'HVAC', count: 3, color: '#3b82f6' },
    { skill: 'Plumbing', count: 2, color: '#10b981' },
    { skill: 'Electrical', count: 2, color: '#f59e0b' },
    { skill: 'Maintenance', count: 3, color: '#ef4444' }
  ];

  const performanceMetrics = [
    { metric: 'Jobs/Week', sarah: 11.25, mike: 9.5, emily: 10.25, david: 8.75, lisa: 10.5 },
    { metric: 'Revenue/Hour', sarah: 117, mike: 98, emily: 104, david: 92, lisa: 104 },
    { metric: 'Satisfaction', sarah: 4.9, mike: 4.7, emily: 4.8, david: 4.6, lisa: 4.9 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-xl font-semibold">Team Performance Analytics</h2>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Team Members</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-green-600">All active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Jobs/Member</p>
                <p className="text-2xl font-bold">40.2</p>
                <p className="text-xs text-green-600">+12% vs last month</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Revenue</p>
                <p className="text-2xl font-bold">$81.2K</p>
                <p className="text-xs text-green-600">+15% growth</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-green-600">Excellent rating</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarFallback>{member.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Jobs Completed</p>
                  <p className="text-lg font-bold">{member.jobsCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold">${member.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Satisfaction</p>
                  <p className="text-lg font-bold">{member.satisfaction}/5</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                  <p className="text-lg font-bold">{member.efficiency}%</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span>On-Time Rate</span>
                  <span>{member.onTimeRate}%</span>
                </div>
                <Progress value={member.onTimeRate} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sarah" stroke="#3b82f6" name="Sarah" />
                <Line type="monotone" dataKey="mike" stroke="#10b981" name="Mike" />
                <Line type="monotone" dataKey="emily" stroke="#f59e0b" name="Emily" />
                <Line type="monotone" dataKey="david" stroke="#ef4444" name="David" />
                <Line type="monotone" dataKey="lisa" stroke="#8b5cf6" name="Lisa" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ skill, count }) => `${skill}: ${count}`}
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Team Member</th>
                  <th className="text-center p-3">Jobs</th>
                  <th className="text-center p-3">Revenue</th>
                  <th className="text-center p-3">Hours</th>
                  <th className="text-center p-3">$/Hour</th>
                  <th className="text-center p-3">Satisfaction</th>
                  <th className="text-center p-3">Efficiency</th>
                  <th className="text-center p-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">{member.jobsCompleted}</td>
                    <td className="text-center p-3">${member.revenue.toLocaleString()}</td>
                    <td className="text-center p-3">{member.hoursWorked}</td>
                    <td className="text-center p-3">${Math.round(member.revenue / member.hoursWorked)}</td>
                    <td className="text-center p-3">{member.satisfaction}/5</td>
                    <td className="text-center p-3">{member.efficiency}%</td>
                    <td className="text-center p-3">
                      <Badge 
                        variant={member.efficiency >= 90 ? "default" : member.efficiency >= 85 ? "secondary" : "destructive"}
                      >
                        {member.efficiency >= 90 ? "Excellent" : member.efficiency >= 85 ? "Good" : "Improvement Needed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Team Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Highest Customer Satisfaction</span>
                <Badge className="bg-yellow-100 text-yellow-800">Sarah & Lisa - 4.9/5</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Most Jobs Completed</span>
                <Badge className="bg-green-100 text-green-800">Sarah - 45 jobs</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Best On-Time Rate</span>
                <Badge className="bg-blue-100 text-blue-800">Sarah - 98%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Development Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Efficiency Improvement</p>
                <p className="text-sm text-orange-700">David could benefit from additional training</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">Cross-Training Opportunity</p>
                <p className="text-sm text-purple-700">Lisa ready for electrical certification</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Leadership Development</p>
                <p className="text-sm text-blue-700">Sarah shows potential for team lead role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
