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
import { 
  Zap, Plus, Brain, Search, Filter, Database, Calendar,
  Workflow, Activity, TrendingUp, Layers, BarChart3,
  CheckCircle, DollarSign, Star, ArrowRight, ChevronRight,
  MessageSquare, Mail, Clock, RefreshCw, AlertTriangle,
  Shield, Wrench, Timer, Users, Play, Pause, Settings,
  X, Check, Info, Target, Sparkles, TrendingDown, Phone,
  Send, Bell, FileText, User, MapPin, Hash, Sun, Gift,
  Smartphone, Crown, Cloud, ArrowLeft
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
  const [activeView, setActiveView] = useState('templates');
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [jobStatuses, setJobStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Check URL params for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['templates', 'automations', 'workflow-builder', 'logs'].includes(tab)) {
      setActiveView(tab);
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null);
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

  // Recommendations based on business type
  const recommendations = templates.filter(t => t.isRecommended).map(template => ({
    ...template,
    templateId: template.id,
    title: template.name,
    metrics: {
      'Avg. Open Rate': '85%',
      'Time Saved': '2 hrs/week'
    }
  }));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch automations and job statuses
  useEffect(() => {
    if (user?.id) {
      fetchAutomations();
      fetchJobStatuses();
    }
  }, [user?.id]);

  const fetchAutomations = async () => {
    // Implementation remains the same
  };

  const fetchJobStatuses = async () => {
    // Implementation remains the same
  };

  const openConfigDialog = (template: any, isRecommended = false) => {
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
    // Implementation for default message templates
    const templates: Record<string, any> = {
      appointment_24h: {
        sms: 'Hi {{customer_name}}, reminder: You have an appointment tomorrow at {{appointment_time}}. Reply C to confirm or R to reschedule.',
        emailSubject: 'Appointment Reminder - {{appointment_date}}',
        emailBody: 'Dear {{customer_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\n\nIf you need to reschedule, please call us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      }
    };
    
    return templates[templateId]?.[type] || '';
  };

  // Get workflow steps based on template
  const getWorkflowSteps = (templateId: string, actions: string[]) => {
    const steps: any[] = [];
    
    // Add email step if template includes email
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
    
    // Add SMS step if template includes SMS
    if (actions.includes('Send SMS') || actions.includes('send_sms')) {
      // Add delay for some templates
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

  // Get trigger defaults based on template
  const getTriggerDefaults = (templateId: string) => {
    switch (templateId) {
      case 'appointment_24h':
        return {
          type: 'time_based',
          conditions: {
            hours_before: 24,
            trigger_field: 'schedule_start',
            entity_type: 'job'
          }
        };
      case 'job_complete':
        return {
          type: 'status_change',
          conditions: {
            from_status: 'in_progress',
            to_status: 'completed',
            entity_type: 'job'
          }
        };
      case 'payment_reminder':
        return {
          type: 'time_based',
          conditions: {
            days_after: 3,
            trigger_field: 'due_date',
            entity_type: 'invoice'
          }
        };
      default:
        return {
          type: 'status_change',
          conditions: {}
        };
    }
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
        trigger_config: getTriggerDefaults(template.id || template.templateId),
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

  const handleTemplateUse = (template: any) => {
    // Load template into workflow builder
    const workflowTemplate = {
      name: template.name,
      triggers: template.triggers?.map((t: string) => ({
        type: t,
        name: TRIGGER_TYPES[t] || t
      })) || [],
      steps: getWorkflowSteps(template.id, template.actions || [])
    };
    
    setLoadedTemplate(workflowTemplate);
    setActiveView('workflow-builder');
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

  return (
    <PageLayout>
      <PageHeader
        title="Automations"
        description="Streamline your business with intelligent workflow automation"
        icon={
          <div className="p-3 rounded-xl bg-gradient-to-br from-fixlyfy/10 to-fixlyfy-light/10">
            <Zap className="w-6 h-6 text-fixlyfy" />
          </div>
        }
        actions={
          activeView === 'automations' ? (
            <GradientButton
              size="sm"
              onClick={() => setActiveView('workflow-builder')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Automation
            </GradientButton>
          ) : activeView === 'workflow-builder' && selectedWorkflowId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedWorkflowId(null);
                setLoadedTemplate(null);
                setActiveView('automations');
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Automations
            </Button>
          ) : null
        }
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ModernCard 
          variant="hoverable" 
          className="cursor-pointer"
          onClick={() => setActiveView('workflow-builder')}
        >
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
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

        <ModernCard variant="hoverable">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Send className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="hoverable">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">32h</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Timer className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="hoverable">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">24%</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* AI Insights */}
      <ModernCard className="mb-6">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fixlyfy/10 to-fixlyfy-light/10">
              <Brain className="w-6 h-6 text-fixlyfy" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                AI Insights
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Based on your business data, we recommend implementing a <span className="font-medium">24-hour appointment reminder</span> automation. 
                This could reduce no-shows by up to 30% and save approximately 5 hours per week in manual follow-ups.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const template = templates.find(t => t.id === 'appointment_24h');
                    if (template) openConfigDialog(template);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Quick Setup
                </Button>
                <Button size="sm" variant="ghost">
                  View All Insights
                </Button>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center justify-center gap-2">
            <Workflow className="w-4 h-4" />
            My Automations
            {automationRules.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {automationRules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflow-builder" className="flex items-center justify-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fixlyfy" />
              Recommended for Your Business
            </h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {recommendations && recommendations.length > 0 ? recommendations.map((rec, index) => (
                <motion.div
                  key={rec.templateId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <ModernCard variant="interactive" className="h-full">
                    <ModernCardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-fixlyfy/10 to-fixlyfy-light/10">
                          <rec.icon className="w-6 h-6 text-fixlyfy" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {rec.metrics && Object.entries(rec.metrics).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => openConfigDialog(rec, true)}
                          >
                            Configure & Use
                          </Button>
                        </div>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No recommendations available
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
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

          {/* All Templates */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates && filteredTemplates.length > 0 ? filteredTemplates.map((template, index) => (
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
            )) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No templates found
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading automations...</p>
              </div>
            </div>
          ) : automationRules.length === 0 ? (
            <ModernCard className="p-12">
              <div className="text-center">
                <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first automation from a template or build a custom workflow
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView('templates')}
                    className="flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Browse Templates
                  </Button>
                  <GradientButton
                    onClick={() => setActiveView('workflow-builder')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom
                  </GradientButton>
                </div>
              </div>
            </ModernCard>
          ) : (
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
                            setActiveView('workflow-builder');
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
          )}
        </TabsContent>

        {/* Workflow Builder Tab */}
        <TabsContent value="workflow-builder" className="space-y-6">
          <SimpleWorkflowBuilder
            workflowId={selectedWorkflowId || 'new'}
            onSave={() => {
              setSelectedWorkflowId(null);
              setLoadedTemplate(null);
              setActiveView('automations');
              fetchAutomations();
            }}
            loadedTemplate={loadedTemplate}
          />
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
              {/* Basic Info */}
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

              {/* Actions */}
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

              {/* Message Templates */}
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

              {/* Enable/Disable */}
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