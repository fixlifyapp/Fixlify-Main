import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { teamMembers } from "@/data/team";
import { FormData } from "./useScheduleJobForm";

interface ScheduleSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSelectChange: (field: string) => (value: string) => void;
}

export const ScheduleSection = ({
  formData,
  setFormData,
  handleSelectChange,
}: ScheduleSectionProps) => {
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleSuggestTechnician = () => {
    setShowAISuggestion(true);
    setTimeout(() => {
      setFormData({ ...formData, technician_id: "3" });
    }, 500);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateTime = new Date(date);
      
      // Set default start time to 9 AM
      dateTime.setHours(9, 0, 0, 0);
      
      // Auto-set end date to same day, 2 hours later
      const endDateTime = new Date(date);
      endDateTime.setHours(11, 0, 0, 0);
      
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
      
      // Keep existing time if end time was already set, otherwise default to 5 PM
      if (formData.schedule_end) {
        const existingEnd = new Date(formData.schedule_end);
        dateTime.setHours(existingEnd.getHours(), existingEnd.getMinutes(), 0, 0);
      } else {
        dateTime.setHours(17, 0, 0, 0);
      }
      
      setFormData({
        ...formData,
        schedule_end: dateTime.toISOString()
      });
      
      // Close the popover after selection
      setEndDateOpen(false);
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData.schedule_start) {
      const date = new Date(formData.schedule_start);
      const [hours, minutes] = e.target.value.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      
      // Auto-adjust end time if it's before start time or if they're the same day
      let newFormData = { ...formData, schedule_start: date.toISOString() };
      
      if (formData.schedule_end) {
        const endDate = new Date(formData.schedule_end);
        const startDate = new Date(date);
        
        // If end time is before start time on the same day, add 2 hours to start time
        if (endDate.toDateString() === startDate.toDateString() && endDate <= startDate) {
          const newEndTime = new Date(startDate);
          newEndTime.setHours(startDate.getHours() + 2);
          newFormData.schedule_end = newEndTime.toISOString();
        }
      }
      
      setFormData(newFormData);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData.schedule_end) {
      const date = new Date(formData.schedule_end);
      const [hours, minutes] = e.target.value.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      setFormData({ ...formData, schedule_end: date.toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Schedule</h3>
      
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
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Time Picker */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                <Input
                  type="time"
                  value={formData.schedule_start ? format(new Date(formData.schedule_start), "HH:mm") : "09:00"}
                  onChange={handleStartTimeChange}
                  className="h-10 text-center"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2 h-10 flex items-center">
                  {formData.schedule_start 
                    ? format(new Date(formData.schedule_start), "h:mm a")
                    : "9:00 AM"
                  }
                </div>
              </div>
            </div>
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
                    return date.getTime() < Math.max(today.getTime(), startDate.getTime());
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Time Picker */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                <Input
                  type="time"
                  value={formData.schedule_end ? format(new Date(formData.schedule_end), "HH:mm") : "17:00"}
                  onChange={handleEndTimeChange}
                  className="h-10 text-center"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2 h-10 flex items-center">
                  {formData.schedule_end 
                    ? format(new Date(formData.schedule_end), "h:mm a")
                    : "5:00 PM"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Assignment - Full width */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Label className="text-sm font-medium">Technician Assignment</Label>
          <Button 
            type="button"
            variant="link" 
            size="sm" 
            className="h-auto p-0 self-start sm:self-auto text-xs"
            onClick={handleSuggestTechnician}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1" />
            AI Suggest
          </Button>
        </div>
        
        <Select value={formData.technician_id} onValueChange={handleSelectChange("technician_id")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Assign technician (optional)" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map(tech => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showAISuggestion && (
          <div className="mt-3 p-3 text-sm border rounded-lg bg-primary/5 border-primary/20">
            <p className="font-medium text-primary mb-1">AI Suggestion:</p>
            <p className="text-muted-foreground">Best Tech: Michael Chen (Available 9AM, nearby previous job, 5⭐ rating)</p>
          </div>
        )}
      </div>
    </div>
  );
}; 