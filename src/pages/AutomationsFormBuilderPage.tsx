
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Bot,
  Sparkles,
  Code,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AutomationsFormBuilderPage = () => {
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'job_created',
    conditions: '',
    actions: [{ type: 'send_sms', message: '', delay: 0 }]
  });

  const features = [
    {
      title: 'Form-Based Builder',
      description: 'Simple form interface for creating automations',
      icon: FileText,
      color: 'from-green-500 to-green-700',
      status: 'Active'
    },
    {
      title: 'Smart Templates',
      description: 'Pre-built automation templates for common workflows',
      icon: Star,
      color: 'from-blue-500 to-blue-700',
      status: 'Active'
    },
    {
      title: 'AI Message Assistant',
      description: 'AI-powered message composition and optimization',
      icon: Bot,
      color: 'from-purple-500 to-purple-700',
      status: 'Beta'
    },
    {
      title: 'Simple Design',
      description: 'Clean, straightforward interface with green theme',
      icon: Eye,
      color: 'from-teal-500 to-emerald-500',
      status: 'Active'
    }
  ];

  // Hardcoded automation data for demonstration
  const sampleAutomations = [
    {
      id: '1',
      name: 'Welcome New Clients',
      description: 'Send welcome message when a new job is created',
      trigger: 'job_created',
      status: 'active',
      actions: 2,
      executions: 156,
      success_rate: 98,
      last_run: '1 hour ago',
      created_at: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Payment Reminders',
      description: 'Remind clients about overdue payments',
      trigger: 'payment_overdue',
      status: 'active',
      actions: 3,
      executions: 89,
      success_rate: 92,
      last_run: '3 hours ago',
      created_at: '2024-01-10'
    },
    {
      id: '3',
      name: 'Job Completion Survey',
      description: 'Send feedback survey after job completion',
      trigger: 'job_completed',
      status: 'paused',
      actions: 1,
      executions: 234,
      success_rate: 87,
      last_run: '2 days ago',
      created_at: '2024-01-05'
    }
  ];

  const templates = [
    {
      id: '1',
      name: 'Customer Welcome Series',
      description: 'Multi-step welcome sequence for new customers',
      category: 'Customer Service',
      trigger: 'job_created',
      actions: 3,
      usage: 145
    },
    {
      id: '2',
      name: 'Payment Follow-up',
      description: 'Automated payment reminder sequence',
      category: 'Billing',
      trigger: 'invoice_overdue',
      actions: 2,
      usage: 98
    },
    {
      id: '3',
      name: 'Appointment Reminders',
      description: 'Send reminders before scheduled appointments',
      category: 'Scheduling',
      trigger: 'appointment_scheduled',
      actions: 1,
      usage: 178
    }
  ];

  const handleCreateNew = () => {
    setSelectedAutomation(null);
    setIsEditing(true);
    setFormData({
      name: '',
      description: '',
      trigger: 'job_created',
      conditions: '',
      actions: [{ type: 'send_sms', message: '', delay: 0 }]
    });
  };

  const handleEdit = (automation: any) => {
    setSelectedAutomation(automation);
    setIsEditing(true);
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      conditions: '',
      actions: [{ type: 'send_sms', message: '', delay: 0 }]
    });
  };

  const handleSave = () => {
    console.log('Saving automation:', formData);
    toast.success('Automation saved successfully');
    setIsEditing(false);
    setSelectedAutomation(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedAutomation(null);
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'send_sms', message: '', delay: 0 }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-transparent to-emerald-800/20"></div>
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
                Create powerful automation workflows using our simple form-based interface with AI assistance
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <FileText className="w-3 h-3 mr-1" />
                  Form Builder
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Bot className="w-3 h-3 mr-1" />
                  AI-Assisted
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Code className="w-3 h-3 mr-1" />
                  Simple Setup
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white shadow-xl"
              >
                <Star className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
              <GradientButton
                onClick={handleCreateNew}
                className="bg-white text-green-600 hover:bg-white/90 shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New
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
                     style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}}></div>
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

        {/* Main Content */}
        {isEditing ? (
          <ModernCard variant="elevated" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-100/50 p-6 border-b">
              <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                {selectedAutomation ? 'Edit Automation' : 'Create New Automation'}
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter automation name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trigger Event
                      </label>
                      <Select value={formData.trigger} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_created">Job Created</SelectItem>
                          <SelectItem value="job_completed">Job Completed</SelectItem>
                          <SelectItem value="payment_overdue">Payment Overdue</SelectItem>
                          <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this automation does"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                    <Button onClick={addAction} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.actions.map((action, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Action {index + 1}</h4>
                          {formData.actions.length > 1 && (
                            <Button
                              onClick={() => removeAction(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Action Type
                            </label>
                            <Select 
                              value={action.type} 
                              onValueChange={(value) => updateAction(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="send_sms">Send SMS</SelectItem>
                                <SelectItem value="send_email">Send Email</SelectItem>
                                <SelectItem value="create_task">Create Task</SelectItem>
                                <SelectItem value="update_status">Update Status</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delay (minutes)
                            </label>
                            <Input
                              type="number"
                              value={action.delay}
                              onChange={(e) => updateAction(index, 'delay', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Content
                          </label>
                          <Textarea
                            value={action.message}
                            onChange={(e) => updateAction(index, 'message', e.target.value)}
                            placeholder="Enter your message content"
                            rows={3}
                          />
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                              <Bot className="w-4 h-4 mr-2" />
                              AI Enhance
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <GradientButton onClick={handleSave}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Automation
                  </GradientButton>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        ) : (
          <>
            {/* Templates Section */}
            <ModernCard variant="elevated" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-100/50 p-6 border-b">
                <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent flex items-center gap-2">
                  <Star className="w-6 h-6 text-green-600" />
                  Automation Templates
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <ModernCard key={template.id} variant="elevated" hoverable className="group">
                      <ModernCardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            {template.usage}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {template.trigger}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {template.actions} actions
                            </span>
                          </div>
                        </div>
                        <GradientButton 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                          onClick={() => {
                            toast.success('Template loaded successfully');
                            handleCreateNew();
                          }}
                        >
                          Use Template
                        </GradientButton>
                      </ModernCardContent>
                    </ModernCard>
                  ))}
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Current Automations */}
            <ModernCard variant="elevated" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-100/50 p-6 border-b">
                <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  Your Automations
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="p-6">
                <div className="space-y-4">
                  {sampleAutomations.map((automation) => (
                    <div key={automation.id} className="bg-gradient-to-r from-white to-green-50/50 rounded-xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3 flex-1">
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
                              {automation.actions} actions
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {automation.executions} runs
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              {automation.success_rate}% success
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {automation.last_run}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300">
                            <Play className="w-4 h-4 mr-2" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm" className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                          <GradientButton size="sm" onClick={() => handleEdit(automation)} className="bg-gradient-to-r from-green-500 to-emerald-600">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </GradientButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCardContent>
            </ModernCard>
          </>
        )}
      </div>
    </div>
  );
};

export default AutomationsFormBuilderPage;
