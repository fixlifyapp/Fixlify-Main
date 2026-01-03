import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Plus, X, Check, Sparkles, ListTodo, Loader2 } from "lucide-react";
import { useJobTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useConfigItems } from "@/hooks/useConfigItems";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TagsTasksEditSectionProps {
  jobId: string;
  tags: string[];
  onUpdate?: () => void;
}

export const TagsTasksEditSection = ({ jobId, tags, onUpdate }: TagsTasksEditSectionProps) => {
  const [newTask, setNewTask] = useState("");
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Save indicator component
  const SaveIndicator = ({ field }: { field: string }) => {
    if (savingField === field) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }
    if (savedField === field) {
      return <Check className="h-3 w-3 text-emerald-500" />;
    }
    return null;
  };

  // Load available tags
  const { items: availableTags, isLoading: tagsLoading } = useConfigItems("tags");

  // Load job tasks and mutations
  const { data: tasks = [], isLoading: tasksLoading } = useJobTasks(jobId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleTagToggle = async (tagName: string) => {
    setSavingField("tags");
    try {
      const newTags = tags.includes(tagName)
        ? tags.filter(t => t !== tagName)
        : [...tags, tagName];

      const { error } = await supabase
        .from("jobs")
        .update({ tags: newTags })
        .eq("id", jobId);

      if (error) throw error;
      setSavedField("tags");
      setTimeout(() => setSavedField(null), 1500);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    } finally {
      setSavingField(null);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    setSavingField("tasks");
    try {
      await createTask.mutateAsync({
        job_id: jobId,
        description: newTask.trim()
      });
      setNewTask("");
      setSavedField("tasks");
      setTimeout(() => setSavedField(null), 1500);
    } catch (error) {
      console.error("Error adding task:", error);
      // Toast is already shown by the hook
    } finally {
      setSavingField(null);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateTask.mutateAsync({ id: taskId, status: newStatus });
    } catch (error) {
      console.error("Error updating task:", error);
      // Toast is already shown by the hook
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
    } catch (error) {
      console.error("Error removing task:", error);
      // Toast is already shown by the hook
    }
  };

  const handleTaskKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const isSavingTags = savingField === "tags";
  const isAddingTask = savingField === "tasks";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tags Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</Label>
          </div>
          <SaveIndicator field="tags" />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {tagsLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
          ) : availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No tags configured</p>
          ) : (
            availableTags
              .filter((tag: any) => tag.is_active !== false) // Show tag if is_active is true or undefined
              .map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant={tags.includes(tag.name) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    tags.includes(tag.name)
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:bg-muted",
                    isSavingTags && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => !isSavingTags && handleTagToggle(tag.name)}
                >
                  {tag.name}
                </Badge>
              ))
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks</Label>
            {totalTasks > 0 && (
              <span className="text-xs text-muted-foreground">
                ({completedTasks}/{totalTasks})
              </span>
            )}
          </div>
          <SaveIndicator field="tasks" />
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
        )}

        {/* Add task input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleTaskKeyPress}
            disabled={isAddingTask}
            className="h-8 text-sm"
          />
          <Button
            type="button"
            onClick={handleAddTask}
            size="sm"
            disabled={isAddingTask || !newTask.trim()}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Task list */}
        {tasksLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-3 text-muted-foreground text-sm">
            <Sparkles className="h-4 w-4 mx-auto mb-1 opacity-50" />
            No tasks yet
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors group",
                  task.status === 'completed'
                    ? "bg-emerald-50/60 border-emerald-200/50"
                    : "bg-background border-border hover:border-primary/30"
                )}
              >
                <button
                  onClick={() => handleToggleTask(task.id, task.status)}
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 transition-colors",
                    task.status === 'completed'
                      ? "bg-emerald-500"
                      : "border-2 border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {task.status === 'completed' && (
                    <Check className="h-2.5 w-2.5 text-white" />
                  )}
                </button>
                <span className={cn(
                  "flex-1 text-sm truncate",
                  task.status === 'completed'
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                )}>
                  {task.description}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTask(task.id)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
