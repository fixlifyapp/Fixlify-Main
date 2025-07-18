import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Save, Trash2, ChevronDown, Info, Sparkles,
  Calendar, CheckCircle, Send, DollarSign, AlertCircle,
  User, FileText, Clock, Star, Tag, UserPlus, MessageSquare,
  Mail, Phone, Bell, Timer, Target, Zap, X, Play, Pause,
  History, Variable, GripVertical, ArrowDown, Code, Webhook,
  Wand2, RefreshCw, Edit3, ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { useAutomationData, getFieldValueOptions } from '@/hooks/useAutomationData';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { motion, AnimatePresence } from 'framer-motion';
import { DeliveryWindowConfig } from './DeliveryWindowConfig';

// Types
interface WorkflowTrigger {
  type: string;
  name: string;
  icon: any;
  color: string;
  category: string;
  description: string;
  config?: any;
}

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  icon: any;
  description: string;
  config: any;
  deliveryWindow?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
    weekdays?: boolean[];
  };
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
  connector?: 'and' | 'or';
  fieldType?: string;
}

interface SimpleWorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
  loadedTemplate?: any;
}

// Trigger options
const TRIGGERS: WorkflowTrigger[] = [
  // Jobs
  { type: 'job_created', name: 'Job Created', icon: Plus, color: 'blue', category: 'Jobs', description: 'When a new job is created' },
  { type: 'job_scheduled', name: 'Job Scheduled', icon: Calendar, color: 'blue', category: 'Jobs', description: 'When a job is scheduled' },
  { type: 'job_completed', name: 'Job Completed', icon: CheckCircle, color: 'green', category: 'Jobs', description: 'When a job is marked complete' },
  { type: 'job_status_changed', name: 'Job Status Changed', icon: Target, color: 'blue', category: 'Jobs', description: 'When job status is updated' },
  
  // Financial
  { type: 'estimate_sent', name: 'Estimate Sent', icon: Send, color: 'purple', category: 'Financial', description: 'When an estimate is sent' },
  { type: 'estimate_approved', name: 'Estimate Approved', icon: CheckCircle, color: 'purple', category: 'Financial', description: 'When an estimate is approved' },
  { type: 'invoice_sent', name: 'Invoice Sent', icon: FileText, color: 'purple', category: 'Financial', description: 'When an invoice is sent' },
  { type: 'payment_received', name: 'Payment Received', icon: DollarSign, color: 'green', category: 'Financial', description: 'When payment is received' },
  { type: 'payment_overdue', name: 'Payment Overdue', icon: AlertCircle, color: 'red', category: 'Financial', description: 'When payment becomes overdue' },
  
  // Customers
  { type: 'customer_created', name: 'Customer Created', icon: UserPlus, color: 'teal', category: 'Customers', description: 'When a new customer is added' },
  { type: 'customer_tagged', name: 'Customer Tagged', icon: Tag, color: 'teal', category: 'Customers', description: 'When a customer is tagged' },
  
  // Tasks
  { type: 'task_created', name: 'Task Created', icon: Plus, color: 'orange', category: 'Tasks', description: 'When a task is created' },
  { type: 'task_completed', name: 'Task Completed', icon: CheckCircle, color: 'orange', category: 'Tasks', description: 'When a task is marked done' },
];

// Action options
const ACTION_TYPES = [
  { type: 'send_sms', name: 'Send SMS', icon: MessageSquare, description: 'Send a text message' },
  { type: 'send_email', name: 'Send Email', icon: Mail, description: 'Send an email' },
  { type: 'send_notification', name: 'Send Notification', icon: Bell, description: 'Send in-app notification' },
  { type: 'create_task', name: 'Create Task', icon: Plus, description: 'Create a follow-up task' },
  { type: 'update_status', name: 'Update Status', icon: Target, description: 'Change job or invoice status' },
  { type: 'add_tag', name: 'Add Tag', icon: Tag, description: 'Add a tag to customer or job' },
  { type: 'webhook', name: 'Call Webhook', icon: Webhook, description: 'Send data to external service' },
  { type: 'wait', name: 'Wait', icon: Clock, description: 'Add a delay before next action' },
];

// Timing options
const TIMING_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'minutes_after', label: 'Minutes after' },
  { value: 'hours_after', label: 'Hours after' },
  { value: 'days_after', label: 'Days after' },
  { value: 'minutes_before', label: 'Minutes before' },
  { value: 'hours_before', label: 'Hours before' },
  { value: 'days_before', label: 'Days before' },
];

// Field options for conditions based on trigger type
const getFieldOptions = (triggerType: string) => {
  const commonFields = [
    { value: 'client_tag', label: 'Client Tag', type: 'select' },
    { value: 'client_type', label: 'Client Type', type: 'select' },
    { value: 'client_source', label: 'Lead Source', type: 'select' },
    { value: 'client_rating', label: 'Client Rating', type: 'number' },
    { value: 'total_spent', label: 'Total Spent', type: 'number' },
    { value: 'service_count', label: 'Service Count', type: 'number' },
  ];

  const jobFields = [
    { value: 'job_type', label: 'Job Type', type: 'select' },
    { value: 'job_status', label: 'Job Status', type: 'select' },
    { value: 'job_tag', label: 'Job Tag', type: 'select' },
    { value: 'priority', label: 'Priority', type: 'select' },
    { value: 'technician', label: 'Assigned Technician', type: 'select' },
    { value: 'service_area', label: 'Service Area', type: 'select' },
    { value: 'job_value', label: 'Job Value', type: 'number' },
    { value: 'recurring', label: 'Is Recurring', type: 'boolean' },
  ];

  const financialFields = [
    { value: 'amount', label: 'Amount', type: 'number' },
    { value: 'payment_method', label: 'Payment Method', type: 'select' },
    { value: 'payment_status', label: 'Payment Status', type: 'select' },
    { value: 'days_overdue', label: 'Days Overdue', type: 'number' },
    { value: 'discount_applied', label: 'Discount Applied', type: 'boolean' },
    { value: 'tax_exempt', label: 'Tax Exempt', type: 'boolean' },
  ];

  const fieldMap: Record<string, any[]> = {
    // Job triggers
    'job_created': [...jobFields, ...commonFields],
    'job_scheduled': [...jobFields, ...commonFields],
    'job_completed': [...jobFields, ...commonFields],
    'job_status_changed': [...jobFields, ...commonFields],
    
    // Financial triggers
    'estimate_sent': [...financialFields, ...commonFields, { value: 'estimate_status', label: 'Estimate Status', type: 'select' }],
    'estimate_approved': [...financialFields, ...commonFields],
    'invoice_sent': [...financialFields, ...commonFields, { value: 'invoice_status', label: 'Invoice Status', type: 'select' }],
    'payment_received': [...financialFields, ...commonFields],
    'payment_overdue': [...financialFields, ...commonFields],
    
    // Customer triggers
    'customer_created': [...commonFields],
    'customer_tagged': [...commonFields, { value: 'tag_name', label: 'Tag Name', type: 'select' }],
    
    // Task triggers
    'task_created': [
      { value: 'task_type', label: 'Task Type', type: 'select' },
      { value: 'task_priority', label: 'Task Priority', type: 'select' },
      ...commonFields
    ],
    'task_completed': [
      { value: 'task_type', label: 'Task Type', type: 'select' },
      { value: 'completion_time', label: 'Completion Time', type: 'select' },
      ...commonFields
    ],
  };

  return fieldMap[triggerType] || commonFields;
};

// Operator options based on field type
const getOperatorOptions = (fieldType: string) => {
  switch (fieldType) {
    case 'number':
      return [
        { value: 'equals', label: '=' },
        { value: 'not_equals', label: '≠' },
        { value: 'greater_than', label: '>' },
        { value: 'less_than', label: '<' },
        { value: 'greater_or_equal', label: '≥' },
        { value: 'less_or_equal', label: '≤' },
      ];
    case 'boolean':
      return [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
      ];
    case 'select':
    case 'text':
    default:
      return [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'does not contain' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
      ];
  }
};



// Sortable Step Component
const SortableStep: React.FC<{
  step: WorkflowStep;
  index: number;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onRemove: () => void;
  selectedTrigger?: WorkflowTrigger | null;
  companyTimezone?: string;
}> = ({ step, index, onUpdate, onRemove, selectedTrigger, companyTimezone = 'America/New_York' }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0); // Expand first step by default
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ActionIcon = ACTION_TYPES.find(a => a.type === step.type)?.icon || Zap;

  const generateAIContent = async (type: 'write' | 'rewrite' | 'improve') => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let newContent = '';
      
      if (step.type === 'send_sms') {
        if (type === 'write') {
          newContent = getAISmsTemplate(selectedTrigger?.type || '');
        } else if (type === 'rewrite' && step.config.message) {
          newContent = `Hi {{client_name}}! ${step.config.message} Reply STOP to opt out.`;
        } else if (type === 'improve' && step.config.message) {
          newContent = step.config.message.replace('Hi', 'Hello').replace('!', '! 👋') + ' Text YES to confirm.';
        }
        onUpdate({ config: { ...step.config, message: newContent } });
      } else if (step.type === 'send_email') {
        if (type === 'write') {
          const templates = getAIEmailTemplate(selectedTrigger?.type || '');
          onUpdate({ 
            config: { 
              ...step.config, 
              subject: templates.subject,
              body: templates.body 
            } 
          });
        } else if (type === 'rewrite' && step.config.body) {
          onUpdate({ 
            config: { 
              ...step.config, 
              body: `Dear {{client_name}},\n\n${step.config.body}\n\nBest regards,\n{{company_name}}`
            } 
          });
        } else if (type === 'improve' && step.config.body) {
          onUpdate({ 
            config: { 
              ...step.config, 
              body: step.config.body.replace('appointment', 'scheduled appointment').replace('thank you', 'thank you very much') + '\n\nP.S. Don\'t hesitate to contact us if you have any questions!'
            } 
          });
        }
      }
      
      setIsGeneratingAI(false);
      toast.success('AI content generated!');
    }, 1500);
  };

  const getAISmsTemplate = (triggerType: string) => {
    const templates: Record<string, string> = {
      'job_scheduled': "Hi {{client_name}}! 📅 Just a friendly reminder about your appointment tomorrow at {{appointment_time}}. Our technician {{technician_name}} will arrive between {{time_window}}. Reply YES to confirm or call {{company_phone}} to reschedule.",
      'job_completed': "Hi {{client_name}}! ✅ Great news - we've completed the service at your property. You can view your invoice here: {{invoice_link}}. How was your experience today? Reply with a rating 1-5 ⭐",
      'payment_received': "Thank you {{client_name}}! 💚 We've received your payment of {{payment_amount}}. Your account is all set. We appreciate your prompt payment and look forward to serving you again!",
      'estimate_sent': "Hi {{client_name}}! 📋 Your estimate for {{service_type}} is ready: {{estimate_link}}. Total: {{estimate_amount}}. This quote is valid for 30 days. Reply APPROVE to get scheduled!",
      'payment_overdue': "Hi {{client_name}}, this is a friendly reminder that your invoice #{{invoice_number}} for {{invoice_amount}} is past due. Please pay at your earliest convenience: {{payment_link}}. Need help? Call us!",
      'customer_created': "Welcome to {{company_name}}, {{client_name}}! 🎉 We're thrilled to have you as our customer. Save this number for easy scheduling. Reply STOP to opt out of messages.",
      'default': "Hi {{client_name}}! This is {{company_name}} with an update about your service. {{message_content}}. Questions? Reply or call {{company_phone}}."
    };
    
    return templates[triggerType] || templates.default;
  };

  const getAIEmailTemplate = (triggerType: string) => {
    const templates: Record<string, { subject: string; body: string }> = {
      'job_scheduled': {
        subject: "Appointment Confirmation - {{appointment_date}} at {{appointment_time}}",
        body: "Dear {{client_name}},\n\nThank you for choosing {{company_name}}! This email confirms your upcoming appointment:\n\n📅 **Date:** {{appointment_date}}\n⏰ **Time:** {{appointment_time}}\n🏠 **Location:** {{service_address}}\n👷 **Technician:** {{technician_name}}\n🔧 **Service:** {{service_type}}\n\n**What to Expect:**\n- Our technician will arrive within the scheduled time window\n- Please ensure someone 18+ is present during the service\n- Clear access to the service area would be appreciated\n\n**Need to Reschedule?**\nNo problem! Just reply to this email or call us at {{company_phone}}.\n\nWe look forward to serving you!\n\nBest regards,\n{{company_name}} Team"
      },
      'job_completed': {
        subject: "Service Completed - Thank You for Choosing {{company_name}}!",
        body: "Dear {{client_name}},\n\nWe're pleased to inform you that we've successfully completed the service at your property today.\n\n**Service Summary:**\n- Service Type: {{service_type}}\n- Completion Time: {{completion_time}}\n- Technician: {{technician_name}}\n- Invoice Total: {{invoice_amount}}\n\n**What We Did:**\n{{work_performed_summary}}\n\n**Your Invoice:**\nYou can view and pay your invoice online: {{invoice_link}}\n\n**We Value Your Feedback!**\nYour opinion matters to us. Please take a moment to rate your experience:\n{{review_link}}\n\n**Warranty Information:**\nYour service includes our standard warranty. Keep this email for your records.\n\nThank you for trusting {{company_name}} with your needs!\n\nWarm regards,\n{{company_name}} Team\n\nP.S. Refer a friend and receive {{referral_discount}} off your next service!"
      },
      'default': {
        subject: "Important Update from {{company_name}}",
        body: "Dear {{client_name}},\n\nWe wanted to reach out with an important update regarding your account with {{company_name}}.\n\n{{message_content}}\n\nIf you have any questions or concerns, please don't hesitate to contact us:\n- Phone: {{company_phone}}\n- Email: {{company_email}}\n- Online: {{company_website}}\n\nThank you for being a valued customer.\n\nSincerely,\n{{company_name}} Team"
      }
    };
    
    return templates[triggerType] || templates.default;
  };

  return (
    <div ref={setNodeRef} style={style} className="workflow-step">
      <div className="step-number">{index + 1}</div>
      <Card className={cn("workflow-card ml-8", isDragging && "shadow-lg")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <ActionIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "transform rotate-180"
                  )} />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="h-8 w-8 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Step Configuration */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      {step.type === 'send_sms' && (
                        <div className="space-y-3 pl-11">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Message</Label>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => generateAIContent('write')}
                                  disabled={isGeneratingAI}
                                >
                                  <Wand2 className="w-3 h-3" />
                                  AI Write
                                </Button>
                                {step.config.message && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => generateAIContent('rewrite')}
                                      disabled={isGeneratingAI}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Rewrite
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => generateAIContent('improve')}
                                      disabled={isGeneratingAI}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Improve
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => toast.info("Variables: {{client_name}}, {{appointment_time}}, {{company_name}}, {{technician_name}}, {{service_type}}, etc.")}
                                >
                                  <Variable className="w-3 h-3" />
                                  Variables
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              value={step.config.message || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, message: e.target.value } })}
                              placeholder="Click 'AI Write' to generate a professional message or type your own..."
                              className={cn("text-sm transition-all", isGeneratingAI && "opacity-50")}
                              rows={4}
                              disabled={isGeneratingAI}
                            />
                            {isGeneratingAI && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="w-4 h-4" />
                                </motion.div>
                                Generating AI content...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {step.type === 'send_email' && (
                        <div className="space-y-3 pl-11">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Subject</Label>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => generateAIContent('write')}
                                  disabled={isGeneratingAI}
                                >
                                  <Wand2 className="w-3 h-3" />
                                  AI Write
                                </Button>
                              </div>
                            </div>
                            <Input
                              value={step.config.subject || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, subject: e.target.value } })}
                              placeholder="Email subject..."
                              className="mt-1"
                              disabled={isGeneratingAI}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm">Message</Label>
                              <div className="flex gap-1">
                                {step.config.body && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => generateAIContent('rewrite')}
                                      disabled={isGeneratingAI}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Rewrite
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => generateAIContent('improve')}
                                      disabled={isGeneratingAI}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Improve
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => toast.info("Variables: {{client_name}}, {{appointment_date}}, {{service_type}}, {{invoice_link}}, etc.")}
                                >
                                  <Variable className="w-3 h-3" />
                                  Variables
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              value={step.config.body || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, body: e.target.value } })}
                              placeholder="Click 'AI Write' to generate a professional email or type your own..."
                              className={cn("mt-1 text-sm transition-all", isGeneratingAI && "opacity-50")}
                              rows={6}
                              disabled={isGeneratingAI}
                            />
                            {isGeneratingAI && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="w-4 h-4" />
                                </motion.div>
                                Generating AI content...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {step.type === 'wait' && (
                        <div className="pl-11">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={step.config.duration || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, duration: e.target.value } })}
                              placeholder="1"
                              className="w-20"
                              min="1"
                            />
                            <Select
                              value={step.config.unit || 'hours'}
                              onValueChange={(value) => onUpdate({ config: { ...step.config, unit: value } })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {step.type === 'create_task' && (
                        <div className="space-y-3 pl-11">
                          <div>
                            <Label className="text-sm">Task Title</Label>
                            <Input
                              value={step.config.title || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, title: e.target.value } })}
                              placeholder="Follow up with {{client_name}}"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Description</Label>
                            <Textarea
                              value={step.config.description || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, description: e.target.value } })}
                              placeholder="Check on service satisfaction..."
                              className="mt-1 text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Due In</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                value={step.config.dueIn || ''}
                                onChange={(e) => onUpdate({ config: { ...step.config, dueIn: e.target.value } })}
                                placeholder="3"
                                className="w-20"
                                min="1"
                              />
                              <Select
                                value={step.config.dueUnit || 'days'}
                                onValueChange={(value) => onUpdate({ config: { ...step.config, dueUnit: value } })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="weeks">Weeks</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.type === 'update_status' && (
                        <div className="pl-11">
                          <Label className="text-sm">Change Status To</Label>
                          <Select
                            value={step.config.status || ''}
                            onValueChange={(value) => onUpdate({ config: { ...step.config, status: value } })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="on_hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {step.type === 'add_tag' && (
                        <div className="pl-11">
                          <Label className="text-sm">Tag Name</Label>
                          <Input
                            value={step.config.tag || ''}
                            onChange={(e) => onUpdate({ config: { ...step.config, tag: e.target.value } })}
                            placeholder="VIP Customer"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {step.type === 'send_notification' && (
                        <div className="space-y-3 pl-11">
                          <div>
                            <Label className="text-sm">Notification Title</Label>
                            <Input
                              value={step.config.title || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, title: e.target.value } })}
                              placeholder="New job assigned"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Message</Label>
                            <Textarea
                              value={step.config.message || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, message: e.target.value } })}
                              placeholder="You have been assigned to job #{{job_number}}"
                              className="mt-1 text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'webhook' && (
                        <div className="space-y-3 pl-11">
                          <div>
                            <Label className="text-sm">Webhook URL</Label>
                            <Input
                              value={step.config.url || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, url: e.target.value } })}
                              placeholder="https://api.example.com/webhook"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {(step.type === 'send_sms' || step.type === 'send_email') && (
                        <div className="mt-4 pl-11">
                          <DeliveryWindowConfig
                            deliveryWindow={step.deliveryWindow}
                            onChange={(deliveryWindow) => onUpdate({ deliveryWindow })}
                            userTimezone={companyTimezone}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SimpleWorkflowBuilder: React.FC<SimpleWorkflowBuilderProps> = ({
  workflowId,
  onSave,
  loadedTemplate
}) => {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const automationData = useAutomationData();
  const { timezone: companyTimezone } = useCompanySettings();
  
  // Debug logging
  useEffect(() => {
    console.log('SimpleWorkflowBuilder - automationData:', automationData);
    console.log('User ID:', user?.id);
    console.log('Organization ID:', organization?.id);
  }, [automationData, user?.id, organization?.id]);
  
  // State
  const [workflowName, setWorkflowName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [showConditions, setShowConditions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load template or existing workflow
  useEffect(() => {
    if (loadedTemplate) {
      setWorkflowName(loadedTemplate.name || '');
      // Load trigger
      if (loadedTemplate.triggers?.[0]) {
        const trigger = TRIGGERS.find(t => t.type === loadedTemplate.triggers[0].type);
        if (trigger) setSelectedTrigger(trigger);
      }
      // Load steps
      if (loadedTemplate.steps?.length > 0) {
        const loadedSteps = loadedTemplate.steps.map((step: any) => {
          const actionType = ACTION_TYPES.find(a => a.type === step.type);
          return {
            id: step.id || `step-${Date.now()}-${Math.random()}`,
            type: step.type,
            name: actionType?.name || step.name,
            description: actionType?.description || '',
            config: step.config || {}
          };
        });
        setSteps(loadedSteps);
      }
    } else if (workflowId && workflowId !== 'new') {
      loadWorkflow();
    }
  }, [workflowId, loadedTemplate]);

  const loadWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      
      // Parse the workflow data
      setWorkflowName(data.name);
      setIsActive(data.status === 'active');
      
      // Load trigger
      const trigger = TRIGGERS.find(t => t.type === data.trigger_type);
      if (trigger) setSelectedTrigger(trigger);
      
      // Load conditions
      if (data.trigger_conditions?.conditions) {
        setConditions(data.trigger_conditions.conditions);
        setShowConditions(true);
      }
      
      // Load steps
      if (data.template_config?.steps) {
        setSteps(data.template_config.steps);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const handleAddStep = (type: string) => {
    const actionType = ACTION_TYPES.find(a => a.type === type);
    if (!actionType) return;
    
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: actionType.type,
      name: actionType.name,
      description: actionType.description,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddCondition = () => {
    const newCondition: WorkflowCondition = { 
      field: '', 
      operator: 'is', 
      value: '', 
      connector: conditions.length > 0 ? 'or' : 'and',
      fieldType: 'text'
    };
    setConditions([...conditions, newCondition]);
    setShowConditions(true);
  };

  const handleUpdateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
    if (conditions.length === 1) setShowConditions(false);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName || !selectedTrigger || steps.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!organization?.id) {
      toast.error('Organization not found. Please refresh and try again.');
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        user_id: user?.id,
        organization_id: organization.id,
        name: workflowName,
        description: `${selectedTrigger.description} → ${steps.length} action${steps.length > 1 ? 's' : ''}`,
        status: isActive ? 'active' : 'paused',
        category: selectedTrigger.category.toLowerCase(),
        trigger_type: selectedTrigger.type,
        trigger_conditions: showConditions && conditions.length > 0 ? { conditions } : {},
        action_type: steps.map(s => s.type).join(','),
        action_config: {},
        delivery_window: {},
        multi_channel_config: {},
        template_config: {
          steps: steps.map(step => ({
            ...step,
            deliveryWindow: step.deliveryWindow || undefined
          })),
          enabled: isActive,
          timezone: companyTimezone
        },
        execution_count: 0,
        success_count: 0,
        enabled: isActive,
        is_active: isActive,
        workflow_type: 'simple',
        steps: steps,
        settings: {
          enabled: isActive,
          timezone: companyTimezone
        }
      };

      if (workflowId && workflowId !== 'new') {
        // Update existing
        const { error } = await supabase
          .from('automation_workflows')
          .update(workflowData)
          .eq('id', workflowId);
        
        if (error) throw error;
        toast.success('Workflow updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('automation_workflows')
          .insert(workflowData);
        
        if (error) throw error;
        toast.success('Workflow created successfully!');
      }

      onSave?.(workflowData);
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      const errorMessage = error?.message || 'Failed to save workflow';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="workflow-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name" className="text-base font-medium">Automation Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Send appointment reminder"
                className="mt-1.5 text-base"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "status-indicator",
                  isActive ? "active" : "paused"
                )} />
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  id="workflow-active"
                />
                <Label htmlFor="workflow-active" className="cursor-pointer">
                  {isActive ? 'Active' : 'Paused'}
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger Section */}
      <Card className="workflow-card workflow-section">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">When this happens</h3>
                <p className="text-sm text-muted-foreground">Choose a trigger to start your automation</p>
              </div>
            </div>

            <div className="relative">
              <Select
                value={selectedTrigger?.type}
                onValueChange={(value) => {
                  const trigger = TRIGGERS.find(t => t.type === value);
                  setSelectedTrigger(trigger || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a trigger..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {['Jobs', 'Financial', 'Customers', 'Tasks'].map(category => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {TRIGGERS.filter(t => t.category === category).map(trigger => (
                          <SelectItem key={trigger.type} value={trigger.type}>
                            <div className="flex items-center gap-2">
                              <trigger.icon className="w-4 h-4" />
                              {trigger.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {selectedTrigger && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted/30 rounded-lg border border-muted"
              >
                <div className="flex items-start gap-3">
                  <selectedTrigger.icon className={cn(
                    "w-5 h-5 mt-0.5",
                    selectedTrigger.color === 'blue' && "text-blue-600",
                    selectedTrigger.color === 'green' && "text-green-600",
                    selectedTrigger.color === 'purple' && "text-purple-600",
                    selectedTrigger.color === 'red' && "text-red-600",
                    selectedTrigger.color === 'orange' && "text-orange-600",
                    selectedTrigger.color === 'teal' && "text-teal-600"
                  )} />
                  <div>
                    <p className="font-medium">{selectedTrigger.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedTrigger.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add Condition Button */}
            {selectedTrigger && !showConditions && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddCondition}
                  className="w-full justify-center gap-2 text-primary hover:text-primary hover:bg-primary/5 border-dashed border"
                >
                  <Plus className="w-4 h-4" />
                  Add condition (optional)
                </Button>
              </div>
            )}

            {/* Conditions */}
            <AnimatePresence>
              {showConditions && conditions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Conditions</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddCondition}
                        className="h-8 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add 'or' condition
                      </Button>
                    </div>
                    {conditions.map((condition, index) => {
                      const fieldOptions = getFieldOptions(selectedTrigger?.type || '');
                      const selectedField = fieldOptions.find(f => f.value === condition.field);
                      const fieldType = selectedField?.type || 'text';
                      const operatorOptions = getOperatorOptions(fieldType);
                      const valueOptions = getFieldValueOptions(condition.field, automationData);
                      
                      // Debug logging
                      if (condition.field === 'job_tag') {
                        console.log('Job tag field - valueOptions:', valueOptions);
                        console.log('Job tag field - automationData.jobTags:', automationData.jobTags);
                      }
                      
                      return (
                        <div key={index} className="space-y-2">
                          {index > 0 && (
                            <div className="flex items-center gap-2 pl-4">
                              <div className="flex-1 border-t" />
                              <span className="text-xs font-medium text-muted-foreground px-2">
                                {condition.connector?.toUpperCase() || 'AND'}
                              </span>
                              <div className="flex-1 border-t" />
                            </div>
                          )}
                          
                          <div className="condition-row flex items-center gap-2">
                            {index === 0 && <div className="w-20 text-sm text-muted-foreground">Only if...</div>}
                            {index > 0 && <div className="w-20" />}
                            
                            <Select
                              value={condition.field}
                              onValueChange={(value) => {
                                const field = fieldOptions.find(f => f.value === value);
                                handleUpdateCondition(index, { 
                                  field: value, 
                                  fieldType: field?.type || 'text',
                                  operator: 'is',
                                  value: ''
                                });
                              }}
                            >
                              <SelectTrigger className="flex-1 h-9">
                                <SelectValue placeholder="Select property..." />
                              </SelectTrigger>
                              <SelectContent>
                                <ScrollArea className="h-64">
                                  {fieldOptions.map(field => (
                                    <SelectItem key={field.value} value={field.value}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>

                            <Select
                              value={condition.operator}
                              onValueChange={(value) => handleUpdateCondition(index, { operator: value })}
                            >
                              <SelectTrigger className="w-36 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {operatorOptions.map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {fieldType === 'boolean' ? (
                              <Select
                                value={condition.value}
                                onValueChange={(value) => handleUpdateCondition(index, { value })}
                              >
                                <SelectTrigger className="flex-1 h-9">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (fieldType === 'select' || valueOptions.length > 0) ? (
                              <Select
                                value={condition.value}
                                onValueChange={(value) => handleUpdateCondition(index, { value })}
                              >
                                <SelectTrigger className="flex-1 h-9">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-48">
                                    {valueOptions.length > 0 ? (
                                      valueOptions.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="p-2 text-sm text-muted-foreground text-center">
                                        No options available
                                      </div>
                                    )}
                                  </ScrollArea>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={condition.value}
                                onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                                placeholder={fieldType === 'number' ? '0' : 'Enter value...'}
                                type={fieldType === 'number' ? 'number' : 'text'}
                                className="flex-1 h-9"
                              />
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleRemoveCondition(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      {selectedTrigger && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Do this</h3>
                <p className="text-sm text-muted-foreground">Add actions to take when triggered</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Step
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {ACTION_TYPES.map(action => (
                  <DropdownMenuItem
                    key={action.type}
                    onClick={() => handleAddStep(action.type)}
                    className="cursor-pointer"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    <div className="flex-1">
                      <p className="font-medium">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Steps List */}
          {steps.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      index={index}
                      onUpdate={(updates) => handleUpdateStep(index, updates)}
                      onRemove={() => handleRemoveStep(index)}
                      selectedTrigger={selectedTrigger}
                      companyTimezone={companyTimezone}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <Card className="workflow-card border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No actions added yet. Choose an action type to get started.
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Step
                      <ChevronDown className="w-3 h-3 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {ACTION_TYPES.map(action => (
                      <DropdownMenuItem
                        key={action.type}
                        onClick={() => handleAddStep(action.type)}
                        className="cursor-pointer"
                      >
                        <action.icon className="w-4 h-4 mr-2" />
                        <div className="flex-1">
                          <p className="font-medium">{action.name}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Save Button */}
      {selectedTrigger && steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end gap-3 pt-2"
        >
          <Button 
            variant="outline" 
            onClick={() => onSave?.(null)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveWorkflow} 
            disabled={isSaving || !workflowName}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Save className="w-4 h-4" />
                </motion.div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Automation
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleWorkflowBuilder;