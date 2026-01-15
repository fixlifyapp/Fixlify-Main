// Swipe Time Picker - Clock Face with Gestures
// Revolutionary time selection for mobile

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, addMinutes } from 'date-fns';
import {
  Clock,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';

interface SwipeTimePickerProps {
  value?: Date;
  onChange?: (time: Date) => void;
  minTime?: string; // "HH:MM"
  maxTime?: string; // "HH:MM"
  interval?: number; // minutes
  aiSuggestedSlots?: Date[];
  onConfirm?: (time: Date) => void;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const AM_PM = ['AM', 'PM'] as const;

export function SwipeTimePicker({
  value = new Date(),
  onChange,
  minTime = '06:00',
  maxTime = '22:00',
  interval = 30,
  aiSuggestedSlots = [],
  onConfirm,
  className,
}: SwipeTimePickerProps) {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState(value.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(
    Math.round(value.getMinutes() / interval) * interval
  );
  const [isPM, setIsPM] = useState(value.getHours() >= 12);

  // Calculate angle for clock hand
  const hourAngle = (selectedHour % 12) * 30 - 90; // 30 degrees per hour
  const minuteAngle = selectedMinute * 6 - 90; // 6 degrees per minute

  // Generate available minute slots
  const minuteSlots = useMemo(() => {
    const slots: number[] = [];
    for (let m = 0; m < 60; m += interval) {
      slots.push(m);
    }
    return slots;
  }, [interval]);

  // Get current time as Date
  const getCurrentTime = useCallback(() => {
    let hours = selectedHour;
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, selectedMinute, 0, 0);
    return date;
  }, [selectedHour, selectedMinute, isPM]);

  // Check if time is AI suggested
  const isAISuggested = useCallback(
    (hour: number, minute: number) => {
      return aiSuggestedSlots.some((slot) => {
        const slotHour = slot.getHours() % 12 || 12;
        const slotMinute = slot.getMinutes();
        const slotIsPM = slot.getHours() >= 12;
        return slotHour === hour && slotMinute === minute && slotIsPM === isPM;
      });
    },
    [aiSuggestedSlots, isPM]
  );

  // Handle hour selection
  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    setMode('minute');
    onChange?.(getCurrentTime());
  };

  // Handle minute selection
  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    onChange?.(getCurrentTime());
  };

  // Handle AM/PM toggle
  const handleToggleAMPM = () => {
    setIsPM(!isPM);
    onChange?.(getCurrentTime());
  };

  // Get time of day icon
  const getTimeOfDayIcon = () => {
    const hours = isPM ? (selectedHour === 12 ? 12 : selectedHour + 12) : selectedHour;
    if (hours >= 6 && hours < 12) return Sun;
    if (hours >= 12 && hours < 18) return Sunset;
    return Moon;
  };

  const TimeIcon = getTimeOfDayIcon();

  return (
    <div className={cn("flex flex-col items-center p-6", className)}>
      {/* Time Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TimeIcon className="h-5 w-5 text-violet-600" />
          <Badge variant="outline" className="text-xs">
            {isPM ? 'Afternoon' : 'Morning'}
          </Badge>
        </div>
        <div className="flex items-baseline justify-center">
          <motion.span
            className={cn(
              "text-5xl font-bold cursor-pointer transition-colors",
              mode === 'hour' ? "text-violet-600" : "text-slate-400"
            )}
            onClick={() => setMode('hour')}
            whileTap={{ scale: 0.95 }}
          >
            {selectedHour.toString().padStart(2, '0')}
          </motion.span>
          <span className="text-5xl font-bold text-slate-300 mx-1">:</span>
          <motion.span
            className={cn(
              "text-5xl font-bold cursor-pointer transition-colors",
              mode === 'minute' ? "text-violet-600" : "text-slate-400"
            )}
            onClick={() => setMode('minute')}
            whileTap={{ scale: 0.95 }}
          >
            {selectedMinute.toString().padStart(2, '0')}
          </motion.span>
          <motion.button
            className="ml-3 text-2xl font-semibold text-violet-600"
            onClick={handleToggleAMPM}
            whileTap={{ scale: 0.9 }}
          >
            {isPM ? 'PM' : 'AM'}
          </motion.button>
        </div>
      </div>

      {/* Clock Face */}
      <div className="relative w-72 h-72 mb-6">
        {/* Clock Background */}
        <div className="absolute inset-0 rounded-full bg-slate-100 border-4 border-slate-200" />

        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-violet-600 z-20" />

        {/* Clock Hand */}
        <motion.div
          className="absolute top-1/2 left-1/2 origin-left z-10"
          style={{
            width: mode === 'hour' ? '80px' : '100px',
            height: '2px',
          }}
          animate={{
            rotate: mode === 'hour' ? hourAngle : minuteAngle,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="h-full bg-violet-600 rounded-full" />
          <div
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-violet-600",
              mode === 'hour' ? "w-10 h-10 -mr-5" : "w-8 h-8 -mr-4"
            )}
          />
        </motion.div>

        {/* Hour/Minute Numbers */}
        <AnimatePresence mode="wait">
          {mode === 'hour' ? (
            <motion.div
              key="hours"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {HOURS.map((hour) => {
                const angle = (hour * 30 - 90) * (Math.PI / 180);
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = hour === selectedHour;
                const isSuggested = isAISuggested(hour, selectedMinute);

                return (
                  <motion.button
                    key={hour}
                    className={cn(
                      "absolute w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                      "transition-colors",
                      isSelected
                        ? "bg-violet-600 text-white"
                        : isSuggested
                        ? "bg-violet-100 text-violet-600 ring-2 ring-violet-300"
                        : "hover:bg-slate-200"
                    )}
                    style={{
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 20px)`,
                    }}
                    onClick={() => handleHourSelect(hour)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {hour}
                    {isSuggested && !isSelected && (
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-violet-500" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="minutes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {minuteSlots.map((minute) => {
                const angle = (minute * 6 - 90) * (Math.PI / 180);
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = minute === selectedMinute;
                const isSuggested = isAISuggested(selectedHour, minute);

                return (
                  <motion.button
                    key={minute}
                    className={cn(
                      "absolute w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
                      "transition-colors",
                      isSelected
                        ? "bg-violet-600 text-white"
                        : isSuggested
                        ? "bg-violet-100 text-violet-600 ring-2 ring-violet-300"
                        : "hover:bg-slate-200"
                    )}
                    style={{
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 20px)`,
                    }}
                    onClick={() => handleMinuteSelect(minute)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {minute.toString().padStart(2, '0')}
                    {isSuggested && !isSelected && (
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-violet-500" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Time Presets */}
      <div className="flex gap-2 mb-6">
        {[
          { label: '9 AM', hour: 9, minute: 0, pm: false },
          { label: '12 PM', hour: 12, minute: 0, pm: true },
          { label: '3 PM', hour: 3, minute: 0, pm: true },
          { label: '5 PM', hour: 5, minute: 0, pm: true },
        ].map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className={cn(
              "text-xs",
              selectedHour === preset.hour &&
                selectedMinute === preset.minute &&
                isPM === preset.pm &&
                "border-violet-500 bg-violet-50"
            )}
            onClick={() => {
              setSelectedHour(preset.hour);
              setSelectedMinute(preset.minute);
              setIsPM(preset.pm);
              onChange?.(getCurrentTime());
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Mode Toggle & Confirm */}
      <div className="flex items-center gap-4 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setMode(mode === 'hour' ? 'minute' : 'hour')}
        >
          {mode === 'hour' ? (
            <>
              <ChevronRight className="mr-2 h-4 w-4" />
              Set Minutes
            </>
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Set Hour
            </>
          )}
        </Button>
        <Button
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          onClick={() => onConfirm?.(getCurrentTime())}
        >
          <Check className="mr-2 h-4 w-4" />
          Confirm
        </Button>
      </div>
    </div>
  );
}

// Compact inline version for forms
export function TimePickerCompact({
  value,
  onChange,
  className,
}: {
  value?: Date;
  onChange?: (time: Date) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        <Clock className="mr-2 h-4 w-4" />
        {value ? format(value, 'h:mm a') : 'Select time'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <SwipeTimePicker
                value={value}
                onChange={onChange}
                onConfirm={(time) => {
                  onChange?.(time);
                  setIsOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
