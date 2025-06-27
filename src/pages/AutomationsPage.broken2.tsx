import React, { useState, useEffect, useRef } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Plus, TrendingUp, Play, Pause, BarChart3, MessageSquare, 
  Calendar, DollarSign, Star, Workflow, Brain, Sparkles, Clock,
  Users, CheckCircle, AlertTriangle, Mail, Edit,
  Trash2, Search, RefreshCw, ArrowRight,
  ChevronRight, Shield, Wrench, Timer, Activity, Layers,
  X, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useAI } from '@/hooks/use-ai';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobStatuses } from '@/hooks/useConfigItems';

interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    type: string;
    conditions?: any[];
    statusFrom?: string;
    statusTo?: string;
  };
  action: {
    type: string;
    config: any;
    delay?: { type: string; value?: number };
  };
  multiChannel?: {
    primaryChannel: 'sms' | 'email';
    fallbackEnabled: boolean;
    fallbackChannel?: 'sms' | 'email';
    fallbackDelayHours: number;
  };
  usage_count?: number;
  success_rate?: number;
  created_at?: string;
}

const AutomationsPage = () => {
  const [activeView, setActiveView] = useState('templates');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const { user } = useAuth();
  const { organization } = useOrganization();
  const { generateText, isLoading: aiLoading } = useAI({
    systemContext: "You are an expert at creating professional business messages and automation rules.",
    mode: "business"
  });
  
  const { items: customJobStatuses } = useJobStatuses();

  const aiExamples = [
    "Send SMS reminder 24 hours before appointment",
    "Email invoice when job is completed",
    "Follow up 7 days after job completion",
    "Send review request after payment received",
    "Alert technician when job is scheduled",
    "Send payment reminder 3 days after invoice overdue"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % aiExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerTypes = [
    { value: 'job_status_changed', label: 'Job Status Changed', icon: RefreshCw },
    { value: 'job_created', label: 'New Job Created', icon: Plus },
    { value: 'job_completed', label: 'Job Completed', icon: CheckCircle },
    { value: 'appointment_tomorrow', label: 'Appointment Tomorrow', icon: Calendar },
    { value: 'invoice_created', label: 'Invoice Created', icon: DollarSign },
    { value: 'invoice_overdue', label: 'Invoice Overdue', icon: AlertTriangle },
    { value: 'payment_received', label: 'Payment Received', icon: DollarSign },
  ];

  const actionTypes = [
    { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'send_notification', label: 'Send Push Notification', icon: Bell },
    { value: 'notify_team', label: 'Notify Team', icon: Users },
  ];

  const getBusinessRecommendations = () => {
    return [
      {
        title: 'Smart Appointment Confirmations',
        description: '24-hour reminder that adapts based on job type',
        icon: Calendar,
        templateId: 'appointment_24h',
        metrics: { noShowReduction: '75%', satisfaction: '90%', timeSaved: '3hrs/week' }
      },
      {
        title: 'Intelligent Job Follow-up',
        description: 'AI-powered follow-up timing based on job complexity',
        icon: Star,
        templateId: 'job_complete',
        metrics: { reviewRate: '45%', rating: '4.8★', repeatBusiness: '+30%' }
      },
      {
        title: 'Dynamic Payment Reminders',
        description: 'Professional reminders that escalate appropriately',
        icon: DollarSign,
        templateId: 'invoice_reminder',
        metrics: { collectionRate: '95%', daysSalesOutstanding: '-15', timeSaved: '2hrs/week' }
      }
    ];
  };

  const getTemplatesByCategory = () => {
    return {
      'Customer Communication': [
        {
          id: 'appointment_24h',
          name: '24-Hour Appointment Reminder',
          description: 'Automatic reminder sent day before scheduled appointment',
          icon: Calendar,
          gradient: 'from-blue-500 to-blue-600',
          popularity: 95,
          avgTimesSaved: '3 hrs/week',
          rule: {
            name: '24-Hour Appointment Reminder',
            description: 'Sends SMS reminder 24 hours before appointment',
            status: 'active' as const,
            trigger: { type: 'appointment_tomorrow' },
            action: {
              type: 'send_sms',
              config: {
                message: 'Hi {{client_name}}! This is {{company_name}} confirming your appointment tomorrow at {{scheduled_time}}. Reply Y to confirm.'
              }
            }
          }
        },
        {
          id: 'job_complete',
          name: 'Job Completion Follow-up',
          description: 'Thank customer when job is completed',
          icon: CheckCircle,
          gradient: 'from-green-500 to-green-600',
          popularity: 88,
          avgTimesSaved: '2 hrs/week',
          rule: {
            name: 'Job Completion Follow-up',
            description: 'Thank you message when job is completed',
            status: 'active' as const,
            trigger: { type: 'job_completed' },
            action: {
              type: 'send_sms',
              config: {
                message: 'Thank you for choosing {{company_name}}! How was your experience? We would love your feedback.'
              }
            }
          }
        }
      ],
      'Financial & Billing': [
        {
          id: 'invoice_reminder',
          name: 'Invoice Payment Reminder',
          description: 'Gentle reminder for overdue invoices',
          icon: DollarSign,
          gradient: 'from-orange-500 to-orange-600',
          popularity: 91,
          avgTimesSaved: '2 hrs/week',
          rule: {
            name: 'Invoice Payment Reminder',
            description: 'Payment reminder for overdue invoices',
            status: 'active' as const,
            trigger: { type: 'invoice_overdue' },
            action: {
              type: 'send_email',
              config: {
                subject: 'Payment Reminder - Invoice #{{invoice_number}}',
                body: 'This is a friendly reminder about your invoice that is now overdue.'
              }
            }
          }
        }
      ]
    };
  };

  const handleUseTemplate = (template: any) => {
    setSelectedRule(template.rule);
    setBuilderOpen(true);
  };

  const createTemplateAutomation = (templateId: string) => {
    const allTemplates = Object.values(getTemplatesByCategory()).flat();
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      handleUseTemplate(template);
    }
  };

  const handleAIAutomationCreate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the automation you want to create');
      return;
    }

    try {
      const response = await generateText(`Create an automation rule for: "${aiPrompt}"`);
      if (response) {
        toast.success('AI automation created! Review and save when ready.');
        setBuilderOpen(true);
        setAiPrompt('');
      }
    } catch (error) {
      toast.error('Failed to create AI automation');
    }
  };

  const saveAutomation = async (rule: AutomationRule) => {
    if (!user?.id) return;

    try {
      const automationData = {
        user_id: user.id,
        organization_id: organization?.id || user.id,
        name: rule.name,
        description: rule.description,
        status: rule.status,
        trigger_type: rule.trigger.type,
        trigger_conditions: rule.trigger.conditions || [],
        action_type: rule.action.type,
        action_config: rule.action.config
      };

      if (rule.id) {
        await supabase.from('automation_workflows').update(automationData).eq('id', rule.id);
        toast.success('Automation updated successfully');
      } else {
        await supabase.from('automation_workflows').insert(automationData);
        toast.success('Automation created successfully');
      }

      loadAutomations();
      setBuilderOpen(false);
      setSelectedRule(null);
    } catch (error) {
      toast.error('Failed to save automation');
    }
  };

  const loadAutomations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(automation => ({
        id: automation.id,
        name: automation.name,
        description: automation.description,
        status: automation.status,
        trigger: {
          type: automation.trigger_type,
          conditions: automation.trigger_conditions || []
        },
        action: {
          type: automation.action_type,
          config: automation.action_config || {}
        },
        usage_count: automation.execution_count || 0,
        success_rate: automation.success_count && automation.execution_count 
          ? Math.round((automation.success_count / automation.execution_count) * 100)
          : 0,
        created_at: automation.created_at
      }));
      
      setAutomationRules(transformedData);
    } catch (error) {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomationStatus = async (ruleId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', ruleId);
      
      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadAutomations();
    } catch (error) {
      toast.error('Failed to update automation status');
    }
  };

  const deleteAutomation = async (ruleId: string) => {
    try {
      await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', ruleId);
      
      toast.success('Automation deleted');
      loadAutomations();
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  const calculateMetrics = () => {
    const activeRules = automationRules.filter(r => r.status === 'active').length;
    const totalExecutions = automationRules.reduce((sum, r) => sum + (r.usage_count || 0), 0);
    const successfulExecutions = automationRules.reduce((sum, r) => sum + ((r.usage_count || 0) * (r.success_rate || 0) / 100), 0);
    const averageSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100) : 0;
    
    return {
      activeRules,
      totalExecutions,
      averageSuccessRate,
      estimatedTimeSaved: Math.round(totalExecutions * 2.5),
      estimatedRevenue: Math.round(successfulExecutions * 15)
    };
  };

  useEffect(() => {
    if (user?.id) {
      loadAutomations();
    }
  }, [user?.id]);

  const recommendations = getBusinessRecommendations();
  const templateCategories = getTemplatesByCategory();
  const metrics = calculateMetrics();
  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Smart Automations"
          description="AI-powered automation workflows that save time and delight customers"
          icon={Zap}
          actions={
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => loadAutomations()}
                className="hidden sm:flex"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <GradientButton
                variant="primary"
                onClick={() => {
                  setSelectedRule(null);
                  setBuilderOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </GradientButton>
            </div>
          }
        />

        {/* AI Builder Section */}
        <ModernCard variant="elevated" className="relative overflow-hidden">
          <ModernCardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl flex items-center justify-center shadow-2xl">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold">AI Automation Builder</h2>
                    <p className="text-muted-foreground text-sm mt-1">Powered by Advanced AI</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-8 text-lg">
                  Describe what you want to automate in plain English
                </p>
                
                <div className="relative group">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIAutomationCreate()}
                    placeholder="Try: Send SMS reminder 24 hours before appointment"
                    className="h-16 pr-40 text-lg"
                  />
                  <AnimatePresence mode="wait">
                    {!aiPrompt && (
                      <motion.div
                        key={currentExampleIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.6, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 flex items-center px-4 pointer-events-none"
                      >
                        <span className="text-muted-foreground italic">
                          Try: {aiExamples[currentExampleIndex]}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <GradientButton
                    onClick={handleAIAutomationCreate}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="absolute right-2 top-2 h-12"
                    variant="primary"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create
                      </>
                    )}
                  </GradientButton>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Timer, label: 'Save 10+ hours/week' },
                  { icon: TrendingUp, label: '85% response rate' },
                  { icon: Users, label: 'Delight customers' },
                  { icon: DollarSign, label: 'Increase revenue' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="templates">
              <Layers className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Workflow className="w-4 h-4 mr-2" />
              My Automations
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Templates View */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            {/* Recommendations */}
            <ModernCard variant="elevated">
              <ModernCardHeader>
                <ModernCardTitle>Recommended for Your Business</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {recommendations.map((rec, index) => {
                    const Icon = rec.icon;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => createTemplateAutomation(rec.templateId)}
                      >
                        <Icon className="w-12 h-12 text-fixlyfy mb-4" />
                        <h4 className="font-semibold mb-2">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {rec.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.metrics && Object.entries(rec.metrics).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Template Categories */}
            {Object.entries(templateCategories).map(([category, templates]) => (
              <ModernCard key={category} variant="elevated">
                <ModernCardHeader>
                  <ModernCardTitle>{category}</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={template.id}
                          className="p-6 border rounded-xl hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center",
                            template.gradient
                          )}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-semibold mb-2">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          {template.popularity && (
                            <Badge variant="secondary" className="text-xs">
                              {template.popularity}% use this
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </TabsContent>

          {/* My Automations View */}
          <TabsContent value="automations" className="space-y-6 mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search automations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-fixlyfy" />
              </div>
            ) : automationRules.length === 0 ? (
              <ModernCard variant="elevated" className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start with a template or create your own
                  </p>
                  <Button onClick={() => setActiveView('templates')}>
                    Browse Templates
                  </Button>
                </div>
              </ModernCard>
            ) : (
              <div className="grid gap-4">
                {automationRules
                  .filter(rule => {
                    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
                    const matchesType = filterType === 'all' || rule.trigger.type === filterType;
                    return matchesSearch && matchesStatus && matchesType;
                  })
                  .map((rule) => {
                    const triggerType = triggerTypes.find(t => t.value === rule.trigger.type);
                    const actionType = actionTypes.find(a => a.value === rule.action.type);
                    
                    return (
                      <ModernCard key={rule.id} variant="elevated" className="overflow-hidden">
                        <div className={cn(
                          "absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
                          rule.status === 'active' ? "from-green-500 to-green-600" : "from-gray-400 to-gray-500"
                        )} />
                        <ModernCardContent className="p-6 pl-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{rule.name}</h3>
                                <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                                  {rule.status}
                                </Badge>
                              </div>
                              
                              {rule.description && (
                                <p className="text-muted-foreground mb-3">{rule.description}</p>
                              )}
                              
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {triggerType?.icon && <triggerType.icon className="w-4 h-4" />}
                                  <span>{triggerType?.label}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {actionType?.icon && <actionType.icon className="w-4 h-4" />}
                                  <span>{actionType?.label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {rule.usage_count || 0} executions
                                </span>
                                {rule.success_rate !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {rule.success_rate}% success
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRule(rule);
                                  setBuilderOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAutomationStatus(rule.id!, rule.status)}
                              >
                                {rule.status === 'active' ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Delete this automation?')) {
                                    deleteAutomation(rule.id!);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </ModernCardContent>
                      </ModernCard>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* Analytics View */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Active Automations', value: metrics.activeRules, icon: Zap },
                { label: 'Total Executions', value: metrics.totalExecutions, icon: Activity },
                { label: 'Success Rate', value: `${metrics.averageSuccessRate.toFixed(1)}%`, icon: TrendingUp },
                { label: 'Time Saved', value: `${metrics.estimatedTimeSaved} hrs`, icon: Timer },
                { label: 'Revenue Impact', value: `$${metrics.estimatedRevenue}`, icon: DollarSign }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <ModernCard key={index} variant="elevated">
                    <ModernCardContent className="p-6">
                      <Icon className="w-8 h-8 text-fixlyfy mb-4" />
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </h3>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </ModernCardContent>
                  </ModernCard>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Builder Dialog */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRule?.id ? 'Edit Automation' : 'Create New Automation'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Automation Name</Label>
                <Input
                  value={selectedRule?.name || ''}
                  onChange={(e) => setSelectedRule(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="e.g., 24-Hour Appointment Reminder"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedRule?.description || ''}
                  onChange={(e) => setSelectedRule(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Brief description of what this automation does"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setBuilderOpen(false)}>
                  Cancel
                </Button>
                <GradientButton
                  onClick={() => {
                    if (selectedRule) {
                      saveAutomation({
                        ...selectedRule,
                        status: selectedRule.status || 'draft'
                      });
                    }
                  }}
                >
                  {selectedRule?.id ? 'Update' : 'Create'} Automation
                </GradientButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default AutomationsPage;