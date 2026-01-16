// Placeholder View - Better UX for unimplemented views
// Guides users to working features (Timeline, Map)

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CalendarDays,
  LayoutGrid,
  Users,
  GanttChart,
  Map,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  Route,
  MousePointer,
} from 'lucide-react';

type ViewType = 'day' | 'week' | 'month' | 'team';

interface PlaceholderViewProps {
  viewType: ViewType;
  onNavigate: (view: string) => void;
  onOpenAISchedule: () => void;
}

const VIEW_INFO: Record<ViewType, {
  icon: React.ElementType;
  title: string;
  description: string;
}> = {
  day: {
    icon: Calendar,
    title: 'Day View',
    description: 'Classic day view is being enhanced with AI features',
  },
  week: {
    icon: CalendarDays,
    title: 'Week View',
    description: 'Weekly overview is being upgraded with smart insights',
  },
  month: {
    icon: LayoutGrid,
    title: 'Month View',
    description: 'Month calendar is getting a modern redesign',
  },
  team: {
    icon: Users,
    title: 'Team View',
    description: 'Team scheduling with AI optimization coming soon',
  },
};

const QUICK_ACTIONS = [
  {
    id: 'timeline',
    icon: GanttChart,
    title: 'Timeline View',
    description: 'Horizontal timeline with zoom',
    badge: 'New',
    action: 'timeline',
  },
  {
    id: 'map',
    icon: Map,
    title: 'Map View',
    description: 'See jobs on map with weather',
    badge: 'New',
    action: 'map',
  },
];

export function PlaceholderView({ viewType, onNavigate, onOpenAISchedule }: PlaceholderViewProps) {
  const viewInfo = VIEW_INFO[viewType];
  const Icon = viewInfo.icon;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Icon className="h-10 w-10 text-slate-400" />
            </div>
            <Badge
              className="absolute -top-2 -right-2 bg-violet-500 hover:bg-violet-500"
            >
              Coming Soon
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">{viewInfo.title}</h2>
        <p className="text-muted-foreground mb-8">{viewInfo.description}</p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-muted-foreground">Try our new views</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {QUICK_ACTIONS.map((action) => (
            <Card
              key={action.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md hover:border-violet-200",
                "group"
              )}
              onClick={() => onNavigate(action.action)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0 group-hover:from-violet-200 group-hover:to-purple-200 transition-colors">
                    <action.icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.title}</span>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">
                        {action.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Schedule CTA */}
        <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold text-violet-900">AI Schedule</h3>
          </div>
          <p className="text-sm text-violet-700 mb-4">
            Type naturally to schedule: "Schedule John for AC repair tomorrow at 9am"
          </p>
          <Button
            onClick={onOpenAISchedule}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            <Zap className="h-4 w-4" />
            Open AI Schedule
            <kbd className="ml-2 rounded bg-violet-500 px-1.5 py-0.5 text-[10px] text-violet-100">
              ⌘K
            </kbd>
          </Button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MousePointer className="h-3 w-3" />
            Click tabs above to switch views
          </span>
        </div>
      </motion.div>
    </div>
  );
}
