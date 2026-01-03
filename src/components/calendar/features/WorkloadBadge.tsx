import * as React from "react";
import { cn } from "@/lib/utils";
import { TechnicianWorkload } from "../CalendarProvider";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkloadBadgeProps {
  workload: TechnicianWorkload;
  technicianName?: string;
  maxJobs?: number;
  maxHours?: number;
  className?: string;
  compact?: boolean;
}

export function WorkloadBadge({
  workload,
  technicianName,
  maxJobs = 8,
  maxHours = 10,
  className,
  compact = false,
}: WorkloadBadgeProps) {
  const { jobCount, hoursWorked, isOverloaded, isNearCapacity } = workload;

  // Calculate percentage for visual indicator
  const jobPercentage = (jobCount / maxJobs) * 100;
  const hourPercentage = (hoursWorked / maxHours) * 100;
  const overallPercentage = Math.max(jobPercentage, hourPercentage);

  // Determine status
  const status = isOverloaded
    ? "overloaded"
    : isNearCapacity
    ? "near-capacity"
    : "available";

  // Status colors
  const statusColors = {
    overloaded: {
      bg: "bg-red-500/10",
      border: "border-red-500/50",
      text: "text-red-600 dark:text-red-400",
      bar: "bg-red-500",
      icon: AlertTriangle,
    },
    "near-capacity": {
      bg: "bg-amber-500/10",
      border: "border-amber-500/50",
      text: "text-amber-600 dark:text-amber-400",
      bar: "bg-amber-500",
      icon: Clock,
    },
    available: {
      bg: "bg-green-500/10",
      border: "border-green-500/50",
      text: "text-green-600 dark:text-green-400",
      bar: "bg-green-500",
      icon: CheckCircle,
    },
  };

  const colors = statusColors[status];
  const Icon = colors.icon;

  // Format hours
  const formattedHours = hoursWorked.toFixed(1);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border",
                colors.bg,
                colors.border,
                colors.text,
                className
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium">{jobCount}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5">
              {technicianName && (
                <p className="font-medium">{technicianName}</p>
              )}
              <div className="text-xs space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Jobs:</span>
                  <span className={cn("font-medium", colors.text)}>
                    {jobCount} / {maxJobs}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Hours:</span>
                  <span className={cn("font-medium", colors.text)}>
                    {formattedHours}h / {maxHours}h
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", colors.bar)}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
              {isOverloaded && (
                <p className="text-xs text-red-500 font-medium">
                  ⚠️ Workload capacity exceeded
                </p>
              )}
              {isNearCapacity && !isOverloaded && (
                <p className="text-xs text-amber-500 font-medium">
                  ⏰ Near maximum capacity
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded-md border",
        colors.bg,
        colors.border,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", colors.text)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-medium", colors.text)}>
            {jobCount} jobs
          </span>
          <span className="text-muted-foreground">{formattedHours}h</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-1">
          <div
            className={cn("h-full transition-all", colors.bar)}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Simple capacity indicator for very compact spaces
export function CapacityDot({
  workload,
  className,
}: {
  workload: TechnicianWorkload;
  className?: string;
}) {
  const { isOverloaded, isNearCapacity } = workload;

  return (
    <div
      className={cn(
        "h-2 w-2 rounded-full",
        isOverloaded
          ? "bg-red-500 animate-pulse"
          : isNearCapacity
          ? "bg-amber-500"
          : "bg-green-500",
        className
      )}
    />
  );
}
