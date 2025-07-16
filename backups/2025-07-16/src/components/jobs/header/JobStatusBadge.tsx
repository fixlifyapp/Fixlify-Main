
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Loader2, MoreHorizontal, XCircle, Calendar, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useJobStatuses } from "@/hooks/useConfigItems";

interface JobStatusBadgeProps {
  status: string;
  jobId?: string;
  onStatusChange: (newStatus: string) => void;
  variant?: "compact" | "full";
  className?: string;
}

export const JobStatusBadge = ({ 
  status, 
  jobId, 
  onStatusChange, 
  variant = "full",
  className 
}: JobStatusBadgeProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { items: jobStatuses } = useJobStatuses();

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "completed":
        return <Check size={16} className="mr-1" />;
      case "scheduled":
        return <Calendar size={16} className="mr-1" />;
      case "in-progress":
      case "in_progress":
        return <Loader2 size={16} className="mr-1 animate-spin" />;
      case "canceled":
      case "cancelled":
        return <XCircle size={16} className="mr-1" />;
      case "ask-review":
        return <AlertTriangle size={16} className="mr-1" />;
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    // Find the status in our database statuses first
    const dbStatus = jobStatuses.find(s => s.name === statusValue);
    if (dbStatus && dbStatus.color) {
      return `bg-${dbStatus.color}/10 text-${dbStatus.color} border-${dbStatus.color}/20`;
    }
    
    // Fallback to default colors
    switch (statusValue) {
      case "open":
      case "scheduled":
        return "bg-fixlyfy-bg-interface text-fixlyfy-primary border-fixlyfy-primary";
      case "in-progress":
      case "in_progress":
        return "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20";
      case "completed":
        return "bg-fixlyfy-success/10 text-fixlyfy-success border-fixlyfy-success/20";
      case "canceled":
      case "cancelled":
        return "bg-fixlyfy-error/10 text-fixlyfy-error border-fixlyfy-error/20";
      case "ask-review":
        return "bg-fixlyfy-secondary/10 text-fixlyfy-secondary border-fixlyfy-secondary/20";
      default:
        return "bg-fixlyfy-bg-interface text-fixlyfy-text-secondary border-fixlyfy-text-secondary/20";
    }
  };

  const getStatusLabel = (statusValue: string) => {
    // Find the status in our database statuses first
    const dbStatus = jobStatuses.find(s => s.name === statusValue);
    if (dbStatus) {
      return dbStatus.name.charAt(0).toUpperCase() + dbStatus.name.slice(1);
    }
    
    // Fallback to default labels
    switch (statusValue) {
      case "open":
        return "Open";
      case "scheduled":
        return "Scheduled";
      case "in-progress":
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "canceled":
      case "cancelled":
        return "Cancelled";
      case "ask-review":
        return "Ask Review";
      default:
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (status === newStatus || isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Call the onStatusChange callback immediately for optimistic update
      await onStatusChange(newStatus);
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-7 border font-medium transition-all duration-200",
            getStatusColor(status),
            isUpdating && "opacity-70",
            className
          )}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            getStatusIcon(status)
          )}
          <span>
            {getStatusLabel(status)}
          </span>
          {variant === "full" && <MoreHorizontal size={14} className="ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Job Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {jobStatuses
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map((statusOption) => (
            <DropdownMenuItem 
              key={statusOption.id}
              className={status === statusOption.name ? "bg-fixlyfy/10" : ""} 
              onClick={() => handleStatusChange(statusOption.name)}
              disabled={isUpdating}
            >
              {getStatusIcon(statusOption.name)}
              <span className="ml-2">{getStatusLabel(statusOption.name)}</span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
