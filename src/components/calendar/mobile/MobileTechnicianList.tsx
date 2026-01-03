import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent, CalendarResource, STATUS_COLORS } from "../CalendarProvider";
import { format, isSameDay, differenceInMinutes } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Car,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileTechnicianListProps {
  resources: CalendarResource[];
  events: CalendarEvent[];
  date: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onTechnicianClick?: (technicianId: string) => void;
  className?: string;
}

/**
 * Mobile-optimized technician list view with expandable job lists
 */
export function MobileTechnicianList({
  resources,
  events,
  date,
  onEventClick,
  onTechnicianClick,
  className,
}: MobileTechnicianListProps) {
  const [expandedTechnicians, setExpandedTechnicians] = React.useState<Set<string>>(
    new Set()
  );

  const toggleTechnician = (techId: string) => {
    setExpandedTechnicians((prev) => {
      const next = new Set(prev);
      if (next.has(techId)) {
        next.delete(techId);
      } else {
        next.add(techId);
      }
      return next;
    });
  };

  // Get events for each technician on the current date
  const technicianData = React.useMemo(() => {
    return resources.map((resource) => {
      const techEvents = events
        .filter(
          (event) =>
            event.resourceId === resource.id &&
            isSameDay(new Date(event.start), date)
        )
        .sort(
          (a, b) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );

      const totalMinutes = techEvents.reduce((sum, event) => {
        return (
          sum +
          differenceInMinutes(new Date(event.end), new Date(event.start))
        );
      }, 0);

      const completedJobs = techEvents.filter(
        (e) => e.extendedProps?.status === "completed"
      ).length;

      const inProgressJobs = techEvents.filter(
        (e) => e.extendedProps?.status === "in_progress"
      ).length;

      return {
        resource,
        events: techEvents,
        totalJobs: techEvents.length,
        totalHours: totalMinutes / 60,
        completedJobs,
        inProgressJobs,
        pendingJobs: techEvents.length - completedJobs - inProgressJobs,
      };
    });
  }, [resources, events, date]);

  return (
    <div className={cn("mobile-technician-list", className)}>
      {/* Date Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{format(date, "EEEE")}</h3>
            <p className="text-sm text-muted-foreground">
              {format(date, "MMMM d, yyyy")}
            </p>
          </div>
          <Badge variant="secondary">
            {resources.length} technicians
          </Badge>
        </div>
      </div>

      {/* Technician List */}
      <div className="divide-y">
        {technicianData.map(
          ({
            resource,
            events: techEvents,
            totalJobs,
            totalHours,
            completedJobs,
            inProgressJobs,
            pendingJobs,
          }) => {
            const isExpanded = expandedTechnicians.has(resource.id);
            const initials = resource.title
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Collapsible
                key={resource.id}
                open={isExpanded}
                onOpenChange={() => toggleTechnician(resource.id)}
              >
                {/* Technician Header */}
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      {resource.extendedProps?.avatar ? (
                        <AvatarImage src={resource.extendedProps.avatar} />
                      ) : null}
                      <AvatarFallback
                        className="text-sm font-medium"
                        style={{
                          backgroundColor: resource.extendedProps?.color || "#3b82f6",
                          color: "white",
                        }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {resource.title}
                        </span>
                        {inProgressJobs > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-yellow-500/10 text-yellow-600"
                          >
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {totalHours.toFixed(1)}h
                        </span>
                        <span>{totalJobs} jobs</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-1.5">
                      {completedJobs > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-6 w-6 p-0 flex items-center justify-center rounded-full bg-green-500/10 text-green-600"
                        >
                          {completedJobs}
                        </Badge>
                      )}
                      {pendingJobs > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-6 w-6 p-0 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-600"
                        >
                          {pendingJobs}
                        </Badge>
                      )}
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Expanded Content - Job List */}
                <CollapsibleContent>
                  <div className="pl-[76px] pr-4 pb-4 space-y-2">
                    {techEvents.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        No jobs scheduled
                        <Button
                          variant="link"
                          size="sm"
                          className="block mx-auto mt-1"
                          onClick={() => onTechnicianClick?.(resource.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Job
                        </Button>
                      </div>
                    ) : (
                      <>
                        {techEvents.map((event, index) => {
                          const status =
                            event.extendedProps?.status || "scheduled";
                          const statusColor =
                            STATUS_COLORS[status] || STATUS_COLORS.scheduled;
                          const startTime = new Date(event.start);
                          const endTime = new Date(event.end);
                          const duration = differenceInMinutes(
                            endTime,
                            startTime
                          );

                          // Calculate travel time indicator
                          const nextEvent = techEvents[index + 1];
                          const hasTimeGap =
                            nextEvent &&
                            differenceInMinutes(
                              new Date(nextEvent.start),
                              endTime
                            ) > 0;

                          return (
                            <React.Fragment key={event.id}>
                              <button
                                className="w-full text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                                onClick={() => onEventClick?.(event)}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Time */}
                                  <div className="flex-shrink-0 text-center min-w-[50px]">
                                    <div className="text-sm font-medium">
                                      {format(startTime, "h:mm")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(startTime, "a")}
                                    </div>
                                  </div>

                                  {/* Status Line */}
                                  <div
                                    className="w-1 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: statusColor,
                                      height: "100%",
                                      minHeight: "40px",
                                    }}
                                  />

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {event.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      <span>{duration}m</span>
                                      {event.extendedProps?.address && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate flex items-center gap-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {event.extendedProps.address.split(
                                              ","
                                            )[0]}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Icon */}
                                  <div className="flex-shrink-0">
                                    {status === "completed" ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : status === "in_progress" ? (
                                      <Clock className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* Travel Time Indicator */}
                              {hasTimeGap && nextEvent && (
                                <div className="flex items-center gap-2 pl-[62px] py-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Car className="h-3 w-3" />
                                    <span>
                                      {differenceInMinutes(
                                        new Date(nextEvent.start),
                                        endTime
                                      )}
                                      m gap
                                    </span>
                                  </div>
                                  <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}

                        {/* Add Job Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-muted-foreground"
                          onClick={() => onTechnicianClick?.(resource.id)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Job for {resource.title.split(" ")[0]}
                        </Button>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          }
        )}
      </div>

      {/* Empty State */}
      {resources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h4 className="font-medium text-muted-foreground">
            No technicians available
          </h4>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Add team members to start scheduling jobs
          </p>
        </div>
      )}
    </div>
  );
}
