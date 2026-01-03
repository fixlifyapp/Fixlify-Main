import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HighlightText } from "@/components/ui/highlight-text";
import {
  ExternalLink,
  Edit,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  Link
} from "lucide-react";
import { format } from "date-fns";
import { Job } from "@/types/job";
import { useJobStatuses, useJobTypes, useTags } from "@/hooks/useConfigItems";
import { usePortalLink } from "@/hooks/usePortalLink";
import { JobsTable } from "./JobsTable";

interface JobsListProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  onRefresh?: () => void;
  searchTerm?: string;
}

export const JobsList = ({
  jobs,
  isGridView = false,
  selectedJobs,
  onSelectJob,
  onSelectAllJobs,
  onRefresh,
  searchTerm = ""
}: JobsListProps) => {
  const navigate = useNavigate();
  const { copyPortalLink, isGenerating } = usePortalLink();
  
  // Get configuration data for styling and display
  const { items: jobStatuses } = useJobStatuses();
  const { items: jobTypes } = useJobTypes();
  const { items: tagItems } = useTags();

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };

  const handlePortalLink = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (job.client_id) {
      await copyPortalLink(job.client_id);
    }
  };

  const areAllJobsSelected = jobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id));

  // Get status styling from configuration
  const getStatusBadgeStyle = (status: string) => {
    const statusConfig = jobStatuses?.find(s => s.name === status);
    if (statusConfig?.color) {
      return { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color, borderColor: statusConfig.color };
    }
    
    // Fallback styles - using proper capitalized status names
    const statusStyles: Record<string, any> = {
      "Completed": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
      "In Progress": { backgroundColor: "#f59e0b20", color: "#f59e0b", borderColor: "#f59e0b" }, 
      "New": { backgroundColor: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" },
      "Cancelled": { backgroundColor: "#ef444420", color: "#ef4444", borderColor: "#ef4444" },
      "On Hold": { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" }
    };
    
    return statusStyles[status] || { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" };
  };

  // Get job type styling from configuration
  const getJobTypeDisplay = (job: Job) => {
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

  // Resolve tag UUIDs to tag names and colors
  const resolveJobTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return [];
    
    return tags.map(tag => {
      // If it's a UUID, find the tag by ID
      if (tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: null };
      }
      // If it's a name, find the tag by name
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: null };
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'New':
        return <Calendar className="h-4 w-4" />;
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4" />;
      case 'On Hold':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (job: Job) => {
    if (job.schedule_start) {
      return format(new Date(job.schedule_start), "HH:mm");
    }
    if (job.date) {
      return format(new Date(job.date), "HH:mm");
    }
    return "TBD";
  };

  if (jobs.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-muted-foreground">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p>No jobs match your current filters.</p>
          {onRefresh && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onRefresh}
            >
              Refresh Jobs
            </Button>
          )}
        </div>
      </ModernCard>
    );
  }

  if (isGridView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={areAllJobsSelected}
              onCheckedChange={onSelectAllJobs}
            />
            <span className="text-sm text-muted-foreground">
              Select all ({jobs.length})
            </span>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const statusStyle = getStatusBadgeStyle(job.status);
            const jobTypeDisplay = getJobTypeDisplay(job);
            const statusIcon = getStatusIcon(job.status);
            const resolvedTags = resolveJobTags(job.tags || []);
            
            return (
              <div key={job.id} className="cursor-pointer" onClick={() => handleJobClick(job.id)}>
                <ModernCard 
                  variant="elevated" 
                  className="hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={(checked) => onSelectJob(job.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-mono text-sm font-medium text-fixlyfy">{job.id}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handlePortalLink(e, job)}
                          disabled={!job.client_id || isGenerating}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy portal link"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditJob(e, job.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        <HighlightText text={job.client?.name || 'Unknown Client'} highlight={searchTerm} />
                      </h3>
                      <p className="text-sm text-muted-foreground">{formatTime(job)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1"
                        style={statusStyle}
                      >
                        {statusIcon}
                        {job.status}
                      </Badge>
                      
                      {jobTypeDisplay.color ? (
                        <Badge 
                          variant="outline"
                          style={{ borderColor: jobTypeDisplay.color, color: jobTypeDisplay.color }}
                        >
                          {jobTypeDisplay.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {jobTypeDisplay.name}
                        </Badge>
                      )}
                    </div>
                    
                    {job.address && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          <HighlightText text={job.address} highlight={searchTerm} />
                        </span>
                      </div>
                    )}
                    
                    {job.revenue && job.revenue > 0 && (
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${job.revenue.toFixed(2)}
                      </div>
                    )}
                    
                    {resolvedTags && resolvedTags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {resolvedTags.slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs"
                            style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {resolvedTags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{resolvedTags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </ModernCard>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view - table
  return (
    <JobsTable
      jobs={jobs}
      selectedJobs={selectedJobs}
      onSelectJob={onSelectJob}
      onSelectAllJobs={onSelectAllJobs}
    />
  );
};
