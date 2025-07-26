import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Plus, Calendar, User, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useJobTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useProfiles } from "@/hooks/use-profiles";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  clientId?: string;
  disabled?: boolean;
}

export function TaskManagementDialog({
  open,
  onOpenChange,
  jobId,
  clientId,
  disabled = false,
}: TaskManagementDialogProps) {
  const { data: tasks = [], isLoading } = useJobTasks(jobId);
  const { data: profiles = [] } = useProfiles();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const handleAddTask = async () => {
    if (!newTaskDescription.trim() || disabled) return;

    try {
      await createTask.mutateAsync({
        description: newTaskDescription.trim(),
        job_id: jobId,
        client_id: clientId,
        priority: newTaskPriority,
        assigned_to: newTaskAssignee === 'unassigned' ? undefined : newTaskAssignee || undefined,
        due_date: newTaskDueDate || undefined,
      });
      
      setNewTaskDescription("");
      setNewTaskPriority('medium');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleToggleTask = async (task: any) => {
    if (disabled) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask.mutateAsync({
        id: task.id,
        status: newStatus,
      });
      toast.success(newStatus === 'completed' ? "Task completed" : "Task reopened");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (disabled) return;
    
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Add new task section */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">Add New Task</h4>
            <Textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description..."
              disabled={disabled}
              className="min-h-[60px]"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as any)} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name || profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Due date"
              />
            </div>
            <Button 
              onClick={handleAddTask}
              disabled={disabled || !newTaskDescription.trim() || createTask.isPending}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          {/* Current tasks list */}
          <div className="space-y-2">
            <Label className="mb-2 block">
              Current Tasks ({tasks.filter(t => t.status !== 'completed').length} remaining)
            </Label>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks added yet</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const assignedUser = profiles.find((p) => p.id === task.assigned_to);
                  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';

                  return (
                    <div 
                      key={task.id} 
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        task.status === 'completed' && "bg-muted/30 opacity-75"
                      )}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        disabled={disabled}
                        className="mt-0.5 focus:outline-none"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1 space-y-2">
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
                              <span>{format(new Date(task.due_date), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
