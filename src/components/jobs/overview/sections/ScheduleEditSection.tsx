import React, { useState, useMemo } from "react";
import { format, addMinutes } from "date-fns";
import { CalendarIcon, Clock, User, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateScheduleDates, autoCorrectEndDate } from "@/utils/schedule-validation";

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      const value = `${h}:${m}`;

      // Format label as 12-hour time
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const label = `${displayHour}:${m} ${period}`;

      options.push({ value, label });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

interface ScheduleEditSectionProps {
  job: {
    id: string;
    schedule_start?: string | null;
    schedule_end?: string | null;
    technician_id?: string | null;
    technician?: { id: string; full_name?: string; name?: string } | null;
  };
  onUpdate?: () => void;
}

export const ScheduleEditSection = ({ job, onUpdate }: ScheduleEditSectionProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Local state for form values
  const [scheduleStart, setScheduleStart] = useState<string | null>(job.schedule_start || null);
  const [scheduleEnd, setScheduleEnd] = useState<string | null>(job.schedule_end || null);
  const [technicianId, setTechnicianId] = useState<string | null>(job.technician_id || null);

  // Save indicator component
  const SaveIndicator = ({ field }: { field: string }) => {
    if (savingField === field) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }
    if (savedField === field) {
      return <Check className="h-3 w-3 text-emerald-500" />;
    }
    return null;
  };

  const { technicians, isLoading: techniciansLoading } = useTechnicians();
  const { settings: companySettings } = useCompanySettings();

  // Get business hours from settings
  const businessHours = companySettings?.business_hours;

  // Map day names to day-of-week numbers
  const dayNameToNumber: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };

  // Get disabled days (non-working days)
  const disabledDaysOfWeek = useMemo(() => {
    if (!businessHours) return [];
    return Object.entries(businessHours)
      .filter(([_, hours]) => !hours.enabled)
      .map(([day]) => dayNameToNumber[day.toLowerCase()])
      .filter((num): num is number => num !== undefined);
  }, [businessHours]);

  // Get default start/end times from business hours based on selected day
  const getDefaultTimes = (date: Date) => {
    if (!businessHours) return { start: '09:00', end: '17:00' };
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    const dayHours = businessHours[dayName];
    return {
      start: dayHours?.start || '09:00',
      end: dayHours?.end || '17:00',
    };
  };

  const saveSchedule = async (
    updates: {
      schedule_start?: string | null;
      schedule_end?: string | null;
      technician_id?: string | null
    },
    fieldName: string
  ) => {
    setSavingField(fieldName);
    try {
      const { error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", job.id);

      if (error) throw error;
      setSavedField(fieldName);
      setTimeout(() => setSavedField(null), 1500);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setSavingField(null);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateTime = new Date(date);
      const defaults = getDefaultTimes(date);
      const [startHour, startMin] = defaults.start.split(':').map(Number);
      dateTime.setHours(startHour, startMin, 0, 0);

      const newStart = dateTime.toISOString();
      setScheduleStart(newStart);

      // Auto-set end if not set, or auto-correct if end is now before start
      if (!scheduleEnd) {
        const endDateTime = addMinutes(dateTime, 60);
        const newEnd = endDateTime.toISOString();
        setScheduleEnd(newEnd);
        saveSchedule({ schedule_start: newStart, schedule_end: newEnd }, "schedule_start");
      } else {
        // Check if current end date is now before new start date
        const validation = validateScheduleDates(dateTime, scheduleEnd);
        if (!validation.isValid) {
          const correctedEnd = autoCorrectEndDate(dateTime, scheduleEnd);
          const newEnd = correctedEnd.toISOString();
          setScheduleEnd(newEnd);
          saveSchedule({ schedule_start: newStart, schedule_end: newEnd }, "schedule_start");
          toast.warning("End time was adjusted to be after start time");
        } else {
          saveSchedule({ schedule_start: newStart }, "schedule_start");
        }
      }

      setStartDateOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateTime = new Date(date);
      if (scheduleEnd) {
        const existingEnd = new Date(scheduleEnd);
        dateTime.setHours(existingEnd.getHours(), existingEnd.getMinutes(), 0, 0);
      } else {
        const defaults = getDefaultTimes(date);
        const [endHour, endMin] = defaults.end.split(':').map(Number);
        dateTime.setHours(endHour, endMin, 0, 0);
      }

      const newEnd = dateTime.toISOString();
      setScheduleEnd(newEnd);
      saveSchedule({ schedule_end: newEnd }, "schedule_end");
      setEndDateOpen(false);
    }
  };

  const handleStartTimeChange = (timeValue: string) => {
    if (scheduleStart) {
      const date = new Date(scheduleStart);
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      const newStart = date.toISOString();
      setScheduleStart(newStart);
      saveSchedule({ schedule_start: newStart }, "schedule_start");
    }
  };

  const handleEndTimeChange = (timeValue: string) => {
    if (scheduleEnd) {
      const date = new Date(scheduleEnd);
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));

      // Validate against start time and auto-correct if needed
      const startDate = scheduleStart ? new Date(scheduleStart) : null;
      const validation = validateScheduleDates(startDate, date);

      let newEnd: string;
      if (!validation.isValid && startDate) {
        const corrected = autoCorrectEndDate(startDate, date);
        newEnd = corrected.toISOString();
        toast.warning("End time adjusted to be after start time");
      } else {
        newEnd = date.toISOString();
      }

      setScheduleEnd(newEnd);
      saveSchedule({ schedule_end: newEnd }, "schedule_end");
    }
  };

  const handleTechnicianChange = (value: string) => {
    const newTechId = value === "unassigned" ? null : value;
    setTechnicianId(newTechId);
    saveSchedule({ technician_id: newTechId }, "technician");
  };

  // Get current time value for Select
  const getTimeValue = (dateString: string | null | undefined, defaultTime: string) => {
    if (!dateString) return defaultTime;
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = Math.floor(date.getMinutes() / 30) * 30;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const isDisabledDate = (date: Date) => {
    return disabledDaysOfWeek.includes(date.getDay());
  };

  const currentTechnician = technicians.find(t => t.id === technicianId);

  const isSaving = !!savingField;

  return (
    <div className="space-y-4">
      {/* Start Date & Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Start Date & Time
          </Label>
          <SaveIndicator field="schedule_start" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-9",
                  !scheduleStart && "text-muted-foreground"
                )}
                disabled={savingField === "schedule_start"}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate text-sm">
                  {scheduleStart
                    ? format(new Date(scheduleStart), "MMM dd, yyyy")
                    : "Pick date"
                  }
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduleStart ? new Date(scheduleStart) : undefined}
                onSelect={handleStartDateSelect}
                disabled={isDisabledDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Select
            value={getTimeValue(scheduleStart, "09:00")}
            onValueChange={handleStartTimeChange}
            disabled={!scheduleStart || savingField === "schedule_start"}
          >
            <SelectTrigger className="h-9">
              <Clock className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {TIME_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* End Date & Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            End Date & Time
          </Label>
          <SaveIndicator field="schedule_end" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-9",
                  !scheduleEnd && "text-muted-foreground"
                )}
                disabled={savingField === "schedule_end"}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate text-sm">
                  {scheduleEnd
                    ? format(new Date(scheduleEnd), "MMM dd, yyyy")
                    : "Pick date"
                  }
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduleEnd ? new Date(scheduleEnd) : undefined}
                onSelect={handleEndDateSelect}
                disabled={(date) => {
                  const startDate = scheduleStart ? new Date(scheduleStart) : new Date();
                  startDate.setHours(0, 0, 0, 0);
                  return date < startDate || disabledDaysOfWeek.includes(date.getDay());
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Select
            value={getTimeValue(scheduleEnd, "17:00")}
            onValueChange={handleEndTimeChange}
            disabled={!scheduleEnd || savingField === "schedule_end"}
          >
            <SelectTrigger className="h-9">
              <Clock className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {TIME_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Technician Assignment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Assigned Technician
          </Label>
          <SaveIndicator field="technician" />
        </div>
        <Select
          value={technicianId || "unassigned"}
          onValueChange={handleTechnicianChange}
          disabled={savingField === "technician"}
        >
          <SelectTrigger className="h-9">
            <User className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder={techniciansLoading ? "Loading..." : "Select technician"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">
              <span className="text-muted-foreground">Unassigned</span>
            </SelectItem>
            {technicians.map(tech => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
