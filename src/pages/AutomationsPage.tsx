import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { EnhancedVerticalWorkflowBuilder } from '@/components/automations/EnhancedVerticalWorkflowBuilder';
import {
  Zap, Plus, Workflow, Activity, TrendingUp,
  CheckCircle, Clock, RefreshCw, Timer, Settings,
  X, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
// import SimpleWorkflowBuilder from '@/components/automations/SimpleWorkflowBuilder';
// import { AutomationExecutionLogs } from '@/components/automations/AutomationExecutionLogs';
// import { AutomationManualExecution } from '@/services/automation-manual-execution';

const AutomationsPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('automations');
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  
  const { user } = useAuth();
  const { organization } = useOrganization();

  // Fetch automations
  useEffect(() => {
    if (user?.id && organization?.id) {
      fetchAutomations();
    }
  }, [user?.id, organization?.id]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomationRules(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGeneratedAutomation = (automation: any) => {
    // Convert AI-generated automation to workflow format
    const workflowTemplate = {
      name: automation.name,
      description: automation.description,
      triggers: [automation.trigger],
      steps: automation.steps
    };
    
    setLoadedTemplate(workflowTemplate);
    setShowWorkflowBuilder(true);
  };

  const handleToggleAutomation = async (id: string, currentStatus: string) => {
    try {
      console.log('Toggling automation:', id, 'from', currentStatus);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Toggle error:', error);
        throw error;
      }

      toast.success(`Automation ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      fetchAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Automation deleted successfully');
      fetchAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  // Show workflow builder overlay
  if (showWorkflowBuilder) {
    return (
      <PageLayout>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowWorkflowBuilder(false);
              setSelectedWorkflowId(null);
              setLoadedTemplate(null);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Automations
          </Button>
        </div>
        <EnhancedVerticalWorkflowBuilder
          workflowId={selectedWorkflowId || undefined}
          template={loadedTemplate}
          onSave={(workflow) => {
            toast.success('Workflow saved successfully!');
            setShowWorkflowBuilder(false);
            setSelectedWorkflowId(null);
            setLoadedTemplate(null);
            fetchAutomations();
          }}
          onCancel={() => {
            setShowWorkflowBuilder(false);
            setSelectedWorkflowId(null);
            setLoadedTemplate(null);
          }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Automations"
        subtitle="Streamline your business with intelligent workflow automation"
        icon={Zap}
        actionButton={{
          text: 'Create Automation',
          icon: Plus,
          onClick: () => setShowWorkflowBuilder(true)
        }}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Automations</p>
                <p className="text-2xl font-bold">
                  {automationRules.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {automationRules.reduce((sum, a) => sum + (a.execution_count || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {automationRules.length > 0 
                    ? `${Math.round((automationRules.reduce((sum, a) => sum + (a.success_count || 0), 0) / 
                        automationRules.reduce((sum, a) => sum + (a.execution_count || 1), 0)) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">
                  {Math.round(automationRules.reduce((sum, a) => sum + (a.execution_count || 0), 0) * 5 / 60)}h
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Timer className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automations" className="flex items-center justify-center gap-2">
            <Workflow className="w-4 h-4" />
            Automations
            {automationRules.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {automationRules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading automations...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Action Templates */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Popular Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Welcome New Clients */}
                  <ModernCard className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    const template = {
                      name: "Welcome New Clients",
                      description: "Send welcome message to new clients via SMS",
                      triggers: [{
                        trigger_type: "client_created",
                        conditions: {}
                      }],
                      steps: [{
                        action_type: "send_sms",
                        action_config: {
                          message: "Welcome {{client.firstName}}! Thank you for choosing our services. We'll keep you updated on your service requests.",
                          delay: 0
                        }
                      }]
                    };
                    setLoadedTemplate(template);
                    setShowWorkflowBuilder(true);
                  }}>
                    <ModernCardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Zap className="w-4 h-4 text-blue-500" />
                        </div>
                        <h4 className="font-semibold">Welcome New Clients</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Auto-send welcome SMS to new clients</p>
                    </ModernCardContent>
                  </ModernCard>

                  {/* Job Completion Follow-up */}
                  <ModernCard className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    const template = {
                      name: "Job Completion Follow-up",
                      description: "Follow up with clients after job completion",
                      triggers: [{
                        trigger_type: "job_status_changed",
                        conditions: { status: "completed" }
                      }],
                      steps: [{
                        action_type: "send_sms",
                        action_config: {
                          message: "Hi {{client.firstName}}, your job #{{job.number}} is complete! We hope you're satisfied with our service. Please let us know if you need anything else.",
                          delay: 3600 // 1 hour delay
                        }
                      }]
                    };
                    setLoadedTemplate(template);
                    setShowWorkflowBuilder(true);
                  }}>
                    <ModernCardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <h4 className="font-semibold">Job Completion</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Follow up after job completion</p>
                    </ModernCardContent>
                  </ModernCard>

                  {/* Payment Reminder */}
                  <ModernCard className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    const template = {
                      name: "Payment Reminder",
                      description: "Remind clients about overdue invoices",
                      triggers: [{
                        trigger_type: "invoice_overdue",
                        conditions: { days_overdue: 7 }
                      }],
                      steps: [
                        {
                          action_type: "send_email",
                          action_config: {
                            subject: "Payment Reminder - Invoice #{{invoice.number}}",
                            message: "Dear {{client.firstName}}, this is a friendly reminder that invoice #{{invoice.number}} for ${{invoice.total}} is now overdue. Please submit payment at your earliest convenience.",
                            delay: 0
                          }
                        },
                        {
                          action_type: "send_sms",
                          action_config: {
                            message: "Hi {{client.firstName}}, invoice #{{invoice.number}} (${{invoice.total}}) is overdue. Please check your email for details.",
                            delay: 86400 // 24 hours after email
                          }
                        }
                      ]
                    };
                    setLoadedTemplate(template);
                    setShowWorkflowBuilder(true);
                  }}>
                    <ModernCardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <h4 className="font-semibold">Payment Reminder</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Auto-remind overdue payments</p>
                    </ModernCardContent>
                  </ModernCard>
                </div>
              </div>

              {/* AI Builder */}
              <div className="mb-6">
                <ModernCard>
                  <ModernCardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Zap className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">AI Automation Builder</h3>
                        <p className="text-sm text-muted-foreground">Describe what you want to automate and we'll build it for you</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <textarea
                        placeholder="Example: Send SMS to clients 24 hours before their scheduled appointment"
                        className="w-full p-3 border rounded-lg resize-none h-20 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        id="ai-automation-input"
                      />
                      
                      <div className="flex gap-2">
                        <GradientButton 
                          onClick={() => {
                            const input = document.getElementById('ai-automation-input') as HTMLTextAreaElement;
                            const description = input?.value?.trim();
                            
                            if (!description) {
                              toast.error('Please describe what you want to automate');
                              return;
                            }

                            // Parse the description and create a template
                            let template = null;
                            
                            if (description.toLowerCase().includes('appointment') && description.toLowerCase().includes('remind')) {
                              template = {
                                name: "Appointment Reminder",
                                description: description,
                                triggers: [{
                                  trigger_type: "scheduled_trigger",
                                  conditions: { hours_before_appointment: 24 }
                                }],
                                steps: [{
                                  action_type: "send_sms",
                                  action_config: {
                                    message: "Hi {{client.firstName}}, this is a reminder about your appointment tomorrow at {{appointment.time}}. See you then!",
                                    delay: 0
                                  }
                                }]
                              };
                            } else if (description.toLowerCase().includes('welcome') && description.toLowerCase().includes('new')) {
                              template = {
                                name: "Welcome New Clients",
                                description: description,
                                triggers: [{
                                  trigger_type: "client_created",
                                  conditions: {}
                                }],
                                steps: [{
                                  action_type: "send_sms",
                                  action_config: {
                                    message: "Welcome {{client.firstName}}! Thank you for choosing our services.",
                                    delay: 0
                                  }
                                }]
                              };
                            } else if (description.toLowerCase().includes('job') && description.toLowerCase().includes('complete')) {
                              template = {
                                name: "Job Completion Follow-up",
                                description: description,
                                triggers: [{
                                  trigger_type: "job_status_changed",
                                  conditions: { status: "completed" }
                                }],
                                steps: [{
                                  action_type: "send_sms",
                                  action_config: {
                                    message: "Hi {{client.firstName}}, your job is complete! Please let us know if you need anything else.",
                                    delay: 0
                                  }
                                }]
                              };
                            } else {
                              // Generic template
                              template = {
                                name: "Custom Automation",
                                description: description,
                                triggers: [{
                                  trigger_type: "manual",
                                  conditions: {}
                                }],
                                steps: [{
                                  action_type: "send_sms",
                                  action_config: {
                                    message: "Custom message based on: " + description,
                                    delay: 0
                                  }
                                }]
                              };
                            }
                            
                            setLoadedTemplate(template);
                            setShowWorkflowBuilder(true);
                            input.value = '';
                          }}
                          className="px-6"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Create Automation
                        </GradientButton>
                        
                        <Button variant="outline" onClick={() => setShowWorkflowBuilder(true)}>
                          <Workflow className="w-4 h-4 mr-2" />
                          Advanced Builder
                        </Button>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </div>

              {/* Existing Automations */}
              {automationRules.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">My Automations</h3>
                  <div className="grid gap-4">
                    {automationRules.map((automation) => (
                      <ModernCard key={automation.id}>
                        <ModernCardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{automation.name}</h3>
                                <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                                  {automation.status}
                                </Badge>
                              </div>
                              {automation.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {automation.description}
                                </p>
                              )}
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <RefreshCw className="w-4 h-4" />
                                  {automation.execution_count || 0} executions
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  {automation.success_count || 0} successful
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(automation.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active</span>
                                <Switch
                                  checked={automation.status === 'active'}
                                  onCheckedChange={() => handleToggleAutomation(automation.id, automation.status)}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('History button clicked for automation:', automation.id);
                                  // Navigate to logs tab
                                  setActiveView('logs');
                                  toast.info('Showing automation logs');
                                }}
                                title="View History"
                                className="hover:bg-muted"
                              >
                                <Clock className="w-4 h-4" />
                                <span className="ml-1 text-xs">History</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    console.log('Testing automation:', automation.id);
                                    toast.info('Testing automation...');
                                    
                                    // Call the manual trigger function
                                    const { data, error } = await supabase.rpc('trigger_automation_manually', {
                                      automation_id: automation.id,
                                      test_data: {
                                        source: 'manual_test',
                                        timestamp: new Date().toISOString()
                                      }
                                    });
                                    
                                    console.log('Test result:', data, error);
                                    
                                    if (error) {
                                      throw error;
                                    }
                                    
                                    if (data && typeof data === 'object' && 'success' in data && data.success) {
                                      toast.success('Automation triggered successfully!');
                                      // Refresh to show updated execution count
                                      setTimeout(() => {
                                        fetchAutomations();
                                      }, 2000);
                                    } else {
                                      const errorMsg = data && typeof data === 'object' && 'error' in data 
                                        ? String(data.error) 
                                        : 'Failed to trigger automation';
                                      toast.error(errorMsg);
                                    }
                                  } catch (error: any) {
                                    console.error('Error testing automation:', error);
                                    toast.error(`Test failed: ${error.message}`);
                                  }
                                }}
                                title="Test Automation"
                                disabled={automation.status !== 'active'}
                                className="hover:bg-muted disabled:opacity-50"
                              >
                                <Activity className="w-4 h-4" />
                                <span className="ml-1 text-xs">Test</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedWorkflowId(automation.id);
                                  setShowWorkflowBuilder(true);
                                }}
                                title="Edit Automation"
                                className="hover:bg-muted"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAutomation(automation.id)}
                                title="Delete Automation"
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </ModernCardContent>
                      </ModernCard>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State */
                <ModernCard className="p-12 text-center">
                  <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first automation to streamline your workflow
                  </p>
                  <GradientButton
                    onClick={() => setShowWorkflowBuilder(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom Automation
                  </GradientButton>
                </ModernCard>
              )}
            </>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <ModernCard>
            <ModernCardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Execution Logs</h3>
              <p className="text-muted-foreground">Coming soon - View automation execution history</p>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AutomationsPage;