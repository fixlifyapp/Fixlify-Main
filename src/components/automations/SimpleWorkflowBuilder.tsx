
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  description: string;
  config: any;
  icon: string;
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

interface SimpleWorkflowBuilderProps {
  workflowId?: string;
  initialData?: any;
  onSave?: (workflowData: any) => void;
  onCancel?: () => void;
}

export const SimpleWorkflowBuilder: React.FC<SimpleWorkflowBuilderProps> = ({
  workflowId,
  initialData,
  onSave,
  onCancel
}) => {
  const { data: companyData } = useCompanySettings();
  const [workflowName, setWorkflowName] = useState(initialData?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(initialData?.description || '');
  const [triggerType, setTriggerType] = useState(initialData?.trigger_type || 'job_created');
  const [conditions, setConditions] = useState<WorkflowCondition[]>(
    initialData?.trigger_conditions?.conditions || []
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(
    initialData?.steps || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const updateCondition = (index: number, field: keyof WorkflowCondition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'action',
      name: 'New Step',
      description: 'Configure this step',
      config: {},
      icon: 'settings'
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const workflowData = {
        user_id: user.id,
        organization_id: user.id, // Using user.id as organization_id for now
        name: workflowName,
        description: workflowDescription,
        status: 'active',
        category: 'custom',
        trigger_type: triggerType,
        trigger_conditions: { conditions },
        steps: steps as any, // Cast to Json type
        workflow_type: 'simple',
        enabled: true,
        is_active: true,
        created_by: user.id,
        settings: {
          timezone: companyData?.companySettings?.company_timezone || 'America/New_York'
        }
      };

      let result;
      if (workflowId) {
        result = await supabase
          .from('automation_workflows')
          .update(workflowData)
          .eq('id', workflowId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('automation_workflows')
          .insert(workflowData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(workflowId ? 'Workflow updated successfully' : 'Workflow created successfully');
      onSave?.(result.data);
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast.error(error.message || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe what this workflow does"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>When should this workflow run?</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_created">Job Created</SelectItem>
                <SelectItem value="job_completed">Job Completed</SelectItem>
                <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
                <SelectItem value="payment_received">Payment Received</SelectItem>
                <SelectItem value="customer_created">Customer Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Conditions (optional)</Label>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>
            {conditions.map((condition, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Field</Label>
                  <Input
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    placeholder="e.g., status, amount"
                  />
                </div>
                <div className="w-32">
                  <Label>Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Value</Label>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    placeholder="Value to compare"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCondition(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Actions</CardTitle>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Step {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Step Name</Label>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(index, 'name', e.target.value)}
                    placeholder="Step name"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={step.type}
                    onValueChange={(value) => updateStep(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="delay">Delay</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  placeholder="What does this step do?"
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          {steps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No steps added yet. Click "Add Step" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : workflowId ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </div>
  );
};
