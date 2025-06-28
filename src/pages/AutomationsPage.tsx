import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AIAutomationBuilder } from '@/components/automations/AIAutomationBuilder';
import { 
  Zap, Plus, Brain, Search, Filter, Database, Calendar,
  Workflow, Activity, TrendingUp, Layers, BarChart3,
  CheckCircle, DollarSign, Star, ArrowRight, ChevronRight,
  MessageSquare, Mail, Clock, RefreshCw, AlertTriangle,
  Shield, Wrench, Timer, Users, Play, Pause, Settings,
  X, Check, Info, Target, Sparkles, TrendingDown, Phone,
  Send, Bell, FileText, User, MapPin, Hash, Sun, Gift,
  Smartphone, Crown, Cloud, ArrowLeft, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import SimpleWorkflowBuilder from '@/components/automations/SimpleWorkflowBuilder';
import { AutomationExecutionLogs } from '@/components/automations/AutomationExecutionLogs';

interface AutomationConfig {
  templateId: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: any;
  };
  actions: {
    sms: boolean;
    email: boolean;
    notification: boolean;
  };
  messageTemplates: {
    sms?: string;
    email?: {
      subject: string;
      body: string;
    };
  };
  enabled: boolean;
}

const AutomationsPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('automations');
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  
  const { user } = useAuth();
  const { organization } = useOrganization();

  // Trigger types mapping
  const TRIGGER_TYPES: Record<string, string> = {
    job_completed: 'Job Completed',
    invoice_paid: 'Invoice Paid',
    invoice_threshold: 'Invoice Above Threshold',
    estimate_sent: 'Estimate Sent',
    customer_created: 'New Customer',
    rating_below_threshold: 'Low Rating Received',
    days_since_last_service: 'X Days Since Last Service',
    weather_forecast: 'Weather Forecast',
    job_scheduled: 'Job Scheduled',
    estimate_expired: 'Estimate Expired',
    payment_overdue: 'Payment Overdue',
    membership_expiring: 'Membership Expiring'
  };

  // Template definitions
  const templates = [
    {
      id: 'appointment_24h',
      name: '24-Hour Appointment Reminder',
      description: 'Send reminder 24 hours before scheduled appointment',
      category: 'scheduling',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      actions: ['Send SMS', 'Send Email'],
      triggers: ['job_scheduled'],
      isRecommended: true
    },
    {
      id: 'job_complete',
      name: 'Job Completion Follow-up',
      description: 'Thank customers and request feedback after job completion',
      category: 'feedback',
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      actions: ['Send SMS', 'Send Email'],
      triggers: ['job_completed']
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      description: 'Remind customers about outstanding invoices',
      category: 'financial',
      icon: DollarSign,
      gradient: 'from-yellow-500 to-yellow-600',
      actions: ['Send Email', 'Send SMS'],
      triggers: ['payment_overdue'],
      isRecommended: true
    },
    {
      id: 'review_request',
      name: 'Review Request',
      description: 'Ask satisfied customers to leave a review',
      category: 'feedback',
      icon: Star,
      gradient: 'from-purple-500 to-purple-600',
      actions: ['Send Email'],
      triggers: ['job_completed', 'rating_above_threshold']
    },
    {
      id: 'estimate_follow_up',
      name: 'Estimate Follow-up',
      description: 'Follow up on sent estimates to increase conversion',
      category: 'sales',
      icon: FileText,
      gradient: 'from-orange-500 to-orange-600',
      actions: ['Send Email', 'Send SMS'],
      triggers: ['estimate_sent']
    },
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      description: 'Remind customers about regular maintenance schedules',
      category: 'scheduling',
      icon: Wrench,
      gradient: 'from-gray-500 to-gray-600',
      actions: ['Send Email'],
      triggers: ['days_since_last_service'],
      isRecommended: true
    }
  ];

  const categories = ['all', 'scheduling', 'feedback', 'financial', 'sales'];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const openConfigDialog = (template: any) => {
    setSelectedTemplate(template);
    setAutomationConfig({
      templateId: template.id || template.templateId,
      name: template.name || template.title,
      description: template.description,
      trigger: {
        type: template.triggers?.[0] || 'job_completed',
        conditions: {}
      },
      actions: {
        sms: template.actions?.includes('Send SMS') || false,
        email: template.actions?.includes('Send Email') || false,
        notification: template.actions?.includes('Push Notification') || false
      },
      messageTemplates: {
        sms: getDefaultMessageTemplate(template.id || template.templateId, 'sms'),
        email: {
          subject: getDefaultMessageTemplate(template.id || template.templateId, 'emailSubject'),
          body: getDefaultMessageTemplate(template.id || template.templateId, 'emailBody')
        }
      },
      enabled: true
    });
    setShowConfigDialog(true);
  };

  const getDefaultMessageTemplate = (templateId: string, type: string) => {
    const templates: Record<string, any> = {
      appointment_24h: {
        sms: 'Hi {{customer_name}}, reminder: You have an appointment tomorrow at {{appointment_time}}. Reply C to confirm or R to reschedule.',
        emailSubject: 'Appointment Reminder - {{appointment_date}}',
        emailBody: 'Dear {{customer_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\n\nIf you need to reschedule, please call us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      },
      job_complete: {
        sms: 'Thank you for choosing {{company_name}}! How was your experience? Please rate us: {{review_link}}',
        emailSubject: 'Thank you for your business!',
        emailBody: 'Dear {{customer_name}},\n\nThank you for choosing {{company_name}} for your {{service_type}} needs.\n\nWe would love to hear about your experience. Please take a moment to leave us a review: {{review_link}}\n\nBest regards,\n{{company_name}}'
      },
      payment_reminder: {
        sms: 'Hi {{customer_name}}, this is a reminder that your invoice {{invoice_number}} is due. Amount: {{amount}}. Pay online: {{payment_link}}',
        emailSubject: 'Payment Reminder - Invoice {{invoice_number}}',
        emailBody: 'Dear {{customer_name}},\n\nThis is a friendly reminder that your invoice {{invoice_number}} for {{amount}} is now due.\n\nYou can pay online at: {{payment_link}}\n\nIf you have any questions, please contact us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      }
    };
    
    return templates[templateId]?.[type] || '';
  };

  const getWorkflowSteps = (templateId: string, actions: string[]) => {
    const steps: any[] = [];
    
    if (actions.includes('Send Email') || actions.includes('send_email')) {
      steps.push({
        id: `step-email-${Date.now()}`,
        type: 'send_email',
        name: 'Send Email',
        config: {
          recipient: 'client',
          subject: getDefaultMessageTemplate(templateId, 'emailSubject'),
          message: getDefaultMessageTemplate(templateId, 'emailBody')
        }
      });
    }
    
    if (actions.includes('Send SMS') || actions.includes('send_sms')) {
      if (['job_complete', 'payment_received'].includes(templateId)) {
        steps.push({
          id: `step-delay-${Date.now()}`,
          type: 'delay',
          name: 'Wait Period',
          config: { delayValue: 1, delayUnit: 'days' }
        });
      }
      
      steps.push({
        id: `step-sms-${Date.now()}`,
        type: 'send_sms',
        name: 'Send SMS',
        config: {
          message: getDefaultMessageTemplate(templateId, 'sms')
        }
      });
    }
    
    return steps.length > 0 ? steps : [{
      id: `step-default-${Date.now()}`,
      type: 'send_email',
      name: 'Send Notification',
      config: {
        subject: 'Service Update',
        message: 'Update about your service request.'
      }
    }];
  };

  const handleSaveAutomation = async () => {
    if (!automationConfig || !selectedTemplate) return;

    try {
      const template = selectedTemplate;
      const workflowSteps = getWorkflowSteps(
        template.id || template.templateId,
        template.actions || []
      );

      const workflowData = {
        name: automationConfig.name,
        description: automationConfig.description,
        trigger_type: automationConfig.trigger.type,
        trigger_config: {},
        workflow_config: {
          triggers: [{
            type: automationConfig.trigger.type,
            name: TRIGGER_TYPES[automationConfig.trigger.type] || automationConfig.trigger.type
          }],
          steps: workflowSteps
        },
        status: automationConfig.enabled ? 'active' : 'inactive',
        organization_id: organization?.id,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('automation_workflows')
        .insert(workflowData);

      if (error) throw error;

      toast.success('Automation created successfully');
      setShowConfigDialog(false);
      fetchAutomations();
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to create automation');
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

  const handleTemplateUse = (template: any) => {
    const workflowTemplate = {
      name: template.name,
      triggers: template.triggers?.map((t: string) => ({
        type: t,
        name: TRIGGER_TYPES[t] || t
      })) || [],
      steps: getWorkflowSteps(template.id, template.actions || [])
    };
    
    setLoadedTemplate(workflowTemplate);
    setShowWorkflowBuilder(true);
  };

  const handleToggleAutomation = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

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
        <SimpleWorkflowBuilder
          workflowId={selectedWorkflowId || 'new'}
          onSave={() => {
            setShowWorkflowBuilder(false);
            setSelectedWorkflowId(null);
            setLoadedTemplate(null);
            fetchAutomations();
          }}
          loadedTemplate={loadedTemplate}
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

      {/* Tabs - Now only 2 */}
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
        {/* Automations Tab - Combines existing automations and templates */}
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
              {/* AI Automation Builder */}
              <div className="mb-6">
                <AIAutomationBuilder onAutomationGenerated={handleAIGeneratedAutomation} />
              </div>

              {/* Existing Automations */}
              {automationRules.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">My Automations</h3>
                  <div className="grid gap-4">
                    {automationRules.map((automation) => (
                      <ModernCard key={automation.id} variant="interactive">
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
                              <Switch
                                checked={automation.status === 'active'}
                                onCheckedChange={() => handleToggleAutomation(automation.id, automation.status)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedWorkflowId(automation.id);
                                  setShowWorkflowBuilder(true);
                                }}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAutomation(automation.id)}
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
              )}

              {/* Templates Section - Collapsible or always visible if no automations */}
              <Collapsible 
                open={showTemplates || automationRules.length === 0} 
                onOpenChange={setShowTemplates}
              >
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-4 h-auto"
                      disabled={automationRules.length === 0}
                    >
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Automation Templates
                      </h3>
                      {automationRules.length > 0 && (
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          showTemplates && "rotate-180"
                        )} />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="whitespace-nowrap"
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {filteredTemplates.map((template, index) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="h-full"
                        >
                          <ModernCard variant="hoverable" className="h-full">
                            <ModernCardContent className="p-6">
                              <div className={cn(
                                "inline-flex p-3 rounded-xl mb-4",
                                "bg-gradient-to-br",
                                template.gradient
                              )}>
                                <template.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold mb-2">{template.name}</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                {template.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {template.actions.map((action: string) => (
                                  <Badge key={action} variant="secondary" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleTemplateUse(template)}
                                >
                                  Use Template
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => openConfigDialog(template)}
                                >
                                  Quick Setup
                                </Button>
                              </div>
                            </ModernCardContent>
                          </ModernCard>
                        </motion.div>
                      ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No templates found matching your search
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Empty State */}
              {automationRules.length === 0 && (
                <ModernCard className="p-12 text-center">
                  <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a template above or create a custom automation to get started
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
          <AutomationExecutionLogs />
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Automation</DialogTitle>
            <DialogDescription>
              Set up your automation with custom messages and triggers
            </DialogDescription>
          </DialogHeader>

          {automationConfig && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Automation Name</Label>
                <Input
                  value={automationConfig.name}
                  onChange={(e) => setAutomationConfig({
                    ...automationConfig,
                    name: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={automationConfig.description}
                  onChange={(e) => setAutomationConfig({
                    ...automationConfig,
                    description: e.target.value
                  })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={automationConfig.actions.sms}
                      onCheckedChange={(checked) => setAutomationConfig({
                        ...automationConfig,
                        actions: { ...automationConfig.actions, sms: !!checked }
                      })}
                    />
                    <Label htmlFor="sms" className="cursor-pointer">Send SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={automationConfig.actions.email}
                      onCheckedChange={(checked) => setAutomationConfig({
                        ...automationConfig,
                        actions: { ...automationConfig.actions, email: !!checked }
                      })}
                    />
                    <Label htmlFor="email" className="cursor-pointer">Send Email</Label>
                  </div>
                </div>
              </div>

              {automationConfig.actions.sms && (
                <div className="space-y-2">
                  <Label>SMS Message</Label>
                  <Textarea
                    value={automationConfig.messageTemplates.sms}
                    onChange={(e) => setAutomationConfig({
                      ...automationConfig,
                      messageTemplates: {
                        ...automationConfig.messageTemplates,
                        sms: e.target.value
                      }
                    })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {'{{customer_name}}'}, {'{{appointment_time}}'}, {'{{service_type}}'}
                  </p>
                </div>
              )}

              {automationConfig.actions.email && (
                <>
                  <div className="space-y-2">
                    <Label>Email Subject</Label>
                    <Input
                      value={automationConfig.messageTemplates.email?.subject}
                      onChange={(e) => setAutomationConfig({
                        ...automationConfig,
                        messageTemplates: {
                          ...automationConfig.messageTemplates,
                          email: {
                            ...automationConfig.messageTemplates.email!,
                            subject: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={automationConfig.messageTemplates.email?.body}
                      onChange={(e) => setAutomationConfig({
                        ...automationConfig,
                        messageTemplates: {
                          ...automationConfig.messageTemplates,
                          email: {
                            ...automationConfig.messageTemplates.email!,
                            body: e.target.value
                          }
                        }
                      })}
                      rows={5}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enable automation immediately</Label>
                <Switch
                  id="enabled"
                  checked={automationConfig.enabled}
                  onCheckedChange={(checked) => setAutomationConfig({
                    ...automationConfig,
                    enabled: checked
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <GradientButton onClick={handleSaveAutomation}>
              Create Automation
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default AutomationsPage;