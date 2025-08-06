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
  const { items: jobStatuses, isLoading } = useJobStatuses();

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue.toLowerCase()) {
      case "completed":
        return <Check size={16} className="mr-1" />;
      case "new":
      case "scheduled":
        return <Calendar size={16} className="mr-1" />;
      case "in progress":
        return <Loader2 size={16} className="mr-1 animate-spin" />;
      case "cancelled":
      case "canceled":
        return <XCircle size={16} className="mr-1" />;
      case "on hold":
        return <AlertTriangle size={16} className="mr-1" />;
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    // Find the status in our database statuses first
    const dbStatus = jobStatuses.find(s => s.name.toLowerCase() === statusValue.toLowerCase());
    if (dbStatus && dbStatus.color) {
      // Convert hex color to Tailwind classes
      switch (dbStatus.color) {
        case "#3b82f6": // Blue
          return "bg-blue-50 text-blue-700 border-blue-200";
        case "#f59e0b": // Amber
          return "bg-amber-50 text-amber-700 border-amber-200";
        case "#10b981": // Green
          return "bg-green-50 text-green-700 border-green-200";
        case "#ef4444": // Red
          return "bg-red-50 text-red-700 border-red-200";
        case "#6b7280": // Gray
          return "bg-gray-50 text-gray-700 border-gray-200";
        default:
          return "bg-fixlyfy-bg-interface text-fixlyfy-primary border-fixlyfy-primary";
      }
    }
    
    // Fallback to default colors based on status name
    switch (statusValue.toLowerCase()) {
      case "new":
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";
      case "on hold":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-fixlyfy-bg-interface text-fixlyfy-text-secondary border-fixlyfy-text-secondary/20";
    }
  };

  const getStatusLabel = (statusValue: string) => {
    // Return status in uppercase
    return statusValue.toUpperCase();
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log('🚀 JobStatusBadge: handleStatusChange called', {
      currentStatus: status,
      newStatus,
      jobId,
      isUpdating
    });
    
    // Normalize status values for comparison
    const normalizedCurrent = status.toLowerCase().replace(/[\s_-]/g, '');
    const normalizedNew = newStatus.toLowerCase().replace(/[\s_-]/g, '');
    
    console.log('🔍 JobStatusBadge: Normalized comparison', {
      normalizedCurrent,
      normalizedNew,
      areEqual: normalizedCurrent === normalizedNew
    });
    
    if (normalizedCurrent === normalizedNew || isUpdating) {
      console.log('❌ JobStatusBadge: Skipping update - same status or already updating', { 
        status, 
        newStatus, 
        normalizedCurrent,
        normalizedNew,
        isUpdating 
      });
      return;
    }
    
    console.log('JobStatusBadge: Starting status update', {
      currentStatus: status,
      newStatus,
      jobId
    });
    
    setIsUpdating(true);
    try {
      console.log('🔄 JobStatusBadge: Calling onStatusChange with:', newStatus);
      // Call the onStatusChange callback immediately for optimistic update
      await onStatusChange(newStatus);
      console.log('✅ JobStatusBadge: onStatusChange completed successfully');
      // Don't show toast here - useJobStatusUpdate will handle it
    } catch (error) {
      console.error("❌ JobStatusBadge: Error updating job status:", error);
      // Don't show error toast here - useJobStatusUpdate will handle it
    } finally {
      setIsUpdating(false);
      console.log('🏁 JobStatusBadge: setIsUpdating(false) called');
    }
  };

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="h-7 border font-medium"
        disabled
      >
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Loading...
      </Button>
    );
  }

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
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Job Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {jobStatuses
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map((statusOption) => (
            <DropdownMenuItem 
              key={statusOption.id}
              className={cn(
                "cursor-pointer",
                status === statusOption.name && "bg-fixlyfy/10"
              )} 
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
