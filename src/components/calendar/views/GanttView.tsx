import * as React from "react";
import { format, isToday, startOfDay, differenceInMinutes, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarStore, CalendarEvent, CalendarResource, STATUS_COLORS } from "../CalendarProvider";
import { WorkloadBadge, CapacityDot, TravelSummaryBadge, GanttTravelConnector } from "../features";
import { useCalendarContext } from "../CalendarProvider";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { NowIndicator } from "../NowIndicator";
import { User, GripVertical, MapPin, Clock, ChevronRight, Car } from "lucide-react";
import { calculateTravelGaps, TravelGap } from "@/hooks/useTravelCalculation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GanttViewProps {
  className?: string;
}

// Single event bar in the Gantt chart
function GanttEventBar({
  event,
  dayStart,
  hourWidth,
  rowHeight,
}: {
  event: CalendarEvent;
  dayStart: Date;
  hourWidth: number;
  rowHeight: number;
}) {
  const { onEventClick } = useCalendarContext();
  const startMinutes = differenceInMinutes(new Date(event.start), dayStart);
  const endMinutes = differenceInMinutes(new Date(event.end), dayStart);
  const durationMinutes = endMinutes - startMinutes;

  // Calculate position
  const left = (startMinutes / 60) * hourWidth;
  const width = (durationMinutes / 60) * hourWidth;

  // Get status colors
  const statusColor = STATUS_COLORS[event.status] || STATUS_COLORS.scheduled;

  // Draggable setup
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: {
      type: "event",
      event,
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
              "absolute rounded-md shadow-sm cursor-grab active:cursor-grabbing transition-all",
              "flex items-center gap-1.5 px-2 overflow-hidden",
              "border border-white/20",
              "hover:shadow-md hover:z-10 hover:scale-[1.02]",
              isDragging && "opacity-50 shadow-lg scale-105 z-50"
            )}
            style={{
              left: `${left}px`,
              top: "4px",
              width: `${Math.max(width - 4, 24)}px`,
              height: `${rowHeight - 8}px`,
              backgroundColor: event.backgroundColor || statusColor.bg,
              color: event.textColor || statusColor.text,
            }}
          >
            {/* Drag handle indicator */}
            <GripVertical className="h-3 w-3 opacity-50 flex-shrink-0" />

            {/* Event content */}
            <div className="flex-1 min-w-0 flex items-center gap-1">
              <span className="text-xs font-medium truncate">
                {event.title}
              </span>
              {width > 100 && event.extendedProps?.clientName && (
                <span className="text-[10px] opacity-75 truncate hidden sm:inline">
                  • {event.extendedProps.clientName}
                </span>
              )}
            </div>

            {/* Duration indicator for larger bars */}
            {width > 80 && (
              <span className="text-[10px] opacity-75 flex-shrink-0">
                {Math.round(durationMinutes / 60)}h
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-medium">{event.title}</p>
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                <span className="text-foreground font-medium">
                  ({Math.round(durationMinutes / 60)}h {durationMinutes % 60}m)
                </span>
              </div>
              {event.extendedProps?.clientName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3 w-3" />
                  {event.extendedProps.clientName}
                </div>
              )}
              {event.extendedProps?.address && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.extendedProps.address}</span>
                </div>
              )}
            </div>
            <div className="pt-1 border-t">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                }}
              >
                {event.status.replace("-", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Travel connector between events in Gantt view
function TravelConnector({
  gap,
  dayStart,
  hourWidth,
  rowHeight,
  minHour,
}: {
  gap: TravelGap;
  dayStart: Date;
  hourWidth: number;
  rowHeight: number;
  minHour: number;
}) {
  const fromEndMinutes = differenceInMinutes(new Date(gap.fromJob.end), dayStart);
  const toStartMinutes = differenceInMinutes(new Date(gap.toJob.start), dayStart);

  // Calculate positions relative to view start
  const viewStartMinutes = minHour * 60;
  const fromX = ((fromEndMinutes - viewStartMinutes) / 60) * hourWidth;
  const toX = ((toStartMinutes - viewStartMinutes) / 60) * hourWidth;
  const gapWidth = toX - fromX;

  if (gapWidth < 8) return null;

  // Calculate travel proportion for visual
  const travelProportion = Math.min(gap.travelMinutes / Math.max(gap.gapMinutes, 1), 1);

  const statusColor = gap.isRisky
    ? "bg-red-500"
    : gap.isTight
    ? "bg-amber-500"
    : "bg-green-500";

  const statusBg = gap.isRisky
    ? "bg-red-500/20"
    : gap.isTight
    ? "bg-amber-500/15"
    : "bg-green-500/10";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute flex items-center justify-center cursor-help group",
              "transition-opacity hover:opacity-100",
              gapWidth < 40 ? "opacity-60" : "opacity-80"
            )}
            style={{
              left: `${fromX}px`,
              top: "0",
              width: `${gapWidth}px`,
              height: `${rowHeight}px`,
            }}
          >
            {/* Background */}
            <div
              className={cn(
                "absolute inset-x-1 top-1/2 -translate-y-1/2 h-1 rounded-full",
                statusBg
              )}
            />

            {/* Travel time portion */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-1 rounded-full left-1",
                statusColor,
                "opacity-60"
              )}
              style={{ width: `${Math.max((gapWidth - 8) * travelProportion, 4)}px` }}
            />

            {/* Icon */}
            {gapWidth > 24 && (
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full",
                  gapWidth > 40 ? "w-5 h-5" : "w-4 h-4",
                  gap.isRisky
                    ? "bg-red-500 text-white"
                    : gap.isTight
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground",
                  "group-hover:scale-110 transition-transform"
                )}
              >
                <Car className={cn(gapWidth > 40 ? "h-3 w-3" : "h-2.5 w-2.5")} />
              </div>
            )}

            {/* Time label */}
            {gapWidth > 60 && (
              <span
                className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-medium",
                  gap.isRisky
                    ? "text-red-500"
                    : gap.isTight
                    ? "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {gap.travelMinutes}m
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
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
              <p className="text-red-500 pt-1 border-t">
                ⚠️ Not enough time for travel
              </p>
            )}
            {gap.isTight && !gap.isRisky && (
              <p className="text-amber-500 pt-1 border-t">
                ⏰ Tight timing - minimal buffer
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Resource row (technician swimlane)
function ResourceRow({
  resource,
  events,
  dayStart,
  hourWidth,
  rowHeight,
  hours,
  slotDuration,
  minHour,
}: {
  resource: CalendarResource;
  events: CalendarEvent[];
  dayStart: Date;
  hourWidth: number;
  rowHeight: number;
  hours: number[];
  slotDuration: number;
  minHour: number;
}) {
  const { onSlotClick, onDateSelect } = useCalendarContext();
  const getTechnicianWorkload = useCalendarStore((state) => state.getTechnicianWorkload);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const maxJobsPerTechnicianPerDay = useCalendarStore((state) => state.maxJobsPerTechnicianPerDay);
  const maxHoursPerTechnicianPerDay = useCalendarStore((state) => state.maxHoursPerTechnicianPerDay);
  const isSlotOutsideBusinessHours = useCalendarStore((state) => state.isSlotOutsideBusinessHours);

  const workload = getTechnicianWorkload(resource.id, currentDate);
  const totalWidth = hours.length * hourWidth;

  // Calculate travel gaps between events
  const travelGaps = React.useMemo(() => {
    return calculateTravelGaps(events);
  }, [events]);

  // Calculate total travel time
  const totalTravelMinutes = React.useMemo(() => {
    return travelGaps.reduce((sum, gap) => sum + gap.travelMinutes, 0);
  }, [travelGaps]);

  const riskyGaps = travelGaps.filter((g) => g.isRisky).length;

  // Handle click on empty area
  const handleRowClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickMinutes = Math.floor((clickX / hourWidth) * 60);
    const clickHour = Math.floor(clickMinutes / 60);
    const clickMinuteRounded = Math.floor((clickMinutes % 60) / slotDuration) * slotDuration;

    const clickTime = new Date(dayStart);
    clickTime.setHours(hours[0] + clickHour, clickMinuteRounded, 0, 0);

    onSlotClick?.(clickTime, resource.id);
  };

  // Handle double click to create event
  const handleRowDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickMinutes = Math.floor((clickX / hourWidth) * 60);
    const clickHour = Math.floor(clickMinutes / 60);
    const clickMinuteRounded = Math.floor((clickMinutes % 60) / slotDuration) * slotDuration;

    const startTime = new Date(dayStart);
    startTime.setHours(hours[0] + clickHour, clickMinuteRounded, 0, 0);

    const endTime = addMinutes(startTime, slotDuration);

    onDateSelect?.(startTime, endTime, resource.id);
  };

  return (
    <div className="flex border-b border-border hover:bg-muted/30 transition-colors">
      {/* Resource label (sticky left) */}
      <div
        className="w-48 flex-shrink-0 sticky left-0 z-20 bg-background border-r border-border"
        style={{
          backgroundColor: resource.color ? `${resource.color}08` : undefined,
        }}
      >
        <div className="h-full flex items-center gap-2 px-3 py-2">
          {/* Color indicator */}
          <div
            className="h-8 w-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: resource.color || "#6b7280" }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{resource.title}</span>
              <CapacityDot workload={workload} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {workload.jobCount} jobs
              </span>
              <span className="text-xs text-muted-foreground">
                {workload.hoursWorked.toFixed(1)}h
              </span>
              {/* Travel time summary */}
              {totalTravelMinutes > 0 && (
                <span
                  className={cn(
                    "text-xs flex items-center gap-0.5",
                    riskyGaps > 0 ? "text-amber-500" : "text-muted-foreground"
                  )}
                >
                  <Car className="h-3 w-3" />
                  {totalTravelMinutes}m
                  {riskyGaps > 0 && <span className="text-red-500">!</span>}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline area */}
      <div
        className="relative flex-1 cursor-pointer"
        style={{
          width: `${totalWidth}px`,
          minWidth: `${totalWidth}px`,
          height: `${rowHeight}px`,
        }}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
      >
        {/* Hour grid lines */}
        {hours.map((hour, index) => {
          const time = new Date(dayStart);
          time.setHours(hour, 0, 0, 0);
          const isOutside = isSlotOutsideBusinessHours(currentDate, time);

          return (
            <div
              key={hour}
              className={cn(
                "absolute top-0 bottom-0 border-l",
                index === 0 ? "border-border" : "border-border/30",
                isOutside && "bg-muted/30"
              )}
              style={{
                left: `${index * hourWidth}px`,
                width: `${hourWidth}px`,
                ...(isOutside && {
                  backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 8px)",
                }),
              }}
            />
          );
        })}

        {/* Travel connectors (render behind events) */}
        {travelGaps.map((gap, index) => (
          <TravelConnector
            key={`travel-${index}`}
            gap={gap}
            dayStart={dayStart}
            hourWidth={hourWidth}
            rowHeight={rowHeight}
            minHour={hours[0]}
          />
        ))}

        {/* Events */}
        {events.map((event) => (
          <GanttEventBar
            key={event.id}
            event={event}
            dayStart={dayStart}
            hourWidth={hourWidth}
            rowHeight={rowHeight}
          />
        ))}
      </div>
    </div>
  );
}

export function GanttView({ className }: GanttViewProps) {
  const currentDate = useCalendarStore((state) => state.currentDate);
  const resources = useCalendarStore((state) => state.resources);
  const events = useCalendarStore((state) => state.events);
  const slotMinTime = useCalendarStore((state) => state.slotMinTime);
  const slotMaxTime = useCalendarStore((state) => state.slotMaxTime);
  const slotDuration = useCalendarStore((state) => state.slotDuration);

  // Parse time range
  const [minHour] = slotMinTime.split(":").map(Number);
  const [maxHour] = slotMaxTime.split(":").map(Number);

  // Generate hours array
  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let h = minHour; h < maxHour; h++) {
      result.push(h);
    }
    return result;
  }, [minHour, maxHour]);

  // Constants
  const hourWidth = 80; // pixels per hour
  const rowHeight = 56; // pixels per technician row
  const totalWidth = hours.length * hourWidth;

  // View date
  const viewDate = currentDate;
  const dayStart = startOfDay(viewDate);
  const today = isToday(viewDate);

  // Filter events for the current day
  const dayEvents = React.useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === viewDate.toDateString();
    });
  }, [events, viewDate]);

  // Group events by resource
  const eventsByResource = React.useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    resources.forEach((resource) => {
      grouped[resource.id] = dayEvents.filter(
        (event) => event.resourceId === resource.id
      );
    });
    // Unassigned events
    grouped["unassigned"] = dayEvents.filter((event) => !event.resourceId);
    return grouped;
  }, [dayEvents, resources]);

  // Add unassigned row if there are unassigned events
  const displayResources: CalendarResource[] = React.useMemo(() => {
    const unassignedEvents = eventsByResource["unassigned"] || [];
    const result = [...resources];
    if (unassignedEvents.length > 0) {
      result.push({ id: "unassigned", title: "Unassigned", color: "#6b7280" });
    }
    return result;
  }, [resources, eventsByResource]);

  // Now indicator position
  const nowPosition = React.useMemo(() => {
    if (!today) return null;
    const now = new Date();
    const minutesSinceDayStart = differenceInMinutes(now, dayStart);
    const minutesSinceViewStart = minutesSinceDayStart - (minHour * 60);
    if (minutesSinceViewStart < 0 || minutesSinceViewStart > (maxHour - minHour) * 60) {
      return null;
    }
    return (minutesSinceViewStart / 60) * hourWidth;
  }, [today, dayStart, minHour, maxHour, hourWidth]);

  return (
    <div className={cn("flex flex-col flex-1 min-h-0", className)}>
      {/* Day header */}
      <div className="flex border-b border-border bg-muted/30">
        <div className="w-48 flex-shrink-0 border-r border-border px-3 py-2">
          <h3 className={cn("text-sm font-semibold", today && "text-primary")}>
            {format(viewDate, "EEEE")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {format(viewDate, "MMMM d, yyyy")}
          </p>
        </div>
        {/* Hour labels */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex" style={{ width: `${totalWidth}px` }}>
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-center border-l border-border/30 first:border-l-0"
                style={{ width: `${hourWidth}px` }}
              >
                <span className="text-xs font-medium text-muted-foreground py-2">
                  {format(new Date().setHours(hour, 0), "h a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Swimlanes */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {displayResources.length === 0 ? (
            // No resources placeholder
            <div className="flex-1 flex items-center justify-center text-muted-foreground py-16">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No technicians available</p>
                <p className="text-sm">Add technicians to use Gantt view</p>
              </div>
            </div>
          ) : (
            <>
              {displayResources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  events={eventsByResource[resource.id] || []}
                  dayStart={dayStart}
                  hourWidth={hourWidth}
                  rowHeight={rowHeight}
                  hours={hours}
                  slotDuration={slotDuration}
                  minHour={minHour}
                />
              ))}

              {/* Now indicator line */}
              {nowPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                  style={{ left: `${192 + nowPosition}px` }} // 192 = resource label width (w-48)
                >
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/20 text-xs flex-wrap">
        <span className="text-muted-foreground">Status:</span>
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors.bg }}
            />
            <span className="capitalize">{status.replace("-", " ")}</span>
          </div>
        ))}

        <span className="text-muted-foreground ml-4">Travel:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>OK</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Tight</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Risky</span>
        </div>
      </div>
    </div>
  );
}
