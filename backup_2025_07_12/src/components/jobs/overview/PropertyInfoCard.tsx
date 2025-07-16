
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Calendar } from "lucide-react";
import { JobOverview } from "@/hooks/useJobOverview";

interface PropertyInfoCardProps {
  overview: JobOverview;
}

export const PropertyInfoCard = ({ overview }: PropertyInfoCardProps) => {
  const hasPropertyInfo = overview.property_type || overview.property_age || 
                         overview.property_size || overview.previous_service_date;

  if (!hasPropertyInfo) return null;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview.property_type && (
            <div>
              <p className="text-sm text-muted-foreground">Property Type</p>
              <p className="font-medium">{overview.property_type}</p>
            </div>
          )}
          {overview.property_age && (
            <div>
              <p className="text-sm text-muted-foreground">Property Age</p>
              <p className="font-medium">{overview.property_age}</p>
            </div>
          )}
          {overview.property_size && (
            <div>
              <p className="text-sm text-muted-foreground">Property Size</p>
              <p className="font-medium">{overview.property_size}</p>
            </div>
          )}
          {overview.previous_service_date && (
            <div>
              <p className="text-sm text-muted-foreground">Previous Service</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(overview.previous_service_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
