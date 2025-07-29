import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus, Activity, TrendingUp, Settings,
  RefreshCw, ArrowLeft, Play, Trash2, 
  Workflow, Clock, MessageSquare, Zap, Edit2, Check, X
} from 'lucide-react';

import { AdvancedWorkflowBuilder } from './AdvancedWorkflowBuilder';
import { AutomationService, AutomationWorkflow } from '@/services/automationService';
import { useAuth } from '@/hooks/use-auth';

export const SimplifiedAutomationSystem: React.FC = () => {
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

  const handleCreateFromTemplate = (template: any) => {
    // Create a new workflow based on template
    const templateWorkflow = {
      name: template.name,
      description: template.description,
      template_config: {
        steps: template.steps
      }
    };
    setEditingWorkflow(templateWorkflow as AutomationWorkflow);
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

  const handleToggleWorkflow = async (id: string, newStatus: string) => {
    try {
      const enabled = newStatus === 'active';
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
            Back to Workflows
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
            { name: 'job.formattedDate', label: 'Appointment Date', type: 'text' },
            { name: 'job.appointmentTime', label: 'Appointment Time', type: 'text' },
            { name: 'job.scheduledDateTime', label: 'Full Appointment', type: 'text' },
            { name: 'invoice.number', label: 'Invoice Number', type: 'text' },
            { name: 'invoice.total', label: 'Invoice Total', type: 'currency' },
            { name: 'company.name', label: 'Company Name', type: 'text' }
          ]}
          onSave={handleSaveWorkflow}
          onCancel={() => {
            setShowBuilder(false);
            setEditingWorkflow(null);
          }}
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
          <p className="text-muted-foreground">Create and manage automated workflows with triggers and actions</p>
        </div>
        <Button onClick={handleCreateWorkflow} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Basic Stats */}
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
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{automations.length}</p>
              </div>
              <Workflow className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates Available</p>
                <p className="text-2xl font-bold">9</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined View: Workflows and Templates */}
      <div className="space-y-6">
        {/* Existing Workflows */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Workflows</h3>
          <WorkflowList 
            automations={automations}
            setAutomations={setAutomations}
            onEdit={handleEditWorkflow}
            onDelete={handleDeleteWorkflow}
            onToggle={handleToggleWorkflow}
            onTest={handleTestWorkflow}
            loading={loading}
          />
        </div>

        {/* Quick Start Templates */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ready-to-Use Templates</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Welcome New Clients',
                description: 'Send welcome message when client is added',
                icon: MessageSquare,
                trigger: 'New Client Added',
                actions: ['Send Email', 'Send SMS'],
                steps: [
                  { type: 'trigger', name: 'New Client Added', config: { trigger_type: 'client_created' } },
                  { type: 'action', name: 'Send Welcome Email', config: { action_type: 'send_email', template: 'welcome' } }
                ]
              },
              {
                name: 'Job Completion Follow-up',
                description: 'Follow up after job completion',
                icon: Clock,
                trigger: 'Job Completed',
                actions: ['Wait 1 Day', 'Send Survey'],
                steps: [
                  { type: 'trigger', name: 'Job Completed', config: { trigger_type: 'job_completed' } },
                  { type: 'delay', name: 'Wait 1 Day', config: { delay_hours: 24 } },
                  { type: 'action', name: 'Send Survey', config: { action_type: 'send_email', template: 'survey' } }
                ]
              },
              {
                name: 'Payment Reminders',
                description: 'Remind about overdue payments',
                icon: RefreshCw,
                trigger: 'Invoice Overdue',
                actions: ['Send Reminder', 'Create Task'],
                steps: [
                  { type: 'trigger', name: 'Invoice Overdue', config: { trigger_type: 'invoice_overdue' } },
                  { type: 'action', name: 'Send Reminder', config: { action_type: 'send_email', template: 'payment_reminder' } },
                  { type: 'action', name: 'Create Task', config: { action_type: 'create_task', title: 'Follow up on payment' } }
                ]
              },
              {
                name: 'Appointment Confirmations',
                description: 'Confirm upcoming appointments',
                icon: Zap,
                trigger: 'Job Scheduled',
                actions: ['Wait Until Day Before', 'Send SMS'],
                steps: [
                  { type: 'trigger', name: 'Job Scheduled', config: { trigger_type: 'job_scheduled' } },
                  { type: 'delay', name: 'Wait Until Day Before', config: { delay_until: 'day_before' } },
                  { type: 'action', name: 'Send SMS Confirmation', config: { action_type: 'send_sms', template: 'appointment_confirm' } }
                ]
              },
              {
                name: 'Missed Call Auto Response',
                description: 'Auto-respond when you miss a call',
                icon: MessageSquare,
                trigger: 'Missed Call',
                actions: ['Send SMS'],
                steps: [
                  { type: 'trigger', name: 'Missed Call', config: { trigger_type: 'missed_call' } },
                  { type: 'action', name: 'Send Auto-Response SMS', config: { action_type: 'send_sms', template: 'missed_call_response' } }
                ]
              },
              {
                name: 'Daily Task Reminders',
                description: 'Send daily reminders for overdue tasks',
                icon: Clock,
                trigger: 'Daily Schedule',
                actions: ['Check Tasks', 'Send Reminder'],
                steps: [
                  { type: 'trigger', name: 'Daily at 9 AM', config: { trigger_type: 'scheduled', schedule: 'daily_9am' } },
                  { type: 'action', name: 'Send Task Reminder', config: { action_type: 'send_email', template: 'daily_tasks' } }
                ]
              },
              {
                name: 'Quote Follow-up',
                description: 'Follow up on pending estimates',
                icon: RefreshCw,
                trigger: 'Estimate Created',
                actions: ['Wait 3 Days', 'Send Follow-up'],
                steps: [
                  { type: 'trigger', name: 'Estimate Created', config: { trigger_type: 'estimate_created' } },
                  { type: 'delay', name: 'Wait 3 Days', config: { delay_hours: 72 } },
                  { type: 'action', name: 'Send Follow-up Email', config: { action_type: 'send_email', template: 'estimate_followup' } }
                ]
              },
              {
                name: 'Emergency Service Alert',
                description: 'Immediate response for emergency calls',
                icon: Zap,
                trigger: 'Emergency Call',
                actions: ['Alert Team', 'Auto-Response'],
                steps: [
                  { type: 'trigger', name: 'Emergency Call Received', config: { trigger_type: 'emergency_call' } },
                  { type: 'action', name: 'Send Team Alert', config: { action_type: 'send_notification', template: 'emergency_alert' } },
                  { type: 'action', name: 'Auto-Response SMS', config: { action_type: 'send_sms', template: 'emergency_response' } }
                ]
              },
              {
                name: 'Seasonal Maintenance',
                description: 'Remind clients about seasonal services',
                icon: TrendingUp,
                trigger: 'Season Change',
                actions: ['Send Campaign', 'Create Leads'],
                steps: [
                  { type: 'trigger', name: 'Seasonal Schedule', config: { trigger_type: 'seasonal_trigger' } },
                  { type: 'action', name: 'Send Maintenance Reminder', config: { action_type: 'send_email', template: 'seasonal_maintenance' } }
                ]
              }
            ].map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <IconComponent className="w-8 h-8 text-primary" />
                      <Button 
                        size="sm"
                        onClick={() => handleCreateFromTemplate(template)}
                        className="gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Use
                      </Button>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-1 text-xs">
                      <div><span className="font-medium text-blue-600">Trigger:</span> {template.trigger}</div>
                      <div><span className="font-medium text-green-600">Actions:</span> {template.actions.join(' → ')}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Workflow List Component
const WorkflowList: React.FC<{
  automations: AutomationWorkflow[];
  setAutomations: React.Dispatch<React.SetStateAction<AutomationWorkflow[]>>;
  onEdit: (workflow: AutomationWorkflow) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, status: string) => void;
  onTest: (id: string) => void;
  loading: boolean;
}> = ({ automations, setAutomations, onEdit, onDelete, onToggle, onTest, loading }) => {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const generateWorkflowSubtitle = (automation: AutomationWorkflow): string => {
    let subtitle = '';
    
    // Extract triggers from template_config
    const triggers = automation.triggers || automation.template_config?.triggers || [];
    const actions = automation.actions || automation.template_config?.actions || automation.template_config?.steps?.filter((s: any) => s.type === 'action') || [];
    
    if (triggers.length > 0) {
      const triggerType = triggers[0].triggerType || triggers[0].type || 'trigger';
      const triggerName = triggerType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      subtitle += `When ${triggerName}`;
    }
    
    if (actions.length > 0) {
      const actionCount = actions.length;
      if (actionCount === 1) {
        const actionType = actions[0].actionType || actions[0].type || 'action';
        const actionName = actionType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        subtitle += ` → ${actionName}`;
      } else {
        subtitle += ` → ${actionCount} actions`;
      }
    }
    
    return subtitle || 'Workflow automation';
  };

  const handleNameEdit = (automation: AutomationWorkflow) => {
    setEditingName(automation.id!);
    setTempName(automation.name);
  };

  const handleNameSave = async (automation: AutomationWorkflow) => {
    if (tempName.trim() && tempName !== automation.name) {
      try {
        await AutomationService.updateWorkflow(automation.id!, { 
          name: tempName.trim() 
        });
        // Update local state
        setAutomations(prev => prev.map(a => 
          a.id === automation.id ? { ...a, name: tempName.trim() } : a
        ));
        toast.success('Workflow name updated');
      } catch (error) {
        toast.error('Failed to update workflow name');
      }
    }
    setEditingName(null);
  };

  const handleNameCancel = () => {
    setEditingName(null);
    setTempName('');
  };
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
        <Card key={automation.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {editingName === automation.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="text-lg font-semibold"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave(automation);
                          if (e.key === 'Escape') handleNameCancel();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleNameSave(automation)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleNameCancel}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{automation.name}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleNameEdit(automation)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                    {automation.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{generateWorkflowSubtitle(automation)}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Executions: {automation.execution_count || 0}</span>
                  {automation.last_triggered_at && (
                    <span>Last Run: {new Date(automation.last_triggered_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={automation.status === 'active'}
                  onCheckedChange={(checked) => 
                    onToggle(automation.id!, checked ? 'active' : 'inactive')
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
            <p className="text-muted-foreground mb-4">Start with a template or create your own workflow</p>
            <p className="text-sm text-muted-foreground">Every workflow must start with a trigger</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
