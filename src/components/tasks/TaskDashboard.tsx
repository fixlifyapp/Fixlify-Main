import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { 
  Calendar, CheckCircle, Circle, Clock, Plus, Filter, 
  ChevronDown, AlertCircle, User, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useOverdueTasks } from '@/hooks/use-tasks';
import { useProfiles } from '@/hooks/use-profiles';
import { useJobs } from '@/hooks/use-jobs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface TaskDashboardProps {
  filterByUser?: boolean;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ filterByUser = false }) => {
  const { user } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskJobId, setNewTaskJobId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const filters = {
    ...(filterByUser && user ? { assigned_to: user.id } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  };

  const { data: allTasks = [], isLoading } = useTasks(filters);
  const { data: overdueTasks = [] } = useOverdueTasks();
  const { data: profiles = [] } = useProfiles();
  const { data: jobs = [] } = useJobs();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Filter tasks based on priority and assignee
  const tasks = allTasks.filter(task => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) return false;
    return true;
  });

  // Group tasks
  const todayTasks = tasks.filter(task => task.due_date && isToday(new Date(task.due_date)));
  const tomorrowTasks = tasks.filter(task => task.due_date && isTomorrow(new Date(task.due_date)));
  const upcomingTasks = tasks.filter(task => 
    task.due_date && 
    !isToday(new Date(task.due_date)) && 
    !isTomorrow(new Date(task.due_date)) && 
    !isPast(new Date(task.due_date))
  );
  const noDueDateTasks = tasks.filter(task => !task.due_date);

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) return;

    await createTask.mutateAsync({
      description: newTaskDescription.trim(),
      job_id: newTaskJobId || undefined,
      priority: newTaskPriority,
      assigned_to: newTaskAssignee || undefined,
      due_date: newTaskDueDate || undefined,
    });

    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
    setNewTaskJobId('');
    setIsAddingTask(false);
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask.mutateAsync({
      id: task.id,
      status: newStatus,
    });
  };

  const TaskItem = ({ task }: { task: any }) => {
    const assignedUser = profiles.find((p) => p.id === task.assigned_to);
    const job = jobs.find((j) => j.id === task.job_id);
    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-sm",
          task.status === 'completed' && "bg-muted/30 opacity-75"
        )}
      >
        <button
          onClick={() => toggleTaskStatus(task)}
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
            {job && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span>{job.title || `Job #${job.id}`}</span>
              </div>
            )}
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600 font-medium"
              )}>
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.due_date), 'MMM d')}</span>
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
      </div>
    );
  };

  const TaskGroup = ({ title, tasks, icon }: { title: string; tasks: any[]; icon: React.ReactNode }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
          <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
        </div>
        <div className="space-y-2">
          {tasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">To complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tomorrowTasks.length}</div>
            <p className="text-xs text-muted-foreground">Coming up</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Task */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name || profile.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddingTask(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter task description..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <Select value={newTaskJobId} onValueChange={setNewTaskJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to job..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-job">No job</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title || `Job #${job.id}`}
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
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskDescription('');
                  setNewTaskPriority('medium');
                  setNewTaskAssignee('');
                  setNewTaskDueDate('');
                  setNewTaskJobId('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                disabled={!newTaskDescription.trim() || createTask.isPending}
              >
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Lists */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Loading tasks...</div>
            </CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                {statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' 
                  ? "No tasks match your filters" 
                  : "No tasks yet. Create your first task to get started!"}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {overdueTasks.length > 0 && statusFilter !== 'completed' && (
              <TaskGroup 
                title="Overdue" 
                tasks={overdueTasks.filter(task => {
                  if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
                  if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) return false;
                  return true;
                })} 
                icon={<AlertCircle className="w-4 h-4 text-red-600" />} 
              />
            )}
            <TaskGroup 
              title="Today" 
              tasks={todayTasks} 
              icon={<Calendar className="w-4 h-4 text-orange-600" />} 
            />
            <TaskGroup 
              title="Tomorrow" 
              tasks={tomorrowTasks} 
              icon={<Calendar className="w-4 h-4 text-blue-600" />} 
            />
            <TaskGroup 
              title="Upcoming" 
              tasks={upcomingTasks} 
              icon={<Calendar className="w-4 h-4 text-gray-600" />} 
            />
            <TaskGroup 
              title="No Due Date" 
              tasks={noDueDateTasks} 
              icon={<Clock className="w-4 h-4 text-gray-400" />} 
            />
          </>
        )}
      </div>
    </div>
  );
};
