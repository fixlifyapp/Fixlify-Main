
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  description: string;
  config: any;
  icon: string;
}

interface EnhancedVerticalWorkflowBuilderProps {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
}

export const EnhancedVerticalWorkflowBuilder: React.FC<EnhancedVerticalWorkflowBuilderProps> = ({
  steps,
  onChange
}) => {
  const [currentEditingStep, setCurrentEditingStep] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const { data: companyData } = useCompanySettings();

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'action',
      name: 'New Step',
      description: 'Configure this step',
      config: {},
      icon: 'settings'
    };
    onChange([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    onChange(steps.filter(step => step.id !== stepId));
  };

  const editStep = (stepId: string) => {
    setCurrentEditingStep(stepId);
    setShowTemplates(true);
  };

  const generateWithAI = (stepId: string) => {
    setCurrentEditingStep(stepId);
    setShowAIDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Workflow Steps</h3>
        <Button onClick={addStep} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editStep(step.id)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => generateWithAI(step.id)}
                  >
                    AI
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStep(step.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {steps.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No steps added yet</p>
          <Button onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Step
          </Button>
        </Card>
      )}
    </div>
  );
};
