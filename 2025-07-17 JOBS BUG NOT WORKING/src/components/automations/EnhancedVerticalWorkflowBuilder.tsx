
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Play, Pause } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description: string;
  config: any;
}

export default function EnhancedVerticalWorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      type: 'trigger',
      title: 'New Job Created',
      description: 'When a new job is created in the system',
      config: {}
    }
  ]);
  
  const { companySettings, isLoading } = useCompanySettings();

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type,
      title: `New ${type}`,
      description: `Configure your ${type}`,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return '⚡';
      case 'condition': return '🔍';
      case 'action': return '🎯';
      case 'delay': return '⏱️';
      default: return '📋';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Builder</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-lg">{getStepIcon(step.type)}</span>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
            
            {index < steps.length - 1 && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 justify-center pt-4">
        <Button variant="outline" size="sm" onClick={() => addStep('condition')}>
          <Plus className="w-4 h-4 mr-2" />
          Condition
        </Button>
        <Button variant="outline" size="sm" onClick={() => addStep('action')}>
          <Plus className="w-4 h-4 mr-2" />
          Action
        </Button>
        <Button variant="outline" size="sm" onClick={() => addStep('delay')}>
          <Plus className="w-4 h-4 mr-2" />
          Delay
        </Button>
      </div>
    </div>
  );
}
