import * as React from "react";
import { cn } from "@/lib/utils";
import { TravelGap, TechnicianTravelSummary, getTravelSummaryText } from "@/hooks/useTravelCalculation";
import { Car, AlertTriangle, Clock, MapPin, Navigation } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TravelTimeIndicatorProps {
  gap: TravelGap;
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

/**
 * Visual indicator for travel time between two consecutive jobs
 */
export function TravelTimeIndicator({
  gap,
  orientation = "vertical",
  compact = false,
  className,
}: TravelTimeIndicatorProps) {
  const { travelMinutes, gapMinutes, isRisky, isTight, distanceKm } = gap;

  // Determine status and colors
  const status = isRisky ? "risky" : isTight ? "tight" : "ok";

  const statusConfig = {
    risky: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-500",
      icon: AlertTriangle,
      label: "Risky - Not enough time",
      dotColor: "bg-red-500",
    },
    tight: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-500",
      icon: Clock,
      label: "Tight timing",
      dotColor: "bg-amber-500",
    },
    ok: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-500",
      icon: Car,
      label: "OK",
      dotColor: "bg-green-500",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Calculate buffer time
  const bufferMinutes = gapMinutes - travelMinutes;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center justify-center",
                orientation === "vertical" ? "h-4 w-full" : "w-4 h-full",
                className
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium",
                  config.bg,
                  config.text
                )}
              >
                <Icon className="h-2.5 w-2.5" />
                <span>{travelMinutes}m</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <TravelTooltipContent gap={gap} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2",
              orientation === "vertical"
                ? "flex-col py-1"
                : "flex-row px-2",
              className
            )}
          >
            {/* Connector line */}
            <div
              className={cn(
                "flex-shrink-0",
                orientation === "vertical"
                  ? "w-0.5 h-3"
                  : "h-0.5 w-3",
                config.dotColor,
                "opacity-50"
              )}
            />

            {/* Travel info badge */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs",
                config.bg,
                config.border,
                config.text
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium">{travelMinutes}m</span>
              <span className="text-muted-foreground">({distanceKm}km)</span>
            </div>

            {/* Gap indicator */}
            <div
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                gapMinutes > 0 ? "text-muted-foreground" : "text-red-500"
              )}
            >
              <span>Gap: {gapMinutes}m</span>
              {bufferMinutes > 0 && (
                <span className="text-green-500">(+{bufferMinutes}m buffer)</span>
              )}
              {bufferMinutes < 0 && (
                <span className="text-red-500">({bufferMinutes}m short!)</span>
              )}
            </div>

            {/* Connector line */}
            <div
              className={cn(
                "flex-shrink-0",
                orientation === "vertical"
                  ? "w-0.5 h-3"
                  : "h-0.5 w-3",
                config.dotColor,
                "opacity-50"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <TravelTooltipContent gap={gap} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip content for detailed travel info
function TravelTooltipContent({ gap }: { gap: TravelGap }) {
  const { fromJob, toJob, travelMinutes, gapMinutes, isRisky, isTight, distanceKm } = gap;
  const bufferMinutes = gapMinutes - travelMinutes;

  return (
    <div className="space-y-2 text-xs">
      <div className="font-medium text-sm">Travel Between Jobs</div>

      {/* From/To */}
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
          <div>
            <div className="font-medium">{fromJob.title}</div>
            {gap.fromAddress && (
              <div className="text-muted-foreground truncate max-w-[200px]">
                {gap.fromAddress}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pl-1">
          <Navigation className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">→</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
          <div>
            <div className="font-medium">{toJob.title}</div>
            {gap.toAddress && (
              <div className="text-muted-foreground truncate max-w-[200px]">
                {gap.toAddress}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t">
        <div>
          <span className="text-muted-foreground">Distance:</span>
          <span className="ml-1 font-medium">{distanceKm} km</span>
        </div>
        <div>
          <span className="text-muted-foreground">Est. Travel:</span>
          <span className="ml-1 font-medium">{travelMinutes} min</span>
        </div>
        <div>
          <span className="text-muted-foreground">Gap:</span>
          <span className="ml-1 font-medium">{gapMinutes} min</span>
        </div>
        <div>
          <span className="text-muted-foreground">Buffer:</span>
          <span
            className={cn(
              "ml-1 font-medium",
              bufferMinutes >= 15
                ? "text-green-500"
                : bufferMinutes >= 0
                ? "text-amber-500"
                : "text-red-500"
            )}
          >
            {bufferMinutes >= 0 ? `+${bufferMinutes}` : bufferMinutes} min
          </span>
        </div>
      </div>

      {/* Status message */}
      {isRisky && (
        <div className="flex items-center gap-1.5 text-red-500 pt-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Not enough time for travel! Consider rescheduling.</span>
        </div>
      )}
      {isTight && !isRisky && (
        <div className="flex items-center gap-1.5 text-amber-500 pt-1">
          <Clock className="h-3 w-3" />
          <span>Tight timing - minimal buffer for delays.</span>
        </div>
      )}
    </div>
  );
}

/**
 * Summary badge showing total travel for a technician
 */
interface TravelSummaryBadgeProps {
  summary: TechnicianTravelSummary;
  className?: string;
  compact?: boolean;
}

export function TravelSummaryBadge({
  summary,
  className,
  compact = false,
}: TravelSummaryBadgeProps) {
  const { totalTravelMinutes, totalDistanceKm, riskyGaps, gaps } = summary;

  if (gaps.length === 0) return null;

  const hasIssues = riskyGaps > 0;
  const hours = Math.floor(totalTravelMinutes / 60);
  const mins = totalTravelMinutes % 60;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                hasIssues
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-muted text-muted-foreground",
                className
              )}
            >
              <Car className="h-3 w-3" />
              <span>
                {hours > 0 ? `${hours}h${mins}m` : `${mins}m`}
              </span>
              {hasIssues && (
                <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5 text-xs">
              <div className="font-medium">Travel Summary</div>
              <div className="text-muted-foreground">
                {getTravelSummaryText(summary)}
              </div>
              {hasIssues && (
                <div className="text-amber-500">
                  ⚠️ {riskyGaps} timing issue{riskyGaps > 1 ? "s" : ""}
                </div>
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
        "flex items-center gap-2 px-2 py-1 rounded-md border text-xs",
        hasIssues
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-muted/50 border-border",
        className
      )}
    >
      <Car className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <span className="font-medium">
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
        </span>
        <span className="text-muted-foreground">travel</span>
        <span className="text-muted-foreground">•</span>
        <span>{totalDistanceKm} km</span>
      </div>
      {hasIssues && (
        <div className="flex items-center gap-1 text-amber-500">
          <AlertTriangle className="h-3 w-3" />
          <span>{riskyGaps}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Gantt-style travel connector between events
 */
interface GanttTravelConnectorProps {
  gap: TravelGap;
  startX: number;
  endX: number;
  y: number;
  height: number;
  className?: string;
}

export function GanttTravelConnector({
  gap,
  startX,
  endX,
  y,
  height,
  className,
}: GanttTravelConnectorProps) {
  const { isRisky, isTight, travelMinutes, gapMinutes } = gap;

  // Calculate the proportion of travel time within the gap
  const travelProportion = Math.min(travelMinutes / Math.max(gapMinutes, 1), 1);
  const gapWidth = endX - startX;
  const travelWidth = gapWidth * travelProportion;

  const status = isRisky ? "risky" : isTight ? "tight" : "ok";

  const statusColors = {
    risky: "bg-red-500/30 border-red-500/50",
    tight: "bg-amber-500/20 border-amber-500/40",
    ok: "bg-green-500/10 border-green-500/30",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute flex items-center justify-center cursor-help",
              className
            )}
            style={{
              left: startX,
              top: y,
              width: gapWidth,
              height: height,
            }}
          >
            {/* Travel time portion */}
            <div
              className={cn(
                "absolute left-0 h-1 rounded-full",
                statusColors[status]
              )}
              style={{ width: travelWidth }}
            />

            {/* Travel icon */}
            {gapWidth > 30 && (
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full w-5 h-5",
                  isRisky
                    ? "bg-red-500 text-white"
                    : isTight
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Car className="h-3 w-3" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <TravelTooltipContent gap={gap} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Timeline-style travel indicators for day/week views
 */
interface TimelineTravelMarkersProps {
  gaps: TravelGap[];
  getEventPosition: (event: { start: Date | string; end: Date | string }) => {
    top: number;
    height: number;
  };
  className?: string;
}

export function TimelineTravelMarkers({
  gaps,
  getEventPosition,
  className,
}: TimelineTravelMarkersProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {gaps.map((gap, index) => {
        const fromPos = getEventPosition(gap.fromJob);
        const toPos = getEventPosition(gap.toJob);

        // Position between the two events
        const markerTop = fromPos.top + fromPos.height;
        const markerHeight = toPos.top - markerTop;

        if (markerHeight < 20) return null;

        return (
          <div
            key={index}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
            style={{
              top: markerTop,
              height: markerHeight,
            }}
          >
            <TravelTimeIndicator
              gap={gap}
              orientation="vertical"
              compact={markerHeight < 60}
            />
          </div>
        );
      })}
    </div>
  );
}
