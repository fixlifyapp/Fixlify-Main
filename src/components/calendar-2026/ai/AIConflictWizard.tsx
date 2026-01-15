// AI Conflict Wizard - Smart Conflict Resolution
// When conflicts occur, AI offers 3 alternatives

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Route,
  Users,
  Zap,
  Timer,
  MapPin,
} from 'lucide-react';
import type { ScheduleConflict, ConflictSuggestion } from '../types';

interface AIConflictWizardProps {
  conflict: ScheduleConflict | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (suggestion: ConflictSuggestion) => Promise<void>;
  onDismiss: () => void;
}

export function AIConflictWizard({
  conflict,
  open,
  onOpenChange,
  onResolve,
  onDismiss,
}: AIConflictWizardProps) {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string | null>(null);
  const [isResolving, setIsResolving] = React.useState(false);

  const handleResolve = async () => {
    if (!selectedSuggestion || !conflict) return;

    const suggestion = conflict.suggestions.find((s) => s.id === selectedSuggestion);
    if (!suggestion) return;

    setIsResolving(true);
    try {
      await onResolve(suggestion);
      onOpenChange(false);
    } finally {
      setIsResolving(false);
    }
  };

  const getConflictIcon = (type: ScheduleConflict['type']) => {
    switch (type) {
      case 'overlap':
        return Clock;
      case 'travel_time':
        return Route;
      case 'workload':
        return Users;
      case 'business_hours':
        return Timer;
      default:
        return AlertTriangle;
    }
  };

  const getConflictColor = (severity: ScheduleConflict['severity']) => {
    return severity === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  };

  const getActionIcon = (action: ConflictSuggestion['action']) => {
    switch (action) {
      case 'move':
        return ArrowRight;
      case 'reassign':
        return User;
      case 'shorten':
        return Timer;
      case 'cancel':
        return XCircle;
      default:
        return Zap;
    }
  };

  if (!conflict) return null;

  const ConflictIcon = getConflictIcon(conflict.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                conflict.severity === 'error' ? 'bg-red-100' : 'bg-amber-100'
              )}
            >
              <ConflictIcon
                className={cn(
                  "h-5 w-5",
                  conflict.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                )}
              />
            </div>
            <div>
              <DialogTitle>Scheduling Conflict Detected</DialogTitle>
              <DialogDescription>{conflict.message}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Affected Events */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Affected Jobs</h4>
            <div className="space-y-2">
              {conflict.affectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: event.backgroundColor }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(event.end).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.extendedProps?.technicianName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.extendedProps.technicianName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* AI Suggestions */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h4 className="text-sm font-medium">AI Suggestions</h4>
              <Badge
                variant="outline"
                className="border-violet-200 bg-violet-50 text-violet-600 text-xs"
              >
                {conflict.suggestions.length} options
              </Badge>
            </div>

            <RadioGroup
              value={selectedSuggestion || ''}
              onValueChange={setSelectedSuggestion}
              className="space-y-3"
            >
              {conflict.suggestions.map((suggestion, index) => {
                const ActionIcon = getActionIcon(suggestion.action);
                const isSelected = selectedSuggestion === suggestion.id;

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Label
                      htmlFor={suggestion.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all",
                        isSelected
                          ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                          : "border-slate-200 hover:border-violet-200 hover:bg-slate-50"
                      )}
                    >
                      <RadioGroupItem value={suggestion.id} id={suggestion.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded",
                              isSelected ? 'bg-violet-200' : 'bg-slate-100'
                            )}
                          >
                            <ActionIcon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{suggestion.description}</span>
                          {index === 0 && (
                            <Badge className="bg-violet-600 text-[10px]">Recommended</Badge>
                          )}
                        </div>

                        {/* Show new slot info if applicable */}
                        {suggestion.newSlot && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {suggestion.newSlot.start.toLocaleDateString()}{' '}
                              {suggestion.newSlot.start.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {suggestion.newTechnician && (
                              <>
                                <span className="mx-1">•</span>
                                <User className="h-3 w-3" />
                                <span>{suggestion.newTechnician.title}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Impact description */}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Impact: {suggestion.impact}
                        </p>
                      </div>
                    </Label>
                  </motion.div>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button variant="ghost" onClick={onDismiss}>
            Ignore for now
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!selectedSuggestion || isResolving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isResolving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Apply Solution
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mini version for inline conflict indicators
export function ConflictIndicatorBadge({
  conflict,
  onClick,
}: {
  conflict: ScheduleConflict;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        conflict.severity === 'error'
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      <span>Conflict</span>
      <Badge
        variant="secondary"
        className={cn(
          "h-4 px-1 text-[10px]",
          conflict.severity === 'error' ? 'bg-red-200' : 'bg-amber-200'
        )}
      >
        {conflict.suggestions.length}
      </Badge>
    </motion.button>
  );
}
