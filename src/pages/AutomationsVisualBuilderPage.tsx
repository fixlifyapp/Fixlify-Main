
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AutomationBuilder } from '@/components/automations/AutomationBuilder';
import { 
  Zap, 
  Plus, 
  TrendingUp, 
  BarChart3,
  Star,
  Workflow,
  Bot,
  Sparkles,
  Palette,
  Code,
  Eye,
  Play,
  Settings,
  MessageSquare,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AutomationsVisualBuilderPage = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleCreateFromScratch = () => {
    setSelectedTemplate(null);
    setBuilderOpen(true);
  };

  const features = [
    {
      title: 'Visual Flow Builder',
      description: 'Drag and drop interface with nodes and connections',
      icon: Workflow,
      color: 'from-purple-500 to-purple-700',
      status: 'Active'
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Smart message generation and workflow optimization',
      icon: Bot,
      color: 'from-blue-500 to-blue-700',
      status: 'Beta'
    },
    {
      title: 'Template Gallery',
      description: 'Pre-built automation templates for common scenarios',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      status: 'Active'
    },
    {
      title: '3D Gradient Design',
      description: 'Modern glassmorphism UI with beautiful animations',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      status: 'Active'
    }
  ];

  // Hardcoded workflow data for demonstration
  const sampleWorkflows = [
    {
      id: '1',
      name: 'New Job Welcome Sequence',
      description: 'Send welcome messages to new clients when a job is created',
      status: 'active',
      trigger_count: 1,
      action_count: 3,
      executions: 45,
      success_rate: 95,
      last_run: '2 hours ago'
    },
    {
      id: '2', 
      name: 'Payment Reminder Flow',
      description: 'Automated payment reminders for overdue invoices',
      status: 'active',
      trigger_count: 1,
      action_count: 2,
      executions: 23,
      success_rate: 87,
      last_run: '1 day ago'
    },
    {
      id: '3',
      name: 'Job Completion Follow-up',
      description: 'Follow-up messages and feedback requests after job completion',
      status: 'paused',
      trigger_count: 2,
      action_count: 4,
      executions: 67,
      success_rate: 92,
      last_run: '3 days ago'
    }
  ];

  const templates = [
    {
      id: '1',
      name: 'Client Onboarding',
      description: 'Welcome new clients with automated messages and setup instructions',
      category: 'Customer Service',
      actions: 4,
      popularity: 95
    },
    {
      id: '2',
      name: 'Invoice Reminders',
      description: 'Send payment reminders before and after due dates',
      category: 'Billing',
      actions: 3,
      popularity: 87
    },
    {
      id: '3',
      name: 'Appointment Confirmations',
      description: 'Confirm appointments 24 hours before scheduled time',
      category: 'Scheduling',
      actions: 2,
      popularity: 92
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-purple-800/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Visual Automation Builder</h1>
              </div>
              <p className="text-purple-100 text-lg max-w-2xl">
                Create sophisticated automation workflows with our intuitive drag-and-drop interface, powered by AI assistance
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Code className="w-3 h-3 mr-1" />
                  Visual Builder
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Real-time Preview
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <GradientButton
                onClick={() => setTemplatesOpen(true)}
                variant="info"
                className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white shadow-xl"
              >
                <Star className="w-4 h-4 mr-2" />
                Browse Templates
              </GradientButton>
              <GradientButton
                onClick={handleCreateFromScratch}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Flow
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

        {/* Current Workflows */}
        <ModernCard variant="elevated" className="overflow-hidden">
          <ModernCardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b">
            <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent flex items-center gap-2">
              <Workflow className="w-6 h-6 text-purple-600" />
              Your Visual Workflows
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-6">
            <div className="space-y-4">
              {sampleWorkflows.map((workflow) => (
                <div key={workflow.id} className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'} className={cn(
                          workflow.status === 'active' && "bg-gradient-to-r from-green-500 to-green-600"
                        )}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{workflow.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {workflow.trigger_count} Triggers
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {workflow.action_count} Actions
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {workflow.executions} runs
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {workflow.success_rate}% success
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workflow.last_run}
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
                        Edit
                      </Button>
                      <GradientButton size="sm" onClick={() => {
                        setSelectedTemplate(workflow);
                        setBuilderOpen(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Open
                      </GradientButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Automation Builder Dialog */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden rounded-2xl">
            <AutomationBuilder
              template={selectedTemplate}
              onSave={async (workflow) => {
                console.log('Saving workflow:', workflow);
                setBuilderOpen(false);
                setSelectedTemplate(null);
                toast.success('Automation saved successfully');
              }}
              onCancel={() => {
                setBuilderOpen(false);
                setSelectedTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Templates Gallery Dialog */}
        <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto rounded-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-600" />
                Automation Templates
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <ModernCard key={template.id} variant="elevated" hoverable className="group">
                  <ModernCardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {template.popularity}%
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        {template.actions} actions
                      </div>
                    </div>
                    <GradientButton 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setBuilderOpen(true);
                        setTemplatesOpen(false);
                        toast.success('Template loaded successfully');
                      }}
                    >
                      Use Template
                    </GradientButton>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AutomationsVisualBuilderPage;
