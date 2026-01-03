import * as React from "react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import {
  Bot,
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Loader2,
  Calendar,
  Send,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAIScheduling,
  AIRecommendation,
  TechnicianWorkload,
} from "./useAIScheduling";
import { useCalendarStore } from "../CalendarProvider";

interface AISchedulingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation?: (recommendation: AIRecommendation) => void;
  className?: string;
}

interface InsightItem {
  type: "conflict" | "gap" | "overload" | "opportunity" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * AI Scheduling Panel - Command center for AI-powered scheduling insights
 */
export function AISchedulingPanel({
  isOpen,
  onClose,
  onApplyRecommendation,
  className,
}: AISchedulingPanelProps) {
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"insights" | "recommend" | "workload">("insights");

  const currentDate = useCalendarStore((state) => state.currentDate);
  const events = useCalendarStore((state) => state.events);
  const resources = useCalendarStore((state) => state.resources);

  const {
    isLoading,
    error,
    recommendations,
    topRecommendation,
    technicianWorkload,
    getRecommendations,
    getTechnicianWorkload,
    clearRecommendations,
  } = useAIScheduling();

  // Auto-fetch workload when panel opens
  React.useEffect(() => {
    if (isOpen) {
      const dateRange = {
        start: startOfDay(currentDate),
        end: endOfDay(addDays(currentDate, 7)),
      };
      getTechnicianWorkload(dateRange);
    }
  }, [isOpen, currentDate, getTechnicianWorkload]);

  // Generate insights from current schedule
  const insights = React.useMemo(() => {
    const items: InsightItem[] = [];

    // Check for scheduling conflicts
    const conflictEvents = events.filter((event) => {
      const overlapping = events.filter(
        (e) =>
          e.id !== event.id &&
          e.resourceId === event.resourceId &&
          new Date(e.start) < new Date(event.end) &&
          new Date(e.end) > new Date(event.start)
      );
      return overlapping.length > 0;
    });

    if (conflictEvents.length > 0) {
      items.push({
        type: "conflict",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        title: `${conflictEvents.length} Scheduling Conflicts`,
        description: "Some jobs overlap with each other. Review and resolve.",
        action: {
          label: "View Conflicts",
          onClick: () => {},
        },
      });
    }

    // Check for overloaded technicians
    const overloadedTechs = technicianWorkload.filter((w) => w.totalHours > 8);
    if (overloadedTechs.length > 0) {
      items.push({
        type: "overload",
        icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
        title: `${overloadedTechs.length} Technician${overloadedTechs.length > 1 ? "s" : ""} Over Capacity`,
        description: overloadedTechs.map((t) => t.technician.name).join(", "),
        action: {
          label: "Rebalance",
          onClick: () => {},
        },
      });
    }

    // Check for underutilized technicians
    const underutilizedTechs = technicianWorkload.filter(
      (w) => w.totalHours < 4 && w.jobCount > 0
    );
    if (underutilizedTechs.length > 0) {
      items.push({
        type: "opportunity",
        icon: <Lightbulb className="h-4 w-4 text-green-500" />,
        title: "Available Capacity",
        description: `${underutilizedTechs.map((t) => t.technician.name).join(", ")} ha${underutilizedTechs.length > 1 ? "ve" : "s"} open slots`,
      });
    }

    // Add general info if no issues
    if (items.length === 0) {
      items.push({
        type: "info",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        title: "Schedule Looks Good",
        description: "No conflicts or issues detected for today.",
      });
    }

    return items;
  }, [events, technicianWorkload]);

  // Handle query submission
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Parse natural language query (basic implementation)
    await getRecommendations({
      dateRange: {
        start: startOfDay(currentDate),
        end: endOfDay(addDays(currentDate, 7)),
      },
      estimatedDuration: 60,
    });

    setActiveTab("recommend");
  };

  // Handle apply recommendation
  const handleApplyRecommendation = (rec: AIRecommendation) => {
    onApplyRecommendation?.(rec);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 md:w-96",
        "bg-background/95 backdrop-blur-xl border-l border-border",
        "shadow-2xl z-50 flex flex-col",
        "animate-in slide-in-from-right-full duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-violet-500" />
            <Sparkles className="h-2.5 w-2.5 text-amber-400 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="font-semibold text-sm">AI Scheduling Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-destructive/10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border/50 px-2">
        {[
          { id: "insights", label: "Insights", icon: <Zap className="h-3.5 w-3.5" /> },
          { id: "recommend", label: "Suggest", icon: <Sparkles className="h-3.5 w-3.5" /> },
          { id: "workload", label: "Workload", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              "border-b-2 -mb-[2px]",
              activeTab === tab.id
                ? "border-violet-500 text-violet-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Today's Schedule Analysis
              </h3>

              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <StatCard
                  label="Total Jobs"
                  value={events.length}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <StatCard
                  label="Technicians"
                  value={resources.length}
                  icon={<User className="h-4 w-4" />}
                />
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommend" && (
            <div className="space-y-4">
              {/* Natural Language Input */}
              <form onSubmit={handleQuerySubmit} className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 'Schedule a 2-hour job tomorrow'"
                  className="pr-10 text-sm bg-muted/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      AI Recommendations
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecommendations}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>

                  {recommendations.map((rec, index) => (
                    <RecommendationCard
                      key={index}
                      recommendation={rec}
                      rank={index + 1}
                      isTop={index === 0}
                      onApply={() => handleApplyRecommendation(rec)}
                    />
                  ))}
                </div>
              )}

              {!isLoading && recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Ask me to suggest optimal slots</p>
                  <p className="text-xs mt-1 opacity-70">
                    I'll analyze workload, travel time, and availability
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Workload Tab */}
          {activeTab === "workload" && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Technician Workload
              </h3>

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && technicianWorkload.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No workload data available</p>
                </div>
              )}

              {technicianWorkload.map((workload) => (
                <WorkloadCard key={workload.technician.id} workload={workload} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          AI suggestions are based on current schedule, travel time, and workload
        </p>
      </div>
    </div>
  );
}

// Sub-components

interface InsightCardProps {
  insight: InsightItem;
}

function InsightCard({ insight }: InsightCardProps) {
  const bgColor = {
    conflict: "bg-red-500/10 border-red-500/20",
    gap: "bg-blue-500/10 border-blue-500/20",
    overload: "bg-amber-500/10 border-amber-500/20",
    opportunity: "bg-green-500/10 border-green-500/20",
    info: "bg-muted/50 border-border",
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        bgColor[insight.type]
      )}
    >
      <div className="flex items-start gap-2">
        {insight.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{insight.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {insight.description}
          </p>
          {insight.action && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs mt-2"
              onClick={insight.action.onClick}
            >
              {insight.action.label}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  rank: number;
  isTop: boolean;
  onApply: () => void;
}

function RecommendationCard({
  recommendation,
  rank,
  isTop,
  onApply,
}: RecommendationCardProps) {
  const { slot, technician, score, reasoning } = recommendation;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        isTop
          ? "bg-violet-500/10 border-violet-500/30 shadow-lg shadow-violet-500/5"
          : "bg-muted/30 border-border hover:border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isTop && <Sparkles className="h-4 w-4 text-violet-500" />}
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              isTop
                ? "bg-violet-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            #{rank}
          </span>
          <span className="text-sm font-medium">{technician.name}</span>
        </div>
        <div
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            score >= 80
              ? "bg-green-500/20 text-green-500"
              : score >= 60
              ? "bg-amber-500/20 text-amber-500"
              : "bg-muted text-muted-foreground"
          )}
        >
          {score}%
        </div>
      </div>

      {/* Time slot */}
      <div className="flex items-center gap-2 text-sm mb-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span>
          {format(slot.start, "EEE, MMM d")} at {format(slot.start, "h:mm a")}
        </span>
      </div>

      {/* Reasoning */}
      {reasoning.length > 0 && (
        <ul className="space-y-1 mb-3">
          {reasoning.slice(0, 3).map((reason, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-1.5"
            >
              <span className="text-green-500 mt-0.5">+</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Apply Button */}
      <Button
        size="sm"
        className={cn(
          "w-full h-8",
          isTop && "bg-violet-500 hover:bg-violet-600"
        )}
        variant={isTop ? "default" : "outline"}
        onClick={onApply}
      >
        {isTop ? "Apply Best Match" : "Apply"}
      </Button>
    </div>
  );
}

interface WorkloadCardProps {
  workload: TechnicianWorkload;
}

function WorkloadCard({ workload }: WorkloadCardProps) {
  const { technician, jobCount, totalHours, scheduled, inProgress, completed } =
    workload;

  const utilizationPercent = Math.min((totalHours / 8) * 100, 100);
  const isOverloaded = totalHours > 8;

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {technician.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{technician.name}</p>
            <p className="text-xs text-muted-foreground">
              {jobCount} jobs • {totalHours.toFixed(1)}h
            </p>
          </div>
        </div>
        {isOverloaded && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full transition-all rounded-full",
            utilizationPercent >= 100
              ? "bg-red-500"
              : utilizationPercent >= 80
              ? "bg-amber-500"
              : "bg-green-500"
          )}
          style={{ width: `${utilizationPercent}%` }}
        />
      </div>

      {/* Status breakdown */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{scheduled} scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">{inProgress} active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{completed} done</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Toggle button for opening the AI panel
 */
interface AISchedulingToggleProps {
  isOpen: boolean;
  onClick: () => void;
  hasAlerts?: boolean;
  className?: string;
}

export function AISchedulingToggle({
  isOpen,
  onClick,
  hasAlerts = false,
  className,
}: AISchedulingToggleProps) {
  return (
    <Button
      variant={isOpen ? "secondary" : "outline"}
      size="sm"
      className={cn(
        "gap-2 relative",
        isOpen && "bg-violet-500/10 border-violet-500/30",
        className
      )}
      onClick={onClick}
    >
      <Bot className={cn("h-4 w-4", isOpen && "text-violet-500")} />
      <span className="hidden sm:inline">AI Assistant</span>
      {hasAlerts && !isOpen && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
      )}
    </Button>
  );
}
