import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Edit, Plus, Calendar, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useJobTasks } from "@/hooks/use-tasks";
import { useProfiles } from "@/hooks/use-profiles";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";

interface TasksSectionProps {
  jobId: string;
  onTasksEdit: () => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({ jobId, onTasksEdit }) => {
  const { data: tasks = [], isLoading } = useJobTasks(jobId);
  const { data: profiles = [] } = useProfiles();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = tasks.filter(t => 
    t.due_date && 
    isPast(new Date(t.due_date)) && 
    t.status !== 'completed'
  );

  if (isLoading) {
    return (
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Tasks</h3>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} tasks remaining
              {overdueTasks.length > 0 && (
                <span className="text-red-600 ml-2">
                  ({overdueTasks.length} overdue)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-purple-600 h-8"
            onClick={onTasksEdit}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-muted-foreground">
              No tasks assigned. Click the edit button to add tasks.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const assignedUser = profiles.find((p) => p.id === task.assigned_to);
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    task.status === 'completed' && "bg-muted/30 opacity-75"
                  )}
                >
                  <div className="mt-0.5">
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm",
                      task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        task.priority === 'high' && "bg-red-50 text-red-600",
                        task.priority === 'medium' && "bg-yellow-50 text-yellow-600",
                        task.priority === 'low' && "bg-green-50 text-green-600"
                      )}>
                        {task.priority}
                      </Badge>
                      {assignedUser && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{assignedUser.name || assignedUser.email}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600 font-medium"
                        )}>
                          {isOverdue && <AlertCircle className="w-3 h-3" />}
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
