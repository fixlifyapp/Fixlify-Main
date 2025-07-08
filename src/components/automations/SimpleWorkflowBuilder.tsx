
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

interface WorkflowData {
  name: string;
  description: string;
  trigger_type: string;
  conditions: WorkflowCondition[];
  action_type: string;
  action_config: {
    message_template: string;
    send_email: boolean;
    send_sms: boolean;
    delay_hours: number;
  };
}

export default function SimpleWorkflowBuilder() {
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: '',
    description: '',
    trigger_type: 'job_created',
    conditions: [],
    action_type: 'send_notification',
    action_config: {
      message_template: '',
      send_email: true,
      send_sms: false,
      delay_hours: 0,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { companySettings, isLoading: settingsLoading } = useCompanySettings();

  const handleSaveWorkflow = async () => {
    if (!workflowData.name || !workflowData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const workflowPayload = {
        user_id: user.id,
        organization_id: user.id, // Using user_id as organization_id for now
        name: workflowData.name,
        description: workflowData.description,
        status: 'active',
        category: 'communication',
        trigger_type: workflowData.trigger_type,
        trigger_conditions: JSON.stringify({ conditions: workflowData.conditions }),
        action_type: workflowData.action_type,
        action_config: JSON.stringify(workflowData.action_config),
        steps: JSON.stringify([
          {
            id: '1',
            type: 'trigger',
            config: { trigger_type: workflowData.trigger_type }
          },
          {
            id: '2',
            type: 'action',
            config: workflowData.action_config
          }
        ]),
        enabled: true,
        settings: JSON.stringify({
          notifications: true,
          logging: true
        })
      };

      const { error } = await supabase
        .from('automation_workflows')
        .insert(workflowPayload);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow created successfully",
      });

      // Reset form
      setWorkflowData({
        name: '',
        description: '',
        trigger_type: 'job_created',
        conditions: [],
        action_type: 'send_notification',
        action_config: {
          message_template: '',
          send_email: true,
          send_sms: false,
          delay_hours: 0,
        }
      });

    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Simple Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name *</Label>
            <Input
              id="name"
              value={workflowData.name}
              onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter workflow name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={workflowData.description}
              onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Event</Label>
            <Select
              value={workflowData.trigger_type}
              onValueChange={(value) => setWorkflowData(prev => ({ ...prev, trigger_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_created">Job Created</SelectItem>
                <SelectItem value="job_completed">Job Completed</SelectItem>
                <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
                <SelectItem value="estimate_approved">Estimate Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action Type</Label>
            <Select
              value={workflowData.action_type}
              onValueChange={(value) => setWorkflowData(prev => ({ ...prev, action_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_notification">Send Notification</SelectItem>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="send_sms">Send SMS</SelectItem>
                <SelectItem value="create_task">Create Task</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Textarea
              id="template"
              value={workflowData.action_config.message_template}
              onChange={(e) => setWorkflowData(prev => ({
                ...prev,
                action_config: { ...prev.action_config, message_template: e.target.value }
              }))}
              placeholder="Enter your message template here..."
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveWorkflow} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}
