// Schedule Bottom Sheet - Drag-up Mobile Interface
// Revolutionary mobile scheduling experience

import * as React from 'react';
import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  X,
  GripHorizontal,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  ChevronRight,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';
import type { BottomSheetState, ParsedIntent } from '../types';

interface ScheduleBottomSheetProps {
  state: BottomSheetState;
  onStateChange: (state: Partial<BottomSheetState>) => void;
  selectedDate?: Date;
  selectedTime?: Date;
  selectedTechnician?: CalendarResource;
  technicians?: CalendarResource[];
  clients?: Array<{ id: string; name: string; phone?: string }>;
  jobTypes?: string[];
  onSchedule?: (data: {
    date: Date;
    startTime: Date;
    endTime: Date;
    technicianId: string;
    clientId?: string;
    jobType?: string;
    notes?: string;
  }) => Promise<void>;
  aiSuggestion?: ParsedIntent;
}

const SNAP_POINTS = {
  closed: '0%',
  peek: '25%',
  half: '50%',
  full: '90%',
};

const SNAP_HEIGHTS = {
  closed: 0,
  peek: 0.25,
  half: 0.5,
  full: 0.9,
};

export function ScheduleBottomSheet({
  state,
  onStateChange,
  selectedDate = new Date(),
  selectedTime,
  selectedTechnician,
  technicians = [],
  clients = [],
  jobTypes = ['Service Call', 'Repair', 'Installation', 'Maintenance', 'Inspection'],
  onSchedule,
  aiSuggestion,
}: ScheduleBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: selectedDate,
    startTime: selectedTime || new Date(),
    duration: 60, // minutes
    technicianId: selectedTechnician?.id || '',
    clientId: '',
    jobType: '',
    notes: '',
  });

  // Motion values for drag
  const y = useMotionValue(0);
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Calculate current height based on snap point
  const getSnapHeight = (snapPoint: BottomSheetState['snapPoint']) => {
    return windowHeight * SNAP_HEIGHTS[snapPoint];
  };

  // Handle drag end - snap to nearest point
  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const velocity = info.velocity.y;
      const currentY = y.get();
      const threshold = 50;

      // Determine direction
      if (velocity > 500 || currentY > threshold) {
        // Swiping down
        if (state.snapPoint === 'full') {
          onStateChange({ snapPoint: 'half' });
        } else if (state.snapPoint === 'half') {
          onStateChange({ snapPoint: 'peek' });
        } else {
          onStateChange({ isOpen: false, snapPoint: 'closed' });
        }
      } else if (velocity < -500 || currentY < -threshold) {
        // Swiping up
        if (state.snapPoint === 'peek') {
          onStateChange({ snapPoint: 'half' });
        } else if (state.snapPoint === 'half') {
          onStateChange({ snapPoint: 'full' });
        }
      }

      y.set(0);
    },
    [state.snapPoint, onStateChange, y]
  );

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.technicianId) return;

    setIsSubmitting(true);
    try {
      const endTime = new Date(formData.startTime);
      endTime.setMinutes(endTime.getMinutes() + formData.duration);

      await onSchedule?.({
        date: formData.date,
        startTime: formData.startTime,
        endTime,
        technicianId: formData.technicianId,
        clientId: formData.clientId || undefined,
        jobType: formData.jobType || undefined,
        notes: formData.notes || undefined,
      });

      onStateChange({ isOpen: false, snapPoint: 'closed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close handler
  const handleClose = () => {
    onStateChange({ isOpen: false, snapPoint: 'closed' });
  };

  if (!state.isOpen) return null;

  const sheetHeight = getSnapHeight(state.snapPoint);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: state.snapPoint === 'full' ? 0.5 : 0.3 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black z-40"
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }}
        animate={{ y: `${100 - SNAP_HEIGHTS[state.snapPoint] * 100}%` }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-white rounded-t-3xl shadow-2xl",
          "flex flex-col"
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold">Schedule Job</h2>
            <p className="text-sm text-muted-foreground">
              {format(formData.date, 'EEEE, MMMM d')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Suggestion Banner */}
        {aiSuggestion && (
          <div className="mx-6 mb-4 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 p-3 border border-violet-100">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="font-medium text-violet-800">AI Suggestion</span>
            </div>
            <p className="text-sm text-violet-700 mt-1">
              {aiSuggestion.technician && `${aiSuggestion.technician} `}
              {aiSuggestion.timePreference && `in the ${aiSuggestion.timePreference}`}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 h-7 text-violet-600"
              onClick={() => {
                if (aiSuggestion.technicianId) {
                  setFormData((prev) => ({ ...prev, technicianId: aiSuggestion.technicianId! }));
                }
              }}
            >
              Apply Suggestion
            </Button>
          </div>
        )}

        {/* Peek View - Quick Stats */}
        {state.snapPoint === 'peek' && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-3">
              <QuickStatCard
                icon={Calendar}
                label="Date"
                value={format(formData.date, 'MMM d')}
                onClick={() => onStateChange({ snapPoint: 'half' })}
              />
              <QuickStatCard
                icon={Clock}
                label="Time"
                value={format(formData.startTime, 'h:mm a')}
                onClick={() => onStateChange({ snapPoint: 'half' })}
              />
              <QuickStatCard
                icon={User}
                label="Tech"
                value={
                  technicians.find((t) => t.id === formData.technicianId)?.title.split(' ')[0] ||
                  'Select'
                }
                onClick={() => onStateChange({ snapPoint: 'half' })}
              />
            </div>
            <Button
              className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
              onClick={() => onStateChange({ snapPoint: 'full' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Schedule
            </Button>
          </div>
        )}

        {/* Half/Full View - Form */}
        {(state.snapPoint === 'half' || state.snapPoint === 'full') && (
          <div className="flex-1 overflow-y-auto px-6 pb-safe">
            {/* Technician Selection */}
            <div className="mb-6">
              <Label className="mb-2 block">Technician</Label>
              <div className="grid grid-cols-2 gap-2">
                {technicians.slice(0, 4).map((tech) => (
                  <TechnicianCard
                    key={tech.id}
                    technician={tech}
                    selected={formData.technicianId === tech.id}
                    onClick={() => setFormData((prev) => ({ ...prev, technicianId: tech.id }))}
                  />
                ))}
              </div>
            </div>

            {state.snapPoint === 'full' && (
              <>
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="mb-2 block">Date</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.date, 'MMM d, yyyy')}
                    </Button>
                  </div>
                  <div>
                    <Label className="mb-2 block">Time</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {format(formData.startTime, 'h:mm a')}
                    </Button>
                  </div>
                </div>

                {/* Duration Quick Select */}
                <div className="mb-6">
                  <Label className="mb-2 block">Duration</Label>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map((mins) => (
                      <Button
                        key={mins}
                        variant={formData.duration === mins ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "flex-1",
                          formData.duration === mins && "bg-violet-600 hover:bg-violet-700"
                        )}
                        onClick={() => setFormData((prev) => ({ ...prev, duration: mins }))}
                      >
                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Client Selection */}
                <div className="mb-6">
                  <Label className="mb-2 block">Client (Optional)</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {clients.find((c) => c.id === formData.clientId)?.name || 'Select client'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Job Type */}
                <div className="mb-6">
                  <Label className="mb-2 block">Job Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={formData.jobType === type ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer py-1.5 px-3",
                          formData.jobType === type && "bg-violet-600"
                        )}
                        onClick={() => setFormData((prev) => ({ ...prev, jobType: type }))}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <Label className="mb-2 block">Notes (Optional)</Label>
                  <Input
                    placeholder="Add any notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="sticky bottom-0 pt-4 pb-6 bg-white">
              <Button
                className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700"
                disabled={!formData.technicianId || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Check className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? 'Scheduling...' : 'Schedule Job'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

// Quick stat card for peek view
function QuickStatCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
      <CardContent className="p-3 text-center">
        <Icon className="h-5 w-5 mx-auto mb-1 text-violet-600" />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-sm truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

// Technician selection card
function TechnicianCard({
  technician,
  selected,
  onClick,
}: {
  technician: CalendarResource;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
        selected
          ? "border-violet-500 bg-violet-50"
          : "border-slate-200 hover:border-violet-200"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback
          style={{ backgroundColor: technician.color || '#8b5cf6' }}
          className="text-white"
        >
          {technician.title
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{technician.title}</p>
        {selected && (
          <Badge variant="secondary" className="mt-1 text-[10px] bg-violet-100 text-violet-700">
            Selected
          </Badge>
        )}
      </div>
      {selected && (
        <Check className="h-5 w-5 text-violet-600 shrink-0" />
      )}
    </motion.button>
  );
}
