
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Info, Calendar, User, Wrench, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useJobStatuses, useJobTypes } from "@/hooks/useConfigItems";

interface JobBasicInfoCardProps {
  job: any;
  editable?: boolean;
  onUpdate?: () => void;
}

export const JobBasicInfoCard = ({ job, editable = false, onUpdate }: JobBasicInfoCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get configuration data for styling
  const { items: jobStatuses } = useJobStatuses();
  const { items: jobTypes } = useJobTypes();

  // Get status styling from configuration
  const getStatusBadgeStyle = (status: string) => {
    const statusConfig = jobStatuses?.find(s => s.name.toLowerCase() === status.toLowerCase());
    if (statusConfig?.color) {
      return { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color, borderColor: statusConfig.color };
    }
    
    // Fallback styles
    const statusStyles: Record<string, any> = {
      "completed": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
      "in-progress": { backgroundColor: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" }, 
      "scheduled": { backgroundColor: "#f59e0b20", color: "#f59e0b", borderColor: "#f59e0b" },
      "cancelled": { backgroundColor: "#ef444420", color: "#ef4444", borderColor: "#ef4444" },
      "canceled": { backgroundColor: "#ef444420", color: "#ef4444", borderColor: "#ef4444" }
    };
    
    return statusStyles[status.toLowerCase()] || { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" };
  };

  // Get job type styling from configuration
  const getJobTypeDisplay = (job: any) => {
    if (job.job_type) {
      const jobTypeConfig = jobTypes?.find(jt => jt.name === job.job_type);
      return {
        name: jobTypeConfig?.name || job.job_type,
        color: jobTypeConfig?.color
      };
    }
    if (job.service) {
      return { name: job.service, color: null };
    }
    return { name: "Service Job", color: null };
  };

  const statusStyle = getStatusBadgeStyle(job.status);
  const jobTypeDisplay = getJobTypeDisplay(job);

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={Info}>
            Job Information
          </ModernCardTitle>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Number</h3>
              <p className="font-mono text-base font-medium text-fixlyfy">{job.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <Badge 
                variant="outline"
                style={statusStyle}
                className="font-medium text-base"
              >
                {job.status}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Service Type</h3>
              {jobTypeDisplay.color ? (
                <Badge 
                  variant="outline"
                  style={{ borderColor: jobTypeDisplay.color, color: jobTypeDisplay.color }}
                  className="font-medium text-base"
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  {jobTypeDisplay.name}
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-medium text-base">
                  <Wrench className="h-3 w-3 mr-1" />
                  {jobTypeDisplay.name}
                </Badge>
              )}
            </div>
            
            {job.lead_source && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Lead Source</h3>
                <p className="text-base">{job.lead_source}</p>
              </div>
            )}
            
            {job.date && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Service Date</h3>
                <div className="flex items-center text-base">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {format(new Date(job.date), "EEEE, MMMM do, yyyy")}
                </div>
              </div>
            )}
            
            {job.technician_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned Technician</h3>
                <div className="flex items-center text-base">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  Technician {job.technician_id}
                </div>
              </div>
            )}
          </div>
          
          {job.address && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Service Address</h3>
              <div className="flex items-start text-base">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <p className="leading-relaxed">{job.address}</p>
              </div>
            </div>
          )}
          
          {job.description && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-base leading-relaxed">{job.description}</p>
            </div>
          )}
          
          {job.revenue && job.revenue > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
              <p className="text-lg font-semibold text-green-600">${job.revenue.toFixed(2)}</p>
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
