import React, { useState } from 'react';
import { JobInfo, Task } from '@/types/job';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { JobDescriptionCard } from './overview/JobDescriptionCard';
import { JobSummaryCard } from './overview/JobSummaryCard';
import { TechnicianCard } from './overview/TechnicianCard';
import { TasksCard } from './overview/TasksCard';
import { AdditionalInfoCard } from './overview/AdditionalInfoCard';
import { ScheduleInfoCard } from './overview/ScheduleInfoCard';
import { AttachmentsCard } from './overview/AttachmentsCard';
import { ConditionalCustomFieldsCard } from './overview/ConditionalCustomFieldsCard';
import { useJobData } from './context/useJobData';

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onSave: (updatedTasks: Task[]) => Promise<void>;
  disabled: boolean;
}

const TaskManagementDialog: React.FC<TaskManagementDialogProps> = ({
  open,
  onOpenChange,
  tasks,
  onSave,
  disabled
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);

  const handleAddTask = () => {
    if (taskTitle.trim() !== '') {
      const newTask: Task = {
        id: Math.random().toString(36).substring(7),
        title: taskTitle,
        description: taskDescription,
        completed: false,
        priority: taskPriority,
        dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
      };
      setCurrentTasks([...currentTasks, newTask]);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskDueDate(undefined);
    }
  };

  const handleTaskCompletion = (taskId: string) => {
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setCurrentTasks(updatedTasks);
  };

  const handleSave = async () => {
    await onSave(currentTasks);
    onOpenChange(false);
  };

  const handlePriorityChange = (taskId: string, priority: 'low' | 'medium' | 'high') => {
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, priority } : task
    );
    setCurrentTasks(updatedTasks);
  };

  const handleDueDateChange = (taskId: string, date: Date | undefined) => {
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, dueDate: date ? date.toISOString() : undefined } : task
    );
    setCurrentTasks(updatedTasks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Manage Tasks</DialogTitle>
          <DialogDescription>
            Add, edit, and manage tasks associated with this job.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="col-span-3 rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button onClick={handleAddTask} disabled={disabled}>Add Task</Button>
        </div>

        <Table>
          <TableCaption>A list of your tasks.</TableCaption>
          <TableHead>
            <TableRow>
              <TableHead>Completed</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskCompletion(task.id)}
                    id={`task-${task.id}`}
                  />
                </TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {task.priority || 'Medium'}
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Set priority</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'low')}>
                        Low
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'medium')}>
                        Medium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'high')}>
                        High
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !task.dueDate && "text-muted-foreground"
                        )}
                      >
                        {task.dueDate ? (
                          format(new Date(task.dueDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                      <Calendar
                        mode="single"
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        onSelect={(date) => handleDueDateChange(task.id, date)}
                        disabled={disabled}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={disabled}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface JobOverviewProps {
  jobId: string;
}

const JobOverview: React.FC<JobOverviewProps> = ({ jobId }) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { job, loading, error } = useJobData(jobId);

  const handleSaveTasks = async (updatedTasks: Task[]) => {
    // Save tasks logic
    setTasks(updatedTasks);
  };

  // Add safety check for job object
  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (error || !job) {
    return <div>Error loading job details</div>;
  }

  return (
    <div className="space-y-6">
      {/* Primary Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <JobDescriptionCard 
            description={job.description || ""} 
            jobId={job.id} 
            editable 
          />
          <JobSummaryCard 
            job={job} 
            jobId={job.id} 
            editable 
          />
          <TechnicianCard 
            job={job} 
            jobId={job.id} 
            editable 
          />
          <TasksCard 
            tasks={job.tasks || []} 
            jobId={job.id} 
            editable 
            onManageTasks={() => setIsTaskDialogOpen(true)}
          />
        </div>
        
        <div className="space-y-6">
          <AdditionalInfoCard job={job} />
          <ScheduleInfoCard 
            job={job} 
            jobId={job.id} 
            editable 
          />
          <AttachmentsCard 
            attachments={[]}
            jobId={job.id} 
            onAttachmentsUpdate={() => {
              // Refresh job data when attachments are updated
              window.location.reload();
            }}
          />
          <ConditionalCustomFieldsCard jobId={job.id} />
        </div>
      </div>
      
      <DialogTrigger asChild>
        <Button variant="outline">Manage Tasks</Button>
      </DialogTrigger>
      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        tasks={tasks}
        onSave={handleSaveTasks}
        disabled={false}
      />
    </div>
  );
};

export default JobOverview;
