
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicianData {
  name: string;
  jobsCompleted: number;
  revenue: number;
  rating: number;
}

interface ReportsTechniciansProps {
  period: string;
  isLoading?: boolean;
  technicianPerformance?: TechnicianData[];
}

// Mock data for technician performance
const defaultTechnicians = [
  {
    id: 1,
    name: "Michael Rodriguez",
    avatar: "/avatars/michael.jpg",
    completedJobs: 32,
    avgRating: 4.9,
    efficiency: 94,
    status: "active"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    avatar: "/avatars/sarah.jpg",
    completedJobs: 27,
    avgRating: 4.8,
    efficiency: 91,
    status: "active"
  },
  {
    id: 3,
    name: "David Chen",
    avatar: "/avatars/david.jpg",
    completedJobs: 24,
    avgRating: 4.7,
    efficiency: 89,
    status: "active"
  },
  {
    id: 4,
    name: "Lisa Williams",
    avatar: "/avatars/lisa.jpg",
    completedJobs: 21,
    avgRating: 4.5,
    efficiency: 82,
    status: "away"
  },
  {
    id: 5,
    name: "James Taylor",
    avatar: "/avatars/james.jpg",
    completedJobs: 18,
    avgRating: 4.3,
    efficiency: 78,
    status: "inactive"
  }
];

export const ReportsTechnicians = ({ period, isLoading, technicianPerformance }: ReportsTechniciansProps) => {
  const formatTechnicianData = () => {
    if (!technicianPerformance) return defaultTechnicians;
    
    return technicianPerformance.map((tech, index) => ({
      id: index + 1,
      name: tech.name,
      avatar: `/avatars/tech${index + 1}.jpg`,
      completedJobs: tech.jobsCompleted,
      avgRating: tech.rating,
      efficiency: Math.min(Math.round(tech.revenue / 100), 100), // Simple calculation for efficiency
      status: "active"
    }));
  };

  const technicians = formatTechnicianData();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>
            {period === 'week' && 'Performance for this week'}
            {period === 'month' && 'Performance for this month'}
            {period === 'quarter' && 'Performance for this quarter'}
            {period === 'year' && 'Performance for this year'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>
          {period === 'week' && 'Performance for this week'}
          {period === 'month' && 'Performance for this month'}
          {period === 'quarter' && 'Performance for this quarter'}
          {period === 'year' && 'Performance for this year'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="efficiency" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="efficiency" className="mt-0">
            <div className="space-y-4">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={tech.avatar} alt={tech.name} />
                    <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium leading-none">{tech.name}</p>
                      <p className="text-sm font-medium">{tech.efficiency}%</p>
                    </div>
                    <Progress 
                      value={tech.efficiency} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="rating" className="mt-0">
            <div className="space-y-4">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={tech.avatar} alt={tech.name} />
                    <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium leading-none">{tech.name}</p>
                      <p className="text-sm font-medium">★ {tech.avgRating}</p>
                    </div>
                    <Progress value={tech.avgRating * 20} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="jobs" className="mt-0">
            <div className="space-y-4">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={tech.avatar} alt={tech.name} />
                    <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium leading-none">{tech.name}</p>
                      <p className="text-sm font-medium">{tech.completedJobs} jobs</p>
                    </div>
                    <Progress value={(tech.completedJobs / 35) * 100} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
