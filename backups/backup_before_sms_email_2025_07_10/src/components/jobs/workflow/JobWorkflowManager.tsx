
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { useJobWorkflow } from "./hooks/useJobWorkflow";

interface JobWorkflowManagerProps {
  jobId: string;
  currentStatus: string;
}

export const JobWorkflowManager = ({ jobId, currentStatus }: JobWorkflowManagerProps) => {
  const { 
    workflow, 
    isLoading, 
    updateJobStatus, 
    getNextActions,
    getWorkflowProgress
  } = useJobWorkflow(jobId, currentStatus);

  const progress = getWorkflowProgress();
  const nextActions = getNextActions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Job Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Workflow Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <div className="font-medium">Current Status</div>
            <div className="text-sm text-muted-foreground capitalize">{currentStatus}</div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-3">
          <h4 className="font-medium">Workflow Steps</h4>
          {workflow.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : step.current 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : step.current ? (
                  <Clock className="h-5 w-5 text-blue-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    step.completed ? 'text-green-900' : 
                    step.current ? 'text-blue-900' : 
                    'text-gray-600'
                  }`}>
                    {step.name}
                  </span>
                  <Badge variant={step.completed ? 'default' : 'secondary'} className="text-xs">
                    {step.completed ? 'completed' : step.current ? 'current' : 'pending'}
                  </Badge>
                </div>
                
                {step.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
                
                {step.assignee && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <User className="h-3 w-3" />
                    {step.assignee}
                  </div>
                )}
                
                {step.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(step.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {step.current && nextActions.length > 0 && (
                <ArrowRight className="h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>

        {/* Next Actions */}
        {nextActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Actions</h4>
            <div className="flex flex-wrap gap-2">
              {nextActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.primary ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateJobStatus(action.targetStatus)}
                  className="flex items-center gap-2"
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Analytics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {workflow.filter(s => s.completed).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {workflow.filter(s => s.current).length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600">
              {workflow.filter(s => !s.completed && !s.current).length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
