<<<<<<< Updated upstream

import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Plus, 
  TrendingUp, 
  BarChart3,
  Workflow,
  Star,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AutomationsPage = () => {
  // Mock data for demonstration
  const workflows = [
    {
      id: '1',
      name: 'Missed Call Follow-up',
      description: 'Automatically send SMS to clients after missed calls',
      status: 'active',
      executions: 45,
      success_rate: 98
    },
    {
      id: '2',
      name: 'Appointment Reminders',
      description: 'Send reminder messages 24 hours before appointments',
      status: 'active',
      executions: 127,
      success_rate: 96
    },
    {
      id: '3',
      name: 'Payment Follow-up',
      description: 'Follow up on overdue invoices automatically',
      status: 'paused',
      executions: 23,
      success_rate: 89
    }
  ];

  const quickStats = [
    {
      title: 'Active Automations',
      value: '2',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%'
    },
    {
      title: 'Success Rate',
      value: '96.8%',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      trend: '+5%'
    },
    {
      title: 'Recent Executions',
      value: '195',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      trend: '+23%'
    },
    {
      title: 'Total Workflows',
      value: '3',
      icon: Workflow,
      color: 'from-orange-500 to-orange-600',
      trend: '+8%'
    }
=======
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
  Send, Bell, FileText, User, MapPin, Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ComprehensiveWorkflowBuilder from '@/components/automations/ComprehensiveWorkflowBuilder';

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

  // Fetch automations and job statuses
  useEffect(() => {
    if (user?.id) {
      fetchAutomations();
      fetchJobStatuses();
    }
  }, [user?.id]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomationRules(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('job_statuses')
        .select('*')
        .eq('user_id', user?.id)
        .order('sequence');

      if (error) throw error;
      setJobStatuses(data || []);
    } catch (error) {
      console.error('Error fetching job statuses:', error);
    }
  };

  // Open configuration dialog - redirect to workflow builder
  const openConfigDialog = (template: any, isRecommendation: boolean = false) => {
    // Convert template to workflow format
    const workflowTemplate = {
      name: template.name || template.title,
      description: template.description,
      triggers: [{
        id: `trigger-${Date.now()}`,
        type: getWorkflowTriggerType(template.id || template.templateId),
        name: TRIGGER_TYPES[getWorkflowTriggerType(template.id || template.templateId)] || template.trigger,
        config: getTriggerDefaults(template.id || template.templateId)
      }],
      steps: convertTemplateToSteps(template)
    };

    // Load template in workflow builder
    setLoadedTemplate(workflowTemplate);
    setActiveView('workflow-builder');
    toast.info('Template loaded in workflow builder. Customize it as needed!');
  };

  // Convert template trigger to workflow trigger type
  const getWorkflowTriggerType = (templateId: string) => {
    const triggerMap: Record<string, string> = {
      'appointment_24h': 'job_scheduled',
      'job_complete': 'job_completed',
      'emergency_alert': 'job_completed',
      'invoice_reminder': 'payment_overdue',
      'payment_received': 'invoice_paid',
      'estimate_created': 'estimate_sent',
      'estimate_accepted': 'estimate_sent',
      'job_assignment': 'customer_created',
      'commission_alert': 'invoice_threshold'
    };
    return triggerMap[templateId] || 'job_completed';
  };

  // Convert template to workflow steps
  const convertTemplateToSteps = (template: any) => {
    const steps: any[] = [];
    const templateId = template.id || template.templateId;
    const actions = template.actions || [];
    
    // Add email step if template includes email
    if (actions.includes('Send Email') || actions.includes('send_email')) {
      steps.push({
        id: `step-email-${Date.now()}`,
        type: 'email',
        name: 'Send Email',
        config: {
          subject: getDefaultMessageTemplate(templateId, 'email_subject'),
          message: getDefaultMessageTemplate(templateId, 'email_body')
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
        type: 'sms',
        name: 'Send SMS',
        config: {
          message: getDefaultMessageTemplate(templateId, 'sms')
        }
      });
    }
    
    // Add gift card for thank you template
    if (templateId === 'thankYouGiftCard' || actions.includes('Send Gift Card')) {
      steps.unshift({
        id: `step-gift-${Date.now()}`,
        type: 'gift_card',
        name: 'Send Gift Card',
        config: { giftCardAmount: 25, message: 'Thank you for your business!' }
      });
    }
    
    return steps.length > 0 ? steps : [{
      id: `step-default-${Date.now()}`,
      type: 'email',
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
            from_status: jobStatuses.find(s => s.name.toLowerCase().includes('progress'))?.name || 'In Progress',
            to_status: jobStatuses.find(s => s.name.toLowerCase().includes('complete'))?.name || 'Completed',
            entity_type: 'job'
          }
        };
      case 'emergency_alert':
        return {
          type: 'status_change',
          conditions: {
            to_status: 'Emergency',
            entity_type: 'job'
          }
        };
      case 'invoice_reminder':
        return {
          type: 'date_based',
          conditions: {
            days_overdue: 7,
            trigger_field: 'due_date',
            entity_type: 'invoice'
          }
        };
      case 'payment_received':
        return {
          type: 'payment_received',
          conditions: {
            payment_status: 'completed',
            entity_type: 'invoice'
          }
        };
      case 'estimate_created':
        return {
          type: 'entity_created',
          conditions: {
            entity_type: 'estimate'
          }
        };
      case 'estimate_accepted':
        return {
          type: 'status_change',
          conditions: {
            to_status: 'accepted',
            entity_type: 'estimate'
          }
        };
      case 'job_assignment':
        return {
          type: 'entity_created',
          conditions: {
            entity_type: 'job',
            needs_assignment: true
          }
        };
      case 'commission_alert':
        return {
          type: 'threshold_reached',
          conditions: {
            entity_type: 'commission',
            threshold_type: 'milestone'
          }
        };
      default:
        return {
          type: 'manual',
          conditions: {}
        };
    }
  };

  // Get default message templates
  const getDefaultMessageTemplate = (templateId: string, type: string) => {
    const templates: any = {
      appointment_24h: {
        sms: "Hi {{client_name}}, this is a reminder about your appointment tomorrow at {{appointment_time}}. Reply YES to confirm or call us to reschedule.",
        email_subject: "Appointment Reminder - {{appointment_date}}",
        email_body: "Dear {{client_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nService: {{service_type}}\nLocation: {{address}}\n\nPlease let us know if you need to reschedule.\n\nBest regards,\n{{company_name}}"
      },
      job_complete: {
        sms: "Hi {{client_name}}, we've completed the service at your property. Thank you for choosing us! We'd love to hear about your experience.",
        email_subject: "Service Completed - Thank You!",
        email_body: "Dear {{client_name}},\n\nWe're pleased to inform you that we've completed the service at your property.\n\nJob Details:\n- Service: {{service_type}}\n- Date: {{completion_date}}\n- Technician: {{technician_name}}\n\nYour feedback is important to us. Please take a moment to share your experience.\n\nThank you for choosing {{company_name}}!"
      },
      emergency_alert: {
        sms: "URGENT: Emergency job for {{client_name}} at {{address}}. Immediate response required!",
        email_subject: "EMERGENCY: Immediate Response Required",
        email_body: "EMERGENCY JOB ALERT\n\nClient: {{client_name}}\nAddress: {{address}}\nPhone: {{client_phone}}\nIssue: {{job_description}}\n\nPlease respond immediately!",
        notification: "Emergency job created - {{client_name}} at {{address}}"
      },
      invoice_reminder: {
        sms: "Hi {{client_name}}, invoice #{{invoice_number}} for ${{amount}} is overdue. Please contact us if you have any questions.",
        email_subject: "Payment Reminder - Invoice #{{invoice_number}}",
        email_body: "Dear {{client_name}},\n\nThis is a friendly reminder that the following invoice is now overdue:\n\nInvoice #: {{invoice_number}}\nAmount: ${{amount}}\nDue Date: {{due_date}}\n\nPlease arrange payment at your earliest convenience. If you have any questions, please don't hesitate to contact us.\n\nThank you,\n{{company_name}}"
      },
      payment_received: {
        sms: "Thank you {{client_name}}! Payment of ${{amount}} received for invoice #{{invoice_number}}.",
        email_subject: "Payment Received - Thank You!",
        email_body: "Dear {{client_name}},\n\nWe've received your payment. Thank you!\n\nPayment Details:\n- Amount: ${{amount}}\n- Invoice #: {{invoice_number}}\n- Date: {{payment_date}}\n\nWe appreciate your prompt payment.\n\nBest regards,\n{{company_name}}"
      },
      estimate_created: {
        sms: "Hi {{client_name}}, your estimate for {{service_type}} is ready. Total: ${{amount}}. View details in your portal.",
        email_subject: "Your Estimate is Ready - {{estimate_number}}",
        email_body: "Dear {{client_name}},\n\nYour estimate is ready for review:\n\nEstimate #: {{estimate_number}}\nService: {{service_type}}\nTotal: ${{amount}}\n\nYou can view the full details and approve the estimate through your customer portal.\n\nBest regards,\n{{company_name}}"
      },
      estimate_accepted: {
        sms: "Great news! {{client_name}} has accepted estimate #{{estimate_number}} for ${{amount}}.",
        email_subject: "Estimate Accepted - {{estimate_number}}",
        email_body: "Estimate #{{estimate_number}} has been accepted!\n\nClient: {{client_name}}\nAmount: ${{amount}}\n\nNext steps:\n1. Schedule the job\n2. Assign a technician\n3. Contact the client to confirm timing",
        notification: "Estimate #{{estimate_number}} accepted by {{client_name}}"
      },
      job_assignment: {
        notification: "New job assigned: {{client_name}} - {{service_type}} at {{address}}",
        sms: "New job assigned: {{client_name}} at {{address}}. Check your schedule for details.",
        email_subject: "New Job Assignment - {{client_name}}",
        email_body: "You've been assigned a new job:\n\nClient: {{client_name}}\nService: {{service_type}}\nAddress: {{address}}\nScheduled: {{appointment_date}} at {{appointment_time}}\n\nPlease review the job details in your dashboard."
      },
      commission_alert: {
        notification: "Commission milestone reached! You've earned ${{commission_amount}} this {{period}}",
        email_subject: "Commission Milestone Achieved!",
        email_body: "Congratulations!\n\nYou've reached a commission milestone:\n\nPeriod: {{period}}\nCommission Earned: ${{commission_amount}}\nJobs Completed: {{jobs_count}}\n\nKeep up the great work!"
      }
    };

    return templates[templateId]?.[type] || "";
  };

  // Create automation from configuration
  const createAutomation = async () => {
    if (!automationConfig) return;

    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert({
          user_id: user?.id,
          organization_id: organization?.id,
          name: automationConfig.name,
          description: automationConfig.description,
          status: automationConfig.enabled ? 'active' : 'paused',
          category: selectedTemplate?.category || 'customer_communication',
          trigger_type: automationConfig.trigger.type,
          trigger_conditions: automationConfig.trigger.conditions,
          action_type: Object.keys(automationConfig.actions).filter(k => automationConfig.actions[k]).join(','),
          template_config: {
            actions: automationConfig.actions,
            messageTemplates: automationConfig.messageTemplates,
            enabled: automationConfig.enabled
          },
          execution_count: 0,
          success_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAutomations();
      toast.success(`${automationConfig.name} created successfully!`);
      setShowConfigDialog(false);
      setActiveView('automations');
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    }
  };

  // Toggle automation status
  const toggleAutomation = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchAutomations();
      toast.success(`Automation ${newStatus === 'active' ? 'enabled' : 'paused'}`);
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation status');
    }
  };

  // Get business recommendations
  const getBusinessRecommendations = () => {
    const businessType = organization?.business_type || 'field_service';
    
    const recommendations = {
      hvac: [
        {
          title: 'Seasonal Maintenance Reminders',
          description: 'Send automated reminders for AC tune-ups in spring and heating checks in fall',
          icon: Calendar,
          templateId: 'seasonal_hvac',
          category: 'maintenance',
          actions: ['send_sms', 'send_email'],
          metrics: { avgOpenRate: '85%', conversionRate: '42%', timeSaved: '2hrs/week' }
        },
        {
          title: 'Filter Change Reminders',
          description: 'Monthly reminders to change air filters based on last service date',
          icon: RefreshCw,
          templateId: 'filter_reminder',
          category: 'maintenance',
          actions: ['send_sms'],
          metrics: { avgOpenRate: '78%', conversionRate: '35%', timeSaved: '1hr/week' }
        },
        {
          title: 'Emergency Job Alert',
          description: 'Instantly notify on-call team when job status changes to emergency',
          icon: AlertTriangle,
          templateId: 'emergency_alert',
          category: 'team',
          actions: ['send_sms', 'create_task'],
          metrics: { responseTime: '< 5min', satisfaction: '95%' }
        }
      ],
      field_service: [
        {
          title: 'Smart Appointment Confirmations',
          description: '24-hour reminder that adapts based on job type and client preferences',
          icon: Calendar,
          templateId: 'appointment_24h',
          category: 'customer_communication',
          actions: ['send_sms', 'send_email'],
          metrics: { noShowReduction: '75%', satisfaction: '90%', timeSaved: '3hrs/week' }
        },
        {
          title: 'Intelligent Job Follow-up',
          description: 'AI-powered follow-up timing based on job complexity and client history',
          icon: Star,
          templateId: 'job_complete',
          category: 'customer_communication',
          actions: ['send_email', 'request_review'],
          metrics: { reviewRate: '45%', rating: '4.8★', repeatBusiness: '+30%' }
        },
        {
          title: 'Dynamic Payment Reminders',
          description: 'Professional reminders that escalate appropriately based on payment history',
          icon: DollarSign,
          templateId: 'invoice_reminder',
          category: 'billing',
          actions: ['send_email', 'send_sms'],
          metrics: { collectionRate: '95%', timeSaved: '2hrs/week' }
        }
      ]
    };

    return recommendations[businessType] || recommendations.field_service;
  };

  // Get template categories
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
          trigger: 'Time-based',
          actions: ['Send SMS', 'Send Email'],
          category: 'customer_communication'
        },
        {
          id: 'job_complete',
          name: 'Job Completion Follow-up',
          description: `Thank customer when job status changes to completed`,
          icon: CheckCircle,
          gradient: 'from-green-500 to-green-600',
          popularity: 88,
          avgTimesSaved: '2 hrs/week',
          trigger: 'Status Change',
          actions: ['Send Email', 'Request Review'],
          category: 'customer_communication'
        },
        {
          id: 'estimate_created',
          name: 'Estimate Ready Notification',
          description: 'Notify customer when estimate is created and ready for review',
          icon: FileText,
          gradient: 'from-purple-500 to-purple-600',
          popularity: 82,
          avgTimesSaved: '1.5 hrs/week',
          trigger: 'Entity Created',
          actions: ['Send SMS', 'Send Email'],
          category: 'customer_communication'
        }
      ],
      'Financial & Billing': [
        {
          id: 'invoice_reminder',
          name: 'Smart Invoice Payment Reminder',
          description: 'Gentle reminder for overdue invoices with smart escalation',
          icon: DollarSign,
          gradient: 'from-orange-500 to-orange-600',
          popularity: 91,
          avgTimesSaved: '2 hrs/week',
          trigger: 'Date-based',
          actions: ['Send Email', 'Send SMS'],
          category: 'billing'
        },
        {
          id: 'payment_received',
          name: 'Payment Thank You',
          description: 'Thank customer automatically when payment is received',
          icon: CheckCircle,
          gradient: 'from-green-500 to-green-600',
          popularity: 85,
          avgTimesSaved: '1 hr/week',
          trigger: 'Payment Received',
          actions: ['Send Email'],
          category: 'billing'
        },
        {
          id: 'estimate_accepted',
          name: 'Estimate Accepted Alert',
          description: 'Notify team when customer accepts an estimate',
          icon: Star,
          gradient: 'from-yellow-500 to-yellow-600',
          popularity: 78,
          avgTimesSaved: '30 min/week',
          trigger: 'Status Change',
          actions: ['Send Notification', 'Send Email'],
          category: 'billing'
        }
      ],
      'Team Management': [
        {
          id: 'emergency_alert',
          name: 'Emergency Job Alert',
          description: 'Alert team when job priority changes to emergency',
          icon: AlertTriangle,
          gradient: 'from-red-500 to-red-600',
          popularity: 76,
          avgTimesSaved: '30 min/emergency',
          trigger: 'Status Change',
          actions: ['Send SMS', 'Send Notification'],
          category: 'team'
        },
        {
          id: 'job_assignment',
          name: 'Smart Job Assignment',
          description: 'Automatically assign jobs based on skills, location, and availability',
          icon: Users,
          gradient: 'from-purple-500 to-purple-600',
          popularity: 82,
          avgTimesSaved: '4 hrs/week',
          trigger: 'New Job',
          actions: ['Assign Tech', 'Send Notification'],
          category: 'team'
        },
        {
          id: 'commission_alert',
          name: 'Commission Milestone Alert',
          description: 'Notify team members when they reach commission milestones',
          icon: Target,
          gradient: 'from-indigo-500 to-indigo-600',
          popularity: 79,
          avgTimesSaved: '1 hr/month',
          trigger: 'Milestone Reached',
          actions: ['Send Notification', 'Send Email'],
          category: 'team'
        }
      ]
    };
  };

  const recommendations = getBusinessRecommendations();
  const templateCategories = getTemplatesByCategory();

  const filteredAutomations = automationRules.filter(rule =>
    rule.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', ...Object.keys(templateCategories)];

  const filteredTemplates = selectedCategory === 'all' 
    ? Object.values(templateCategories).flat()
    : templateCategories[selectedCategory] || [];

  // Calculate real analytics data
  const analyticsData = {
    totalRuns: automationRules.reduce((sum, rule) => sum + (rule.execution_count || 0), 0),
    successRate: automationRules.length > 0 
      ? Math.round(automationRules.reduce((sum, rule) => sum + ((rule.success_count || 0) / (rule.execution_count || 1) * 100), 0) / automationRules.length)
      : 0,
    timeSaved: Math.round(automationRules.reduce((sum, rule) => sum + (rule.execution_count || 0) * 0.5, 0)),
    activeAutomations: automationRules.filter(rule => rule.status === 'active').length
  };

  // Available message variables
  const messageVariables = [
    { name: 'client_name', icon: User },
    { name: 'appointment_time', icon: Clock },
    { name: 'appointment_date', icon: Calendar },
    { name: 'service_type', icon: Wrench },
    { name: 'address', icon: MapPin },
    { name: 'invoice_number', icon: Hash },
    { name: 'estimate_number', icon: Hash },
    { name: 'amount', icon: DollarSign },
    { name: 'company_name', icon: Shield },
    { name: 'technician_name', icon: User },
    { name: 'job_description', icon: FileText },
    { name: 'due_date', icon: Calendar },
    { name: 'payment_date', icon: Calendar },
    { name: 'completion_date', icon: CheckCircle },
    { name: 'client_phone', icon: Phone },
    { name: 'commission_amount', icon: DollarSign },
    { name: 'period', icon: Calendar },
    { name: 'jobs_count', icon: BarChart3 }
>>>>>>> Stashed changes
  ];

  return (
    <PageLayout>
<<<<<<< Updated upstream
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Automations Center"
          subtitle="Streamline your workflow with intelligent automation"
          icon={Zap}
          badges={[
            { text: "Smart Workflows", icon: Workflow, variant: "fixlyfy" },
            { text: "AI Powered", icon: Star, variant: "success" },
            { text: "Time Saving", icon: Clock, variant: "info" }
          ]}
          actionButton={{
            text: "Create Automation",
            icon: Plus,
            onClick: () => console.log('Create automation clicked')
          }}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <ModernCard key={index} variant="elevated" hoverable className="group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            <TabsTrigger 
              value="workflows" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <Star className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid gap-6">
              {workflows.map((workflow) => (
                <ModernCard key={workflow.id} variant="elevated" hoverable>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                          <Badge 
                            variant={workflow.status === 'active' ? 'default' : 'secondary'}
                            className={`flex items-center gap-1 ${
                              workflow.status === 'active' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {workflow.status === 'active' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{workflow.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>{workflow.executions} executions</span>
                          <span>{workflow.success_rate}% success rate</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GradientButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Toggle workflow')}
                        >
                          {workflow.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </>
                          )}
                        </GradientButton>
                        <GradientButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Edit workflow')}
                        >
                          <Settings className="w-4 h-4" />
                        </GradientButton>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <ModernCard variant="elevated">
              <div className="p-8 text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates Coming Soon</h3>
                <p className="text-gray-600 mb-4">Pre-built automation templates to get you started quickly</p>
                <GradientButton onClick={() => console.log('Create template')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Template
                </GradientButton>
              </div>
            </ModernCard>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ModernCard variant="elevated">
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Detailed insights into your automation performance</p>
                <GradientButton onClick={() => console.log('View analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </GradientButton>
              </div>
            </ModernCard>
          </TabsContent>
        </Tabs>
      </div>
=======
      <PageHeader
        title="Smart Automations"
        description="AI-powered automation workflows that save time and delight customers"
        icon={Zap}
        actions={
          <GradientButton 
            variant="primary" 
            onClick={() => {
              setActiveView('workflow-builder');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </GradientButton>
        }
      />

      {/* AI Builder Section */}
      <ModernCard variant="elevated" className="mb-6">
        <ModernCardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Automation Builder</h2>
            <p className="text-muted-foreground mb-6">
              Describe what you want to automate in plain English
            </p>
            <div className="max-w-2xl mx-auto">
              <Input
                placeholder="Try: Send SMS reminder 24 hours before appointment"
                className="h-12 text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    toast.info("AI is analyzing your request...");
                    setTimeout(() => {
                      toast.success("AI suggests: 24-Hour Appointment Reminder template");
                      setSelectedCategory('Customer Communication');
                    }, 1500);
                  }
                }}
              />
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center justify-center gap-2 px-2 sm:px-4">
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Tmp</span>
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center justify-center gap-2 px-2 sm:px-4">
            <Workflow className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">My Automations</span>
            <span className="sm:hidden">My</span>
            {automationRules.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2">
                {automationRules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflow-builder" className="flex items-center justify-center gap-2 px-2 sm:px-4">
            <Workflow className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Workflows</span>
            <span className="sm:hidden">Flow</span>
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
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.templateId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <ModernCard variant="interactive" className="h-full">
                    <ModernCardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={cn(
                          "p-2 sm:p-3 rounded-xl bg-gradient-to-br flex-shrink-0",
                          "from-fixlyfy/10 to-fixlyfy-light/10"
                        )}>
                          <rec.icon className="w-5 h-5 sm:w-6 sm:h-6 text-fixlyfy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 text-sm sm:text-base truncate">{rec.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                            {rec.description}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                            {Object.entries(rec.metrics).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-[10px] sm:text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full text-xs sm:text-sm"
                            onClick={() => openConfigDialog(rec, true)}
                          >
                            Configure & Use
                          </Button>
                        </div>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ))}
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
                className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* All Templates */}
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
                  <ModernCardContent className="p-4 sm:p-6">
                    <div className={cn(
                      "inline-flex p-2 sm:p-3 rounded-xl mb-3 sm:mb-4",
                      "bg-gradient-to-br",
                      template.gradient
                    )}>
                      <template.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">{template.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Trigger:</span>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">{template.trigger}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Actions:</span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {template.actions.map((action, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Time Saved:</span>
                        <span className="font-medium text-green-600 text-xs sm:text-sm">
                          {template.avgTimesSaved}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted border-2 border-background"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">
                          {template.popularity}% use this
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="w-full text-xs sm:text-sm" 
                      variant="outline"
                      onClick={() => openConfigDialog(template)}
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Configure & Use
                    </Button>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* My Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          {/* Analytics Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <ModernCard>
              <ModernCardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-fixlyfy" />
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{analyticsData.totalRuns.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Runs</p>
                </div>
              </ModernCardContent>
            </ModernCard>

            <ModernCard>
              <ModernCardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 text-xs">
                    Weekly
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{analyticsData.timeSaved} hrs</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Time Saved</p>
                </div>
              </ModernCardContent>
            </ModernCard>

            <ModernCard>
              <ModernCardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 text-xs">
                    All Time
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{analyticsData.successRate}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
                </div>
              </ModernCardContent>
            </ModernCard>

            <ModernCard>
              <ModernCardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 text-xs">
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{analyticsData.activeAutomations}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy" />
            </div>
          ) : filteredAutomations.length === 0 ? (
            <ModernCard variant="elevated">
              <ModernCardContent className="py-12 text-center">
                <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation from templates or build your own
                </p>
                <Button onClick={() => setActiveView('templates')}>
                  Browse Templates
                </Button>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <div className="space-y-4">
              {filteredAutomations.map((automation) => (
                <ModernCard key={automation.id} variant="interactive">
                  <ModernCardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{automation.name}</h3>
                          <Badge 
                            variant={automation.status === 'active' ? "default" : "secondary"}
                            className={cn(
                              "text-xs flex-shrink-0",
                              automation.status === 'active' 
                                ? "bg-green-500/10 text-green-700 border-green-500/20" 
                                : ""
                            )}
                          >
                            {automation.status === 'active' ? 'Active' : 'Paused'}
                          </Badge>
                          {automation.trigger_type && (
                            <Badge variant="outline" className="text-xs">
                              {automation.trigger_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                          {automation.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Last: {automation.last_triggered_at 
                                ? new Date(automation.last_triggered_at).toLocaleDateString()
                                : 'Never'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {automation.execution_count || 0} runs
                            </span>
                          </div>
                          {automation.success_count > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                              <span className="text-muted-foreground">
                                {Math.round((automation.success_count / automation.execution_count) * 100)}% success
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() => toggleAutomation(automation.id, automation.status)}
                        >
                          {automation.status === 'active' ? (
                            <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() => {
                            setSelectedWorkflowId(automation.id);
                            setActiveView('workflow-builder');
                          }}
                        >
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>
          )}

          {/* Top Performing Automations */}
          <ModernCard className="mt-6">
            <ModernCardHeader>
              <ModernCardTitle>Top Performing Automations</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              {automationRules.length > 0 ? (
                automationRules
                  .sort((a, b) => (b.execution_count || 0) - (a.execution_count || 0))
                  .slice(0, 5)
                  .map((automation, index) => (
                    <div key={automation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-fixlyfy/10 flex items-center justify-center">
                          <span className="text-sm font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{automation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {automation.execution_count || 0} runs • {automation.success_count || 0} successful
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {automation.status === 'active' ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No automation data yet</p>
                  <p className="text-sm">Create automations to see performance data</p>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        {/* Workflow Builder Tab */}
        <TabsContent value="workflow-builder" className="space-y-6">
          {selectedWorkflowId && (
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline"
                onClick={() => setSelectedWorkflowId(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Workflow
              </Button>
            </div>
          )}
          <ComprehensiveWorkflowBuilder 
            workflowId={selectedWorkflowId}
            initialTemplate={loadedTemplate}
            onSave={() => {
              toast.success('Workflow saved successfully!');
              setActiveView('automations');
              fetchAutomations();
              setSelectedWorkflowId(null);
              setLoadedTemplate(null);
            }}
          />
        </TabsContent>
      </Tabs>
>>>>>>> Stashed changes
    </PageLayout>
  );
};

export default AutomationsPage;