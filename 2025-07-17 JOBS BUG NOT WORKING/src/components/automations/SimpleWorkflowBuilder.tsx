
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SimpleWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  existingWorkflow?: any;
}

const SimpleWorkflowBuilder: React.FC<SimpleWorkflowBuilderProps> = ({ onSave, existingWorkflow }) => {
  const [workflowName, setWorkflowName] = useState(existingWorkflow?.name || '');
  const [triggerType, setTriggerType] = useState(existingWorkflow?.trigger_type || '');
  const [actions, setActions] = useState(existingWorkflow?.steps || []);
  const [isLoading, setIsLoading] = useState(false);

  const triggerOptions = [
    { value: 'job_completed', label: 'Job Completed' },
    { value: 'invoice_sent', label: 'Invoice Sent' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'estimate_sent', label: 'Estimate Sent' },
    { value: 'customer_created', label: 'New Customer' },
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'update_status', label: 'Update Status' },
  ];

  const addAction = () => {
    setActions([...actions, {
      id: Date.now().toString(),
      type: 'send_email',
      config: {}
    }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const updatedActions = actions.map((action, i) => 
      i === index ? { ...action, [field]: value } : action
    );
    setActions(updatedActions);
  };

  const saveWorkflow = async () => {
    if (!workflowName || !triggerType) {
      toast.error('Please provide workflow name and trigger');
      return;
    }

    setIsLoading(true);
    try {
      const workflowData = {
        name: workflowName,
        trigger_type: triggerType,
        steps: actions,
        enabled: true,
        organization_id: (await supabase.auth.getUser()).data.user?.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { error } = await supabase
        .from('automation_workflows')
        .insert(workflowData);

      if (error) throw error;

      toast.success('Workflow saved successfully!');
      onSave?.(workflowData);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create automated workflows for your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>

          <div>
            <Label htmlFor="trigger-type">Trigger</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Define what happens when the trigger occurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <Card key={action.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">Action {index + 1}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Action Type</Label>
                  <Select 
                    value={action.type} 
                    onValueChange={(value) => updateAction(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(action.type === 'send_email' || action.type === 'send_sms') && (
                  <>
                    <div>
                      <Label>Message Content</Label>
                      <Textarea
                        value={action.config?.content || ''}
                        onChange={(e) => updateAction(index, 'config', { 
                          ...action.config, 
                          content: e.target.value 
                        })}
                        placeholder="Enter your message content"
                      />
                    </div>
                    {action.type === 'send_email' && (
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={action.config?.subject || ''}
                          onChange={(e) => updateAction(index, 'config', { 
                            ...action.config, 
                            subject: e.target.value 
                          })}
                          placeholder="Email subject"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          ))}

          <Button onClick={addAction} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={saveWorkflow} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Workflow
        </Button>
        <Button variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Test Workflow
        </Button>
      </div>
    </div>
  );
};

export default SimpleWorkflowBuilder;
