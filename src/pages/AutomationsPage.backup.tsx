import React, { useState, useEffect, useRef, Suspense } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, Plus, TrendingUp, Settings, Play, Pause, BarChart3, MessageSquare, 
  Calendar, DollarSign, Star, Workflow, Brain, Sparkles, Send, Clock,
  Users, CheckCircle, AlertTriangle, Eye, Mail, Phone, Copy, Edit,
  Trash2, Search, Filter, RefreshCw, ArrowRight, Target, Lightbulb,
  Variable, Wand2, ChevronRight, Shield, Megaphone, FileText, Bot,
  Package, Wrench, Timer, Building, Rocket, Activity, Layers, Cpu,
  Network, ChevronDown, Tag, X, Info, Database, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useAI } from '@/hooks/use-ai';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobStatuses } from '@/hooks/useConfigItems';
import { useQuery } from '@tanstack/react-query';

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
  conditions?: {
    operator: 'AND' | 'OR';
    rules: any[];
  };
  action: {
    type: string;
    config: any;
    delay?: { type: string; value?: number };
  };
  deliveryWindow?: {
    businessHoursOnly: boolean;
    allowedDays: string[];
    timeRange?: { start: string; end: string };
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
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [statusFrom, setStatusFrom] = useState<string>('');
  const [statusTo, setStatusTo] = useState<string>('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const { user } = useAuth();
  const { organization } = useOrganization();
  const { generateText, isLoading: aiLoading } = useAI({
    systemContext: "You are an expert at creating professional business messages and automation rules. Help write clear, engaging messages for field service businesses.",
    mode: "business"
  });
  
  // Fetch actual job statuses from settings
  const { items: customJobStatuses, isLoading: statusesLoading } = useJobStatuses();

  // AI examples with rotating effect
  const aiExamples = [
    "Send SMS reminder 24 hours before appointment when job status is scheduled",
    "Email invoice automatically when job status changes from in_progress to completed",
    "Follow up 7 days after job completion for customer feedback",
    "Send review request after payment received and job is completed",
    "Alert technician when job status changes from pending to scheduled",
    "Remind customer about seasonal maintenance every 6 months",
    "Send payment reminder 3 days after invoice overdue",
    "Welcome new customers with onboarding sequence",
    "Notify office manager when job status changes to emergency",
    "Send job summary when technician marks job as completed"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % aiExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get appropriate icon for status
  const getIconForStatus = (statusName: string) => {
    const name = statusName.toLowerCase();
    if (name.includes('pend')) return Clock;
    if (name.includes('schedul')) return Calendar;
    if (name.includes('progress') || name.includes('working')) return Activity;
    if (name.includes('complet') || name.includes('done')) return CheckCircle;
    if (name.includes('cancel')) return X;
    if (name.includes('hold') || name.includes('pause')) return Pause;
    if (name.includes('emergency') || name.includes('urgent')) return AlertTriangle;
    if (name.includes('confirm')) return CheckCircle;
    return Zap;
  };

  // Transform custom job statuses into the format needed by the UI
  const jobStatuses = React.useMemo(() => {
    if (!customJobStatuses || customJobStatuses.length === 0) {
      return [
        { value: 'pending', label: 'Pending', color: 'orange', icon: Clock, description: 'Awaiting confirmation' },
        { value: 'scheduled', label: 'Scheduled', color: 'blue', icon: Calendar, description: 'Appointment confirmed' },
        { value: 'in_progress', label: 'In Progress', color: 'yellow', icon: Activity, description: 'Work in progress' },
        { value: 'completed', label: 'Completed', color: 'green', icon: CheckCircle, description: 'Job finished' },
        { value: 'cancelled', label: 'Cancelled', color: 'red', icon: X, description: 'Job cancelled' }
      ];
    }
    
    return customJobStatuses.map(status => ({
      value: status.name.toLowerCase().replace(/\s+/g, '_'),
      label: status.name,
      color: status.color || 'gray',
      icon: getIconForStatus(status.name),
      description: status.description || ''
    }));
  }, [customJobStatuses]);
  // Enhanced triggers with better categorization
  const triggerTypes = [
    { value: 'job_status_changed', label: 'Job Status Changed', icon: RefreshCw, category: 'Status', needsCondition: true, conditionType: 'status_change' },
    { value: 'job_status_to', label: 'Job Status Changes To', icon: ArrowRight, category: 'Status', needsCondition: true, conditionType: 'status_to' },
    { value: 'job_status_from', label: 'Job Status Changes From', icon: ArrowRight, category: 'Status', needsCondition: true, conditionType: 'status_from' },
    { value: 'job_created', label: 'New Job Created', icon: Plus, category: 'Job Lifecycle' },
    { value: 'job_assigned', label: 'Job Assigned to Tech', icon: Users, category: 'Job Lifecycle' },
    { value: 'job_completed', label: 'Job Completed', icon: CheckCircle, category: 'Job Lifecycle' },
    { value: 'appointment_tomorrow', label: 'Appointment Tomorrow', icon: Calendar, category: 'Time Based' },
    { value: 'appointment_today', label: 'Appointment Today', icon: Calendar, category: 'Time Based' },
    { value: 'new_client', label: 'New Client Added', icon: Users, category: 'Client' },
    { value: 'invoice_created', label: 'Invoice Created', icon: DollarSign, category: 'Financial' },
    { value: 'invoice_overdue', label: 'Invoice Overdue', icon: AlertTriangle, category: 'Financial' },
    { value: 'payment_received', label: 'Payment Received', icon: DollarSign, category: 'Financial' },
  ];

  // Enhanced actions
  const actionTypes = [
    { value: 'send_sms', label: 'Send SMS', icon: MessageSquare, category: 'Communication' },
    { value: 'send_email', label: 'Send Email', icon: Mail, category: 'Communication' },
    { value: 'send_notification', label: 'Send Push Notification', icon: Bell, category: 'Communication' },
    { value: 'update_job_status', label: 'Update Job Status', icon: RefreshCw, category: 'Job' },
    { value: 'assign_technician', label: 'Assign Technician', icon: Users, category: 'Job' },
    { value: 'create_task', label: 'Create Task', icon: CheckCircle, category: 'Task' },
    { value: 'notify_team', label: 'Notify Team', icon: Users, category: 'Team' },
  ];

  // Get business-specific recommendations
  const getBusinessRecommendations = () => {
    const businessType = organization?.business_type || 'field_service';
    
    const recommendations: Record<string, any[]> = {
      hvac: [
        {
          title: 'Seasonal Maintenance Reminders',
          description: 'Send automated reminders for AC tune-ups in spring and heating checks in fall',
          icon: Calendar,
          templateId: 'seasonal_hvac',
          metrics: { avgOpenRate: '85%', conversionRate: '42%', timeSaved: '2hrs/week' }
        },
        {
          title: 'Filter Change Reminders',
          description: 'Monthly reminders to change air filters for better system performance',
          icon: RefreshCw,
          templateId: 'filter_reminder',
          metrics: { avgOpenRate: '78%', conversionRate: '35%', timeSaved: '1hr/week' }
        },
        {
          title: 'Emergency Job Alert',
          description: 'Instantly notify on-call team when job status changes to emergency',
          icon: AlertTriangle,
          templateId: 'emergency_alert',
          metrics: { responseTime: '< 5min', satisfaction: '95%', timeSaved: '30min/job' }
        }
      ],
      field_service: [
        {
          title: 'Smart Appointment Confirmations',
          description: '24-hour reminder that adapts based on job type and customer history',
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
      ]
    };

    return recommendations[businessType] || recommendations.field_service;
  };
  // Get templates by category
  const getTemplatesByCategory = () => {
    const baseTemplates = {
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
            trigger: { 
              type: 'appointment_tomorrow', 
              conditions: [
                { field: 'job_status', operator: 'equals', value: 'scheduled' }
              ]
            },
            action: {
              type: 'send_sms',
              config: {
                message: `Hi {{client_first_name}}! This is {{company_name}} confirming your appointment tomorrow at {{scheduled_time}} for {{job_title}}. 

{{technician_name}} will be your technician. We'll call 30 min before arrival.

Reply Y to confirm or call {{company_phone}} to reschedule.`
              },
              delay: { type: 'immediate' }
            },
            multiChannel: { 
              primaryChannel: 'sms' as const, 
              fallbackEnabled: true, 
              fallbackChannel: 'email' as const,
              fallbackDelayHours: 2 
            }
          }
        },
        {
          id: 'job_complete',
          name: 'Job Completion Follow-up',
          description: 'Thank customer when job status changes to completed',
          icon: CheckCircle,
          gradient: 'from-green-500 to-green-600',
          popularity: 88,
          avgTimesSaved: '2 hrs/week',
          rule: {
            name: 'Job Completion Follow-up',
            description: 'Thank you message when job is completed',
            status: 'active' as const,
            trigger: { 
              type: 'job_status_to', 
              statusTo: 'completed',
              conditions: []
            },
            action: {
              type: 'send_sms',
              config: {
                message: `Hi {{client_first_name}}, thank you for choosing {{company_name}}! 

Your {{job_title}} has been completed by {{technician_name}}.

How was your experience? We'd love your feedback: {{review_link}}

Need anything else? Call us at {{company_phone}}`
              },
              delay: { type: 'hours', value: 2 }
            }
          }
        },
        {
          id: 'emergency_alert',
          name: 'Emergency Job Alert',
          description: 'Alert team when job status changes to emergency',
          icon: AlertTriangle,
          gradient: 'from-red-500 to-red-600',
          popularity: 76,
          avgTimesSaved: '30 min/emergency',
          rule: {
            name: 'Emergency Job Alert',
            description: 'Notify team of emergency jobs',
            status: 'active' as const,
            trigger: { 
              type: 'job_status_to', 
              statusTo: 'emergency',
              conditions: []
            },
            action: {
              type: 'notify_team',
              config: {
                message: `🚨 EMERGENCY JOB ALERT!

Client: {{client_name}}
Address: {{job_address}}
Issue: {{job_description}}

Job #{{job_number}} needs immediate attention!`,
                notifyMethod: 'sms',
                recipients: 'all_available'
              },
              delay: { type: 'immediate' }
            }
          }
        }
      ],
      'Financial & Billing': [
        {
          id: 'invoice_reminder',
          name: 'Smart Invoice Payment Reminder',
          description: 'Gentle reminder for overdue invoices with escalation',
          icon: DollarSign,
          gradient: 'from-orange-500 to-orange-600',
          popularity: 91,
          avgTimesSaved: '2 hrs/week',
          rule: {
            name: 'Invoice Payment Reminder',
            description: 'Professional payment reminder with multi-channel fallback',
            status: 'active' as const,
            trigger: { 
              type: 'invoice_overdue',
              conditions: [
                { field: 'days_overdue', operator: 'equals', value: 3 }
              ]
            },
            action: {
              type: 'send_email',
              config: {
                subject: 'Payment Reminder - {{company_name}} Invoice #{{invoice_number}}',
                body: `Hi {{client_name}},

We hope you're doing well! This is a friendly reminder about your invoice.

Invoice Details:
• Invoice #: {{invoice_number}}
• Amount Due: {{amount_due}}
• Due Date: {{due_date}} ({{days_overdue}} days ago)

Pay securely online: {{payment_link}}

Best regards,
{{company_name}}`
              },
              delay: { type: 'immediate' }
            }
          }
        }
      ]
    };

    return baseTemplates;
  };
  // Handle template selection
  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setSelectedRule(template.rule);
    
    // Extract status conditions based on trigger type
    if (template.rule.trigger.statusFrom) {
      setStatusFrom(template.rule.trigger.statusFrom);
    }
    if (template.rule.trigger.statusTo) {
      setStatusTo(template.rule.trigger.statusTo);
    }
    
    setBuilderOpen(true);
  };

  // Create template automation
  const createTemplateAutomation = (templateId: string) => {
    const allTemplates = Object.values(getTemplatesByCategory()).flat();
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      handleUseTemplate(template);
    }
  };

  // AI Automation Builder
  const handleAIAutomationCreate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the automation you want to create');
      return;
    }

    try {
      const statusValues = jobStatuses.map(s => s.value).join(', ');
      const triggerList = triggerTypes.map(t => t.value).join(', ');
      const actionList = actionTypes.map(a => a.value).join(', ');
      
      const prompt = `Create a JSON automation rule for: "${aiPrompt}"
Return ONLY valid JSON:
{
  "name": "Clear descriptive name",
  "description": "Brief description",
  "status": "draft",
  "trigger": {
    "type": "job_status_change",
    "statusFrom": "scheduled",
    "statusTo": "completed",
    "conditions": []
  },
  "action": {
    "type": "send_sms",
    "config": {
      "message": "Thank you {{client_name}} for choosing us!",
      "recipient": "customer"
    },
    "delay": { "type": "immediate", "value": 0 }
  }
}

Available triggers: ${triggerList}
Available actions: ${actionList}
Available statuses: ${statusValues}`;

      const response = await generateText(prompt);
      
      if (response) {
        try {
          let automationRule;
          if (typeof response === 'string') {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              automationRule = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } else if (typeof response === 'object') {
            automationRule = response;
          } else {
            throw new Error('Invalid response type');
          }
          
          setSelectedRule(automationRule);
          
          if (automationRule.trigger.statusFrom) {
            setStatusFrom(automationRule.trigger.statusFrom);
          }
          if (automationRule.trigger.statusTo) {
            setStatusTo(automationRule.trigger.statusTo);
          }
          
          setBuilderOpen(true);
          setAiPrompt('');
          toast.success('AI automation created! Review and save when ready.');
        } catch (parseError) {
          toast.error('AI generated invalid automation format. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating AI automation:', error);
      toast.error('Failed to create AI automation');
    }
  };
  // Save automation
  const saveAutomation = async (rule: AutomationRule) => {
    if (!user?.id) return;

    try {
      if (!rule.name || !rule.trigger.type || !rule.action.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const automationData = {
        user_id: user.id,
        organization_id: user.id,
        name: rule.name,
        description: rule.description,
        status: rule.status,
        trigger_type: rule.trigger.type,
        trigger_conditions: rule.trigger.conditions || [],
        action_type: rule.action.type,
        action_config: rule.action.config,
        delivery_window: rule.deliveryWindow || {
          businessHoursOnly: false,
          allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        },
        multi_channel_config: rule.multiChannel || {
          primaryChannel: 'sms',
          fallbackEnabled: false,
          fallbackDelayHours: 2
        }
      };

      if (rule.id) {
        const { error } = await supabase
          .from('automation_workflows')
          .update(automationData)
          .eq('id', rule.id);
        
        if (error) throw error;
        toast.success('Automation updated successfully');
      } else {
        const { error } = await supabase
          .from('automation_workflows')
          .insert(automationData);
        
        if (error) throw error;
        toast.success('Automation created successfully');
      }

      loadAutomations();
      setBuilderOpen(false);
      setSelectedRule(null);
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to save automation');
    }
  };

  // Load automations
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
        deliveryWindow: automation.delivery_window,
        multiChannel: automation.multi_channel_config,
        usage_count: automation.execution_count || 0,
        success_rate: automation.success_count && automation.execution_count 
          ? Math.round((automation.success_count / automation.execution_count) * 100)
          : 0,
        created_at: automation.created_at
      }));
      
      setAutomationRules(transformedData);
    } catch (error) {
      console.error('Error loading automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  // Toggle automation status
  const toggleAutomationStatus = async (ruleId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', ruleId);

      if (error) throw error;
      
      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation status');
    }
  };

  // Delete automation
  const deleteAutomation = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      
      toast.success('Automation deleted');
      loadAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  // Calculate metrics
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
                  setStatusFrom('');
                  setStatusTo('');
                  setBuilderOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </GradientButton>
            </div>
          }
        />

        {/* Enhanced AI Builder Section */}
        <ModernCard 
          variant="elevated" 
          className="relative overflow-hidden min-h-[300px]"
          style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <ModernCardContent className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl flex items-center justify-center shadow-2xl">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl blur-xl opacity-50 animate-pulse" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      AI Automation Builder
                    </h2>
                    <p className="text-fixlyfy-light text-sm mt-1">Powered by Advanced AI</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-8 text-lg">
                  Describe what you want to automate in plain English, and our AI will create it for you
                </p>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-fixlyfy to-fixlyfy-light rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIAutomationCreate()}
                    placeholder=" "
                    className="relative h-16 bg-gray-800/80 backdrop-blur-xl border-gray-600/50 text-white placeholder:text-gray-400 pr-40 text-lg rounded-xl shadow-inner hover:bg-gray-800/90 transition-all"
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentExampleIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex items-center px-4 pointer-events-none"
                    >
                      <span className="text-gray-400 italic text-lg">
                        {!aiPrompt && `Try: ${aiExamples[currentExampleIndex]}`}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  <GradientButton
                    onClick={handleAIAutomationCreate}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="absolute right-2 top-2 h-12 shadow-xl hover:shadow-2xl transition-all px-6"
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
              
              <div className="grid grid-cols-2 gap-6 lg:w-auto">
                {[
                  { icon: Timer, label: 'Save 10+ hours/week', color: 'from-fixlyfy/40 to-fixlyfy/20' },
                  { icon: TrendingUp, label: '85% response rate', color: 'from-green-500/40 to-green-500/20' },
                  { icon: Users, label: 'Delight customers', color: 'from-blue-500/40 to-blue-500/20' },
                  { icon: DollarSign, label: 'Increase revenue', color: 'from-purple-500/40 to-purple-500/20' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={cn(
                      "w-20 h-20 bg-gradient-to-br backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl",
                      item.color
                    )}>
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <TabsTrigger 
                value="templates" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Layers className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="automations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Workflow className="w-4 h-4 mr-2" />
                My Automations
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          
            {activeView === 'automations' && (
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_status_change">Status Change</SelectItem>
                    <SelectItem value="job_created">Job Created</SelectItem>
                    <SelectItem value="job_completed">Job Completed</SelectItem>
                    <SelectItem value="invoice_created">Invoice Created</SelectItem>
                    <SelectItem value="payment_received">Payment Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Templates View */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            {/* AI Recommendations */}
            <ModernCard variant="elevated" className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/5 via-transparent to-fixlyfy-light/5" />
              <ModernCardHeader className="relative">
                <ModernCardTitle icon={Brain} className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent text-xl">
                    AI Recommendations for {organization?.business_type?.replace('_', ' ').toUpperCase() || 'Your Business'}
                  </span>
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="relative">
                <div className="grid gap-6 md:grid-cols-3">
                  {recommendations.map((rec, index) => {
                    const Icon = rec.icon;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="group relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-fixlyfy/50 hover:shadow-2xl transition-all cursor-pointer"
                        onClick={() => createTemplateAutomation(rec.templateId)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/0 to-fixlyfy/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <div className="relative">
                          <motion.div 
                            className="w-14 h-14 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-xl flex items-center justify-center mb-4 shadow-xl"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </motion.div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-fixlyfy transition-colors text-lg">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {rec.description}
                          </p>
                          
                          {/* Metrics */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {rec.metrics && Object.entries(rec.metrics).slice(0, 3).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center text-fixlyfy text-sm font-medium">
                            Use Template
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
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
                  <ModernCardTitle className="text-lg">{category}</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ y: -5 }}
                          className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 hover:border-fixlyfy/50 hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-800"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <div className={cn(
                            "absolute inset-0 opacity-10 bg-gradient-to-br",
                            template.gradient
                          )} />
                          <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
                                template.gradient
                              )}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              {template.popularity && (
                                <Badge variant="secondary" className="text-xs">
                                  {template.popularity}% use this
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-fixlyfy transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {template.description}
                            </p>
                            {template.avgTimesSaved && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                Saves ~{template.avgTimesSaved}
                              </p>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-center group-hover:bg-fixlyfy/10 group-hover:text-fixlyfy"
                            >
                              Use This Template
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </TabsContent>
        
          {/* My Automations View */}
          <TabsContent value="automations" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
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
                  <div className="w-16 h-16 bg-gradient-to-br from-fixlyfy/20 to-fixlyfy-light/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-fixlyfy" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Automations Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start with a template or create your own custom automation
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setActiveView('templates')}
                    >
                      Browse Templates
                    </Button>
                    <GradientButton
                      variant="primary"
                      onClick={() => {
                        setSelectedRule(null);
                        setStatusFrom('');
                        setStatusTo('');
                        setBuilderOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom
                    </GradientButton>
                  </div>
                </div>
              </ModernCard>
            ) : (
              <div className="grid gap-4">
                {automationRules
                  .filter(rule => {
                    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
                    const matchesType = filterType === 'all' || rule.trigger.type === filterType;
                    return matchesSearch && matchesStatus && matchesType;
                  })
                  .map((rule) => {
                    const triggerType = triggerTypes.find(t => t.value === rule.trigger.type);
                    const actionType = actionTypes.find(a => a.value === rule.action.type);
                    
                    return (
                      <ModernCard key={rule.id} variant="elevated" hoverable className="overflow-hidden">
                        <div className={cn(
                          "absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
                          rule.status === 'active' ? "from-green-500 to-green-600" : "from-gray-400 to-gray-500"
                        )} />
                        <ModernCardContent className="p-6 pl-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                                <Badge 
                                  variant={rule.status === 'active' ? 'default' : 'secondary'}
                                  className={cn(
                                    rule.status === 'active' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  )}
                                >
                                  {rule.status}
                                </Badge>
                                {rule.status === 'active' && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                )}
                              </div>
                              
                              {rule.description && (
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
                              )}
                              
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                  {triggerType?.icon && <triggerType.icon className="w-4 h-4" />}
                                  <span>{triggerType?.label}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                  {actionType?.icon && <actionType.icon className="w-4 h-4" />}
                                  <span>{actionType?.label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {rule.usage_count || 0} executions
                                </span>
                                {rule.success_rate !== undefined && (
                                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <TrendingUp className="w-3 h-3" />
                                    {rule.success_rate}% success
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
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
          </TabsContent>                        onChange={(e) => setSelectedRule(prev => ({
                          ...prev!,
                          action: {
                            ...prev!.action,
                            config: { ...prev!.action.config, subject: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Body</Label>
                      <Textarea 
                        placeholder="Enter email body"
                        value={selectedRule?.action.config?.body || ''}
                        onChange={(e) => setSelectedRule(prev => ({
                          ...prev!,
                          action: {
                            ...prev!.action,
                            config: { ...prev!.action.config, body: e.target.value }
                          }
                        }))}
                        rows={6}
                      />
                    </div>
                  </>
                )}
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