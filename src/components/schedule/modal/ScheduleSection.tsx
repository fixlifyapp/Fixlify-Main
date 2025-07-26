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
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Schedule</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schedule_start">Start Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.schedule_start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.schedule_start ? (
                  format(new Date(formData.schedule_start), "PPp")
                ) : (
                  <span>Pick start date & time</span>
                )}
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
              {formData.schedule_start && (
                <div className="p-3 border-t">
                  <Input 
                    type="time" 
                    value={formData.schedule_start ? format(new Date(formData.schedule_start), "HH:mm") : ""}
                    onChange={handleStartTimeChange}
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="schedule_end">End Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.schedule_end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.schedule_end ? (
                  format(new Date(formData.schedule_end), "PPp")
                ) : (
                  <span>Pick end date & time</span>
                )}
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
                  return date < Math.max(today.getTime(), startDate.getTime());
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {formData.schedule_end && (
                <div className="p-3 border-t">
                  <Input 
                    type="time" 
                    value={formData.schedule_end ? format(new Date(formData.schedule_end), "HH:mm") : ""}
                    onChange={handleEndTimeChange}
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="technician_id">Technician Assignment</Label>
            <Button 
              type="button"
              variant="link" 
              size="sm" 
              className="h-6 p-0"
              onClick={handleSuggestTechnician}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              AI Suggest
            </Button>
          </div>
          <Select value={formData.technician_id} onValueChange={handleSelectChange("technician_id")}>
            <SelectTrigger id="technician_id">
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
            <div className="mt-2 p-2 text-xs border rounded bg-fixlyfy/10 border-fixlyfy/20">
              <p className="font-medium text-fixlyfy">AI Suggestion:</p>
              <p>Best Tech: Michael Chen (Available 9AM, nearby previous job, 5⭐ rating)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 