import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Zap, Plus, Workflow, Activity, TrendingUp, Settings,
  CheckCircle, Clock, RefreshCw, Timer, X, ArrowLeft,
  Bot, Play, Eye, Trash2
} from 'lucide-react';

import { AdvancedWorkflowBuilder } from './AdvancedWorkflowBuilder';
import { AutomationService, AutomationWorkflow } from '@/services/automationService';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';

interface UnifiedAutomationSystemProps {
  onBack?: () => void;
}

export const UnifiedAutomationSystem: React.FC<UnifiedAutomationSystemProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([]);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);
  
  const { user } = useAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    if (user?.id && organization?.id) {
      loadAutomations();
      loadExecutionLogs();
    }
  }, [user?.id, organization?.id]);

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

  const loadExecutionLogs = async () => {
    try {
      const logs = await AutomationService.getExecutionLogs();
      setExecutionLogs(logs);
    } catch (error) {
      console.error('Error loading logs:', error);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">AI Automation System</h1>
            <p className="text-muted-foreground">Intelligent workflow automation for your business</p>
          </div>
        </div>
        <Button onClick={handleCreateWorkflow} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
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
                        automations.reduce((sum, a) => sum + (a.execution_count || 1), 0)) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">
                  {Math.round(automations.reduce((sum, a) => sum + (a.execution_count || 0), 0) * 5 / 60)}h
                </p>
              </div>
              <Timer className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <WorkflowDashboard 
            automations={automations}
            onCreateWorkflow={handleCreateWorkflow}
            onEditWorkflow={handleEditWorkflow}
          />
        </TabsContent>

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

        <TabsContent value="logs" className="space-y-6">
          <ExecutionLogs logs={executionLogs} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIAssistantPanel onCreateWorkflow={handleCreateWorkflow} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Dashboard Component
const WorkflowDashboard: React.FC<{
  automations: AutomationWorkflow[];
  onCreateWorkflow: () => void;
  onEditWorkflow: (workflow: AutomationWorkflow) => void;
}> = ({ automations, onCreateWorkflow, onEditWorkflow }) => {
  const recentAutomations = automations.slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAutomations.map((automation) => (
            <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{automation.name}</h4>
                <p className="text-sm text-muted-foreground">{automation.description}</p>
              </div>
              <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                {automation.status}
              </Badge>
            </div>
          ))}
          {recentAutomations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workflows created yet</p>
              <Button onClick={onCreateWorkflow}>Create First Workflow</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Welcome New Clients', description: 'Send welcome message to new clients' },
            { name: 'Job Completion Follow-up', description: 'Follow up after job completion' },
            { name: 'Payment Reminders', description: 'Remind clients about overdue payments' },
            { name: 'Appointment Confirmations', description: 'Confirm upcoming appointments' }
          ].map((template) => (
            <div key={template.name} 
                 className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                 onClick={onCreateWorkflow}>
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <Plus className="w-4 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
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
            <p className="text-muted-foreground">Create your first automation workflow to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Execution Logs Component
const ExecutionLogs: React.FC<{ logs: any[] }> = ({ logs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Workflow: {log.workflow_id}</h4>
                <p className="text-sm text-muted-foreground">
                  Status: {log.status} | Started: {new Date(log.started_at).toLocaleString()}
                </p>
                {log.error_message && (
                  <p className="text-sm text-red-500 mt-1">{log.error_message}</p>
                )}
              </div>
              <Badge variant={
                log.status === 'completed' ? 'default' :
                log.status === 'failed' ? 'destructive' : 'secondary'
              }>
                {log.status}
              </Badge>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No execution logs yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// AI Assistant Panel Component
const AIAssistantPanel: React.FC<{ onCreateWorkflow: () => void }> = ({ onCreateWorkflow }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Automation Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-muted-foreground mb-6">
            Describe what you want to automate and our AI will create the workflow for you
          </p>
          <Button onClick={onCreateWorkflow} className="gap-2">
            <Zap className="w-4 h-4" />
            Start Building with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedAutomationSystem;