import { useState } from "react";
import { SectionCard, SectionHeader, EmptyState } from "../shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Circle,
  ListTodo,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  description: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  assigned_to?: string;
  assignee_name?: string;
  due_date?: string;
  created_by_automation?: boolean;
}

interface TasksProgressCardProps {
  tasks: Task[];
  isLoading?: boolean;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onAddTask?: (task: {
    description: string;
    priority: "low" | "medium" | "high";
    due_date?: string;
  }) => Promise<void>;
  onManageTasks?: () => void;
}

export const TasksProgressCard = ({
  tasks,
  isLoading,
  onToggleTask,
  onAddTask,
  onManageTasks
}: TasksProgressCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const displayTasks = isExpanded ? tasks : pendingTasks.slice(0, 3);

  const handleAddTask = async () => {
    if (!newTaskDescription.trim() || !onAddTask) return;

    setIsSaving(true);
    try {
      await onAddTask({
        description: newTaskDescription.trim(),
        priority: newTaskPriority
      });
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setIsAddingTask(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <SectionCard>
        <SectionHeader icon={ListTodo} title="Tasks" />
        <div className="space-y-3">
          <div className="h-2 bg-slate-100 rounded-full animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={ListTodo}
        title="Tasks"
        subtitle={totalCount > 0 ? `${completedCount}/${totalCount} completed` : undefined}
        action={
          onAddTask && (
            <Button
              size="sm"
              onClick={() => setIsAddingTask(true)}
              className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )
        }
      />

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">Progress</span>
            <span className="text-xs font-bold text-slate-900">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercent === 100
                  ? "bg-emerald-500"
                  : progressPercent >= 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <Textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="What needs to be done?"
            className="min-h-[60px] text-sm resize-none border-slate-200 focus:border-slate-300 focus:ring-slate-200"
            disabled={isSaving}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <Select
              value={newTaskPriority}
              onValueChange={(v) => setNewTaskPriority(v as any)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskDescription("");
                }}
                disabled={isSaving}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskDescription.trim() || isSaving}
                className="h-7 text-xs bg-slate-900 hover:bg-slate-800"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 mr-1" />
                )}
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {totalCount === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Add your first task to track progress"
        />
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg transition-all group hover:border-slate-200",
                  task.status === "completed" && "opacity-60"
                )}
              >
                <button
                  onClick={() => onToggleTask(task.id, task.status !== "completed")}
                  className="mt-0.5 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-full transition-transform hover:scale-110"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm text-slate-800",
                    task.status === "completed" && "line-through text-slate-500"
                  )}>
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 h-4 font-medium",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </Badge>

                    {task.assignee_name && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <User className="h-3 w-3" />
                        {task.assignee_name}
                      </span>
                    )}

                    {task.due_date && (
                      <span className={cn(
                        "flex items-center gap-1 text-[10px]",
                        isOverdue ? "text-red-600 font-medium" : "text-slate-500"
                      )}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Expand/Collapse Button */}
          {(pendingTasks.length > 3 || completedTasks.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-8 text-xs text-slate-500 hover:text-slate-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                  Show all {totalCount} tasks
                  {completedTasks.length > 0 && ` (${completedTasks.length} completed)`}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </SectionCard>
  );
};
