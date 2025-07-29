import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDown, Zap, MessageSquare, Clock, GitBranch, 
  Trash2, Settings, Play, Pause 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'branch';
  name: string;
  config: any;
}

interface VisualWorkflowCanvasProps {
  steps: WorkflowStep[];
  onStepSelect: (stepId: string) => void;
  onStepDelete: (stepId: string) => void;
  selectedStep: string | null;
  isActive?: boolean;
}

export const VisualWorkflowCanvas: React.FC<VisualWorkflowCanvasProps> = ({
  steps,
  onStepSelect,
  onStepDelete,
  selectedStep,
  isActive = false
}) => {
  const getStepIcon = (step: WorkflowStep) => {
    if (step.config?.actionType === 'trigger') {
      return <Zap className="w-5 h-5" />;
    }
    
    switch (step.type) {
      case 'action':
        return <MessageSquare className="w-5 h-5" />;
      case 'delay':
        return <Clock className="w-5 h-5" />;
      case 'condition':
        return <GitBranch className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getStepColor = (step: WorkflowStep) => {
    if (step.config?.actionType === 'trigger') {
      return 'bg-purple-100 border-purple-300 text-purple-700';
    }
    
    switch (step.type) {
      case 'action':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'delay':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'condition':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStepTypeBadge = (step: WorkflowStep) => {
    if (step.config?.actionType === 'trigger') {
      return 'Trigger';
    }
    
    switch (step.type) {
      case 'action':
        return 'Action';
      case 'delay':
        return 'Delay';
      case 'condition':
        return 'Condition';
      default:
        return 'Step';
    }
  };

  return (
    <div className="relative">
      {/* Workflow Status */}
      <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            isActive 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isActive ? 'Active' : 'Inactive'}
          </div>
          <span className="text-sm text-muted-foreground">
            {steps.length} step{steps.length !== 1 ? 's' : ''} configured
          </span>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Workflow Settings
        </Button>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Connector Line */}
              {index > 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-border" />
              )}
              
              {/* Step Card */}
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedStep === step.id 
                    ? 'ring-2 ring-primary shadow-md' 
                    : 'hover:shadow-sm'
                } ${getStepColor(step)}`}
                onClick={() => onStepSelect(step.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getStepTypeBadge(step)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Step {index + 1}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm leading-tight">
                          {step.name}
                        </h3>
                        
                        {/* Step Configuration Preview */}
                        {step.config && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {step.config.actionType === 'trigger' && step.config.triggerType && (
                              <span>Trigger: {step.config.triggerType.replace('_', ' ')}</span>
                            )}
                            {step.config.actionType && step.config.actionType !== 'trigger' && (
                              <span>Action: {step.config.actionType.replace('_', ' ')}</span>
                            )}
                            {step.type === 'delay' && step.config.duration && (
                              <span>Wait: {step.config.duration} {step.config.unit}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Step Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepDelete(step.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Arrow */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {steps.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No workflow steps yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding a trigger to define when this workflow should run
            </p>
            <Button variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Add Your First Trigger
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};