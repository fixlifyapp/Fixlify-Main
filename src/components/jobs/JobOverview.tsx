
import { useState, useEffect } from "react";
import { useJob } from "@/hooks/useJob";
import { useJobOverview } from "@/hooks/useJobOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCustomFieldsDisplay } from "./JobCustomFieldsDisplay";
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

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Service</h4>
              <p className="text-sm text-muted-foreground">{job.service}</p>
            </div>
            
            {job.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.schedule_start && (
                <div>
                  <h4 className="font-medium mb-1">Scheduled Start</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.schedule_start).toLocaleString()}
                  </p>
                </div>
              )}
              
              {job.schedule_end && (
                <div>
                  <h4 className="font-medium mb-1">Scheduled End</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.schedule_end).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {job.tags && job.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Overview Information */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Job Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Property Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {overview.property_type || 'Not specified'}
                  </p>
                </div>
                
                {overview.property_age && (
                  <div>
                    <h4 className="font-medium mb-1">Property Age</h4>
                    <p className="text-sm text-muted-foreground">{overview.property_age}</p>
                  </div>
                )}
                
                {overview.property_size && (
                  <div>
                    <h4 className="font-medium mb-1">Property Size</h4>
                    <p className="text-sm text-muted-foreground">{overview.property_size}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Lead Source</h4>
                  <p className="text-sm text-muted-foreground">
                    {overview.lead_source || 'Not specified'}
                  </p>
                </div>
                
                {overview.previous_service_date && (
                  <div>
                    <h4 className="font-medium mb-1">Previous Service Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(overview.previous_service_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Fields */}
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
