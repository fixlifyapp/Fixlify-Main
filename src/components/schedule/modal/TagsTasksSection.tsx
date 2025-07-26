import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tag, Plus, X } from "lucide-react";
// import { UnifiedTagsSelector } from "@/components/shared/UnifiedTagsSelector";
import { FormData } from "./useScheduleJobForm";

interface TagsTasksSectionProps {
  formData: FormData;
  tags: any[];
  tagsLoading: boolean;
  newTask: string;
  setNewTask: (task: string) => void;
  handleTagToggle: (tagId: string) => void;
  handleAddTask: () => void;
  handleRemoveTask: (index: number) => void;
}

export const TagsTasksSection = ({
  formData,
  tags,
  tagsLoading,
  newTask,
  setNewTask,
  handleTagToggle,
  handleAddTask,
  handleRemoveTask,
}: TagsTasksSectionProps) => {
  const handleTaskKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <>
      {/* Tags Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
          {tagsLoading ? (
            <p className="text-sm text-muted-foreground">Loading tags...</p>
          ) : (
            tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tasks</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleTaskKeyPress}
            />
            <Button type="button" onClick={handleAddTask} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {formData.tasks.length > 0 && (
            <div className="space-y-2">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Checkbox disabled />
                    <span className="text-sm">{task}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTask(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 