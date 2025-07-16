
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  UserCheck,
  Trophy,
  Zap
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  currentJobs: number;
  completedJobs: number;
  revenue: number;
  rating: number;
  efficiency: number;
}

interface TeamCollaboration {
  activeProjects: number;
  sharedDocuments: number;
  teamMessages: number;
  meetingsToday: number;
}

export const TeamCollaborationDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Technician',
      avatar: '/placeholder.svg',
      status: 'online',
      currentJobs: 3,
      completedJobs: 28,
      revenue: 15750,
      rating: 4.9,
      efficiency: 92
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'HVAC Specialist',
      avatar: '/placeholder.svg',
      status: 'online',
      currentJobs: 2,
      completedJobs: 22,
      revenue: 12300,
      rating: 4.7,
      efficiency: 88
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Plumbing Expert',
      avatar: '/placeholder.svg',
      status: 'away',
      currentJobs: 1,
      completedJobs: 25,
      revenue: 14200,
      rating: 4.8,
      efficiency: 90
    }
  ];

  const collaborationData: TeamCollaboration = {
    activeProjects: 12,
    sharedDocuments: 45,
    teamMessages: 127,
    meetingsToday: 3
  };

  const performanceData = [
    { month: 'Jan', team: 85, individual: 82, target: 90 },
    { month: 'Feb', team: 88, individual: 85, target: 90 },
    { month: 'Mar', team: 92, individual: 89, target: 90 },
    { month: 'Apr', team: 87, individual: 84, target: 90 },
    { month: 'May', team: 94, individual: 91, target: 90 },
    { month: 'Jun', team: 96, individual: 93, target: 90 }
  ];

  const workloadData = [
    { name: 'Sarah J.', workload: 85, capacity: 100 },
    { name: 'Mike C.', workload: 72, capacity: 100 },
    { name: 'Emily R.', workload: 68, capacity: 100 },
    { name: 'David L.', workload: 90, capacity: 100 },
    { name: 'Lisa W.', workload: 45, capacity: 100 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Team Collaboration Dashboard
          </h2>
          <p className="text-gray-600">Real-time team performance and collaboration insights</p>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Collaboration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">{collaborationData.activeProjects}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Messages</p>
                <p className="text-2xl font-bold">{collaborationData.teamMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shared Documents</p>
                <p className="text-2xl font-bold">{collaborationData.sharedDocuments}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meetings Today</p>
                <p className="text-2xl font-bold">{collaborationData.meetingsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="workload">Workload Management</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration Tools</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Team Members Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{member.currentJobs}</p>
                        <p className="text-gray-600">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{member.completedJobs}</p>
                        <p className="text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">${member.revenue.toLocaleString()}</p>
                        <p className="text-gray-600">Revenue</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="font-medium">{member.rating}</span>
                        </div>
                        <p className="text-gray-600">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{member.efficiency}%</p>
                        <p className="text-gray-600">Efficiency</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="team" stroke="#3b82f6" strokeWidth={2} name="Team Performance" />
                  <Line type="monotone" dataKey="individual" stroke="#10b981" strokeWidth={2} name="Avg Individual" />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workload Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workloadData.map((member, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getWorkloadColor(member.workload)}`}>
                          {member.workload}%
                        </span>
                        {member.workload >= 90 && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {member.workload < 50 && <Clock className="h-4 w-4 text-blue-600" />}
                      </div>
                    </div>
                    <Progress value={member.workload} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacity Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">David L. - Overloaded</p>
                      <p className="text-sm text-red-600">90% capacity - Consider redistributing work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Lisa W. - Available</p>
                      <p className="text-sm text-blue-600">45% capacity - Ready for new assignments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Redistribute 2 jobs from David to Lisa</p>
                      <p className="text-sm text-gray-600">Balance workload and improve efficiency</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Schedule team training session</p>
                      <p className="text-sm text-gray-600">Improve overall team performance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Team Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Standup</p>
                      <p className="text-sm text-gray-600">9:00 AM - Conference Room A</p>
                    </div>
                    <Badge variant="outline">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Project Review</p>
                      <p className="text-sm text-gray-600">2:00 PM - Virtual Meeting</p>
                    </div>
                    <Badge variant="outline">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Training Session</p>
                      <p className="text-sm text-gray-600">Friday 10:00 AM</p>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserCheck className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm">Sarah completed job #1234</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm">Mike shared update in #general</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 text-yellow-600 mt-1" />
                    <div>
                      <p className="text-sm">Emily achieved weekly target</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="team" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Team Productivity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-20" />
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="w-20" />
                      <span className="font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Goal Achievement</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20" />
                      <span className="font-medium">91%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Team Collaboration</span>
                    <div className="flex items-center gap-2">
                      <Progress value={89} className="w-20" />
                      <span className="font-medium">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
