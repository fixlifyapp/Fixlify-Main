// Smart Agenda - AI Morning Brief with Weather
// Revolutionary daily overview for technicians with Gemini AI insights

import * as React from 'react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, differenceInMinutes, isSameDay } from 'date-fns';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Thermometer,
  AlertTriangle,
  Clock,
  MapPin,
  Route,
  Zap,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Car,
  User,
  DollarSign,
  Calendar,
  CheckCircle2,
  Timer,
  Sparkles,
  RefreshCw,
  Brain,
  Target,
  Activity,
} from 'lucide-react';
import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';
import type { DailyBrief, WeatherInfo, AgendaInsight, AgendaWarning } from '../types';
import { useAIScheduling2026 } from '../hooks/useAIScheduling2026';

interface SmartAgendaProps {
  date?: Date;
  events: CalendarEvent[];
  resources?: CalendarResource[];
  technicianName?: string;
  weather?: WeatherInfo;
  estimatedRevenue?: number;
  completedJobs?: number;
  enableAI?: boolean;
  onJobClick?: (jobId: string) => void;
  onOptimizeRoutes?: () => void;
  className?: string;
}

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  hot: Thermometer,
  cold: Thermometer,
};

const WEATHER_COLORS = {
  sunny: 'bg-amber-100 text-amber-700',
  cloudy: 'bg-slate-100 text-slate-700',
  rainy: 'bg-blue-100 text-blue-700',
  snowy: 'bg-cyan-100 text-cyan-700',
  hot: 'bg-red-100 text-red-700',
  cold: 'bg-indigo-100 text-indigo-700',
};

// Helper to get icon name from insight type
function getInsightIcon(type: string): string {
  switch (type) {
    case 'optimization':
    case 'route_optimization':
      return 'route';
    case 'workload':
    case 'workload_balance':
      return 'balance';
    case 'scheduling_gap':
    case 'gap':
      return 'gap';
    case 'client_preference':
      return 'client';
    case 'efficiency':
      return 'efficiency';
    case 'warning':
    case 'alert':
      return 'alert';
    default:
      return 'tip';
  }
}

export function SmartAgenda({
  date = new Date(),
  events,
  resources = [],
  technicianName = 'there',
  weather,
  estimatedRevenue = 0,
  completedJobs = 0,
  enableAI = true,
  onJobClick,
  onOptimizeRoutes,
  className,
}: SmartAgendaProps) {
  // AI scheduling hook for insights
  const { generateInsights, isLoading: aiLoading } = useAIScheduling2026({
    events,
    resources,
    useGemini: enableAI,
  });

  // State for AI insights
  const [aiInsights, setAiInsights] = useState<AgendaInsight[]>([]);
  const [scheduleHealth, setScheduleHealth] = useState<{
    score: number;
    factors: { efficiency: number; balance: number; gaps: number; travel: number };
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Filter today's events
  const todaysEvents = useMemo(() => {
    return events
      .filter((e) => isSameDay(new Date(e.start), date))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, date]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = todaysEvents.length;
    const completed = todaysEvents.filter((e) => e.status === 'completed').length;
    const inProgress = todaysEvents.filter((e) => e.status === 'in-progress').length;
    const highPriority = todaysEvents.filter(
      (e) => e.extendedProps?.description?.includes('urgent') || e.extendedProps?.description?.includes('priority')
    ).length;

    // Estimate drive time (placeholder - would use real routing API)
    const estimatedDriveMinutes = total * 15;

    // Calculate work hours
    const totalMinutes = todaysEvents.reduce((sum, e) => {
      return sum + differenceInMinutes(new Date(e.end), new Date(e.start));
    }, 0);

    return {
      total,
      completed,
      inProgress,
      remaining: total - completed,
      highPriority,
      estimatedDriveMinutes,
      workHours: Math.round(totalMinutes / 60 * 10) / 10,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [todaysEvents]);

  // Fetch AI insights
  const fetchAIInsights = useCallback(async () => {
    if (!enableAI || todaysEvents.length === 0) return;

    setIsLoadingInsights(true);
    try {
      const result = await generateInsights(todaysEvents, resources);

      if (result?.insights) {
        // Transform AI insights to AgendaInsight format
        const transformed: AgendaInsight[] = result.insights.map((insight: any, idx: number) => ({
          id: `ai-${idx}`,
          type: insight.type || 'tip',
          message: insight.message,
          icon: getInsightIcon(insight.type),
        }));
        setAiInsights(transformed);
      }

      if (result?.scheduleHealth) {
        setScheduleHealth(result.scheduleHealth);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [enableAI, todaysEvents, resources, generateInsights]);

  // Fetch insights on mount and when events change
  useEffect(() => {
    if (enableAI && todaysEvents.length > 0) {
      fetchAIInsights();
    }
  }, [date, todaysEvents.length]);

  // Generate local insights as fallback
  const localInsights = useMemo((): AgendaInsight[] => {
    const result: AgendaInsight[] = [];

    if (stats.highPriority > 0) {
      result.push({
        id: 'priority',
        type: 'tip',
        message: `${stats.highPriority} high-priority ${stats.highPriority === 1 ? 'job' : 'jobs'} today`,
        icon: 'alert',
      });
    }

    if (stats.estimatedDriveMinutes > 60) {
      result.push({
        id: 'drive',
        type: 'route_tip',
        message: `~${Math.round(stats.estimatedDriveMinutes / 60)}h drive time - consider optimizing routes`,
        icon: 'route',
      });
    }

    if (weather?.condition === 'rainy' || weather?.condition === 'snowy') {
      result.push({
        id: 'weather',
        type: 'tip',
        message: 'Weather alert: Allow extra travel time',
        icon: 'weather',
      });
    }

    return result;
  }, [stats, weather]);

  // Use AI insights if available, otherwise fall back to local
  const insights = aiInsights.length > 0 ? aiInsights : localInsights;

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const WeatherIcon = weather ? WEATHER_ICONS[weather.condition] : Sun;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold"
            >
              {greeting}, {technicianName}!
            </motion.h2>
            <p className="text-violet-200 mt-1">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Weather Widget */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2",
                "bg-white/20 backdrop-blur-sm"
              )}
            >
              <WeatherIcon className="h-6 w-6" />
              <span className="text-lg font-semibold">{weather.temperature}°</span>
            </motion.div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <QuickStat value={stats.total} label="Jobs" icon={Calendar} />
          <QuickStat value={stats.remaining} label="Remaining" icon={Clock} />
          <QuickStat value={`${stats.workHours}h`} label="Work Time" icon={Timer} />
          <QuickStat
            value={`${Math.round(stats.estimatedDriveMinutes / 60)}h`}
            label="Drive Time"
            icon={Car}
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-violet-200">Day Progress</span>
            <span className="font-semibold">{stats.completionPercent}%</span>
          </div>
          <Progress value={stats.completionPercent} className="h-2 bg-white/20" />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Schedule Health Score (AI-powered) */}
        {scheduleHealth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-600" />
                <span className="font-medium text-sm text-violet-800">Schedule Health</span>
                <Badge variant="outline" className="text-[10px] bg-violet-100 border-violet-200 text-violet-700">
                  AI
                </Badge>
              </div>
              <span className={cn(
                "text-lg font-bold",
                scheduleHealth.score >= 80 ? "text-emerald-600" :
                scheduleHealth.score >= 60 ? "text-amber-600" : "text-red-600"
              )}>
                {scheduleHealth.score}%
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <Activity className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                <span className="text-muted-foreground">Efficiency</span>
                <div className="font-medium">{scheduleHealth.factors.efficiency}%</div>
              </div>
              <div className="text-center">
                <Target className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                <span className="text-muted-foreground">Balance</span>
                <div className="font-medium">{scheduleHealth.factors.balance}%</div>
              </div>
              <div className="text-center">
                <Clock className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                <span className="text-muted-foreground">Gaps</span>
                <div className="font-medium">{scheduleHealth.factors.gaps}%</div>
              </div>
              <div className="text-center">
                <Route className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                <span className="text-muted-foreground">Travel</span>
                <div className="font-medium">{scheduleHealth.factors.travel}%</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        {(insights.length > 0 || isLoadingInsights) && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <span className="font-medium text-sm">AI Insights</span>
                {aiInsights.length > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-violet-100 border-violet-200 text-violet-700">
                    Gemini
                  </Badge>
                )}
              </div>
              {enableAI && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={fetchAIInsights}
                  disabled={isLoadingInsights}
                >
                  <RefreshCw className={cn("h-3 w-3", isLoadingInsights && "animate-spin")} />
                </Button>
              )}
            </div>

            {isLoadingInsights ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-violet-50 text-sm"
                    >
                      <InsightIcon type={insight.icon} />
                      <span className="text-violet-800">{insight.message}</span>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Weather Recommendation */}
        {weather?.recommendation && (
          <div className={cn(
            "mb-4 p-3 rounded-lg flex items-center gap-3",
            WEATHER_COLORS[weather.condition]
          )}>
            <WeatherIcon className="h-5 w-5 shrink-0" />
            <span className="text-sm">{weather.recommendation}</span>
          </div>
        )}

        {/* Optimize Routes Button */}
        {stats.total > 1 && (
          <Button
            onClick={onOptimizeRoutes}
            variant="outline"
            className="w-full mb-4 border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            <Route className="mr-2 h-4 w-4" />
            Optimize Today's Routes
            <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700">
              AI
            </Badge>
          </Button>
        )}

        <Separator className="mb-4" />

        {/* Job List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Today's Schedule</span>
            <Badge variant="outline">{stats.total} jobs</Badge>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-2">
              {todaysEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No jobs scheduled for today</p>
                </div>
              ) : (
                todaysEvents.map((event, index) => (
                  <JobCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => onJobClick?.(event.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Revenue Estimate */}
        {estimatedRevenue > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Est. Revenue</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">
                ${estimatedRevenue.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Quick stat component for header
function QuickStat({
  value,
  label,
  icon: Icon,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className="h-4 w-4 text-violet-200" />
        <span className="text-xl font-bold">{value}</span>
      </div>
      <span className="text-xs text-violet-200">{label}</span>
    </motion.div>
  );
}

// Dynamic icon for insights
function InsightIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4 text-violet-600 shrink-0";

  switch (type) {
    case 'route':
      return <Route className={iconClass} />;
    case 'balance':
      return <Target className={iconClass} />;
    case 'gap':
      return <Clock className={iconClass} />;
    case 'client':
      return <User className={iconClass} />;
    case 'efficiency':
      return <TrendingUp className={iconClass} />;
    case 'alert':
      return <AlertTriangle className={cn(iconClass, "text-amber-600")} />;
    default:
      return <Lightbulb className={iconClass} />;
  }
}

// Job card component
function JobCard({
  event,
  index,
  onClick,
}: {
  event: CalendarEvent;
  index: number;
  onClick?: () => void;
}) {
  const statusStyles = {
    scheduled: 'border-l-blue-500 bg-blue-50/50',
    'in-progress': 'border-l-amber-500 bg-amber-50/50',
    completed: 'border-l-emerald-500 bg-emerald-50/50',
    cancelled: 'border-l-slate-400 bg-slate-50/50 opacity-60',
    'no-show': 'border-l-red-500 bg-red-50/50',
  };

  const statusIcons = {
    scheduled: Clock,
    'in-progress': Zap,
    completed: CheckCircle2,
    cancelled: AlertTriangle,
    'no-show': AlertTriangle,
  };

  const StatusIcon = statusIcons[event.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border-l-4 cursor-pointer transition-all",
        "hover:shadow-md hover:scale-[1.02]",
        statusStyles[event.status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{event.title}</span>
            <StatusIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(event.start), 'h:mm a')}
            </span>
            {event.extendedProps?.clientName && (
              <span className="flex items-center gap-1 truncate">
                <User className="h-3 w-3" />
                {event.extendedProps.clientName}
              </span>
            )}
          </div>
          {event.extendedProps?.address && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {event.extendedProps.address}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </motion.div>
  );
}

// Compact version for sidebar
export function SmartAgendaCompact({
  events,
  date = new Date(),
  onViewFull,
}: {
  events: CalendarEvent[];
  date?: Date;
  onViewFull?: () => void;
}) {
  const todaysEvents = events
    .filter((e) => isSameDay(new Date(e.start), date))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const completed = todaysEvents.filter((e) => e.status === 'completed').length;
  const total = todaysEvents.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          Today's Agenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-sm text-muted-foreground">
            {completed}/{total} done
          </span>
        </div>
        <Progress value={total > 0 ? (completed / total) * 100 : 0} className="h-2 mb-3" />
        <Button
          variant="ghost"
          className="w-full text-violet-600"
          onClick={onViewFull}
        >
          View Full Agenda
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
