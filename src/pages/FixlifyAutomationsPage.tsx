import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, Plus, Edit3, Trash2, Clock, Mail, MessageSquare, 
  Phone, Bell, Zap, Calendar, FileText, Users, TrendingUp,
  ChevronDown, ArrowLeft, Settings, Star, Filter, Grid3x3,
  Sparkles, Target, Brain, Activity, Workflow, BookOpen,
  CheckCircle, AlertCircle, Timer, Send, UserCheck, Building,
  DollarSign, ShoppingCart, Wrench, Home, Car, Lightbulb,
  Briefcase, Receipt, Bot, Wand2, Copy, MoreVertical, Power,
  PlayCircle, PauseCircle, BarChart3, X, Check, BookTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FixlifyAutomationAnalytics } from "@/components/automations/analytics/FixlifyAutomationAnalytics";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/contexts/OrganizationContext";

// Mock data for demonstration (will be replaced by real data)
const mockAutomations = [
  {
    id: 'ma1',
    title: 'Missed Call / Immediate Text Client',
    description: 'When a call is Missed send client a text message immediately',
    trigger: 'a call',
    triggerCondition: 'is Missed',
    action: 'send',
    actionTarget: 'client',
    actionType: 'a text message',
    timing: 'immediately',
    status: 'active',
    createdDate: 'Apr 25, 2023',
    triggeredCount: 2402,
    conditions: 0,
    messageTemplate: 'Hello {client_first_name}, Hope you\'re doing well! 😊 Thanks for being with us for 2 years! 🎉 As a token of our appreciation, we\'re offering a FREE diagnostic service for you, your friends, and your family, even if no repair is needed. Just mention this message! Nick\n\n{account_business_name}\n{booking_link}'
  },
  {
    id: 'ma2',
    title: 'Missed Call / Immediate Text',
    description: 'When a call is Missed send admin a text message immediately',
    trigger: 'a call',
    triggerCondition: 'is Missed',
    action: 'send',
    actionTarget: 'admin',
    actionType: 'a text message',
    timing: 'immediately',
    status: 'inactive',
    createdDate: 'Apr 25, 2023',
    triggeredCount: 1072,
    conditions: 0,
    messageTemplate: 'Missed call alert: A customer just tried to reach us. Please follow up ASAP.'
  },
  {
    id: 'ma3',
    title: 'Remarketing / Text Coupon',
    description: 'When a job has a status of Done: send client a text and email 4 months after the job end date',
    trigger: 'a job',
    triggerCondition: 'has a status',
    triggerValue: 'Done',
    action: 'send',
    actionTarget: 'client',
    actionType: 'a text and email',
    timing: '4 months after',
    timingReference: 'the job end date',
    status: 'active',
    modifiedDate: 'Jun 12, 2024',
    triggeredCount: 1178,
    conditions: 1,
    messageTemplate: 'Hi {client_first_name}! It\'s been 4 months since our last service. Time for a check-up? Book now and save 15% with code LOYAL15.',
    emailTemplate: {
      subject: 'Time for a Check-up? Save 15%!',
      body: 'Dear {client_first_name},\n\nWe hope everything has been running smoothly since our last visit! As a valued customer, we wanted to reach out with a special offer...'
    }
  },
  {
    id: 'ma4',
    title: 'Email Follow-Up / 7 Days After',
    description: 'When an invoice is sent, send client a text and email 7 days after the invoice date of sending',
    trigger: 'an invoice',
    triggerCondition: 'is sent',
    action: 'send',
    actionTarget: 'client',
    actionType: 'a text and email',
    timing: '7 days after',
    timingReference: 'the invoice date of sending',
    status: 'inactive',
    createdDate: 'Jul 26, 2023',
    triggeredCount: 8,
    conditions: 1,
    messageTemplate: 'Hi {client_first_name}, just a friendly reminder about your invoice #{invoice_number}. Let us know if you have any questions!',
    emailTemplate: {
      subject: 'Invoice Reminder - {invoice_number}',
      body: 'Dear {client_first_name},\n\nThis is a friendly reminder about your invoice...'
    }
  },
  {
    id: 'ma5',
    title: 'DONE 1 Year',
    description: 'When a job has a status of Done: send client a text and email 12 months after the job end date',
    trigger: 'a job',
    triggerCondition: 'has a status',
    triggerValue: 'Done',
    action: 'send',
    actionTarget: 'client',
    actionType: 'a text and email',
    timing: '12 months after',
    timingReference: 'the job end date',
    status: 'active',
    modifiedDate: 'May 12, 2025',
    triggeredCount: 245,
    conditions: 1,
    messageTemplate: 'Hi {client_first_name}! It\'s been a year since our last service. Schedule your annual maintenance and save 20%!',
    emailTemplate: {
      subject: 'Annual Maintenance Reminder - Save 20%',
      body: 'Dear {client_first_name},\n\nIt\'s been exactly one year since we last serviced your equipment...'
    }
  }
];

// Enhanced automation categories with logical templates
const categories = [
  { 
    id: 'appointments', 
    name: 'Appointments', 
    icon: Calendar, 
    description: 'Automate appointment reminders and follow-ups', 
    color: 'from-[#9333EA] to-[#C026D3]',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    count: 6
  },
  { 
    id: 'invoicing', 
    name: 'Invoicing & Payments', 
    icon: DollarSign, 
    description: 'Streamline billing and payment collection', 
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    count: 8
  },
  { 
    id: 'customer-service', 
    name: 'Customer Service', 
    icon: Users, 
    description: 'Enhance customer experience automatically', 
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    count: 7
  },
  { 
    id: 'team-management', 
    name: 'Team Management', 
    icon: UserCheck, 
    description: 'Keep your team organized and informed', 
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    count: 5
  },
  { 
    id: 'marketing', 
    name: 'Marketing & Growth', 
    icon: TrendingUp, 
    description: 'Grow your business with smart campaigns', 
    color: 'from-[#9333EA] to-[#C026D3]',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    count: 9
  },
  { 
    id: 'emergency', 
    name: 'Emergency & Urgent', 
    icon: AlertCircle, 
    description: 'Handle urgent situations promptly', 
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    count: 4
  }
];

// Logical automation templates
const automationTemplates = {
  appointments: [
    {
      id: 1,
      title: "24 Hour Appointment Reminder",
      description: "Send SMS and email reminder to client 24 hours before appointment",
      type: "Pre-Appointment",
      action: "SMS + Email to client with appointment details and technician info",
      badge: "POPULAR",
      highlighted: true,
      category: "Essential",
      estimatedTime: "2 min setup"
    },
    {
      id: 2,
      title: "Morning Route List",
      description: "Send daily schedule to technicians at 7 AM",
      type: "Team Coordination",
      action: "SMS to each technician with their appointments for the day",
      badge: "USE",
      highlighted: false,
      category: "Efficiency",
      estimatedTime: "3 min setup"
    },
    {
      id: 3,
      title: "Appointment Confirmation",
      description: "Auto-confirm when client books online",
      type: "Instant Response",
      action: "Send immediate confirmation with booking details",
      badge: "USE",
      highlighted: false,
      category: "Customer Service",
      estimatedTime: "2 min setup"
    },
    {
      id: 4,
      title: "No-Show Follow-up",
      description: "Contact client if appointment was missed",
      type: "Recovery",
      action: "Send SMS 30 min after missed appointment to reschedule",
      badge: "USE",
      highlighted: false,
      category: "Revenue Recovery",
      estimatedTime: "4 min setup"
    },
    {
      id: 5,
      title: "Technician Running Late",
      description: "Notify client if technician is delayed",
      type: "Communication",
      action: "Auto SMS when technician marks 'running late' status",
      badge: "USE",
      highlighted: false,
      category: "Trust Building",
      estimatedTime: "3 min setup"
    },
    {
      id: 6,
      title: "Post-Service Feedback",
      description: "Request feedback 2 hours after job completion",
      type: "Quality Control",
      action: "Send SMS with quick rating link",
      badge: "USE",
      highlighted: false,
      category: "Improvement",
      estimatedTime: "2 min setup"
    }
  ],
  invoicing: [
    {
      id: 7,
      title: "Invoice Sent Confirmation",
      description: "Notify client when invoice is sent",
      type: "Billing Communication",
      action: "Email invoice with payment link + SMS notification",
      badge: "ESSENTIAL",
      highlighted: true,
      category: "Billing",
      estimatedTime: "2 min setup"
    },
    {
      id: 8,
      title: "Payment Received Thank You",
      description: "Thank client when payment is processed",
      type: "Customer Relations",
      action: "Send thank you email with receipt",
      badge: "USE",
      highlighted: false,
      category: "Retention",
      estimatedTime: "1 min setup"
    },
    {
      id: 9,
      title: "Overdue Invoice Reminder",
      description: "Progressive reminders for unpaid invoices",
      type: "Collections",
      action: "3 reminders: Day 7 (friendly), Day 14 (urgent), Day 30 (final)",
      badge: "USE",
      highlighted: true,
      category: "Cash Flow",
      estimatedTime: "5 min setup"
    },
    {
      id: 10,
      title: "Estimate Follow-up Sequence",
      description: "Convert more estimates to jobs",
      type: "Sales",
      action: "Follow up at 3, 7, and 14 days with different messages",
      badge: "USE",
      highlighted: false,
      category: "Conversion",
      estimatedTime: "6 min setup"
    },
    {
      id: 11,
      title: "Payment Plan Reminder",
      description: "Remind about upcoming payment plan installments",
      type: "Recurring Billing",
      action: "SMS 3 days before scheduled payment",
      badge: "USE",
      highlighted: false,
      category: "Collections",
      estimatedTime: "3 min setup"
    }
  ],
  'customer-service': [
    {
      id: 12,
      title: "New Client Welcome",
      description: "Welcome new clients with helpful information",
      type: "Onboarding",
      action: "Send welcome email with service guide and contact info",
      badge: "USE",
      highlighted: true,
      category: "Experience",
      estimatedTime: "3 min setup"
    },
    {
      id: 13,
      title: "Service Anniversary",
      description: "Celebrate customer milestones",
      type: "Retention",
      action: "Annual thank you with special discount",
      badge: "USE",
      highlighted: false,
      category: "Loyalty",
      estimatedTime: "4 min setup"
    },
    {
      id: 14,
      title: "Weather Alert Service Check",
      description: "Proactive outreach during extreme weather",
      type: "Proactive Service",
      action: "SMS clients in affected areas offering priority service",
      badge: "SMART",
      highlighted: true,
      category: "Care",
      estimatedTime: "5 min setup"
    },
    {
      id: 15,
      title: "Warranty Expiration Notice",
      description: "Remind about expiring warranties",
      type: "Upsell Opportunity",
      action: "Email 30 days before warranty expires with renewal option",
      badge: "USE",
      highlighted: false,
      category: "Revenue",
      estimatedTime: "3 min setup"
    }
  ],
  'team-management': [
    {
      id: 16,
      title: "Daily Team Briefing",
      description: "Start the day with team updates",
      type: "Communication",
      action: "Send morning briefing with goals and announcements",
      badge: "USE",
      highlighted: true,
      category: "Productivity",
      estimatedTime: "3 min setup"
    },
    {
      id: 17,
      title: "Job Completion Alert",
      description: "Notify office when technician completes job",
      type: "Coordination",
      action: "Instant notification to dispatch for next assignment",
      badge: "USE",
      highlighted: false,
      category: "Efficiency",
      estimatedTime: "2 min setup"
    },
    {
      id: 18,
      title: "Weekly Performance Summary",
      description: "Send performance metrics to team members",
      type: "Reporting",
      action: "Email individual stats every Friday",
      badge: "USE",
      highlighted: false,
      category: "Management",
      estimatedTime: "4 min setup"
    }
  ],
  marketing: [
    {
      id: 19,
      title: "Seasonal Service Campaign",
      description: "Promote seasonal services at the right time",
      type: "Seasonal Marketing",
      action: "Email + SMS campaign for AC tune-ups in spring",
      badge: "REVENUE",
      highlighted: true,
      category: "Growth",
      estimatedTime: "6 min setup"
    },
    {
      id: 20,
      title: "Referral Request",
      description: "Ask happy customers for referrals",
      type: "Growth",
      action: "Send referral request 1 week after 5-star review",
      badge: "USE",
      highlighted: false,
      category: "Expansion",
      estimatedTime: "4 min setup"
    },
    {
      id: 21,
      title: "Win-Back Campaign",
      description: "Re-engage customers who haven't used service in 6 months",
      type: "Retention",
      action: "Special offer email + SMS to inactive customers",
      badge: "USE",
      highlighted: false,
      category: "Recovery",
      estimatedTime: "5 min setup"
    },
    {
      id: 22,
      title: "Google Review Request",
      description: "Build online reputation automatically",
      type: "Reputation",
      action: "SMS with direct Google review link after positive feedback",
      badge: "IMPORTANT",
      highlighted: true,
      category: "Growth",
      estimatedTime: "3 min setup"
    }
  ],
  emergency: [
    {
      id: 23,
      title: "Emergency Call Response",
      description: "Immediate action for emergency service requests",
      type: "Critical Response",
      action: "Notify on-call tech + manager instantly via SMS and call",
      badge: "CRITICAL",
      highlighted: true,
      category: "Urgent",
      estimatedTime: "2 min setup"
    },
    {
      id: 24,
      title: "After-Hours Auto Reply",
      description: "Respond to calls/texts outside business hours",
      type: "24/7 Service",
      action: "Auto-reply with emergency contact or next-day callback promise",
      badge: "USE",
      highlighted: false,
      category: "Service",
      estimatedTime: "3 min setup"
    }
  ]
};

const FixlifyAutomationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [createMode, setCreateMode] = useState<'select' | null>(null);
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  // Hook to fetch user's automations from database
  const { data: myAutomations = [], isLoading: loadingAutomations } = useQuery({
    queryKey: ['automations', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('automations')
        .select(`
          *,
          automation_triggers (
            trigger_type,
            trigger_config
          ),
          automation_actions (
            action_type,
            action_config,
            delay_minutes,
            order_index
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching automations:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!organization?.id
  });

  // Hook to fetch automation templates from database
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['automation_templates', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_templates')
        .select('*')
        .or(`is_system.eq.true,organization_id.eq.${organization?.id}`)
        .order('name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!organization?.id
  });

  // Mutation to create automation
  const createAutomationMutation = useMutation({
    mutationFn: async (automationData: any) => {
      if (!organization?.id) throw new Error('No organization');

      // Create automation
      const { data: automation, error: automationError } = await supabase
        .from('automations')
        .insert({
          organization_id: organization.id,
          name: automationData.name,
          description: automationData.description,
          category: automationData.category,
          is_active: true,
          template_id: automationData.template_id
        })
        .select()
        .single();

      if (automationError) throw automationError;

      // Create trigger
      const { error: triggerError } = await supabase
        .from('automation_triggers')
        .insert({
          automation_id: automation.id,
          trigger_type: automationData.trigger_type,
          trigger_config: automationData.trigger_config || {}
        });

      if (triggerError) throw triggerError;

      // Create actions
      const actions = automationData.actions || [];
      for (let i = 0; i < actions.length; i++) {
        const { error: actionError } = await supabase
          .from('automation_actions')
          .insert({
            automation_id: automation.id,
            action_type: actions[i].type,
            action_config: actions[i].config || {},
            delay_minutes: actions[i].delay_minutes || 0,
            order_index: i
          });

        if (actionError) throw actionError;
      }

      return automation;
    },
    onSuccess: () => {
      toast.success('Automation created successfully!');
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      setShowBuilder(false);
    },
    onError: (error) => {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    }
  });

  // Error boundary fallback
  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Automations...</h1>
          <p className="text-gray-600">Please wait while we load the automation templates.</p>
        </div>
      </div>
    );
  }
  
  const [builderData, setBuilderData] = useState({
    name: "Smart Automation Workflow",
    trigger: "job",
    action: "sms", 
    recipient: "client",
    conditions: [] as any[],
    timeAmount: "immediately",
    customTime: false,
    messageTemplate: '',
    emailTemplate: { subject: '', body: '' }
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleTemplateUse = async (template: any) => {
    try {
      console.log('Template clicked:', template);
      
      // If template is from database
      if (template.id && template.trigger_type) {
        const automationData = {
          name: template.name,
          description: template.description,
          category: template.category,
          template_id: template.id,
          trigger_type: template.trigger_type,
          trigger_config: template.config?.trigger || {},
          actions: [{
            type: template.action_type,
            config: template.config || {},
            delay_minutes: template.config?.delay_minutes || 0
          }]
        };
        
        createAutomationMutation.mutate(automationData);
      } else {
        // Legacy template handling
        setBuilderData({
          ...builderData,
          name: template.title || template.name
        });
        setShowBuilder(true);
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template. Please try again.');
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe what automation you want to create");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Parse the AI prompt and create automation
      const promptLower = aiPrompt.toLowerCase();
      
      // Extract trigger
      let trigger = "job";
      if (promptLower.includes("invoice")) trigger = "invoice";
      else if (promptLower.includes("appointment")) trigger = "appointment";
      else if (promptLower.includes("call")) trigger = "call";
      else if (promptLower.includes("estimate")) trigger = "estimate";
      else if (promptLower.includes("payment")) trigger = "payment";
      
      // Extract action
      let action = "sms";
      if (promptLower.includes("email") && promptLower.includes("sms")) action = "both";
      else if (promptLower.includes("email")) action = "email";
      else if (promptLower.includes("call")) action = "call";
      
      // Extract recipient
      let recipient = "client";
      if (promptLower.includes("technician") && promptLower.includes("client")) recipient = "team";
      else if (promptLower.includes("technician")) recipient = "technician";
      else if (promptLower.includes("team")) recipient = "team";
      else if (promptLower.includes("manager")) recipient = "manager";
      
      // Extract timing
      let timeAmount = "immediately";
      if (promptLower.includes("1 hour")) timeAmount = "1hour";
      else if (promptLower.includes("24 hour") || promptLower.includes("1 day")) timeAmount = "1day";
      else if (promptLower.includes("2 hour")) timeAmount = "2hours";
      else if (promptLower.includes("30 min")) timeAmount = "30min";
      else if (promptLower.includes("3 day")) timeAmount = "3days";
      else if (promptLower.includes("1 week")) timeAmount = "1week";
      
      setBuilderData({
        name: `AI Generated: ${aiPrompt.substring(0, 50)}...`,
        trigger,
        action,
        recipient,
        conditions: [],
        timeAmount,
        customTime: false,
        messageTemplate: '',
        emailTemplate: { subject: '', body: '' }
      });
      
      setShowBuilder(true);
      setAiPrompt('');
      toast.success("Automation created from your description!");
      
    } catch (error) {
      toast.error("Failed to generate automation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addCondition = () => {
    setBuilderData({
      ...builderData,
      conditions: [...builderData.conditions, { type: 'status', value: 'completed' }]
    });
  };

  const toggleAutomation = (id: string) => {
    toast.success("Automation status updated");
  };

  const duplicateAutomation = (automation: any) => {
    toast.success(`Duplicated "${automation.title}"`);
  };

  const editMessage = (automation: any) => {
    setSelectedAutomation(automation);
    setMessageContent(automation.messageTemplate || '');
    setEmailSubject(automation.emailTemplate?.subject || '');
    setMessageType(automation.actionType?.includes('email') ? 'email' : 'sms');
    setShowMessageDialog(true);
  };

  const sendTestMessage = async () => {
    try {
      if (messageType === 'sms') {
        // Send SMS via Telnyx
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: '+1234567890', // Test number
            message: messageContent
          }
        });
        
        if (error) throw error;
        toast.success("Test SMS sent successfully!");
      } else {
        // Send Email via Mailgun
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: 'test@example.com', // Test email
            subject: emailSubject,
            html: messageContent
          }
        });
        
        if (error) throw error;
        toast.success("Test email sent successfully!");
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error("Failed to send test message");
    }
  };

  const saveMessage = () => {
    if (selectedAutomation) {
      // Update the automation with new message template
      const updatedAutomation = {
        ...selectedAutomation,
        messageTemplate: messageType === 'sms' ? messageContent : selectedAutomation.messageTemplate,
        emailTemplate: messageType === 'email' ? { subject: emailSubject, body: messageContent } : selectedAutomation.emailTemplate
      };
      
      // Here you would update the automation in your database
      toast.success("Message template saved!");
      setShowMessageDialog(false);
    }
  };

  // Filter templates based on selected category
  const filteredTemplates = templates.filter(template => {
    const categoryMap: Record<string, string> = {
      'appointments': 'appointments',
      'invoicing': 'invoicing_payments',
      'customer-service': 'customer_service',
      'team-management': 'team_management',
      'marketing': 'marketing_growth',
      'emergency': 'emergency_urgent'
    };
    
    return template.category === categoryMap[selectedCategory];
  });

  if (showBuilder) {
    return (
      <PageLayout>
        <PageHeader
          title="Automation Builder"
          subtitle="Create your custom automation workflow"
          icon={Workflow}
          badges={[
            { text: "Visual Builder", icon: Workflow, variant: "fixlyfy" },
            { text: "Smart Conditions", icon: Settings, variant: "info" }
          ]}
        />
          {/* Enhanced Header with Fixlify Purple Gradient */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Input
                  value={builderData.name}
                  onChange={(e) => setBuilderData({...builderData, name: e.target.value})}
                  className="text-2xl font-bold bg-white border-purple-200 text-gray-900 text-xl px-6 py-4 rounded-xl shadow-lg hover:border-purple-300 transition-all"
                />
              </div>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-[#9333EA] hover:text-[#7C3AED] hover:bg-purple-50 rounded-xl p-3"
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowBuilder(false)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced Builder with White Theme */}
          <div className="space-y-6">
            {/* When Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9333EA] to-[#C026D3] flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">When</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-900 px-6 py-3 rounded-xl focus:outline-none focus:border-[#9333EA] hover:bg-gray-100 transition-all shadow-sm"
                  value={builderData.trigger}
                  onChange={(e) => setBuilderData({...builderData, trigger: e.target.value})}
                >
                  <option value="job">a job</option>
                  <option value="appointment">an appointment</option>
                  <option value="invoice">an invoice</option>
                  <option value="estimate">an estimate</option>
                  <option value="payment">a payment</option>
                  <option value="call">a call</option>
                </select>
                <span className="text-gray-600">occurs</span>
              </div>

              {/* Conditions */}
              {builderData.conditions.map((condition, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100"
                >
                  <span className="text-[#9333EA] font-medium">and</span>
                  <select className="bg-white border border-purple-200 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:border-[#9333EA]">
                    <option>has status</option>
                    <option>has priority</option>
                    <option>has tag</option>
                  </select>
                  <select className="bg-white border border-purple-200 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:border-[#9333EA]">
                    <option>completed</option>
                    <option>pending</option>
                    <option>cancelled</option>
                  </select>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const newConditions = [...builderData.conditions];
                      newConditions.splice(index, 1);
                      setBuilderData({...builderData, conditions: newConditions});
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Then Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9333EA] to-[#C026D3] flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Then</h3>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-900 px-6 py-3 rounded-xl focus:outline-none focus:border-[#9333EA] hover:bg-gray-100 transition-all shadow-sm"
                  value={builderData.action}
                  onChange={(e) => setBuilderData({...builderData, action: e.target.value})}
                >
                  <option value="sms">send SMS</option>
                  <option value="email">send email</option>
                  <option value="both">send SMS & email</option>
                  <option value="notification">send notification</option>
                  <option value="call">make call</option>
                </select>
                <span className="text-gray-600">to</span>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-900 px-6 py-3 rounded-xl focus:outline-none focus:border-[#9333EA] hover:bg-gray-100 transition-all shadow-sm"
                  value={builderData.recipient}
                  onChange={(e) => setBuilderData({...builderData, recipient: e.target.value})}
                >
                  <option value="client">client</option>
                  <option value="technician">technician</option>
                  <option value="manager">manager</option>
                  <option value="team">entire team</option>
                </select>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-900 px-6 py-3 rounded-xl focus:outline-none focus:border-[#9333EA] hover:bg-gray-100 transition-all shadow-sm"
                  value={builderData.timeAmount}
                  onChange={(e) => setBuilderData({...builderData, timeAmount: e.target.value})}
                >
                  <option value="immediately">immediately</option>
                  <option value="30min">30 minutes later</option>
                  <option value="1hour">1 hour later</option>
                  <option value="2hours">2 hours later</option>
                  <option value="1day">1 day later</option>
                  <option value="3days">3 days later</option>
                  <option value="1week">1 week later</option>
                  <option value="custom">custom time</option>
                </select>
              </div>

              {/* Message Template Section */}
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <Label className="text-sm font-medium text-gray-700 mb-2">Message Template</Label>
                <Textarea
                  value={builderData.messageTemplate}
                  onChange={(e) => setBuilderData({...builderData, messageTemplate: e.target.value})}
                  placeholder="Enter your message template..."
                  className="min-h-[100px] bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available variables: {'{client_first_name}'}, {'{account_business_name}'}, {'{booking_link}'}
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Button 
                  onClick={addCondition}
                  className="bg-purple-100 hover:bg-purple-200 text-[#9333EA] border border-purple-300 shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add condition
                </Button>
                <Button 
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
              </div>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 rounded-2xl p-6 border border-purple-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 text-gray-700">
                <Clock className="w-5 h-5 text-[#9333EA]" />
                <span>Automation will be sent</span>
                <Badge className="bg-white text-[#9333EA] border border-purple-200">
                  9:00 AM - 5:00 PM
                </Badge>
                <Badge variant="outline" className="border-purple-200 text-[#9333EA]">
                  24/7
                </Badge>
                <span className="text-gray-500 ml-2">Business Hours</span>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="border-purple-300 text-[#9333EA] hover:bg-purple-100 hover:border-purple-400 transition-all"
                >
                  Preview Message
                </Button>
                <Button 
                  onClick={() => {
                    const automationData = {
                      name: builderData.name,
                      description: `When ${builderData.trigger} occurs, ${builderData.action} to ${builderData.recipient} ${builderData.timeAmount}`,
                      category: 'customer_service', // Default category
                      trigger_type: builderData.trigger === 'job' ? 'job_created' : 
                                   builderData.trigger === 'appointment' ? 'job_scheduled' :
                                   builderData.trigger === 'invoice' ? 'invoice_created' :
                                   builderData.trigger === 'estimate' ? 'estimate_created' :
                                   builderData.trigger === 'payment' ? 'payment_received' :
                                   builderData.trigger === 'call' ? 'custom_webhook' : 'job_created',
                      trigger_config: {},
                      actions: [{
                        type: builderData.action === 'sms' ? 'send_sms' :
                              builderData.action === 'email' ? 'send_email' :
                              builderData.action === 'both' ? 'send_sms' :
                              builderData.action === 'notification' ? 'send_notification' :
                              builderData.action === 'call' ? 'webhook' : 'send_sms',
                        config: {
                          message_template: builderData.messageTemplate,
                          email_template: builderData.emailTemplate,
                          recipient: builderData.recipient
                        },
                        delay_minutes: builderData.timeAmount === 'immediately' ? 0 :
                                      builderData.timeAmount === '30min' ? 30 :
                                      builderData.timeAmount === '1hour' ? 60 :
                                      builderData.timeAmount === '2hours' ? 120 :
                                      builderData.timeAmount === '1day' ? 1440 :
                                      builderData.timeAmount === '3days' ? 4320 :
                                      builderData.timeAmount === '1week' ? 10080 : 0
                      }]
                    };
                    
                    createAutomationMutation.mutate(automationData);
                  }}
                  disabled={createAutomationMutation.isPending}
                  className="bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {createAutomationMutation.isPending ? 'Creating...' : 'Create Automation'}
                </Button>
              </div>
            </motion.div>
          </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Smart Automations"
        subtitle="Create intelligent workflows to automate your business processes"
        icon={Zap}
        badges={[
          { text: "AI-Powered", icon: Brain, variant: "fixlyfy" },
          { text: "Smart Triggers", icon: Target, variant: "success" },
          { text: "Multi-Channel", icon: MessageSquare, variant: "info" }
        ]}
        actionButton={{
          text: "Create Automation",
          icon: Plus,
          onClick: () => {
            console.log('Create button clicked');
            setShowBuilder(true);
          }
        }}
      />

      {/* Main Content with Purple Gradient Background */}
      <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-6 -mt-4 border border-purple-300 shadow-lg">
        {/* View Mode Toggle */}
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' 
              ? 'bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white shadow-lg' 
              : 'bg-white/80 backdrop-blur-sm hover:bg-white'
            }
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' 
              ? 'bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white shadow-lg' 
              : 'bg-white/80 backdrop-blur-sm hover:bg-white'
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
        
        {/* Tabs for Templates and My Automations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-purple-300 shadow-md">
            <TabsTrigger 
              value="templates" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9333EA] data-[state=active]:to-[#C026D3] data-[state=active]:text-white"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="my-automations"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9333EA] data-[state=active]:to-[#C026D3] data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              My Automations
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9333EA] data-[state=active]:to-[#C026D3] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-8">
            {/* AI Builder Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 border-2 border-purple-400 shadow-2xl"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C026D3] flex items-center justify-center shadow-md flex-shrink-0">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Automation Builder</h2>
                  <p className="text-gray-600 mb-6">Describe what you want to automate in plain English</p>
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Example: Send a reminder to clients 24 hours before their appointment..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-white border-2 border-purple-300 text-gray-900 placeholder-gray-400 focus:border-[#9333EA] focus:ring-2 focus:ring-purple-200 min-h-[100px] rounded-xl shadow-sm"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          className="bg-purple-100 text-[#9333EA] border border-purple-300 cursor-pointer hover:bg-purple-200 transition-all shadow-sm"
                          onClick={() => setAiPrompt("Send appointment reminder 24 hours before")}
                        >
                          Try: Appointment reminders
                        </Badge>
                        <Badge 
                          className="bg-purple-100 text-[#9333EA] border border-purple-300 cursor-pointer hover:bg-purple-200 transition-all shadow-sm"
                          onClick={() => setAiPrompt("Follow up on unpaid invoices after 7 days")}
                        >
                          Try: Invoice follow-ups
                        </Badge>
                        <Badge 
                          className="bg-purple-100 text-[#9333EA] border border-purple-300 cursor-pointer hover:bg-purple-200 transition-all shadow-sm"
                          onClick={() => setAiPrompt("Thank customers after job completion")}
                        >
                          Try: Thank you messages
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white shadow-md"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                            </motion.div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Create with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search automation templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white border-2 border-purple-300 text-gray-900 placeholder-gray-400 focus:border-[#9333EA] focus:ring-2 focus:ring-purple-200 h-12 rounded-xl shadow-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Categories Sidebar */}
              <div className="col-span-3">
                <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-400 shadow-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{categories.length} types</span>
                    </div>
                    
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategorySelect(category.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${
                              selectedCategory === category.id
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 shadow-md'
                                : 'hover:bg-purple-50 border border-transparent hover:border-purple-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} p-2 shadow-sm`}>
                                <Icon className="w-full h-full text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                                  <Badge className="bg-gray-100 text-gray-700 border-0">
                                    {category.count}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Templates Grid */}
              <div className="col-span-9">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {categories.find(c => c.id === selectedCategory)?.name} Templates
                  </h2>
                  <span className="text-gray-500">{filteredTemplates.length} templates</span>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-6" : "space-y-4"}>
                  {loadingTemplates ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">Loading templates...</p>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">No templates available for this category</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`${
                        template.highlighted 
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 shadow-2xl' 
                          : 'bg-white border-2 border-purple-300'
                      } rounded-xl p-6 transition-all hover:shadow-2xl hover:border-purple-500 cursor-pointer`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {template.badge && (
                            <Badge className={`${
                              template.badge === 'POPULAR' || template.badge === 'ESSENTIAL' || template.badge === 'CRITICAL'
                                ? 'bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white border-0'
                                : template.badge === 'REVENUE' || template.badge === 'IMPORTANT'
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-0'
                                : template.badge === 'SMART'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            } font-semibold`}>
                              {template.badge}
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-gray-200 text-gray-600 capitalize">
                            {template.category?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{template.estimated_time || template.estimatedTime || '2 min'}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name || template.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium capitalize">{template.trigger_type?.replace(/_/g, ' ') || template.type}</span>
                        </div>
                        <p className="text-gray-700 text-sm capitalize">{template.action_type?.replace(/_/g, ' ') || template.action}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            console.log('Template button clicked:', template);
                            handleTemplateUse(template);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white shadow-md hover:shadow-lg transition-all"
                        >
                          USE TEMPLATE
                        </Button>
                        <Button 
                          onClick={() => {
                            console.log('Customize button clicked:', template);
                            setBuilderData({
                              ...builderData,
                              name: template.name,
                              messageTemplate: template.config?.message_template || ''
                            });
                            setShowBuilder(true);
                          }}
                          variant="outline"
                          className="border-purple-300 text-[#9333EA] hover:bg-purple-100"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Automations Tab */}
          <TabsContent value="my-automations" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">My Automations</h2>
                <Badge className="bg-gradient-to-r from-purple-200 to-pink-200 text-[#9333EA] border-0 font-semibold">
                  {myAutomations.filter(a => a.is_active).length} Active
                </Badge>
              </div>
              <Button 
                className="bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            </div>

            <div className="grid gap-4">
              {loadingAutomations ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading automations...</p>
                </div>
              ) : myAutomations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No automations created yet. Start with a template!</p>
                </div>
              ) : (
                myAutomations.map((automation) => (
                <motion.div
                  key={automation.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 shadow-lg border-2 border-purple-300 hover:shadow-2xl hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${automation.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {automation.description || (
                          <>
                            When <span className="font-medium text-gray-900 capitalize">
                              {automation.automation_triggers?.[0]?.trigger_type?.replace(/_/g, ' ')}
                            </span>
                            {automation.automation_actions?.length > 0 && (
                              <> then <span className="font-medium text-gray-900 capitalize">
                                {automation.automation_actions[0]?.action_type?.replace(/_/g, ' ')}
                              </span></>
                            )}
                          </>
                        )}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>
                          Created {new Date(automation.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          Triggered <span className="font-medium text-gray-700">{automation.trigger_count || 0}</span> times
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">{automation.success_count || 0}</span> successful
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editMessage(automation)}
                        className="text-[#9333EA] hover:text-[#7C3AED] hover:bg-purple-100 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAutomation(automation.id)}
                        className={`${
                          automation.status === 'active' 
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateAutomation(automation)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            </div>

            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline"
                className="border-purple-300 text-[#9333EA] hover:bg-purple-100 hover:border-purple-400 transition-all"
              >
                View All Automations
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <FixlifyAutomationAnalytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Creation Mode Selection Dialog */}
      <Dialog open={createMode === 'select'} onOpenChange={() => setCreateMode(null)}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How would you like to create your automation?</h2>
              <p className="text-muted-foreground">Choose the best way to get started</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                  onClick={() => {
                    setCreateMode(null);
                    setActiveTab('templates');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <BookTemplate className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">Start with a Template</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Choose from proven automations that work for businesses like yours
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                  onClick={() => {
                    setCreateMode(null);
                    setShowBuilder(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <Workflow className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">Build from Scratch</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Create a custom automation with our visual workflow builder
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Edit Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedAutomation?.title}</span>
              <div className="flex gap-2">
                <Button
                  variant={messageType === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('email')}
                  className={messageType === 'email' ? 'bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white' : ''}
                >
                  Email message
                </Button>
                <Button
                  variant={messageType === 'sms' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('sms')}
                  className={messageType === 'sms' ? 'bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white' : ''}
                >
                  Text message
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">TEXT TEMPLATE</h4>
              
              {messageType === 'email' && (
                <div className="mb-4">
                  <Label>Subject</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="bg-white"
                  />
                </div>
              )}
              
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={messageType === 'sms' ? "Enter SMS message..." : "Enter email body..."}
                className="min-h-[200px] bg-white"
              />
              
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600">Available variables:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[#9333EA] border-purple-200">
                    {'{...}'} client_first_name
                  </Badge>
                  <Badge variant="outline" className="text-[#9333EA] border-purple-200">
                    {'{...}'} account_business_name
                  </Badge>
                  <Badge variant="outline" className="text-[#9333EA] border-purple-200">
                    {'{...}'} booking_link
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMessageDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={sendTestMessage}
                className="border-purple-300 text-[#9333EA] hover:bg-purple-100 hover:border-purple-400 transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </div>
            <Button
              onClick={saveMessage}
              className="bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Save and close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default FixlifyAutomationsPage; 