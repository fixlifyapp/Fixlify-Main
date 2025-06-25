
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Plus, 
  Play, 
  Save, 
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Zap,
  Bot,
  FileText,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AutomationsFormBuilderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: '',
    action: '',
    message: '',
    schedule: '',
    recipients: ''
  });

  const [savedAutomations, setSavedAutomations] = useState([
    {
      id: 1,
      name: 'Appointment Reminder',
      description: 'Send SMS reminders 24 hours before appointments',
      trigger: 'appointment_scheduled',
      action: 'send_sms',
      status: 'active'
    },
    {
      id: 2,
      name: 'Payment Follow-up',
      description: 'Email customers about overdue payments',
      trigger: 'payment_overdue',
      action: 'send_email',
      status: 'paused'
    }
  ]);

  const triggers = [
    { value: 'appointment_scheduled', label: 'Appointment Scheduled', icon: Clock },
    { value: 'payment_overdue', label: 'Payment Overdue', icon: MessageSquare },
    { value: 'job_completed', label: 'Job Completed', icon: CheckCircle2 },
    { value: 'new_client', label: 'New Client Added', icon: Plus }
  ];

  const actions = [
    { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'make_call', label: 'Make Call', icon: Phone },
    { value: 'create_task', label: 'Create Task', icon: FileText }
  ];

  const features = [
    {
      title: 'Form-Based Setup',
      description: 'Simple form interface for quick automation creation',
      icon: FileText,
      color: 'from-blue-500 to-blue-700',
      status: 'Active'
    },
    {
      title: 'Pre-defined Triggers',
      description: 'Common business triggers ready to use',
      icon: Zap,
      color: 'from-green-500 to-green-700',
      status: 'Active'
    },
    {
      title: 'AI Message Helper',
      description: 'Get AI suggestions for your message content',
      icon: Bot,
      color: 'from-purple-500 to-purple-700',
      status: 'Beta'
    },
    {
      title: 'Quick Deployment',
      description: 'Deploy automations instantly with one click',
      icon: Play,
      color: 'from-orange-500 to-red-500',
      status: 'Active'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAutomation = () => {
    if (!formData.name || !formData.trigger || !formData.action) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAutomation = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      trigger: formData.trigger,
      action: formData.action,
      status: 'active'
    };

    setSavedAutomations(prev => [...prev, newAutomation]);
    setFormData({
      name: '',
      description: '',
      trigger: '',
      action: '',
      message: '',
      schedule: '',
      recipients: ''
    });
    toast.success('Automation saved successfully');
  };

  const handleTestAutomation = () => {
    if (!formData.trigger || !formData.action) {
      toast.error('Please select trigger and action first');
      return;
    }
    toast.success('Test automation executed successfully');
  };

  const generateAIMessage = () => {
    const sampleMessages = [
      "Hi {{client_name}}, your appointment is scheduled for {{appointment_date}} at {{appointment_time}}. Please call if you need to reschedule.",
      "Hello {{client_name}}, your payment of ${{amount}} is now overdue. Please contact us to arrange payment.",
      "Thank you {{client_name}}! Your job has been completed successfully. We hope you're satisfied with our service."
    ];
    
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    handleInputChange('message', randomMessage);
    toast.success('AI message generated successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-blue-800/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Form-Based Automation Builder</h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Create powerful automations using simple forms and pre-configured templates for common business scenarios
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <FileText className="w-3 h-3 mr-1" />
                  Form Builder
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Layers className="w-3 h-3 mr-1" />
                  Template Based
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Bot className="w-3 h-3 mr-1" />
                  AI Assisted
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ModernCard key={index} variant="elevated" hoverable className="group overflow-hidden">
              <ModernCardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                     style={{backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`}}></div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                      feature.color
                    )}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={feature.status === 'Active' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Automation Form */}
          <ModernCard variant="elevated" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b">
              <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Create New Automation
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter automation name"
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this automation does"
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger *</Label>
                <Select value={formData.trigger} onValueChange={(value) => handleInputChange('trigger', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          <trigger.icon className="w-4 h-4" />
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action *</Label>
                <Select value={formData.action} onValueChange={(value) => handleInputChange('action', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message Content</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAIMessage}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Bot className="w-4 h-4 mr-1" />
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter your message content (use {{variable_name}} for dynamic content)"
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <GradientButton
                  onClick={handleSaveAutomation}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Automation
                </GradientButton>
                <Button
                  variant="outline"
                  onClick={handleTestAutomation}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Saved Automations */}
          <ModernCard variant="elevated" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b">
              <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-600" />
                Your Automations
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="p-6">
              <div className="space-y-4">
                {savedAutomations.map((automation) => (
                  <div key={automation.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {triggers.find(t => t.value === automation.trigger)?.label || automation.trigger}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {actions.find(a => a.value === automation.action)?.label || automation.action}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                        {automation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {savedAutomations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No automations created yet</p>
                    <p className="text-sm">Create your first automation using the form</p>
                  </div>
                )}
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default AutomationsFormBuilderPage;
