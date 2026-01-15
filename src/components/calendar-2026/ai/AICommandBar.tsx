// Revolutionary AI Command Bar - Natural Language Scheduling
// Cmd+K / Ctrl+K to activate

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  MapPin,
  Zap,
  Route,
  Users,
  Search,
  Plus,
  ArrowRight,
  Loader2,
  Brain,
  Wand2,
  CalendarPlus,
  CalendarClock,
  Navigation,
  UserCheck,
  FileText,
} from 'lucide-react';
import { useCalendar2026Store } from '../store/calendarStore';
import { useNaturalLanguage } from '../hooks/useNaturalLanguage';
import type { ParsedIntent, SuggestedAction } from '../types';

interface AICommandBarProps {
  onScheduleJob?: (intent: ParsedIntent) => void;
  onNavigate?: (view: string, date?: Date) => void;
  onOptimizeRoutes?: () => void;
  technicians?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string }>;
}

export function AICommandBar({
  onScheduleJob,
  onNavigate,
  onOptimizeRoutes,
  technicians = [],
  clients = [],
}: AICommandBarProps) {
  const { commandBarOpen, setCommandBarOpen, currentCommand, setCurrentCommand } = useCalendar2026Store();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedIntent | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedAction[]>([]);

  const { parseCommand, isLoading: isParsingNLP } = useNaturalLanguage();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(!commandBarOpen);
      }
      // Escape to close
      if (e.key === 'Escape' && commandBarOpen) {
        setCommandBarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandBarOpen, setCommandBarOpen]);

  // Parse natural language input with debounce
  useEffect(() => {
    if (!currentCommand || currentCommand.length < 3) {
      setParsedResult(null);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await parseCommand(currentCommand, { technicians, clients });
        setParsedResult(result);
        generateSuggestions(result);
      } catch (error) {
        console.error('Error parsing command:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentCommand, parseCommand, technicians, clients]);

  const generateSuggestions = useCallback((intent: ParsedIntent | null) => {
    if (!intent) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: SuggestedAction[] = [];

    if (intent.action === 'schedule' && intent.technician) {
      newSuggestions.push({
        id: 'schedule-direct',
        label: `Schedule ${intent.jobType || 'job'} with ${intent.technician}`,
        description: intent.date
          ? `${intent.timePreference || 'Any time'} on ${intent.date.toLocaleDateString()}`
          : 'AI will find the best slot',
        icon: 'calendar-plus',
        execute: async () => {
          onScheduleJob?.(intent);
          setCommandBarOpen(false);
        },
      });
    }

    if (intent.action === 'find' || intent.action === 'show') {
      newSuggestions.push({
        id: 'show-view',
        label: `Show ${intent.technician || intent.client || 'schedule'}`,
        description: 'Jump to the relevant view',
        icon: 'search',
        execute: async () => {
          onNavigate?.('team', intent.date);
          setCommandBarOpen(false);
        },
      });
    }

    if (intent.action === 'optimize') {
      newSuggestions.push({
        id: 'optimize-routes',
        label: 'Optimize today\'s routes',
        description: 'AI will calculate the best route order',
        icon: 'route',
        execute: async () => {
          onOptimizeRoutes?.();
          setCommandBarOpen(false);
        },
      });
    }

    setSuggestions(newSuggestions);
  }, [onScheduleJob, onNavigate, onOptimizeRoutes, setCommandBarOpen]);

  const quickActions = [
    {
      id: 'new-job',
      icon: CalendarPlus,
      label: 'New Job',
      description: 'Create a new job',
      shortcut: 'N',
      action: () => {
        onScheduleJob?.({ action: 'create' });
        setCommandBarOpen(false);
      },
    },
    {
      id: 'auto-schedule',
      icon: Wand2,
      label: 'Auto-Schedule Unassigned',
      description: 'AI schedules all unassigned jobs',
      shortcut: '⇧A',
      aiPowered: true,
      action: () => {
        // Trigger AI auto-scheduling
        setCommandBarOpen(false);
      },
    },
    {
      id: 'optimize-routes',
      icon: Route,
      label: 'Optimize Routes',
      description: 'Optimize today\'s travel routes',
      shortcut: '⇧O',
      aiPowered: true,
      action: () => {
        onOptimizeRoutes?.();
        setCommandBarOpen(false);
      },
    },
    {
      id: 'fill-gaps',
      icon: CalendarClock,
      label: 'Fill Empty Slots',
      description: 'Find jobs to fill schedule gaps',
      shortcut: '⇧F',
      aiPowered: true,
      action: () => {
        setCommandBarOpen(false);
      },
    },
  ];

  const viewActions = [
    { id: 'view-day', icon: Calendar, label: 'Day View', view: 'day' },
    { id: 'view-week', icon: Calendar, label: 'Week View', view: 'week' },
    { id: 'view-timeline', icon: ArrowRight, label: 'Timeline View', view: 'timeline' },
    { id: 'view-map', icon: MapPin, label: 'Map View', view: 'map' },
    { id: 'view-team', icon: Users, label: 'Team View', view: 'team' },
  ];

  return (
    <CommandDialog open={commandBarOpen} onOpenChange={setCommandBarOpen}>
      <div className="relative">
        {/* AI Badge */}
        <div className="absolute right-3 top-3 z-10">
          <Badge
            variant="outline"
            className={cn(
              "gap-1 transition-colors",
              isProcessing || isParsingNLP
                ? "border-violet-400 bg-violet-50 text-violet-600"
                : "border-slate-200"
            )}
          >
            {isProcessing || isParsingNLP ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>AI Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>AI Ready</span>
              </>
            )}
          </Badge>
        </div>

        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Try: 'Schedule John for AC repair tomorrow morning'"
            value={currentCommand}
            onValueChange={setCurrentCommand}
            className="h-14 text-base"
          />

          <CommandList className="max-h-[400px]">
            {/* AI Parsed Result */}
            <AnimatePresence>
              {parsedResult && currentCommand.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="border-b bg-gradient-to-r from-violet-50 to-purple-50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-violet-600" />
                      <span className="text-sm font-medium text-violet-800">
                        AI Understanding
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {parsedResult.action && (
                        <Badge variant="secondary" className="bg-white">
                          <Zap className="h-3 w-3 mr-1" />
                          {parsedResult.action}
                        </Badge>
                      )}
                      {parsedResult.technician && (
                        <Badge variant="secondary" className="bg-white">
                          <User className="h-3 w-3 mr-1" />
                          {parsedResult.technician}
                        </Badge>
                      )}
                      {parsedResult.jobType && (
                        <Badge variant="secondary" className="bg-white">
                          <FileText className="h-3 w-3 mr-1" />
                          {parsedResult.jobType}
                        </Badge>
                      )}
                      {parsedResult.date && (
                        <Badge variant="secondary" className="bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {parsedResult.date.toLocaleDateString()}
                        </Badge>
                      )}
                      {parsedResult.timePreference && (
                        <Badge variant="secondary" className="bg-white">
                          <Clock className="h-3 w-3 mr-1" />
                          {parsedResult.timePreference}
                        </Badge>
                      )}
                      {parsedResult.location && (
                        <Badge variant="secondary" className="bg-white">
                          <MapPin className="h-3 w-3 mr-1" />
                          {parsedResult.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <CommandGroup heading="AI Suggestions">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    onSelect={() => suggestion.execute()}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandEmpty>
              <div className="py-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Type a command or search...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try: "Schedule", "Show John's jobs", "Optimize routes"
                </p>
              </div>
            </CommandEmpty>

            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={action.action}
                  className="flex items-center gap-3 p-2"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      action.aiPowered
                        ? "bg-gradient-to-br from-violet-100 to-purple-100"
                        : "bg-slate-100"
                    )}
                  >
                    <action.icon
                      className={cn(
                        "h-4 w-4",
                        action.aiPowered ? "text-violet-600" : "text-slate-600"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.label}</span>
                      {action.aiPowered && (
                        <Badge
                          variant="outline"
                          className="h-5 border-violet-200 bg-violet-50 text-violet-600 text-[10px]"
                        >
                          AI
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>{action.shortcut}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* View Switcher */}
            <CommandGroup heading="Switch View">
              {viewActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    onNavigate?.(action.view);
                    setCommandBarOpen(false);
                  }}
                  className="flex items-center gap-3 p-2"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Technicians Quick Jump */}
            {technicians.length > 0 && (
              <CommandGroup heading="Jump to Technician">
                {technicians.slice(0, 5).map((tech) => (
                  <CommandItem
                    key={tech.id}
                    onSelect={() => {
                      onNavigate?.('team', undefined);
                      setCommandBarOpen(false);
                    }}
                    className="flex items-center gap-3 p-2"
                  >
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{tech.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-white px-1">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-white px-1">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-white px-1">Esc</kbd> Close
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-violet-600">
              <Sparkles className="h-3 w-3" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </Command>
      </div>
    </CommandDialog>
  );
}
