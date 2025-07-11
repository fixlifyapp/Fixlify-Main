
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobDetails {
  type: string;
  description: string;
}

interface JobDetailsSectionProps {
  jobDetails: JobDetails;
  onTypeClick: () => void;
  onDescriptionClick: () => void;
}

export const JobDetailsSection = ({ 
  jobDetails, 
  onTypeClick, 
  onDescriptionClick 
}: JobDetailsSectionProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Job Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Type */}
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground">Job Type</p>
            <div className="cursor-pointer" onClick={onTypeClick}>
              <Badge className="text-purple-600 bg-purple-50">{jobDetails.type}</Badge>
            </div>
          </div>
          
          {/* Job Description */}
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <div className="cursor-pointer" onClick={onDescriptionClick}>
              <p className="text-gray-700">{jobDetails.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
