
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Edit3, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TasksCardProps {
  tasks: string[];
  jobId: string;
  editable?: boolean;
  onManageTasks?: () => void;
  onUpdate?: () => void;
}

export const TasksCard = ({ tasks, jobId, editable = false, onManageTasks, onUpdate }: TasksCardProps) => {
  const taskList = Array.isArray(tasks) ? tasks : [];
  
  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tasks
          </ModernCardTitle>
          {editable && onManageTasks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onManageTasks}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {taskList.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {taskList.map((task, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1">{task}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <Badge variant="outline" className="text-xs">
                {taskList.length} task{taskList.length !== 1 ? 's' : ''} total
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {editable ? "No tasks assigned. Click the edit button to add tasks." : "No tasks assigned"}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
