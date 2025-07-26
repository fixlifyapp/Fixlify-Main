
import { useState, useEffect } from "react";
import { useJob } from "@/hooks/useJob";
import { useJobOverview } from "@/hooks/useJobOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCustomFieldsDisplay } from "./JobCustomFieldsDisplay";
import { EditableJobDescriptionCard } from "./overview/EditableJobDescriptionCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { EditableJobDetailsCard } from "./overview/EditableJobDetailsCard";
import { EditableJobOverviewCard } from "./overview/EditableJobOverviewCard";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign,
  Clock,
  User,
  FileText,
  CheckSquare,
  Info,
  Building,
  Shield
} from "lucide-react";

interface JobOverviewProps {
  jobId: string;
}

interface Task {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onSave: (updatedTasks: Task[]) => Promise<void>;
  disabled: boolean;
}

const TaskManagementDialog = ({ open, onOpenChange, tasks, onSave, disabled }: TaskManagementDialogProps) => {
  // Simple task management dialog
  return null;
};

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading, error } = useJob(jobId);
  const { overview, isLoading: overviewLoading, saveOverview } = useJobOverview(jobId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const handleTaskSave = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    setShowTaskDialog(false);
  };

  if (isLoading || overviewLoading) {
    return <div className="p-6">Loading job details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!job) {
    return <div className="p-6">Job not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Editable Job Description */}
      <EditableJobDescriptionCard 
        description={job.description || ""} 
        jobId={jobId} 
        onUpdate={() => {}}
      />

      {/* Editable Technician Assignment */}
      <TechnicianCard 
        job={job} 
        jobId={jobId} 
        editable={true}
        onUpdate={() => {}}
      />

      {/* Editable Tags */}
      <JobTagsCard 
        tags={job.tags || []} 
        jobId={jobId} 
        editable={true}
        onUpdate={() => {}}
      />

      {/* Editable Schedule Details */}
      <EditableJobDetailsCard 
        scheduleStart={job.schedule_start}
        scheduleEnd={job.schedule_end}
        jobId={jobId} 
        onUpdate={() => {}}
      />

      {/* Editable Job Overview Information */}
      <EditableJobOverviewCard 
        overview={overview} 
        jobId={jobId} 
        onUpdate={() => {}}
      />


      {/* Additional Information (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JobCustomFieldsDisplay jobId={jobId} />
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
            <Button onClick={() => setShowTaskDialog(true)}>
              Manage Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks assigned to this job</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 border rounded">
                  <CheckSquare className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <Badge variant="outline" className="ml-auto">
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskManagementDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        tasks={tasks}
        onSave={handleTaskSave}
        disabled={false}
      />
    </div>
  );
};
