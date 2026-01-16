// Calendar 2026 - Main Revolutionary Calendar Component
// Integrates all AI features, views, and mobile components

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import {
  Calendar,
  CalendarDays,
  Clock,
  Map,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Command,
  Settings,
  LayoutGrid,
  GanttChart,
} from 'lucide-react';

// Import sub-components
import { AICommandBar } from './ai/AICommandBar';
import { AIConflictWizard } from './ai/AIConflictWizard';
import { TimelineView } from './views/TimelineView';
import { MapScheduleView } from './views/MapScheduleView';
import { PlaceholderView } from './views/PlaceholderView';
import { ScheduleBottomSheet } from './mobile/ScheduleBottomSheet';
import { QuickActionsWheel, useQuickActionsWheel } from './mobile/QuickActionsWheel';
import { SmartAgenda } from './smart/SmartAgenda';
import { CalendarOnboarding } from './onboarding/CalendarOnboarding';
import { useCalendar2026Store } from './store/calendarStore';
import type { CalendarEvent, CalendarResource, TimeRange } from '../calendar/CalendarProvider';
import type { ScheduleConflict, ParsedIntent, TimelineConfig } from './types';

// Import existing calendar views
import { CalendarProvider, useCalendarStore } from '../calendar/CalendarProvider';

interface Calendar2026Props {
  events: CalendarEvent[];
  resources: CalendarResource[];
  technicians?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date, newResourceId?: string) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onScheduleJob?: (data: any) => Promise<void>;
  onOptimizeRoutes?: () => Promise<any>;
  className?: string;
}

const VIEW_OPTIONS = [
  { id: 'day', label: 'Day', icon: Calendar },
  { id: 'week', label: 'Week', icon: CalendarDays },
  { id: 'month', label: 'Month', icon: LayoutGrid },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: GanttChart },
  { id: 'map', label: 'Map', icon: Map },
] as const;

export function Calendar2026({
  events,
  resources,
  technicians = [],
  clients = [],
  onEventClick,
  onEventDrop,
  onSlotClick,
  onScheduleJob,
  onOptimizeRoutes,
  className,
}: Calendar2026Props) {
  // Store hooks
  const {
    activeView,
    setActiveView,
    commandBarOpen,
    setCommandBarOpen,
    bottomSheet,
    setBottomSheet,
    conflicts,
    aiMode,
    timelineConfig,
  } = useCalendar2026Store();

  const { currentDate, setCurrentDate, goToToday, goToPrevious, goToNext, aiHighlightedSlots } =
    useCalendarStore();

  // Local state
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Quick actions wheel
  const quickActionsWheel = useQuickActionsWheel();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle AI command result
  const handleScheduleFromAI = useCallback(
    (intent: ParsedIntent) => {
      if (isMobile) {
        setBottomSheet({
          isOpen: true,
          snapPoint: 'half',
          content: 'schedule',
        });
      } else {
        // Open schedule modal on desktop
        onSlotClick?.(intent.date || new Date(), intent.technicianId);
      }
    },
    [isMobile, setBottomSheet, onSlotClick]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (view: string, date?: Date) => {
      setActiveView(view as any);
      if (date) {
        setCurrentDate(date);
      }
    },
    [setActiveView, setCurrentDate]
  );

  // Handle conflict resolution
  const handleResolveConflict = useCallback(
    async (suggestion: any) => {
      await suggestion.execute();
      setSelectedConflict(null);
    },
    []
  );

  // Handle quick action
  const handleQuickAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'new-job':
          if (isMobile) {
            setBottomSheet({ isOpen: true, snapPoint: 'half', content: 'schedule' });
          } else {
            onSlotClick?.(currentDate);
          }
          break;
        case 'ai-schedule':
          setCommandBarOpen(true);
          break;
        case 'optimize':
          onOptimizeRoutes?.();
          break;
        case 'view-team':
          setActiveView('team');
          break;
        case 'map-view':
          setActiveView('map');
          break;
      }
    },
    [isMobile, setBottomSheet, onSlotClick, currentDate, setCommandBarOpen, onOptimizeRoutes, setActiveView]
  );

  // Current view icon
  const CurrentViewIcon = VIEW_OPTIONS.find((v) => v.id === activeView)?.icon || Calendar;

  return (
    <CalendarProvider
      onEventClick={onEventClick}
      onEventDrop={onEventDrop}
      onSlotClick={onSlotClick}
    >
      {/* Onboarding for first-time users */}
      <CalendarOnboarding />

      <div
        className={cn("flex flex-col h-full bg-white rounded-lg overflow-hidden", className)}
        {...quickActionsWheel.handlers}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg ml-2 hidden sm:inline">
              {format(currentDate, 'MMMM d, yyyy')}
            </span>
          </div>

          {/* Center: View Selector */}
          <div className="hidden md:flex items-center gap-1 bg-white rounded-lg border p-1">
            {VIEW_OPTIONS.map((view) => (
              <Button
                key={view.id}
                variant={activeView === view.id ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  "gap-2",
                  activeView === view.id && "bg-violet-100 text-violet-700"
                )}
                onClick={() => setActiveView(view.id as any)}
              >
                <view.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{view.label}</span>
              </Button>
            ))}
          </div>

          {/* Mobile View Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="gap-2">
                <CurrentViewIcon className="h-4 w-4" />
                {VIEW_OPTIONS.find((v) => v.id === activeView)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {VIEW_OPTIONS.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={cn(
                    "gap-2",
                    activeView === view.id && "bg-violet-50 text-violet-700"
                  )}
                >
                  <view.icon className="h-4 w-4" />
                  {view.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* AI Command Bar Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
              onClick={() => setCommandBarOpen(true)}
            >
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="hidden lg:inline">AI Schedule</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>

            {/* New Job Button */}
            <Button
              className="gap-2 bg-violet-600 hover:bg-violet-700"
              onClick={() => {
                if (isMobile) {
                  setBottomSheet({ isOpen: true, snapPoint: 'half', content: 'schedule' });
                } else {
                  onSlotClick?.(currentDate);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Job</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'timeline' ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <TimelineView
                  events={events}
                  resources={resources}
                  currentDate={currentDate}
                  config={timelineConfig}
                  aiHighlightedSlots={aiHighlightedSlots}
                  onEventClick={onEventClick}
                  onSlotClick={onSlotClick}
                  onEventDrop={onEventDrop}
                />
              </motion.div>
            ) : activeView === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <MapScheduleView
                  events={events}
                  resources={resources}
                  currentDate={currentDate}
                  onEventClick={onEventClick}
                  onOptimizeRoutes={onOptimizeRoutes}
                />
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <PlaceholderView
                  viewType={activeView as 'day' | 'week' | 'month' | 'team'}
                  onNavigate={(view) => setActiveView(view as any)}
                  onOpenAISchedule={() => setCommandBarOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Command Bar */}
        <AICommandBar
          onScheduleJob={handleScheduleFromAI}
          onNavigate={handleNavigate}
          onOptimizeRoutes={onOptimizeRoutes}
          technicians={technicians}
          clients={clients}
        />

        {/* Conflict Wizard */}
        <AIConflictWizard
          conflict={selectedConflict}
          open={!!selectedConflict}
          onOpenChange={(open) => !open && setSelectedConflict(null)}
          onResolve={handleResolveConflict}
          onDismiss={() => setSelectedConflict(null)}
        />

        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {isMobile && (
            <ScheduleBottomSheet
              state={bottomSheet}
              onStateChange={setBottomSheet}
              selectedDate={currentDate}
              technicians={resources}
              clients={clients}
              onSchedule={onScheduleJob}
            />
          )}
        </AnimatePresence>

        {/* Quick Actions Wheel */}
        <QuickActionsWheel
          visible={quickActionsWheel.isVisible}
          position={quickActionsWheel.position}
          onClose={quickActionsWheel.close}
          onActionSelect={handleQuickAction}
        />
      </div>
    </CalendarProvider>
  );
}

// Re-export for convenience
export { SmartAgenda } from './smart/SmartAgenda';
export { AICommandBar } from './ai/AICommandBar';
export { TimelineView } from './views/TimelineView';
export { MapScheduleView } from './views/MapScheduleView';
export { CalendarOnboarding, resetCalendarOnboarding } from './onboarding/CalendarOnboarding';
