
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Plus, 
  Save, 
  Play,
  Settings,
  MessageSquare,
  Clock,
  Zap,
  Bot,
  Sparkles,
  Layout,
  Code2,
  Layers,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AutomationsFormBuilderPage = () => {
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const features = [
    {
      title: 'Simple Form Interface',
      description: 'Easy-to-use forms without complex visual elements',
      icon: FileText,
      color: 'from-green-500 to-green-700',
      status: 'Active'
    },
    {
      title: 'Template-Based Setup',
      description: 'Quick setup using pre-configured automation templates',
      icon: Layout,
      color: 'from-blue-500 to-blue-700',
      status: 'Active'
    },
    {
      title: 'Step-by-Step Wizard',
      description: 'Guided process for creating automation workflows',
      icon: Layers,
      color: 'from-orange-500 to-red-500',
      status: 'Active'
    },
    {
      title: 'AI Message Writing',
      description: 'AI assistance for writing effective messages',
      icon: Bot,
      color: 'from-purple-500 to-purple-700',
      status: 'Beta'
    }
  ];

  // Hardcoded automation data for demonstration
  const sampleAutomations = [
    {
      id: '1',
      name: 'Welcome New Clients',
      description: 'Send a welcome message when a new client is added',
      trigger: 'Client Created',
      actions: [
        { type: 'SMS', message: 'Welcome to our service! We\'re excited to work with you.' },
        { type: 'Email', message: 'Thank you for choosing us. Here\'s what to expect next...' }
      ],
      status: 'active',
      executions: 34,
      success_rate: 97
    },
    {
      id: '2', 
      name: 'Job Completion Survey',
      description: 'Request feedback after job completion',
      trigger: 'Job Status Changed to Completed',
      actions: [
        { type: 'SMS', message: 'How was our service? Please rate us: [survey_link]' }
      ],
      status: 'active',
      executions: 28,
      success_rate: 89
    },
    {
      id: '3',
      name: 'Overdue Invoice Reminder',
      description: 'Remind clients about overdue payments',
      trigger: 'Invoice Overdue',
      actions: [
        { type: 'Email', message: 'Your payment is overdue. Please settle your account.' },
        { type: 'SMS', message: 'Reminder: Your invoice #{{invoice_number}} is past due.' }
      ],
      status: 'paused',
      executions: 15,
      success_rate: 76
    }
  ];

  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    trigger: '',
    message: '',
    messageType: 'sms',
    delay: 0,
    conditions: ''
  });

  const handleCreateNew = () => {
    setSelectedAutomation(null);
    setIsEditing(true);
    setNewAutomation({
      name: '',
      description: '',
      trigger: '',
      message: '',
      messageType: 'sms',
      delay: 0,
      conditions: ''
    });
  };

  const handleSave = () => {
    toast.success('Automation saved successfully');
    setIsEditing(false);
    setSelectedAutomation(null);
  };

  const handleEdit = (automation: any) => {
    setSelectedAutomation(automation);
    setNewAutomation({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      message: automation.actions[0]?.message || '',
      messageType: automation.actions[0]?.type.toLowerCase() || 'sms',
      delay: 0,
      conditions: ''
    });
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-green-600 to-green-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-transparent to-green-800/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Form-Based Automation Builder</h1>
              </div>
              <p className="text-green-100 text-lg max-w-2xl">
                Create automation workflows using simple forms and step-by-step guidance - no complex diagrams needed
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <FileText className="w-3 h-3 mr-1" />
                  Form-Based
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Template-Driven
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Code2 className="w-3 h-3 mr-1" />
                  Simple Setup
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <GradientButton
                onClick={handleCreateNew}
                className="bg-white text-green-600 hover:bg-white/90 shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Automation
              </GradientButton>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Automation Form */}
          {isEditing && (
            <div className="lg:col-span-2">
              <ModernCard variant="elevated" className="overflow-hidden">
                <ModernCardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 p-6 border-b">
                  <ModernCardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    {selectedAutomation ? 'Edit Automation' : 'Create New Automation'}
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Automation Name</Label>
                      <Input
                        id="name"
                        value={newAutomation.name}
                        onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                        placeholder="e.g., Welcome New Clients"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trigger">Trigger Event</Label>
                      <Select value={newAutomation.trigger} onValueChange={(value) => setNewAutomation({...newAutomation, trigger: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client_created">New Client Created</SelectItem>
                          <SelectItem value="job_completed">Job Completed</SelectItem>
                          <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                          <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newAutomation.description}
                      onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                      placeholder="Brief description of what this automation does"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="messageType">Message Type</Label>
                      <Select value={newAutomation.messageType} onValueChange={(value) => setNewAutomation({...newAutomation, messageType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms">SMS Text Message</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="both">Both SMS & Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delay">Delay (minutes)</Label>
                      <Input
                        id="delay"
                        type="number"
                        value={newAutomation.delay}
                        onChange={(e) => setNewAutomation({...newAutomation, delay: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Message Content</Label>
                      <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                        <Bot className="w-4 h-4 mr-2" />
                        AI Assist
                      </Button>
                    </div>
                    <Textarea
                      id="message"
                      value={newAutomation.message}
                      onChange={(e) => setNewAutomation({...newAutomation, message: e.target.value})}
                      placeholder="Enter your message. Use {{client_name}}, {{job_title}}, etc. for dynamic content"
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      Available variables: {{`client_name`}}, {{`job_title`}}, {{`scheduled_date`}}, {{`invoice_number`}}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <GradientButton onClick={handleSave} className="bg-gradient-to-r from-green-500 to-green-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save Automation
                    </GradientButton>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                      <Play className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          )}

          {/* Automation List */}
          <div className={cn("space-y-6", isEditing ? "lg:col-span-1" : "lg:col-span-3")}>
            <ModernCard variant="elevated" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <ModernCardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Your Automations
                  </ModernCardTitle>
                  {!isEditing && (
                    <GradientButton onClick={handleCreateNew} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </GradientButton>
                  )}
                </div>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                <div className="space-y-4">
                  {sampleAutomations.map((automation) => (
                    <div key={automation.id} className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
                              <Badge variant={automation.status === 'active' ? 'default' : 'secondary'} className={cn(
                                automation.status === 'active' && "bg-gradient-to-r from-green-500 to-green-600"
                              )}>
                                {automation.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{automation.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {automation.trigger}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {automation.actions.length} actions
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                {automation.executions} runs
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {automation.success_rate}% success
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(automation)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Actions:</h4>
                          {automation.actions.map((action, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                              <Badge variant="outline" className="text-xs">
                                {action.type}
                              </Badge>
                              <span className="text-gray-600 truncate">{action.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationsFormBuilderPage;
