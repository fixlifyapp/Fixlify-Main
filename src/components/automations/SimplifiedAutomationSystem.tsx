import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Zap, Plus, Activity, TrendingUp, Settings,
  CheckCircle, RefreshCw, Timer, ArrowLeft,
  Play, Trash2, Workflow
} from 'lucide-react';

import { AdvancedWorkflowBuilder } from './AdvancedWorkflowBuilder';
import { AutomationService, AutomationWorkflow } from '@/services/automationService';
import { useAuth } from '@/hooks/use-auth';

export const SimplifiedAutomationSystem: React.FC = () => {
  const [activeView, setActiveView] = useState('workflows');
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadAutomations();
    }
  }, [user?.id]);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const data = await AutomationService.getWorkflows();
      setAutomations(data);
    } catch (error) {
      console.error('Error loading automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowBuilder(true);
  };

  const handleEditWorkflow = (workflow: AutomationWorkflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleSaveWorkflow = async (workflowSteps: any[]) => {
    try {
      // Validate that we have a trigger
      const hasTrigger = workflowSteps.some(step => step.type === 'trigger');
      if (!hasTrigger) {
        toast.error('Workflow must start with a trigger');
        return;
      }

      const workflowData = {
        name: editingWorkflow?.name || 'New Workflow',
        description: editingWorkflow?.description || 'Custom automation workflow',
        template_config: {
          steps: workflowSteps
        },
        status: 'active' as const
      };

      if (editingWorkflow?.id) {
        await AutomationService.updateWorkflow(editingWorkflow.id, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        await AutomationService.createWorkflow(workflowData);
        toast.success('Workflow created successfully');
      }

      setShowBuilder(false);
      setEditingWorkflow(null);
      loadAutomations();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleToggleWorkflow = async (id: string, currentStatus: string) => {
    try {
      const enabled = currentStatus !== 'active';
      await AutomationService.toggleWorkflow(id, enabled);
      toast.success(`Workflow ${enabled ? 'enabled' : 'disabled'}`);
      loadAutomations();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await AutomationService.deleteWorkflow(id);
      toast.success('Workflow deleted');
      loadAutomations();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const handleTestWorkflow = async (id: string) => {
    try {
      await AutomationService.testWorkflow(id, {
        testMode: true,
        clientId: 'test-client',
        jobId: 'test-job'
      });
    } catch (error) {
      console.error('Error testing workflow:', error);
    }
  };

  // Show workflow builder
  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setShowBuilder(false);
              setEditingWorkflow(null);
            }}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Automations
          </Button>
        </div>

        <AdvancedWorkflowBuilder
          initialWorkflow={editingWorkflow?.template_config?.steps || []}
          businessType="Service Business"
          companyName="Your Company"
          availableVariables={[
            { name: 'client.firstName', label: 'Client First Name', type: 'text' },
            { name: 'client.lastName', label: 'Client Last Name', type: 'text' },
            { name: 'client.email', label: 'Client Email', type: 'text' },
            { name: 'client.phone', label: 'Client Phone', type: 'text' },
            { name: 'job.number', label: 'Job Number', type: 'text' },
            { name: 'job.title', label: 'Job Title', type: 'text' },
            { name: 'job.status', label: 'Job Status', type: 'text' },
            { name: 'invoice.number', label: 'Invoice Number', type: 'text' },
            { name: 'invoice.total', label: 'Invoice Total', type: 'currency' },
            { name: 'company.name', label: 'Company Name', type: 'text' }
          ]}
          onSave={handleSaveWorkflow}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Workflows</h2>
          <p className="text-muted-foreground">Create automated workflows starting with triggers</p>
        </div>
        <Button onClick={handleCreateWorkflow} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">
                  {automations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {automations.reduce((sum, a) => sum + (a.execution_count || 0), 0)}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {automations.length > 0 
                    ? `${Math.round((automations.reduce((sum, a) => sum + (a.success_count || 0), 0) / 
                        Math.max(automations.reduce((sum, a) => sum + (a.execution_count || 0), 0), 1)) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowList 
            automations={automations}
            onEdit={handleEditWorkflow}
            onDelete={handleDeleteWorkflow}
            onToggle={handleToggleWorkflow}
            onTest={handleTestWorkflow}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <WorkflowTemplates onCreateWorkflow={handleCreateWorkflow} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Workflow List Component
const WorkflowList: React.FC<{
  automations: AutomationWorkflow[];
  onEdit: (workflow: AutomationWorkflow) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: string) => void;
  onTest: (id: string) => void;
  loading: boolean;
}> = ({ automations, onEdit, onDelete, onToggle, onTest, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map((automation) => (
        <Card key={automation.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{automation.name}</h3>
                  <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                    {automation.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{automation.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Executions: {automation.execution_count || 0}</span>
                  <span>Success Rate: {
                    automation.execution_count 
                      ? Math.round(((automation.success_count || 0) / automation.execution_count) * 100)
                      : 0
                  }%</span>
                  {automation.last_triggered_at && (
                    <span>Last Run: {new Date(automation.last_triggered_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={automation.status === 'active'}
                  onCheckedChange={(checked) => 
                    onToggle(automation.id!, automation.status || 'inactive')
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTest(automation.id!)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(automation)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(automation.id!)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {automations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">Create your first automation workflow to get started</p>
            <p className="text-sm text-muted-foreground">Remember: Every workflow must start with a trigger</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Workflow Templates Component
const WorkflowTemplates: React.FC<{
  onCreateWorkflow: () => void;
}> = ({ onCreateWorkflow }) => {
  const templates = [
    {
      name: 'Welcome New Clients',
      description: 'Send welcome message to new clients when they are created',
      trigger: 'New Client Added',
      actions: ['Send Email', 'Send SMS']
    },
    {
      name: 'Job Completion Follow-up',
      description: 'Follow up with clients after job completion',
      trigger: 'Job Status Changed to Completed',
      actions: ['Wait 1 Day', 'Send Survey Email']
    },
    {
      name: 'Payment Reminders',
      description: 'Remind clients about overdue payments',
      trigger: 'Invoice Overdue',
      actions: ['Send Email Reminder', 'Create Task']
    },
    {
      name: 'Appointment Confirmations',
      description: 'Confirm upcoming appointments',
      trigger: 'Job Scheduled',
      actions: ['Wait Until 1 Day Before', 'Send SMS Confirmation']
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {templates.map((template) => (
        <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{template.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="font-medium text-blue-600">Trigger:</span> {template.trigger}
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-600">Actions:</span> {template.actions.join(' → ')}
              </div>
            </div>
            
            <Button 
              onClick={onCreateWorkflow}
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              Use This Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};