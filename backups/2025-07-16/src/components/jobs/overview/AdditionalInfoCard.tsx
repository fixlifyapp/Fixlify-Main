
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { JobInfo } from "../context/types";

interface AdditionalInfoCardProps {
  job: JobInfo;
}

export const AdditionalInfoCard = ({ job }: AdditionalInfoCardProps) => {
  // Since all the additional info fields have been removed, this component
  // will only show if there are any remaining additional fields in the future
  const hasAdditionalInfo = false;

  if (!hasAdditionalInfo) return null;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">No additional information available.</p>
      </CardContent>
    </Card>
  );
};
