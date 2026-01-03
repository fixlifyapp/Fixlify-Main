import * as React from "react";
import { startOfWeek, addDays, format, isToday, startOfDay, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore, CalendarResource, CalendarEvent } from "../CalendarProvider";
import { TimeAxis } from "../grid/TimeAxis";
import { TimeSlot } from "../grid/TimeSlot";
import { CalendarEventBlock } from "../CalendarEvent";
import { NowIndicator } from "../NowIndicator";
import { WorkloadBadge, CapacityDot, TravelSummaryBadge } from "../features";
import { AISlotOverlay } from "../ai";
import { useAIScheduling } from "../ai/useAIScheduling";
import { User, Car, AlertTriangle } from "lucide-react";
import { calculateTravelGaps, TravelGap } from "@/hooks/useTravelCalculation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamViewProps {
  className?: string;
}

// Travel marker between events in the timeline
function TravelMarker({
  gap,
  dayStart,
  slotHeight,
  slotDuration,
  minHour,
}: {
  gap: TravelGap;
  dayStart: Date;
  slotHeight: number;
  slotDuration: number;
  minHour: number;
}) {
  const fromEndMinutes = differenceInMinutes(new Date(gap.fromJob.end), dayStart);
  const toStartMinutes = differenceInMinutes(new Date(gap.toJob.start), dayStart);

  // Calculate positions
  const viewStartMinutes = minHour * 60;
  const fromY = ((fromEndMinutes - viewStartMinutes) / slotDuration) * slotHeight;
  const toY = ((toStartMinutes - viewStartMinutes) / slotDuration) * slotHeight;
  const gapHeight = toY - fromY;

  if (gapHeight < 16) return null;

  const statusColor = gap.isRisky
    ? "text-red-500"
    : gap.isTight
    ? "text-amber-500"
    : "text-muted-foreground";

  const bgColor = gap.isRisky
    ? "bg-red-500"
    : gap.isTight
    ? "bg-amber-500"
    : "bg-green-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center cursor-help z-10 pointer-events-auto"
            style={{
              top: `${fromY}px`,
              height: `${gapHeight}px`,
            }}
          >
            {/* Connector line */}
            <div className={cn("w-0.5 flex-1 max-h-4", bgColor, "opacity-30")} />

            {/* Travel badge */}
            {gapHeight > 28 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  gap.isRisky
                    ? "bg-red-500/10"
                    : gap.isTight
                    ? "bg-amber-500/10"
                    : "bg-muted",
                  statusColor
                )}
              >
                <Car className="h-2.5 w-2.5" />
                <span>{gap.travelMinutes}m</span>
              </div>
            )}

            {/* Connector line */}
            <div className={cn("w-0.5 flex-1 max-h-4", bgColor, "opacity-30")} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div className="font-medium">Travel Time</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">{gap.distanceKm} km</span>
              <span className="text-muted-foreground">Est. Travel:</span>
              <span className="font-medium">{gap.travelMinutes} min</span>
              <span className="text-muted-foreground">Gap:</span>
              <span className="font-medium">{gap.gapMinutes} min</span>
              <span className="text-muted-foreground">Buffer:</span>
              <span
                className={cn(
                  "font-medium",
                  gap.gapMinutes - gap.travelMinutes >= 15
                    ? "text-green-500"
                    : gap.gapMinutes - gap.travelMinutes >= 0
                    ? "text-amber-500"
                    : "text-red-500"
                )}
              >
                {gap.gapMinutes - gap.travelMinutes >= 0 ? "+" : ""}
                {gap.gapMinutes - gap.travelMinutes} min
              </span>
            </div>
            {gap.isRisky && (
              <p className="text-red-500 pt-1 border-t flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Not enough time for travel
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TeamView({ className }: TeamViewProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);
  const resources = useCalendarStore((state) => state.resources);
  const events = useCalendarStore((state) => state.events);
  const getTimeSlots = useCalendarStore((state) => state.getTimeSlots);
  const slotDuration = useCalendarStore((state) => state.slotDuration);
  const slotMinTime = useCalendarStore((state) => state.slotMinTime);
  const getAllTechnicianWorkloads = useCalendarStore((state) => state.getAllTechnicianWorkloads);
  const maxJobsPerTechnicianPerDay = useCalendarStore((state) => state.maxJobsPerTechnicianPerDay);
  const maxHoursPerTechnicianPerDay = useCalendarStore((state) => state.maxHoursPerTechnicianPerDay);

  // Get AI recommendations
  const { recommendations } = useAIScheduling();

  const timeSlots = getTimeSlots();
  const slotHeight = (slotDuration / 30) * 48;
  const totalGridHeight = timeSlots.length * slotHeight;
  const [minHour] = slotMinTime.split(":").map(Number);

  // For team view, we show the current day with resources as columns
  const viewDate = currentDate;
  const today = isToday(viewDate);

  // Filter events for the current day
  const dayEvents = React.useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.toDateString() === viewDate.toDateString()
      );
    });
  }, [events, viewDate]);

  // Group events by resource
  const eventsByResource = React.useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    resources.forEach((resource) => {
      grouped[resource.id] = dayEvents.filter(
        (event) => event.resourceId === resource.id
      );
    });
    // Unassigned events
    grouped["unassigned"] = dayEvents.filter((event) => !event.resourceId);
    return grouped;
  }, [dayEvents, resources]);

  // Get workloads for all technicians
  const workloads = React.useMemo(() => {
    return getAllTechnicianWorkloads(viewDate);
  }, [getAllTechnicianWorkloads, viewDate]);

  // Add unassigned column if there are unassigned events
  const displayResources: CalendarResource[] = React.useMemo(() => {
    const unassignedEvents = eventsByResource["unassigned"] || [];
    const result = [...resources];
    if (unassignedEvents.length > 0) {
      result.push({ id: "unassigned", title: "Unassigned", color: "#6b7280" });
    }
    return result;
  }, [resources, eventsByResource]);

  return (
    <div className={cn("flex flex-col flex-1 min-h-0", className)}>
      {/* Day header */}
      <div className="flex border-b border-border">
        <div className="w-16 flex-shrink-0 border-r border-border" />
        <div className="flex-1 py-2 px-4">
          <h3 className={cn("text-lg font-semibold", today && "text-primary")}>
            {format(viewDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
      </div>

      {/* Resource headers + grid */}
      <div className="flex flex-1 min-h-0">
        {/* Time axis */}
        <TimeAxis />

        {/* Resources grid */}
        <div className="flex-1 flex overflow-x-auto overflow-y-auto">
          {displayResources.length === 0 ? (
            // No resources placeholder
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No technicians available</p>
                <p className="text-sm">Add technicians to use Team view</p>
              </div>
            </div>
          ) : (
            displayResources.map((resource) => {
              const resourceEvents = eventsByResource[resource.id] || [];

              return (
                <div
                  key={resource.id}
                  className="flex-1 min-w-[150px] flex flex-col border-r border-border last:border-r-0"
                >
                  {/* Resource header with workload badge */}
                  <div
                    className="h-16 flex flex-col items-center justify-center border-b border-border px-2 gap-1"
                    style={{
                      backgroundColor: resource.color
                        ? `${resource.color}15`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {resource.color && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: resource.color }}
                        />
                      )}
                      <span className="text-sm font-medium truncate">
                        {resource.title}
                      </span>
                      {/* Capacity indicator dot */}
                      {workloads[resource.id] && (
                        <CapacityDot workload={workloads[resource.id]} />
                      )}
                    </div>
                    {/* Workload badge */}
                    {workloads[resource.id] && resource.id !== "unassigned" && (
                      <WorkloadBadge
                        workload={workloads[resource.id]}
                        technicianName={resource.title}
                        maxJobs={maxJobsPerTechnicianPerDay}
                        maxHours={maxHoursPerTechnicianPerDay}
                        compact
                      />
                    )}
                  </div>

                  {/* Time slots */}
                  <div
                    className="relative"
                    style={{ height: `${totalGridHeight}px`, minHeight: `${totalGridHeight}px` }}
                  >
                    {/* Slots grid */}
                    <div className="absolute inset-0">
                      {timeSlots.map((slot, slotIndex) => (
                        <TimeSlot
                          key={slotIndex}
                          date={viewDate}
                          time={slot}
                          resourceId={resource.id}
                        />
                      ))}
                    </div>

                    {/* Events layer */}
                    <div className="absolute inset-0 pointer-events-none">
                      {resourceEvents.map((event) => (
                        <CalendarEventBlock
                          key={event.id}
                          event={event}
                          dayStart={startOfDay(viewDate)}
                          slotHeight={slotHeight}
                          slotDuration={slotDuration}
                        />
                      ))}
                    </div>

                    {/* Travel markers layer */}
                    <div className="absolute inset-0 pointer-events-none">
                      {(() => {
                        const travelGaps = calculateTravelGaps(resourceEvents);
                        return travelGaps.map((gap, index) => (
                          <TravelMarker
                            key={`travel-${index}`}
                            gap={gap}
                            dayStart={startOfDay(viewDate)}
                            slotHeight={slotHeight}
                            slotDuration={slotDuration}
                            minHour={minHour}
                          />
                        ));
                      })()}
                    </div>

                    {/* AI recommendations overlay */}
                    {recommendations.length > 0 && (
                      <AISlotOverlay
                        recommendations={recommendations.filter(
                          (rec) => rec.technician.id === resource.id
                        )}
                        dayStart={startOfDay(viewDate)}
                        slotHeight={slotHeight}
                        slotMinTime={slotMinTime}
                      />
                    )}

                    {/* Now indicator */}
                    {today && (
                      <NowIndicator
                        slotHeight={slotHeight}
                        slotDuration={slotDuration}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
