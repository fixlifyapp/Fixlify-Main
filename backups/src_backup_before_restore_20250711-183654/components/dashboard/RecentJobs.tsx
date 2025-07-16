
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

export const RecentJobs = () => {
  const recentJobs = [
    {
      id: 1,
      client: "John Smith",
      service: "HVAC Repair",
      status: "completed",
      date: "2024-01-15",
      location: "Downtown"
    },
    {
      id: 2,
      client: "Sarah Johnson",
      service: "Plumbing",
      status: "in-progress",
      date: "2024-01-15",
      location: "Suburbs"
    },
    {
      id: 3,
      client: "Mike Brown",
      service: "Electrical",
      status: "scheduled",
      date: "2024-01-16",
      location: "City Center"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{job.client}</p>
                <p className="text-sm text-gray-600">{job.service}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{job.date}</span>
                  <MapPin className="h-3 w-3 ml-2" />
                  <span>{job.location}</span>
                </div>
              </div>
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
