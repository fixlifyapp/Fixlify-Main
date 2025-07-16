
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, User } from "lucide-react";
import { JobInfo } from "../context/types";

interface ClientInfoCardProps {
  job: JobInfo;
}

export const ClientInfoCard = ({ job }: ClientInfoCardProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Client Name</p>
            <p className="font-medium">{job.client}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-fixlyfy" />
              <p>{job.phone || "Not provided"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-fixlyfy" />
              <p>{job.email || "Not provided"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p>{job.address}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
