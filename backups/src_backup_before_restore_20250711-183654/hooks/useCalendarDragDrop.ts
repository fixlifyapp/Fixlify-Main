
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface JobScheduleItem {
  id: string;
  title: string;
  date: Date;
  status: string;
}

export const useCalendarDragDrop = (onJobUpdated: () => void) => {
  const [draggedJob, setDraggedJob] = useState<JobScheduleItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag start
  const handleDragStart = (job: JobScheduleItem, e: React.DragEvent) => {
    setDraggedJob(job);
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', job.id);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedJob(null);
    setIsDragging(false);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, time: string = '', day: Date | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, time: string = '', day: Date | null = null) => {
    e.preventDefault();
    if (!draggedJob || !day) return;

    try {
      // Parse time slot to get hour
      let hour = 8; // Default to 8 AM
      if (time) {
        const [hourStr] = time.split(':');
        hour = parseInt(hourStr);
        if (time.includes('PM') && hour !== 12) {
          hour += 12;
        } else if (time.includes('AM') && hour === 12) {
          hour = 0;
        }
      }

      // Create new date from the day and hour
      const newDate = new Date(day);
      newDate.setHours(hour, 0, 0, 0);

      // Update job in Supabase
      const { error } = await supabase
        .from('jobs')
        .update({ date: newDate.toISOString() })
        .eq('id', draggedJob.id);

      if (error) throw error;

      // Success feedback
      toast.success(`Job ${draggedJob.title} moved to ${format(newDate, 'MMM d, yyyy h:mm a')}`);
      
      // Trigger refresh
      onJobUpdated();
    } catch (error) {
      console.error('Error moving job:', error);
      toast.error('Failed to move job');
    } finally {
      setDraggedJob(null);
      setIsDragging(false);
    }
  };

  return {
    draggedJob,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
};
