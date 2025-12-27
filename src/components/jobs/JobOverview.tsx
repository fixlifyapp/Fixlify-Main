
import { useState } from "react";
import { useJob } from "@/hooks/useJob";
import { useJobOverview } from "@/hooks/useJobOverview";
import { useJobTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCustomFieldsDisplay } from "./JobCustomFieldsDisplay";
import { EditableJobDescriptionCard } from "./overview/EditableJobDescriptionCard";
import { TechnicianCard } from "./overview/TechnicianCard";
import { JobTagsCard } from "./overview/JobTagsCard";
import { EditableJobDetailsCard } from "./overview/EditableJobDetailsCard";
import { EditableJobOverviewCard } from "./overview/EditableJobOverviewCard";
import { AttachmentsCard } from "./overview/AttachmentsCard";
import { JobMessages } from "./JobMessages";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";
import { CheckSquare, Building } from "lucide-react";

interface JobOverviewProps {
  jobId: string;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading, error, refetch } = useJob(jobId);
  const { overview, isLoading: overviewLoading, saveOverview } = useJobOverview(jobId);
  const { data: tasks = [], isLoading: tasksLoading } = useJobTasks(jobId);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

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
        onUpdate={refetch}
      />

      {/* Editable Technician Assignment */}
      <TechnicianCard
        job={job}
        jobId={jobId}
        editable={true}
        onUpdate={refetch}
      />

      {/* Editable Tags */}
      <JobTagsCard
        tags={job.tags || []}
        jobId={jobId}
        editable={true}
        onUpdate={refetch}
      />

      {/* Editable Schedule Details */}
      <EditableJobDetailsCard
        scheduleStart={job.schedule_start}
        scheduleEnd={job.schedule_end}
        jobId={jobId}
        onUpdate={refetch}
      />

      {/* Editable Job Overview Information */}
      <EditableJobOverviewCard
        overview={overview}
        jobId={jobId}
        onUpdate={refetch}
      />

      {/* Attachments Section */}
      <AttachmentsCard jobId={jobId} />

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
              Tasks ({tasks.filter(t => t.status !== 'completed').length} remaining)
            </CardTitle>
            <Button onClick={() => setShowTaskDialog(true)}>
              Manage Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <p className="text-muted-foreground">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks assigned to this job</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 border rounded">
                  <CheckSquare className={`h-4 w-4 ${task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                    {task.description}
                  </span>
                  {task.status === 'completed' && (
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
        jobId={jobId}
        clientId={job?.clientId}
        disabled={false}
      />

      {/* Messages Section */}
      <JobMessages jobId={jobId} />
    </div>
  );
};
