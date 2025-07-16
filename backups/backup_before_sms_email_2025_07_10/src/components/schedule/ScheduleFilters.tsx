
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobTypes } from "@/hooks/useConfigItems";

export interface ScheduleFiltersProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

export const ScheduleFilters = ({
  view,
  onViewChange,
  currentDate = new Date(),
  onDateChange
}: ScheduleFiltersProps) => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const {
    items: jobTypes,
    isLoading: jobTypesLoading
  } = useJobTypes();
  const [selectedJobType, setSelectedJobType] = useState("all-jobs");
  
  // Fetch technicians from Supabase
  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setIsLoading(true);
        const {
          data,
          error
        } = await supabase.from('profiles').select('id, name, role').eq('role', 'technician');
        if (error) throw error;
        setTechnicians(data || []);
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast.error("Failed to load technicians");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  const handlePrevious = () => {
    if (onDateChange) {
      const newDate = new Date(currentDate);
      if (view === 'day') {
        newDate.setDate(currentDate.getDate() - 1);
      } else if (view === 'week') {
        newDate.setDate(currentDate.getDate() - 7);
      } else if (view === 'month') {
        newDate.setMonth(currentDate.getMonth() - 1);
      }
      onDateChange(newDate);
    }
  };
  
  const handleNext = () => {
    if (onDateChange) {
      const newDate = new Date(currentDate);
      if (view === 'day') {
        newDate.setDate(currentDate.getDate() + 1);
      } else if (view === 'week') {
        newDate.setDate(currentDate.getDate() + 7);
      } else if (view === 'month') {
        newDate.setMonth(currentDate.getMonth() + 1);
      }
      onDateChange(newDate);
    }
  };
  
  const handleToday = () => {
    if (onDateChange) {
      onDateChange(new Date());
    }
  };
  
  return <div>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft size={18} />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight size={18} />
          </Button>
          <div className="text-base font-medium ml-2">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>
        
        {/* View Selection and Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={view} onValueChange={v => onViewChange(v as 'day' | 'week' | 'month')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={selectedJobType} onValueChange={setSelectedJobType} disabled={jobTypesLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-jobs">All Jobs</SelectItem>
              {jobTypes.map(type => <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Status legend */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy"></span>
          <span className="text-xs">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-warning"></span>
          <span className="text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-success"></span>
          <span className="text-xs">Completed</span>
        </div>
      </div>
    </div>;
};
