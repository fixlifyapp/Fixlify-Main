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
import { Card } from '@/components/ui/card';
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
import { testEdgeFunction } from '@/utils/test-edge-function';
import { useJobStatuses } from '@/hooks/useConfigItems';
import { useQuery } from '@tanstack/react-query';
import { automationVariables } from '@/utils/automation-variables';

// Canvas for 3D background
import * as THREE from 'three';

// 3D Background Component
const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create particle system
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      // Purple to pink gradient colors
      colors[i] = 0.54 + Math.random() * 0.2; // R
      colors[i + 1] = 0.3 + Math.random() * 0.2; // G
      colors[i + 2] = 0.84 + Math.random() * 0.2; // B
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Create connection lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(200 * 3);
    
    for (let i = 0; i < 200 * 3; i += 6) {
      linePositions[i] = (Math.random() - 0.5) * 8;
      linePositions[i + 1] = (Math.random() - 0.5) * 8;
      linePositions[i + 2] = (Math.random() - 0.5) * 8;
      linePositions[i + 3] = (Math.random() - 0.5) * 8;
      linePositions[i + 4] = (Math.random() - 0.5) * 8;
      linePositions[i + 5] = (Math.random() - 0.5) * 8;
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x8a4dd5,
      transparent: true,
      opacity: 0.2
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Animation
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.001;

      particleSystem.rotation.y = time * 0.2;
      particleSystem.rotation.x = time * 0.1;
      lines.rotation.y = -time * 0.1;
      lines.rotation.z = time * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
};
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

interface Variable {
  key: string;
  label: string;
  description: string;
  category: string;
  source?: string; // database table/column
  type?: string; // data type
  example?: string; // example value
};

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
  const [messageEditorOpen, setMessageEditorOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
  const [statusFrom, setStatusFrom] = useState<string>('');
  const [statusTo, setStatusTo] = useState<string>('');
  const [variableSearch, setVariableSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { user } = useAuth();
  const { organization } = useOrganization();
  const { generateText, isLoading: aiLoading } = useAI({
    systemContext: "You are an expert at creating professional business messages and automation rules. Help write clear, engaging messages for field service businesses.",
    mode: "business"
  });
  
  // Fetch actual job statuses from settings
  const { items: customJobStatuses, isLoading: statusesLoading } = useJobStatuses();
  
  // Fetch services/products
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Enhanced AI examples with rotating effect
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
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % aiExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced system variables with database sources and examples
  const systemVariables: Variable[] = [
    // Client Variables - from 'clients' table
    { key: '{{client_name}}', label: 'Client Name', description: 'Full name of the client', category: 'Client', source: 'clients.name', type: 'text', example: 'John Smith' },
    { key: '{{client_first_name}}', label: 'Client First Name', description: 'First name only', category: 'Client', source: 'calculated', type: 'text', example: 'John' },
    { key: '{{client_email}}', label: 'Client Email', description: 'Client email address', category: 'Client', source: 'clients.email', type: 'email', example: 'john@example.com' },
    { key: '{{client_phone}}', label: 'Client Phone', description: 'Client phone number', category: 'Client', source: 'clients.phone', type: 'phone', example: '(555) 123-4567' },
    { key: '{{client_address}}', label: 'Client Address', description: 'Full service address', category: 'Client', source: 'clients.address', type: 'text', example: '123 Main St' },
    { key: '{{client_city}}', label: 'Client City', description: 'Client city', category: 'Client', source: 'clients.city', type: 'text', example: 'New York' },
    { key: '{{client_state}}', label: 'Client State', description: 'Client state', category: 'Client', source: 'clients.state', type: 'text', example: 'NY' },
    { key: '{{client_zip}}', label: 'Client ZIP', description: 'Client ZIP code', category: 'Client', source: 'clients.zip', type: 'text', example: '10001' },
    { key: '{{client_type}}', label: 'Client Type', description: 'Residential or Commercial', category: 'Client', source: 'clients.type', type: 'text', example: 'Residential' },
    
    // Job Variables - from 'jobs' table
    { key: '{{job_title}}', label: 'Job Title', description: 'Title of the job/service', category: 'Job', source: 'jobs.title', type: 'text', example: 'AC Maintenance' },
    { key: '{{job_description}}', label: 'Job Description', description: 'Detailed job description', category: 'Job', source: 'jobs.description', type: 'text', example: 'Annual AC tune-up' },
    { key: '{{job_type}}', label: 'Job Type', description: 'Type of service', category: 'Job', source: 'jobs.job_type', type: 'text', example: 'Maintenance' },
    { key: '{{job_service}}', label: 'Service Type', description: 'Service category', category: 'Job', source: 'jobs.service', type: 'text', example: 'HVAC' },
    { key: '{{scheduled_date}}', label: 'Scheduled Date', description: 'Date of appointment', category: 'Job', source: 'jobs.scheduled_date', type: 'date', example: 'Jan 15, 2025' },
    { key: '{{scheduled_time}}', label: 'Scheduled Time', description: 'Time of appointment', category: 'Job', source: 'jobs.scheduled_time', type: 'time', example: '2:00 PM' },
    { key: '{{job_status}}', label: 'Job Status', description: 'Current job status', category: 'Job', source: 'jobs.status', type: 'text', example: 'Scheduled' },    { key: '{{job_number}}', label: 'Job Number', description: 'Unique job identifier', category: 'Job', source: 'jobs.id', type: 'text', example: 'JOB-2025-001' },
    { key: '{{job_address}}', label: 'Job Address', description: 'Service location', category: 'Job', source: 'jobs.address', type: 'text', example: '456 Oak Ave' },
    { key: '{{job_duration}}', label: 'Job Duration', description: 'Estimated duration', category: 'Job', source: 'calculated', type: 'text', example: '2 hours' },
    
    // Technician Variables - from 'profiles' table
    { key: '{{technician_name}}', label: 'Technician Name', description: 'Assigned technician', category: 'Team', source: 'profiles.name', type: 'text', example: 'Mike Johnson' },
    { key: '{{technician_phone}}', label: 'Technician Phone', description: 'Technician contact', category: 'Team', source: 'profiles.phone', type: 'phone', example: '(555) 987-6543' },
    { key: '{{technician_email}}', label: 'Technician Email', description: 'Technician email', category: 'Team', source: 'profiles.email', type: 'email', example: 'mike@company.com' },
    
    // Financial Variables - from 'invoices' table
    { key: '{{invoice_number}}', label: 'Invoice Number', description: 'Invoice identifier', category: 'Financial', source: 'invoices.invoice_number', type: 'text', example: 'INV-2025-001' },
    { key: '{{total_amount}}', label: 'Total Amount', description: 'Total invoice amount', category: 'Financial', source: 'invoices.total', type: 'currency', example: '$250.00' },
    { key: '{{amount_due}}', label: 'Amount Due', description: 'Outstanding balance', category: 'Financial', source: 'invoices.balance_due', type: 'currency', example: '$125.00' },
    { key: '{{due_date}}', label: 'Due Date', description: 'Payment due date', category: 'Financial', source: 'invoices.due_date', type: 'date', example: 'Jan 30, 2025' },
    { key: '{{days_overdue}}', label: 'Days Overdue', description: 'Days past due', category: 'Financial', source: 'calculated', type: 'number', example: '3' },
    { key: '{{payment_link}}', label: 'Payment Link', description: 'Online payment URL', category: 'Financial', source: 'calculated', type: 'url', example: 'https://pay.company.com/abc123' },
    
    // Company Variables - from 'profiles' table (organization)
    { key: '{{company_name}}', label: 'Company Name', description: 'Your business name', category: 'Company', source: 'organization.name', type: 'text', example: 'ABC Service Co' },
    { key: '{{company_phone}}', label: 'Company Phone', description: 'Main business phone', category: 'Company', source: 'organization.phone', type: 'phone', example: '(555) 100-2000' },
    { key: '{{company_email}}', label: 'Company Email', description: 'Business email', category: 'Company', source: 'organization.email', type: 'email', example: 'info@company.com' },
    { key: '{{company_website}}', label: 'Company Website', description: 'Business website URL', category: 'Company', source: 'settings.website', type: 'url', example: 'www.company.com' },
    { key: '{{booking_link}}', label: 'Booking Link', description: 'Online booking URL', category: 'Company', source: 'settings.booking_link', type: 'url', example: 'book.company.com' },
    { key: '{{review_link}}', label: 'Review Link', description: 'Google/Yelp review URL', category: 'Company', source: 'settings.review_link', type: 'url', example: 'g.page/review' },
    
    // Date/Time Variables
    { key: '{{current_date}}', label: 'Current Date', description: 'Today\'s date', category: 'DateTime', source: 'calculated', type: 'date', example: 'Jan 15, 2025' },
    { key: '{{current_time}}', label: 'Current Time', description: 'Current time', category: 'DateTime', source: 'calculated', type: 'time', example: '3:30 PM' },
    { key: '{{tomorrow_date}}', label: 'Tomorrow Date', description: 'Tomorrow\'s date', category: 'DateTime', source: 'calculated', type: 'date', example: 'Jan 16, 2025' },
  ];
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
    return Zap; // Default icon
  };

  // Transform custom job statuses into the format needed by the UI
  const jobStatuses = React.useMemo(() => {
    if (!customJobStatuses || customJobStatuses.length === 0) {
      // Return default statuses if none are configured
      return [
        { value: 'pending', label: 'Pending', color: 'orange', icon: Clock, description: 'Awaiting confirmation' },
        { value: 'scheduled', label: 'Scheduled', color: 'blue', icon: Calendar, description: 'Appointment confirmed' },
        { value: 'in_progress', label: 'In Progress', color: 'yellow', icon: Activity, description: 'Work in progress' },
        { value: 'completed', label: 'Completed', color: 'green', icon: CheckCircle, description: 'Job finished' },
        { value: 'cancelled', label: 'Cancelled', color: 'red', icon: X, description: 'Job cancelled' }
      ];
    }
    
    // Map custom statuses to the format expected by the UI
    return customJobStatuses.map(status => ({
      value: status.name.toLowerCase().replace(/\s+/g, '_'),
      label: status.name,
      color: status.color || 'gray',
      icon: getIconForStatus(status.name),
      description: status.description || ''
    }));
  }, [customJobStatuses]);

  // Enhanced triggers with better categorization (synced with actual system events)
  const triggerTypes = [
    // Status Change Triggers (Dynamic based on configured statuses)
    { value: 'job_status_changed', label: 'Job Status Changed', icon: RefreshCw, category: 'Status', needsCondition: true, conditionType: 'status_change' },
    { value: 'job_status_to', label: 'Job Status Changes To', icon: ArrowRight, category: 'Status', needsCondition: true, conditionType: 'status_to' },
    { value: 'job_status_from', label: 'Job Status Changes From', icon: ArrowRight, category: 'Status', needsCondition: true, conditionType: 'status_from' },
    
    // Job Lifecycle Triggers
    { value: 'job_created', label: 'New Job Created', icon: Plus, category: 'Job Lifecycle' },
    { value: 'job_assigned', label: 'Job Assigned to Tech', icon: Users, category: 'Job Lifecycle' },
    { value: 'job_unassigned', label: 'Job Unassigned', icon: Users, category: 'Job Lifecycle' },
    { value: 'job_completed', label: 'Job Completed', icon: CheckCircle, category: 'Job Lifecycle' },
    { value: 'job_cancelled', label: 'Job Cancelled', icon: X, category: 'Job Lifecycle' },
    
    // Time-Based Triggers
    { value: 'appointment_tomorrow', label: 'Appointment Tomorrow', icon: Calendar, category: 'Time Based' },
    { value: 'appointment_today', label: 'Appointment Today', icon: Calendar, category: 'Time Based' },
    { value: 'appointment_in_1_hour', label: 'Appointment in 1 Hour', icon: Clock, category: 'Time Based' },
    { value: 'job_overdue', label: 'Job Overdue', icon: AlertTriangle, category: 'Time Based' },
    { value: 'follow_up_due', label: 'Follow-up Due', icon: Bell, category: 'Time Based' },
    
    // Client Triggers
    { value: 'new_client', label: 'New Client Added', icon: Users, category: 'Client' },
    { value: 'client_birthday', label: 'Client Birthday', icon: Calendar, category: 'Client' },
    { value: 'client_anniversary', label: 'Service Anniversary', icon: Star, category: 'Client' },
    { value: 'client_inactive', label: 'Client Inactive (90 days)', icon: Clock, category: 'Client' },
    
    // Financial Triggers
    { value: 'estimate_sent', label: 'Estimate Sent', icon: FileText, category: 'Financial' },
    { value: 'estimate_approved', label: 'Estimate Approved', icon: CheckCircle, category: 'Financial' },
    { value: 'invoice_created', label: 'Invoice Created', icon: DollarSign, category: 'Financial' },
    { value: 'invoice_overdue', label: 'Invoice Overdue', icon: AlertTriangle, category: 'Financial' },
    { value: 'payment_received', label: 'Payment Received', icon: DollarSign, category: 'Financial' },
    
    // Communication Triggers
    { value: 'missed_call', label: 'Missed Call', icon: Phone, category: 'Communication' },
    { value: 'customer_inquiry', label: 'Customer Inquiry', icon: MessageSquare, category: 'Communication' },
    { value: 'review_submitted', label: 'Review Submitted', icon: Star, category: 'Communication' },
  ];

  // Enhanced actions with better categorization
  const actionTypes = [
    // Communication Actions
    { value: 'send_sms', label: 'Send SMS', icon: MessageSquare, category: 'Communication' },
    { value: 'send_email', label: 'Send Email', icon: Mail, category: 'Communication' },
    { value: 'send_notification', label: 'Send Push Notification', icon: Bell, category: 'Communication' },
    
    // Job Management Actions
    { value: 'update_job_status', label: 'Update Job Status', icon: RefreshCw, category: 'Job' },
    { value: 'assign_technician', label: 'Assign Technician', icon: Users, category: 'Job' },
    { value: 'create_follow_up_job', label: 'Create Follow-up Job', icon: Plus, category: 'Job' },
    { value: 'add_job_note', label: 'Add Job Note', icon: FileText, category: 'Job' },
    
    // Task Actions
    { value: 'create_task', label: 'Create Task', icon: CheckCircle, category: 'Task' },
    { value: 'schedule_callback', label: 'Schedule Callback', icon: Phone, category: 'Task' },
    
    // Customer Actions
    { value: 'send_review_request', label: 'Request Review', icon: Star, category: 'Customer' },
    { value: 'update_client_tag', label: 'Update Client Tag', icon: Tag, category: 'Customer' },
    { value: 'add_to_campaign', label: 'Add to Campaign', icon: Megaphone, category: 'Customer' },
    
    // Team Actions
    { value: 'notify_team', label: 'Notify Team', icon: Users, category: 'Team' },
    { value: 'notify_manager', label: 'Notify Manager', icon: Shield, category: 'Team' },
    
    // Financial Actions
    { value: 'send_payment_reminder', label: 'Payment Reminder', icon: DollarSign, category: 'Financial' },
    { value: 'apply_discount', label: 'Apply Discount', icon: Tag, category: 'Financial' },
  ];

  // Create automation from template with enhanced status handling
  const createTemplateAutomation = (templateId: string) => {
    const allTemplates = Object.values(getTemplatesByCategory()).flat();
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedRule(template.rule);
      // Extract status conditions for better handling
      if (template.rule.trigger.conditions) {
        const statusFromCondition = template.rule.trigger.conditions.find((c: any) => c.field === 'status_from');
        const statusToCondition = template.rule.trigger.conditions.find((c: any) => c.field === 'status_to' || c.field === 'status');
        
        if (statusFromCondition) {
          setStatusFrom(statusFromCondition.value);
        }
        if (statusToCondition) {
          setStatusTo(statusToCondition.value);
        }
      }
      // Handle newer format with direct status properties
      if (template.rule.trigger.statusFrom) {
        setStatusFrom(template.rule.trigger.statusFrom);
      }
      if (template.rule.trigger.statusTo) {
        setStatusTo(template.rule.trigger.statusTo);
      }
      setBuilderOpen(true);
    }
  };
  // Get business-specific recommendations with enhanced templates
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
      plumbing: [
        {
          title: 'Water Heater Maintenance',
          description: 'Annual water heater flush reminders to extend equipment life',
          icon: Wrench,
          templateId: 'water_heater_maintenance',
          metrics: { avgOpenRate: '82%', conversionRate: '38%', timeSaved: '1.5hrs/week' }
        },
        {
          title: 'Pipe Winterization',
          description: 'Seasonal reminders to prevent frozen pipes',
          icon: Shield,
          templateId: 'winterization_reminder',
          metrics: { avgOpenRate: '88%', conversionRate: '45%', preventedIssues: '90%' }
        },        {
          title: 'Leak Detection Follow-up',
          description: 'Check-in after leak repairs to ensure customer satisfaction',
          icon: CheckCircle,
          templateId: 'leak_followup',
          metrics: { satisfaction: '92%', reviews: '+40%', timeSaved: '45min/job' }
        }
      ],
      electrical: [
        {
          title: 'Safety Inspection Reminders',
          description: 'Annual electrical safety inspection reminders',
          icon: Shield,
          templateId: 'safety_inspection',
          metrics: { avgOpenRate: '80%', conversionRate: '35%', compliance: '95%' }
        },
        {
          title: 'Surge Protector Check',
          description: 'Remind customers to check surge protectors after storms',
          icon: Zap,
          templateId: 'surge_check',
          metrics: { avgOpenRate: '75%', preventedDamage: '$5k/year', timeSaved: '1hr/week' }
        },
        {
          title: 'Panel Upgrade Offers',
          description: 'Send upgrade offers when old panels are detected',
          icon: TrendingUp,
          templateId: 'panel_upgrade',
          metrics: { conversionRate: '28%', avgJobValue: '$2,500', roi: '350%' }
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
        },        {
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

  // Enhanced templates with better status change handling
  const getTemplatesByCategory = () => {
    const businessType = organization?.business_type || 'field_service';
    
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
            },            multiChannel: { 
              primaryChannel: 'sms' as const, 
              fallbackEnabled: true, 
              fallbackChannel: 'email' as const,
              fallbackDelayHours: 2 
            },
            deliveryWindow: {
              businessHoursOnly: true,
              allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
              timeRange: { start: '9:00', end: '18:00' }
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
            },
            multiChannel: { 
              primaryChannel: 'sms' as const, 
              fallbackEnabled: false,
              fallbackDelayHours: 0
            }
          }
        },        {
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
        },
        {
          id: 'status_change_notification',
          name: 'Job Status Change Notification',
          description: 'Notify customer when job status changes',
          icon: RefreshCw,
          gradient: 'from-purple-500 to-purple-600',
          popularity: 82,
          avgTimesSaved: '1.5 hrs/week',
          rule: {
            name: 'Job Status Change Notification',
            description: 'Keep customers informed of job progress',
            status: 'active' as const,
            trigger: { 
              type: 'job_status_changed', 
              statusFrom: 'scheduled',
              statusTo: 'in_progress',
              conditions: []
            },            action: {
              type: 'send_sms',
              config: {
                message: `Hi {{client_first_name}}, good news! {{technician_name}} is now on the way to your location for your {{job_title}}.

Estimated arrival: 30-45 minutes
Address: {{job_address}}

Track technician: {{tracking_link}}`
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
            },            action: {
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

If you've already sent payment, please disregard this notice. If you have any questions about your invoice, we're here to help!

Best regards,
{{company_name}}
{{company_phone}}`
              },
              delay: { type: 'immediate' }
            },
            multiChannel: { 
              primaryChannel: 'email' as const, 
              fallbackEnabled: true,
              fallbackChannel: 'sms' as const,
              fallbackDelayHours: 24
            }
          }
        },
        {
          id: 'payment_received',
          name: 'Payment Thank You',
          description: 'Thank customer when payment is received',
          icon: CheckCircle,
          gradient: 'from-green-500 to-green-600',
          popularity: 85,
          avgTimesSaved: '1 hr/week',          rule: {
            name: 'Payment Thank You',
            description: 'Acknowledge payment receipt',
            status: 'active' as const,
            trigger: { type: 'payment_received', conditions: [] },
            action: {
              type: 'send_sms',
              config: {
                message: `Hi {{client_first_name}}! We've received your payment of {{total_amount}} for invoice #{{invoice_number}}. 

Thank you for your prompt payment! 

- {{company_name}}`
              },
              delay: { type: 'immediate' }
            }
          }
        }
      ],
      'Job Management': [
        {
          id: 'job_scheduled_tech',
          name: 'Technician Assignment Alert',
          description: 'Notify technician when assigned to a job',
          icon: Users,
          gradient: 'from-purple-500 to-purple-600',
          popularity: 79,
          avgTimesSaved: '45 min/week',
          rule: {
            name: 'Technician Assignment Alert',
            description: 'Alert tech of new assignment',
            status: 'active' as const,
            trigger: { 
              type: 'job_status_to',
              statusTo: 'scheduled',
              conditions: [
                { field: 'technician_id', operator: 'not_empty' }
              ]
            },            action: {
              type: 'send_sms',
              config: {
                recipient: 'technician',
                message: `New job assigned to you!

Client: {{client_name}}
Address: {{job_address}}
Service: {{job_title}}
Date: {{scheduled_date}} at {{scheduled_time}}

View details in the app.`
              },
              delay: { type: 'immediate' }
            }
          }
        },
        {
          id: 'job_status_workflow',
          name: 'Automated Status Workflow',
          description: 'Move jobs through statuses automatically',
          icon: Workflow,
          gradient: 'from-indigo-500 to-indigo-600',
          popularity: 73,
          avgTimesSaved: '2 hrs/week',
          rule: {
            name: 'Automated Status Workflow',
            description: 'Progress jobs through workflow stages',
            status: 'active' as const,
            trigger: { 
              type: 'job_status_changed',
              statusFrom: 'pending',
              statusTo: 'scheduled',
              conditions: []
            },
            action: {
              type: 'create_task',
              config: {
                title: 'Prepare for {{job_title}}',
                description: 'Review job requirements and prepare necessary equipment',
                assignTo: 'technician',
                dueDate: 'scheduled_date'
              },
              delay: { type: 'immediate' }
            }
          }
        }
      ]
    };
    // Add business-specific templates
    if (businessType === 'hvac') {
      baseTemplates['Service & Maintenance'] = [
        {
          id: 'seasonal_hvac',
          name: 'Seasonal HVAC Maintenance',
          description: 'Spring AC / Fall heating maintenance reminders',
          icon: Calendar,
          gradient: 'from-cyan-500 to-cyan-600',
          popularity: 94,
          avgTimesSaved: '4 hrs/week',
          rule: {
            name: 'Seasonal HVAC Maintenance',
            description: 'Seasonal maintenance reminder',
            status: 'active' as const,
            trigger: { 
              type: 'seasonal_reminder',
              conditions: [
                { field: 'season', operator: 'equals', value: 'spring' },
                { field: 'service_type', operator: 'equals', value: 'hvac' }
              ]
            },
            action: {
              type: 'send_email',
              config: {
                subject: '🌡️ Time for Your Seasonal HVAC Maintenance',
                body: `Hi {{client_name}},

Spring is here! Time to ensure your AC is ready for the warm months ahead.

Our spring maintenance special includes:
✓ Complete AC system inspection
✓ Filter replacement
✓ Coil cleaning
✓ Refrigerant check
✓ Thermostat calibration

Schedule online: {{booking_link}}
Or call us: {{company_phone}}

Regular maintenance can:
• Lower energy bills by up to 30%
• Extend equipment life by 5-10 years
• Prevent unexpected breakdowns

Best regards,
{{company_name}}`
              }
            },            multiChannel: { 
              primaryChannel: 'email' as const, 
              fallbackEnabled: true,
              fallbackChannel: 'sms' as const,
              fallbackDelayHours: 48
            }
          }
        }
      ];
    }

    return baseTemplates;
  };

  // Handle template selection with enhanced status handling
  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setSelectedRule(template.rule);
    
    // Clear previous status values
    setStatusFrom('');
    setStatusTo('');
    
    // Extract status conditions based on trigger type
    if (template.rule.trigger.statusFrom) {
      setStatusFrom(template.rule.trigger.statusFrom);
    }
    if (template.rule.trigger.statusTo) {
      setStatusTo(template.rule.trigger.statusTo);
    }
    
    // Legacy condition handling
    if (template.rule.trigger.conditions) {
      const statusFromCond = template.rule.trigger.conditions.find((c: any) => c.field === 'status_from');
      const statusToCond = template.rule.trigger.conditions.find((c: any) => c.field === 'status_to' || c.field === 'status');
      
      if (statusFromCond) {
        setStatusFrom(statusFromCond.value);
      }
      if (statusToCond) {
        setStatusTo(statusToCond.value);
      }
    }
    
    setBuilderOpen(true);
  };
  // AI Automation Builder with better prompt handling
  const handleAIAutomationCreate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the automation you want to create');
      return;
    }

    try {
      // Get available status values
      const statusValues = jobStatuses.map(s => s.value).join(', ');
      const triggerList = triggerTypes.map(t => t.value).join(', ');
      const actionList = actionTypes.map(a => a.value).join(', ');
      
      const prompt = `
You are an automation builder. Create a JSON automation rule for: "${aiPrompt}"

IMPORTANT: Return ONLY valid JSON, no explanations or markdown. The response must be parseable JSON.

Use this exact structure:
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
  },
  "multiChannel": {
    "primaryChannel": "sms",
    "fallbackEnabled": false,
    "fallbackChannel": "email",
    "fallbackDelayHours": 2
  }
}

Available triggers: ${triggerList}
Available actions: ${actionList}
Available statuses: ${statusValues}
`;

      const response = await generateText(prompt);
      console.log('Raw AI response:', response);
      console.log('Response type:', typeof response);
      
      if (response) {
        try {
          // Check if response is already an object
          let automationRule;
          if (typeof response === 'string') {
            // If it's a string, try to extract JSON from it
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              automationRule = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } else if (typeof response === 'object') {
            // If it's already an object, use it directly
            automationRule = response;
          } else {
            throw new Error('Invalid response type');
          }
          
          console.log('Parsed automation rule:', automationRule);
          setSelectedRule(automationRule);
          
          // Extract status values if present
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
          console.error('Failed to parse AI response:', parseError);
          console.error('Raw response that failed:', response);
          
          // Try alternative parsing methods
          try {
            // Try to extract JSON from markdown code blocks
            const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
              const automationRule = JSON.parse(codeBlockMatch[1].trim());
              console.log('Extracted from code block:', automationRule);
              setSelectedRule(automationRule);
              setBuilderOpen(true);
              setAiPrompt('');
              toast.success('AI automation created! Review and save when ready.');
              return;
            }
          } catch (e) {
            console.error('Alternative parsing also failed:', e);
          }
          
          toast.error('AI generated invalid automation format. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating AI automation:', error);
      toast.error('Failed to create AI automation');
    }
  };
  // AI Message Enhancement
  const enhanceMessage = async () => {
    if (!currentMessage.trim()) {
      toast.error('Please enter a message to enhance');
      return;
    }

    try {
      const prompt = `Enhance this ${messageType} message for a ${organization?.business_type || 'field service'} business. Make it professional, friendly, and action-oriented. Keep it concise for SMS (under 160 chars) or well-formatted for email. Preserve all {{variables}}:

Original: "${currentMessage}"

Enhanced:`;

      const enhanced = await generateText(prompt);
      if (enhanced) {
        setCurrentMessage(enhanced);
        toast.success('Message enhanced!');
      }
    } catch (error) {
      toast.error('Failed to enhance message');
    }
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = currentMessage.substring(0, start) + variable + currentMessage.substring(end);
      setCurrentMessage(newMessage);
      
      // Reset cursor position after React re-render
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };
  // Replace variables with actual values from database
  const replaceVariables = async (message: string, context: any) => {
    let processedMessage = message;
    
    // Replace each variable with actual value
    for (const variable of systemVariables) {
      if (processedMessage.includes(variable.key)) {
        let value = '';
        
        // Get value based on source
        if (variable.source?.includes('.')) {
          const [table, field] = variable.source.split('.');
          
          switch (table) {
            case 'clients':
              value = context.client?.[field] || '';
              break;
            case 'jobs':
              value = context.job?.[field] || '';
              break;
            case 'profiles':
              value = context.technician?.[field] || context.company?.[field] || '';
              break;
            case 'invoices':
              value = context.invoice?.[field] || '';
              break;
            case 'organization':
              value = context.organization?.[field] || '';
              break;
          }
        } else if (variable.source === 'calculated') {
          // Handle calculated fields
          switch (variable.key) {
            case '{{days_overdue}}':
              if (context.invoice?.due_date) {
                const dueDate = new Date(context.invoice.due_date);
                const today = new Date();
                value = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))).toString();
              }
              break;
            case '{{payment_link}}':
              value = `${window.location.origin}/pay/${context.invoice?.id}`;
              break;
            case '{{client_first_name}}':
              value = context.client?.name?.split(' ')[0] || '';
              break;
            case '{{current_date}}':
              value = new Date().toLocaleDateString();
              break;
            case '{{current_time}}':
              value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              break;
            case '{{tomorrow_date}}':
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              value = tomorrow.toLocaleDateString();
              break;
            case '{{job_duration}}':
              if (context.job?.schedule_start && context.job?.schedule_end) {
                const start = new Date(context.job.schedule_start);
                const end = new Date(context.job.schedule_end);
                const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                value = `${hours} hour${hours !== 1 ? 's' : ''}`;
              }
              break;
          }
        }
        
        // Format value based on type
        if (variable.type === 'currency' && value) {
          value = `$${parseFloat(value).toFixed(2)}`;
        } else if (variable.type === 'date' && value) {
          value = new Date(value).toLocaleDateString();
        } else if (variable.type === 'time' && value) {
          value = new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        processedMessage = processedMessage.replace(new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    }
    
    return processedMessage;
  };
  // Save automation with enhanced validation
  const saveAutomation = async (rule: AutomationRule) => {
    if (!user?.id) return;

    try {
      // Validate required fields
      if (!rule.name || !rule.trigger.type || !rule.action.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Build trigger conditions based on trigger type
      const triggerType = triggerTypes.find(t => t.value === rule.trigger.type);
      let triggerConditions: any[] = [];

      if (triggerType?.conditionType === 'status_change' && statusFrom && statusTo) {
        triggerConditions = [
          { field: 'status_from', operator: 'equals', value: statusFrom },
          { field: 'status_to', operator: 'equals', value: statusTo }
        ];
      } else if (triggerType?.conditionType === 'status_to' && statusTo) {
        triggerConditions = [
          { field: 'status', operator: 'equals', value: statusTo }
        ];
      } else if (triggerType?.conditionType === 'status_from' && statusFrom) {
        triggerConditions = [
          { field: 'status', operator: 'equals', value: statusFrom }
        ];
      }

      // Add any additional conditions from the rule
      if (rule.trigger.conditions) {
        triggerConditions = [...triggerConditions, ...rule.trigger.conditions.filter(c => 
          c.field !== 'status' && c.field !== 'status_from' && c.field !== 'status_to'
        )];
      }

      const automationData = {
        user_id: user.id,
        organization_id: user.id, // Use user.id as organization_id for now
        name: rule.name,
        description: rule.description,
        status: rule.status,
        trigger_type: rule.trigger.type,
        trigger_conditions: triggerConditions,
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
      setStatusFrom('');
      setStatusTo('');
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
      
      // Transform data to match our interface
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
  // Calculate automation metrics
  const calculateMetrics = () => {
    const activeRules = automationRules.filter(r => r.status === 'active').length;
    const totalExecutions = automationRules.reduce((sum, r) => sum + (r.usage_count || 0), 0);
    const successfulExecutions = automationRules.reduce((sum, r) => sum + ((r.usage_count || 0) * (r.success_rate || 0) / 100), 0);
    const averageSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100) : 0;
    
    return {
      activeRules,
      totalExecutions,
      averageSuccessRate,
      estimatedTimeSaved: Math.round(totalExecutions * 2.5), // Estimate 2.5 min saved per automation
      estimatedRevenue: Math.round(successfulExecutions * 15) // Estimate $15 value per successful automation
    };
  };

  // Filter variables by category and search
  const getFilteredVariables = () => {
    return systemVariables.filter(variable => {
      const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory;
      const matchesSearch = variable.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                          variable.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
                          variable.description.toLowerCase().includes(variableSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  useEffect(() => {
    if (user?.id) {
      loadAutomations();
    }
  }, [user?.id]);

  const recommendations = getBusinessRecommendations();
  const templateCategories = getTemplatesByCategory();
  const metrics = calculateMetrics();
  const filteredVariables = getFilteredVariables();
  
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

        {/* Enhanced AI Builder Section - 3D Design */}
        <ModernCard 
          variant="elevated" 
          className="relative overflow-hidden min-h-[300px] ai-builder-section"
          style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transform: 'perspective(1200px) rotateX(1deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 3D Background */}
          <div className="absolute inset-0 opacity-50">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/20 to-fixlyfy-light/20" />}>
              <ThreeBackground />
            </Suspense>
          </div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/20 via-transparent to-fixlyfy-light/20 opacity-60 animate-pulse" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-fixlyfy/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-fixlyfy-light/10 rounded-full blur-3xl animate-float-delayed" />
          </div>
          
          <ModernCardContent className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl flex items-center justify-center shadow-2xl"
                         style={{ 
                           boxShadow: '0 10px 30px rgba(138, 77, 213, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                           transform: 'translateZ(40px)'
                         }}>
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
                    style={{
                      boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(138, 77, 213, 0.3)',
                    }}
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
                    style={{
                      boxShadow: '0 8px 20px rgba(138, 77, 213, 0.4)',
                    }}
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
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className={cn(
                      "w-20 h-20 bg-gradient-to-br backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl",
                      item.color
                    )}
                         style={{ 
                           transform: 'translateZ(30px)',
                           boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                         }}>
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* View Filter Section */}
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
                        style={{
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                          transform: 'translateZ(0)'
                        }}
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
          </div>
        )}
        
        {/* My Automations View */}
        {activeView === 'automations' && (
          <div className="space-y-6">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Export
                </Button>
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
            ) : (              <div className="grid gap-4">
                {automationRules
                  .filter(rule => {
                    // Search filter
                    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    // Status filter
                    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
                    
                    // Type filter
                    const matchesType = filterType === 'all' || rule.trigger.type === filterType;
                    
                    return matchesSearch && matchesStatus && matchesType;
                  })
                  .map((rule) => {
                    // Extract status conditions for display
                    const statusFromCondition = rule.trigger.conditions?.find((c: any) => c.field === 'status_from');
                    const statusToCondition = rule.trigger.conditions?.find((c: any) => c.field === 'status_to' || c.field === 'status');
                    const triggerType = triggerTypes.find(t => t.value === rule.trigger.type);
                    const actionType = actionTypes.find(a => a.value === rule.action.type);
                    
                    // Determine status display
                    let statusDisplay = '';
                    if (statusFromCondition && statusToCondition) {
                      const fromStatus = jobStatuses.find(s => s.value === statusFromCondition.value);
                      const toStatus = jobStatuses.find(s => s.value === statusToCondition.value);
                      statusDisplay = `${fromStatus?.label} → ${toStatus?.label}`;
                    } else if (statusToCondition) {
                      const toStatus = jobStatuses.find(s => s.value === statusToCondition.value);
                      statusDisplay = `→ ${toStatus?.label}`;
                    } else if (statusFromCondition) {
                      const fromStatus = jobStatuses.find(s => s.value === statusFromCondition.value);
                      statusDisplay = `${fromStatus?.label} →`;
                    }
                    
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
                                  {statusDisplay && (
                                    <span className="text-fixlyfy font-medium ml-1">
                                      {statusDisplay}
                                    </span>
                                  )}
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
                                {rule.multiChannel && (
                                  <span className="flex items-center gap-1">
                                    <Network className="w-3 h-3" />
                                    {rule.multiChannel.primaryChannel.toUpperCase()}
                                    {rule.multiChannel.fallbackEnabled && ' + Fallback'}
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
                                  // Extract status values
                                  const statusFromCond = rule.trigger.conditions?.find((c: any) => c.field === 'status_from');
                                  const statusToCond = rule.trigger.conditions?.find((c: any) => c.field === 'status_to' || c.field === 'status');
                                  
                                  if (statusFromCond) {
                                    setStatusFrom(statusFromCond.value);
                                  }
                                  if (statusToCond) {
                                    setStatusTo(statusToCond.value);
                                  }
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
          </div>
        )}
        
        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Active Automations', value: metrics.activeRules, icon: Zap, color: 'from-fixlyfy to-fixlyfy-light', trend: '+12%' },
                { label: 'Total Executions', value: metrics.totalExecutions.toLocaleString(), icon: Activity, color: 'from-blue-500 to-blue-600', trend: '+25%' },
                { label: 'Success Rate', value: `${metrics.averageSuccessRate.toFixed(1)}%`, icon: TrendingUp, color: 'from-green-500 to-green-600', trend: '+5%' },
                { label: 'Time Saved', value: `${metrics.estimatedTimeSaved} hrs`, icon: Timer, color: 'from-purple-500 to-purple-600', trend: '+18%' },
                { label: 'Revenue Impact', value: `$${metrics.estimatedRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-orange-500 to-orange-600', trend: '+32%' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <ModernCard key={index} variant="elevated" hoverable>
                    <ModernCardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          stat.color
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {stat.trend && (
                          <Badge variant="secondary" className="text-xs text-green-600 dark:text-green-400">
                            {stat.trend}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                );
              })}
            </div>

            {/* Performance Chart */}
            <ModernCard variant="elevated" className="mt-6">
              <ModernCardHeader>
                <ModernCardTitle icon={BarChart3}>Automation Performance</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                {automationRules.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automation execution trends
                    </p>
                    {/* Chart would go here */}
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      <p>Performance chart coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>Create automations to see performance data</p>
                    </div>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModernCard variant="elevated">
                <ModernCardHeader>
                  <ModernCardTitle icon={Clock}>Automation Timeline</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recent automation executions
                    </p>
                    {/* Timeline would go here */}
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      <p>Timeline visualization coming soon</p>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="elevated">
                <ModernCardHeader>
                  <ModernCardTitle icon={Target}>Conversion Metrics</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automation effectiveness
                    </p>
                    {/* Conversion metrics would go here */}
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      <p>Conversion metrics coming soon</p>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        )}
          </div>
        )}
        
        {/* Enhanced Automation Builder Dialog */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-fixlyfy" />
                {selectedRule?.id ? 'Edit Automation' : 'Create Automation'}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Automation Name *</Label>
                    <Input
                      id="name"
                      value={selectedRule?.name || ''}
                      onChange={(e) => setSelectedRule(prev => ({ ...prev!, name: e.target.value }))}
                      placeholder="e.g., 24-Hour Appointment Reminder"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={selectedRule?.description || ''}
                      onChange={(e) => setSelectedRule(prev => ({ ...prev!, description: e.target.value }))}
                      placeholder="Brief description of what this automation does"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
                {/* Trigger Section with Enhanced Status Handling */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-fixlyfy" />
                    When this happens...
                  </h3>
                  
                  <div>
                    <Label>Trigger Type *</Label>
                    <Select
                      value={selectedRule?.trigger.type || ''}
                      onValueChange={(value) => {
                        setSelectedRule(prev => ({
                          ...prev!,
                          trigger: { ...prev!.trigger, type: value }
                        }));
                        // Clear status values if trigger doesn't need them
                        const trigger = triggerTypes.find(t => t.value === value);
                        if (!trigger?.needsCondition) {
                          setStatusFrom('');
                          setStatusTo('');
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          triggerTypes.reduce((acc, trigger) => {
                            const category = trigger.category || 'Other';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(trigger);
                            return acc;
                          }, {} as Record<string, typeof triggerTypes>)
                        ).map(([category, triggers]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{category}</div>
                            {triggers.map((trigger) => (
                              <SelectItem key={trigger.value} value={trigger.value}>
                                <div className="flex items-center gap-2">
                                  {React.createElement(trigger.icon, { className: "w-4 h-4" })}
                                  {trigger.label}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Enhanced Status Conditions */}
                  {selectedRule?.trigger.type && (() => {
                    const triggerType = triggerTypes.find(t => t.value === selectedRule.trigger.type);
                    
                    if (triggerType?.conditionType === 'status_change') {
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>From Status</Label>
                            <Select value={statusFrom} onValueChange={setStatusFrom}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobStatuses.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    <div className="flex items-center gap-2">
                                      <status.icon className="w-4 h-4" />
                                      <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        status.color === 'blue' && "bg-blue-500",
                                        status.color === 'yellow' && "bg-yellow-500",
                                        status.color === 'green' && "bg-green-500",
                                        status.color === 'red' && "bg-red-500",
                                        status.color === 'gray' && "bg-gray-500",
                                        status.color === 'orange' && "bg-orange-500",
                                        status.color === 'purple' && "bg-purple-500"
                                      )} />
                                      {status.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>To Status *</Label>
                            <Select value={statusTo} onValueChange={setStatusTo}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobStatuses.map((status) => (
                                  <SelectItem key={status.value} value={status.value} disabled={status.value === statusFrom}>
                                    <div className="flex items-center gap-2">
                                      <status.icon className="w-4 h-4" />
                                      <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        status.color === 'blue' && "bg-blue-500",
                                        status.color === 'yellow' && "bg-yellow-500",
                                        status.color === 'green' && "bg-green-500",
                                        status.color === 'red' && "bg-red-500",
                                        status.color === 'gray' && "bg-gray-500",
                                        status.color === 'orange' && "bg-orange-500",
                                        status.color === 'purple' && "bg-purple-500"
                                      )} />
                                      {status.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    } else if (triggerType?.conditionType === 'status_to') {
                      return (
                        <div>
                          <Label>When status changes to *</Label>
                          <Select value={statusTo} onValueChange={setStatusTo}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <status.icon className="w-4 h-4" />
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      status.color === 'blue' && "bg-blue-500",
                                      status.color === 'yellow' && "bg-yellow-500",
                                      status.color === 'green' && "bg-green-500",
                                      status.color === 'red' && "bg-red-500",
                                      status.color === 'gray' && "bg-gray-500",
                                      status.color === 'orange' && "bg-orange-500",
                                      status.color === 'purple' && "bg-purple-500"
                                    )} />
                                    {status.label}
                                    {status.description && (
                                      <span className="text-xs text-gray-500 ml-2">({status.description})</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    } else if (triggerType?.conditionType === 'status_from') {
                      return (
                        <div>
                          <Label>When status changes from *</Label>
                          <Select value={statusFrom} onValueChange={setStatusFrom}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <status.icon className="w-4 h-4" />
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      status.color === 'blue' && "bg-blue-500",
                                      status.color === 'yellow' && "bg-yellow-500",
                                      status.color === 'green' && "bg-green-500",
                                      status.color === 'red' && "bg-red-500",
                                      status.color === 'gray' && "bg-gray-500",
                                      status.color === 'orange' && "bg-orange-500",
                                      status.color === 'purple' && "bg-purple-500"
                                    )} />
                                    {status.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                </div>
                {/* Action Section */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-fixlyfy" />
                    Do this...
                  </h3>
                  
                  <div>
                    <Label>Action Type *</Label>
                    <Select
                      value={selectedRule?.action.type || ''}
                      onValueChange={(value) => {
                        setSelectedRule(prev => ({
                          ...prev!,
                          action: { ...prev!.action, type: value }
                        }));
                        setMessageType(value === 'send_email' ? 'email' : 'sms');
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          actionTypes.reduce((acc, action) => {
                            const category = action.category || 'Other';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(action);
                            return acc;
                          }, {} as Record<string, typeof actionTypes>)
                        ).map(([category, actions]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{category}</div>
                            {actions.map((action) => (
                              <SelectItem key={action.value} value={action.value}>
                                <div className="flex items-center gap-2">
                                  {React.createElement(action.icon, { className: "w-4 h-4" })}
                                  {action.label}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Message Configuration */}
                  {(selectedRule?.action.type === 'send_sms' || selectedRule?.action.type === 'send_email') && (
                    <div className="space-y-4">
                      {selectedRule.action.type === 'send_email' && (
                        <div>
                          <Label htmlFor="subject">Email Subject</Label>
                          <Input
                            id="subject"
                            value={selectedRule.action.config?.subject || ''}
                            onChange={(e) => setSelectedRule(prev => ({
                              ...prev!,
                              action: {
                                ...prev!.action,
                                config: { ...prev!.action.config, subject: e.target.value }
                              }
                            }))}
                            placeholder="e.g., Appointment Reminder - {{company_name}}"
                            className="mt-1"
                          />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor="message">Message Content</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentMessage(selectedRule.action.config?.message || selectedRule.action.config?.body || '');
                              setMessageEditorOpen(true);
                            }}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            AI Editor
                          </Button>
                        </div>
                        <Textarea
                          id="message-textarea"
                          value={selectedRule.action.config?.message || selectedRule.action.config?.body || ''}
                          onChange={(e) => setSelectedRule(prev => ({
                            ...prev!,
                            action: {
                              ...prev!.action,
                              config: {
                                ...prev!.action.config,
                                [prev!.action.type === 'send_email' ? 'body' : 'message']: e.target.value
                              }
                            }
                          }))}
                          placeholder={selectedRule.action.type === 'send_sms' ? 
                            "Enter your SMS message..." : 
                            "Enter your email content..."}
                          rows={6}
                          className="mt-1 font-mono text-sm"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Tip: Use variables to personalize messages. Click AI Editor for help.
                          </p>
                          {selectedRule.action.type === 'send_sms' && (
                            <p className="text-xs text-gray-500">
                              {(selectedRule.action.config?.message || '').length} / 160 characters
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Delay Configuration */}
                  <div>
                    <Label>When to Execute</Label>
                    <Select
                      value={selectedRule?.action.delay?.type || 'immediate'}
                      onValueChange={(value) => setSelectedRule(prev => ({
                        ...prev!,
                        action: {
                          ...prev!.action,
                          delay: { type: value, value: value !== 'immediate' ? 1 : undefined }
                        }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediately</SelectItem>
                        <SelectItem value="minutes">After X minutes</SelectItem>
                        <SelectItem value="hours">After X hours</SelectItem>
                        <SelectItem value="days">After X days</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {selectedRule?.action.delay?.type !== 'immediate' && (
                      <Input
                        type="number"
                        min="1"
                        value={selectedRule?.action.delay?.value || 1}
                        onChange={(e) => setSelectedRule(prev => ({
                          ...prev!,
                          action: {
                            ...prev!.action,
                            delay: { ...prev!.action.delay!, value: parseInt(e.target.value) }
                          }
                        }))}
                        className="mt-2"
                        placeholder="Enter number"
                      />
                    )}
                  </div>
                </div>
                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-fixlyfy" />
                    Settings
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="status">Automation Status</Label>
                      <p className="text-xs text-gray-500 mt-1">Enable to start using this automation</p>
                    </div>
                    <Switch
                      id="status"
                      checked={selectedRule?.status === 'active'}
                      onCheckedChange={(checked) => setSelectedRule(prev => ({
                        ...prev!,
                        status: checked ? 'active' : 'draft'
                      }))}
                    />
                  </div>

                  {/* Multi-Channel Settings */}
                  {(selectedRule?.action.type === 'send_sms' || selectedRule?.action.type === 'send_email') && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Multi-Channel Settings
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="fallback">Enable Fallback Channel</Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Send via {selectedRule?.action.type === 'send_sms' ? 'email' : 'SMS'} if primary fails
                          </p>
                        </div>
                        <Switch
                          id="fallback"
                          checked={selectedRule?.multiChannel?.fallbackEnabled || false}
                          onCheckedChange={(checked) => setSelectedRule(prev => ({
                            ...prev!,
                            multiChannel: {
                              ...prev!.multiChannel!,
                              primaryChannel: prev!.action.type === 'send_sms' ? 'sms' : 'email',
                              fallbackEnabled: checked,
                              fallbackChannel: prev!.action.type === 'send_sms' ? 'email' : 'sms',
                              fallbackDelayHours: 2
                            }
                          }))}
                        />
                      </div>
                      
                      {selectedRule?.multiChannel?.fallbackEnabled && (
                        <div>
                          <Label htmlFor="fallback-delay">Fallback After (hours)</Label>
                          <Input
                            id="fallback-delay"
                            type="number"
                            min="1"
                            max="48"
                            value={selectedRule?.multiChannel?.fallbackDelayHours || 2}
                            onChange={(e) => setSelectedRule(prev => ({
                              ...prev!,
                              multiChannel: {
                                ...prev!.multiChannel!,
                                fallbackDelayHours: parseInt(e.target.value)
                              }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Window */}
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Delivery Window
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="business-hours">Business Hours Only</Label>
                        <p className="text-xs text-gray-500 mt-1">Send only during business hours</p>
                      </div>
                      <Switch
                        id="business-hours"
                        checked={selectedRule?.deliveryWindow?.businessHoursOnly || false}
                        onCheckedChange={(checked) => setSelectedRule(prev => ({
                          ...prev!,
                          deliveryWindow: {
                            ...prev!.deliveryWindow!,
                            businessHoursOnly: checked,
                            allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
                            timeRange: { start: '9:00', end: '18:00' }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setBuilderOpen(false);
                setStatusFrom('');
                setStatusTo('');
              }}>
                Cancel
              </Button>
              <GradientButton
                variant="primary"
                onClick={() => {
                  if (selectedRule) {
                    saveAutomation(selectedRule);
                  }
                }}
                disabled={!selectedRule?.name || !selectedRule?.trigger.type || !selectedRule?.action.type}
              >
                {selectedRule?.id ? 'Update' : 'Create'} Automation
              </GradientButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced AI Message Editor Dialog */}
        <Dialog open={messageEditorOpen} onOpenChange={setMessageEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-fixlyfy" />
                AI Message Editor
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label>Message Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={messageType === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageType('sms')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    variant={messageType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageType('email')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Message Content</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enhanceMessage}
                    disabled={aiLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiLoading ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>
                </div>
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={messageType === 'sms' ? 
                    "Type your SMS message here..." : 
                    "Type your email content here..."}
                  rows={8}
                  className="font-mono text-sm"
                />
                {messageType === 'sms' && (
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Character count: {currentMessage.length} / 160
                    </p>
                    {currentMessage.length > 160 && (
                      <p className="text-xs text-orange-500">
                        Will be sent as {Math.ceil(currentMessage.length / 160)} messages
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Available Variables</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search variables..."
                      value={variableSearch}
                      onChange={(e) => setVariableSearch(e.target.value)}
                      className="w-48 h-8"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {[...new Set(systemVariables.map(v => v.category))].map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Click any variable to insert it into your message. These automatically pull data from your database.
                </p>
                <ScrollArea className="h-64 border rounded-lg p-3">
                  {Object.entries(
                    filteredVariables.reduce((acc, variable) => {
                      if (!acc[variable.category]) acc[variable.category] = [];
                      acc[variable.category].push(variable);
                      return acc;
                    }, {} as Record<string, Variable[]>)
                  ).map(([category, vars]) => (
                    <div key={category} className="mb-6">
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {category}
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {vars.map((variable) => (
                          <Button
                            key={variable.key}
                            variant="outline"
                            size="sm"
                            className="h-auto py-2 px-3 justify-start text-left group hover:bg-fixlyfy/10 hover:border-fixlyfy"
                            onClick={() => insertVariable(variable.key)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Variable className="w-3 h-3 text-fixlyfy" />
                                <span className="font-mono text-xs">{variable.key}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{variable.label}</p>
                              {variable.example && (
                                <p className="text-xs text-gray-400 mt-0.5 italic">e.g. {variable.example}</p>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Variables are replaced with actual data when the automation runs. 
                      For example, {'{{client_name}}'} becomes "John Smith" based on the job or client that triggered the automation.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setMessageEditorOpen(false)}>
                  Cancel
                </Button>
                <GradientButton
                  variant="primary"
                  onClick={() => {
                    if (selectedRule) {
                      setSelectedRule(prev => ({
                        ...prev!,
                        action: {
                          ...prev!.action,
                          config: {
                            ...prev!.action.config,
                            [messageType === 'email' ? 'body' : 'message']: currentMessage
                          }
                        }
                      }));
                    }
                    setMessageEditorOpen(false);
                  }}
                >
                  Apply Message
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