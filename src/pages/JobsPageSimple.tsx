import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User, MapPin } from "lucide-react";

const JobsPageSimple = () => {
  const sampleJobs = [
    {
      id: 1,
      title: "Kitchen Repair",
      client: "John Smith",
      status: "In Progress",
      date: "2024-01-20",
      location: "123 Main St, City"
    },
    {
      id: 2,
      title: "Bathroom Renovation",
      client: "Jane Doe",
      status: "Scheduled",
      date: "2024-01-22",
      location: "456 Oak Ave, City"
    },
    {
      id: 3,
      title: "HVAC Maintenance",
      client: "Bob Johnson",
      status: "Completed",
      date: "2024-01-18",
      location: "789 Pine St, City"
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Jobs</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{job.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  {job.client}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {job.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default JobsPageSimple;