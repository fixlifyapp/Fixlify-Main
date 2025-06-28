
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

export const UpcomingJobs = () => {
  const upcomingJobs = [
    {
      id: 1,
      client: "Alice Wilson",
      service: "HVAC Maintenance",
      time: "09:00 AM",
      date: "Tomorrow",
      location: "Uptown"
    },
    {
      id: 2,
      client: "Bob Davis",
      service: "Plumbing Check",
      time: "02:00 PM",
      date: "Jan 17",
      location: "Downtown"
    },
    {
      id: 3,
      client: "Carol White",
      service: "Electrical Install",
      time: "10:00 AM",
      date: "Jan 18",
      location: "Suburbs"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium mb-1">{job.client}</p>
                <p className="text-sm text-gray-600">{job.service}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{job.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{job.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
