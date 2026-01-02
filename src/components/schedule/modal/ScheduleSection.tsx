import React, { useState, useMemo } from "react";
import { format, addDays, getDay } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
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
import { FormData } from "./useScheduleJobForm";
import { AIFormHint, useAIScheduling, AIRecommendation } from "@/components/calendar/ai";

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

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

interface CompanySettings {
  timezone?: string;
  business_hours?: BusinessHours;
}

interface ScheduleSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSelectChange: (field: string) => (value: string) => void;
  companySettings?: CompanySettings | null;
}

export const ScheduleSection = ({
  formData,
  setFormData,
  handleSelectChange,
  companySettings,
}: ScheduleSectionProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Fetch technicians from database
  const { technicians, isLoading: techniciansLoading } = useTechnicians();

  // Get business hours from settings
  const businessHours = companySettings?.business_hours;

  // Map day names to day-of-week numbers (0 = Sunday, 1 = Monday, etc.)
  const dayNameToNumber: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
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

  // AI Scheduling
  const {
    isLoading: aiLoading,
    recommendations,
    topRecommendation,
    getRecommendations,
    clearRecommendations,
  } = useAIScheduling();

  // Get AI recommendations when component mounts
  const handleGetAIRecommendations = async () => {
    await getRecommendations({
      dateRange: {
        start: new Date(),
        end: addDays(new Date(), 7),
      },
      estimatedDuration: 60, // Default 1 hour
      preferredTechnicianId: formData.technician_id || undefined,
    });
  };

  // Handle accepting an AI recommendation
  const handleAcceptRecommendation = (rec: AIRecommendation) => {
    setFormData({
      ...formData,
      schedule_start: rec.slot.start.toISOString(),
      schedule_end: rec.slot.end.toISOString(),
      technician_id: rec.technician.id,
    });
    clearRecommendations();
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateTime = new Date(date);

      // Get default times from business hours for this day
      const defaults = getDefaultTimes(date);
      const [startHour, startMin] = defaults.start.split(':').map(Number);

      // Set start time from business hours (not hardcoded 9 AM)
      dateTime.setHours(startHour, startMin, 0, 0);

      // Auto-set end date to 2 hours after start (or use job duration)
      const duration = parseInt(formData.duration) || 60;
      const endDateTime = new Date(dateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      setFormData({
        ...formData,
        schedule_start: dateTime.toISOString(),
        schedule_end: !formData.schedule_end ? endDateTime.toISOString() : formData.schedule_end
      });

      // Close the popover after selection
      setStartDateOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateTime = new Date(date);

      // Keep existing time if end time was already set, otherwise use business hours
      if (formData.schedule_end) {
        const existingEnd = new Date(formData.schedule_end);
        dateTime.setHours(existingEnd.getHours(), existingEnd.getMinutes(), 0, 0);
      } else {
        // Get end time from business hours (not hardcoded 5 PM)
        const defaults = getDefaultTimes(date);
        const [endHour, endMin] = defaults.end.split(':').map(Number);
        dateTime.setHours(endHour, endMin, 0, 0);
      }

      setFormData({
        ...formData,
        schedule_end: dateTime.toISOString()
      });

      // Close the popover after selection
      setEndDateOpen(false);
    }
  };

  // Check if a date is a non-working day
  const isDisabledDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow past dates
    if (date < today) return true;

    // Disable non-working days
    return disabledDaysOfWeek.includes(date.getDay());
  };

  const handleStartTimeChange = (timeValue: string) => {
    if (formData.schedule_start) {
      const date = new Date(formData.schedule_start);
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));

      // Auto-adjust end time if it's before start time or if they're the same day
      let newFormData = { ...formData, schedule_start: date.toISOString() };

      if (formData.schedule_end) {
        const endDate = new Date(formData.schedule_end);
        const startDate = new Date(date);

        // If end time is before start time on the same day, add duration to start time
        if (endDate.toDateString() === startDate.toDateString() && endDate <= startDate) {
          const duration = parseInt(formData.duration) || 60;
          const newEndTime = new Date(startDate);
          newEndTime.setMinutes(startDate.getMinutes() + duration);
          newFormData.schedule_end = newEndTime.toISOString();
        }
      }

      setFormData(newFormData);
    }
  };

  const handleEndTimeChange = (timeValue: string) => {
    if (formData.schedule_end) {
      const date = new Date(formData.schedule_end);
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      setFormData({ ...formData, schedule_end: date.toISOString() });
    }
  };

  // Get current time value for Select
  const getTimeValue = (dateString: string | undefined, defaultTime: string) => {
    if (!dateString) return defaultTime;
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = Math.floor(date.getMinutes() / 30) * 30; // Round to nearest 30 min
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Responsive grid - 1 column on mobile, 2 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Start Date & Time */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Start Date & Time</Label>
          <div className="space-y-2">
            {/* Date Picker */}
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 px-3",
                    !formData.schedule_start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formData.schedule_start 
                      ? format(new Date(formData.schedule_start), "EEE, MMM dd, yyyy")
                      : "Pick start date"
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.schedule_start ? new Date(formData.schedule_start) : undefined}
                  onSelect={handleStartDateSelect}
                  disabled={isDisabledDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Time Picker */}
            <Select
              value={getTimeValue(formData.schedule_start, "09:00")}
              onValueChange={handleStartTimeChange}
            >
              <SelectTrigger className="h-10">
                <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Select time" />
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
        <div className="space-y-3">
          <Label className="text-sm font-medium">End Date & Time</Label>
          <div className="space-y-2">
            {/* Date Picker */}
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 px-3",
                    !formData.schedule_end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formData.schedule_end 
                      ? format(new Date(formData.schedule_end), "EEE, MMM dd, yyyy")
                      : "Pick end date"
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.schedule_end ? new Date(formData.schedule_end) : undefined}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    // Don't allow end date before start date
                    const startDate = formData.schedule_start ? new Date(formData.schedule_start) : today;
                    startDate.setHours(0, 0, 0, 0);
                    // Check if date is before start date OR is a non-working day
                    return date.getTime() < Math.max(today.getTime(), startDate.getTime()) ||
                           disabledDaysOfWeek.includes(date.getDay());
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Time Picker */}
            <Select
              value={getTimeValue(formData.schedule_end, "17:00")}
              onValueChange={handleEndTimeChange}
            >
              <SelectTrigger className="h-10">
                <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Select time" />
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
      </div>

      {/* AI Scheduling Recommendation */}
      <AIFormHint
        recommendation={topRecommendation}
        alternativeRecommendations={recommendations.slice(1, 4)}
        isLoading={aiLoading}
        onAccept={handleAcceptRecommendation}
        onRequestNew={handleGetAIRecommendations}
      />

      {/* Technician Assignment - Full width */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Technician Assignment</Label>

        <Select value={formData.technician_id} onValueChange={handleSelectChange("technician_id")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={techniciansLoading ? "Loading technicians..." : "Assign technician (optional)"} />
          </SelectTrigger>
          <SelectContent>
            {technicians.map(tech => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
            {technicians.length === 0 && !techniciansLoading && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No technicians available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 