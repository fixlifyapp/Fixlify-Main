import React, { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { useJobs } from "@/hooks/useJobs";
import { JobSummaryCard } from "./overview/JobSummaryCard";
import { ScheduleInfoCard } from "./overview/ScheduleInfoCard";
import { JobDescriptionCard } from "./overview/JobDescriptionCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { TasksCard } from "./overview/TasksCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { AdditionalInfoCard } from "./overview/AdditionalInfoCard";
import { AttachmentsCard } from "./overview/AttachmentsCard";
import { ConditionalCustomFieldsCard } from "./overview/ConditionalCustomFieldsCard";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";
import { toast } from "sonner";

interface JobOverviewProps {
  jobId: string;
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading } = useJobDetails();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateJob } = useJobs();

  // Convert job tasks to dialog format
  const convertToDialogTasks = (jobTasks: string[] | undefined): Task[] => {
    if (!jobTasks || !Array.isArray(jobTasks)) return [];
    
    return jobTasks.map((task, index) => ({
      id: index + 1,
      name: typeof task === 'string' ? task : String(task),
      completed: false // For now, we'll assume all tasks are incomplete
    }));
  };

  // Convert dialog tasks back to job format
  const convertToJobTasks = (dialogTasks: Task[]): string[] => {
    return dialogTasks.map(task => task.name);
  };

  const handleUpdateTasks = async (updatedTasks: Task[]) => {
    setIsUpdating(true);
    const taskNames = convertToJobTasks(updatedTasks);
    
    try {
      const result = await updateJob(jobId, {
        tasks: taskNames
      });
      
      if (result) {
        console.log("Tasks updated successfully:", taskNames);
        toast.success("Tasks updated successfully");
        // Real-time will handle the refresh automatically
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobDescriptionCard 
            description={job.description || ""} 
            jobId={jobId} 
            editable 
          />
          <JobSummaryCard 
            job={job} 
            jobId={jobId} 
            editable 
          />
          <TechnicianCard 
            job={job} 
            jobId={jobId} 
            editable 
          />
          <TasksCard 
            tasks={job.tasks || []} 
            jobId={jobId} 
            editable 
            onManageTasks={() => setIsTaskDialogOpen(true)}
          />
        </div>
        
        <div className="space-y-6">
          <AdditionalInfoCard job={job} />
          <ScheduleInfoCard 
            job={job} 
            jobId={jobId} 
            editable 
          />
          <AttachmentsCard 
            jobId={jobId} 
            editable 
          />
          <ConditionalCustomFieldsCard jobId={jobId} />
        </div>
      </div>

      {/* Secondary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobTagsCard 
            tags={job.tags || []} 
            jobId={jobId} 
            editable 
          />
        </div>
      </div>

      {/* Task Management Dialog */}
      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        initialTasks={convertToDialogTasks(job.tasks)}
        onSave={handleUpdateTasks}
        disabled={isUpdating}
      />
    </div>
  );
};
