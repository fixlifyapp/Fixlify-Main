
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: string;
  initialTimeWindow: string;
  onSave: (date: string, timeWindow: string) => void;
}

export function ScheduleSelectionDialog({
  open,
  onOpenChange,
  initialDate,
  initialTimeWindow,
  onSave,
}: ScheduleSelectionDialogProps) {
  // Parse initial dates or set defaults
  const parseInitialDate = () => {
    try {
      return initialDate ? new Date(initialDate) : new Date();
    } catch (e) {
      return new Date();
    }
  };
  
  const [startDate, setStartDate] = useState<Date | undefined>(parseInitialDate());
  const [endDate, setEndDate] = useState<Date | undefined>(parseInitialDate());
  const [startTime, setStartTime] = useState(initialTimeWindow.split(" - ")[0] || "09:00");
  const [endTime, setEndTime] = useState(initialTimeWindow.split(" - ")[1] || "11:00");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const handleSave = () => {
    const formattedStartDate = startDate ? format(startDate, "MMM dd, yyyy") : "Not scheduled";
    const formattedEndDate = endDate ? format(endDate, "MMM dd, yyyy") : formattedStartDate;
    
    // If it's a multi-day job, show date range
    let dateDisplay = formattedStartDate;
    if (startDate && endDate && differenceInDays(endDate, startDate) > 0) {
      dateDisplay = `${formattedStartDate} - ${formattedEndDate}`;
    }
    
    const timeWindow = `${startTime} - ${endTime}`;
    
    onSave(dateDisplay, timeWindow);
    onOpenChange(false);
    toast.success("Job schedule updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Job</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      // If end date is before start date or not set, update it
                      if (date && (!endDate || endDate < date)) {
                        setEndDate(date);
                      }
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* End Date */}
            <div>
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center mt-2">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center mt-2">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
