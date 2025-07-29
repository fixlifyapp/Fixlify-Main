import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Plus, 
  Save, 
  Play, 
  Settings,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  Filter,
  ArrowRight,
  Edit
} from 'lucide-react';
import { EnhancedWorkflowTemplates } from './EnhancedWorkflowTemplates';
import { SmartTriggerSelector } from './SmartTriggerSelector';
import { SmartActionSelector } from './SmartActionSelector';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  config: any;
  enabled: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  triggers: string[];
  actions: string[];
  estimatedTimeSaved: string;
  popularity: number;
  businessValue: string;
  isFeatured: boolean;
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
}

export const EnhancedWorkflowBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    
    // Convert template to workflow steps
    const steps: WorkflowStep[] = [];
    
    // Add trigger step
    if (template.triggers.length > 0) {
      steps.push({
        id: 'trigger-1',
        type: 'trigger',
        config: {
          type: template.triggers[0].toLowerCase().replace(/ /g, '_'),
          name: template.triggers[0]
        },
        enabled: true
      });
    }
    
    // Add action steps
    template.actions.forEach((action, index) => {
      steps.push({
        id: `action-${index + 1}`,
        type: action.toLowerCase().includes('wait') ? 'delay' : 'action',
        config: {
          type: action.toLowerCase().replace(/ /g, '_'),
          name: action
        },
        enabled: true
      });
    });
    
    setWorkflowSteps(steps);
    setActiveTab('builder');
    
    toast.success(`Template "${template.name}" loaded successfully!`);
  };

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `${type}-${Date.now()}`,
      type,
      config: {},
      enabled: true
    };
    
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, config: any) => {
    setWorkflowSteps(workflowSteps.map(step => 
      step.id === stepId 
        ? { ...step, config: { ...step.config, ...config } }
        : step
    ));
  };

  const toggleStepEnabled = (stepId: string) => {
    setWorkflowSteps(workflowSteps.map(step => 
      step.id === stepId 
        ? { ...step, enabled: !step.enabled }
        : step
    ));
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    
    if (workflowSteps.length === 0) {
      toast.error('Please add at least one step to your workflow');
      return;
    }
    
    // Here you would save to your backend
    toast.success('Workflow saved successfully!');
  };

  const handleTestWorkflow = () => {
    if (workflowSteps.length === 0) {
      toast.error('Please add steps to test the workflow');
      return;
    }
    
    toast.info('Testing workflow with sample data...');
    // Here you would trigger a test run
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger':
        return <Zap className="h-4 w-4" />;
      case 'action':
        return <MessageSquare className="h-4 w-4" />;
      case 'condition':
        return <Filter className="h-4 w-4" />;
      case 'delay':
        return <Clock className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'action':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'condition':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'delay':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderWorkflowStep = (step: WorkflowStep, index: number) => (
    <div key={step.id} className="space-y-2">
      {index > 0 && (
        <div className="flex justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      
      <Card className={`${!step.enabled ? 'opacity-50' : ''} transition-opacity`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStepColor(step.type)}>
                {getStepIcon(step.type)}
                <span className="ml-1 capitalize">{step.type}</span>
              </Badge>
              <span className="text-sm font-medium">
                {step.config.name || `${step.type} ${index + 1}`}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStepEnabled(step.id)}
                className="h-8 w-8 p-0"
              >
                {step.enabled ? '👁️' : '👁️‍🗨️'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStep(step.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                ❌
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {step.type === 'trigger' && (
            <div className="space-y-2">
              <Label>Trigger Configuration</Label>
              <p className="text-sm text-muted-foreground">
                Configure when this workflow should start: {step.config.name || 'Select trigger type'}
              </p>
            </div>
          )}
          
          {step.type === 'action' && (
            <div className="space-y-2">
              <Label>Action Configuration</Label>
              <p className="text-sm text-muted-foreground">
                Configure what should happen: {step.config.name || 'Select action type'}
              </p>
            </div>
          )}
          
          {step.type === 'delay' && (
            <div className="space-y-2">
              <Label>Wait Time</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={step.config.amount || ''}
                  onChange={(e) => updateStep(step.id, { amount: e.target.value })}
                  className="w-24"
                />
                <select
                  className="px-3 py-2 border rounded-md"
                  value={step.config.unit || 'minutes'}
                  onChange={(e) => updateStep(step.id, { unit: e.target.value })}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          )}
          
          {step.type === 'condition' && (
            <div className="space-y-2">
              <Label>Condition Logic</Label>
              <p className="text-sm text-muted-foreground">
                Advanced condition builder would go here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Workflow Builder</h1>
        <p className="text-muted-foreground">
          Create powerful automation workflows for your business
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <EnhancedWorkflowTemplates onSelectTemplate={handleSelectTemplate} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          {/* Workflow Header */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Describe what this workflow does"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Steps</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('trigger')}
                    disabled={workflowSteps.some(s => s.type === 'trigger')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('action')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Action
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('delay')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Delay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('condition')}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Condition
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {workflowSteps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No steps added yet</p>
                    <p className="text-sm">Start by adding a trigger or choose a template</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => renderWorkflowStep(step, index))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSaveWorkflow} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
            <Button variant="outline" onClick={handleTestWorkflow}>
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Business Hours</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure when this workflow should run
                  </p>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="business-hours" />
                    <Label htmlFor="business-hours">
                      Only run during business hours
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label>Execution Limits</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Prevent excessive executions
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max executions per hour</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div>
                      <Label>Max executions per day</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};