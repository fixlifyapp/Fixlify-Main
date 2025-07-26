import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Circle, Clock, Plus, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useJobTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { useProfiles } from '@/hooks/use-profiles';
import { cn } from '@/lib/utils';

interface JobTasksProps {
  jobId: string;
  clientId?: string;
}

export const JobTasks: React.FC<JobTasksProps> = ({ jobId, clientId }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const { data: tasks = [], isLoading } = useJobTasks(jobId);
  const { data: profiles = [] } = useProfiles();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) return;

    await createTask.mutateAsync({
      description: newTaskDescription.trim(),
      job_id: jobId,
      client_id: clientId,
      priority: newTaskPriority,
      assigned_to: newTaskAssignee === 'unassigned' ? undefined : newTaskAssignee || undefined,
      due_date: newTaskDueDate || undefined,
    });

    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask.mutateAsync({
      id: task.id,
      status: newStatus,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <Circle className="w-5 h-5 text-gray-400" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 && !isAddingTask ? (
          <div className="text-center py-4 text-muted-foreground">No tasks yet</div>
        ) : (
          <>
            {isAddingTask && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Textarea
                  placeholder="Enter task description..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="min-h-[80px]"
                  autoFocus
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Due date"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskDescription('');
                      setNewTaskPriority('medium');
                      setNewTaskAssignee('');
                      setNewTaskDueDate('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddTask}
                    disabled={!newTaskDescription.trim() || createTask.isPending}
                  >
                    Add Task
                  </Button>
                </div>
              </div>
            )}

            {tasks.map((task) => {
              const assignedUser = profiles.find((p) => p.id === task.assigned_to);
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    task.status === 'completed' && "bg-muted/30 opacity-75"
                  )}
                >
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 focus:outline-none"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div className="flex-1 space-y-2">
                    <p className={cn(
                      "text-sm",
                      task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      {assignedUser && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{assignedUser.name || assignedUser.email}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue && "text-red-600"
                        )}>
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {task.created_by_automation && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Automated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask.mutate(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
};
