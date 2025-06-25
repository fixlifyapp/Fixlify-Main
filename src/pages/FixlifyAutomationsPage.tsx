
import React, { useState } from 'react';
import { useAutomations } from '@/hooks/automations/useAutomations';
import { useAutomationTemplates } from '@/hooks/automations/useAutomationTemplates';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AutomationBuilder } from '@/components/automations/AutomationBuilder';
import { AutomationTemplateGallery } from '@/components/automations/AutomationTemplateGallery';
import { AutomationAnalytics } from '@/components/automations/AutomationAnalytics';
import { AutomationWorkflowList } from '@/components/automations/AutomationWorkflowList';
import { 
  Zap, 
  Plus, 
  TrendingUp, 
  BarChart3,
  Star,
  Workflow,
  Bot,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FixlifyAutomationsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const { 
    workflows, 
    loading, 
    metrics, 
    createWorkflow, 
    toggleWorkflowStatus, 
    executeWorkflow 
  } = useAutomations();
  
  const { 
    templates, 
    recommendedTemplates, 
    categories, 
    useTemplate 
  } = useAutomationTemplates();

  const handleCreateFromScratch = () => {
    setSelectedTemplate(null);
    setBuilderOpen(true);
  };

  const handleUseTemplate = async (template: any) => {
    try {
      console.log('Using template:', template);
      const loadedTemplate = await useTemplate(template.id);
      if (loadedTemplate) {
        setSelectedTemplate(loadedTemplate);
        setBuilderOpen(true);
        setTemplatesOpen(false);
        toast.success('Template loaded successfully');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await executeWorkflow(workflowId);
      toast.success('Automation executed successfully');
    } catch (error) {
      toast.error('Failed to execute automation');
    }
  };

  const quickStats = [
    {
      title: 'Active Automations',
      value: metrics.activeWorkflows,
      icon: Zap,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      trend: '+12%'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-green-500 via-green-600 to-green-700',
      trend: '+5%'
    },
    {
      title: 'Recent Executions',
      value: metrics.recentExecutions,
      icon: BarChart3,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      trend: '+23%'
    },
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows,
      icon: Workflow,
      gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
      trend: '+8%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 animate-pulse mx-auto shadow-2xl"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-600 animate-ping opacity-20 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Loading Automations
            </h3>
            <p className="text-gray-600">Setting up your intelligent workflow system...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Smart Automations
                </h1>
              </div>
              <p className="text-purple-100 text-lg max-w-2xl">
                Create intelligent workflows to automate your business processes with AI-powered assistance
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Multi-Channel
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Smart Triggers
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
                Create Automation
              </GradientButton>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <ModernCard key={index} variant="elevated" hoverable className="group overflow-hidden">
              <ModernCardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.gradient.split(' ')[1]}, ${stat.gradient.split(' ')[3]})`}}></div>
                <div className="flex items-center justify-between relative">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300",
                    stat.gradient
                  )}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>

        {/* Main Content Tabs */}
        <ModernCard variant="elevated" className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 p-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white/70 backdrop-blur- border-gray-200 shadow-lg rounded-2xl p-2">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 shadow-sm"
                >
                  <Workflow className="w-4 h-4 mr-2" />
                  My Workflows
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 shadow-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="templates"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 shadow-sm"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 m-0">
                <AutomationWorkflowList
                  workflows={workflows}
                  onToggleStatus={toggleWorkflowStatus}
                  onExecute={handleExecuteWorkflow}
                  onEdit={(workflow) => {
                    setSelectedTemplate(workflow);
                    setBuilderOpen(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 m-0">
                <AutomationAnalytics workflows={workflows} />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6 m-0">
                <AutomationTemplateGallery
                  templates={templates}
                  recommendedTemplates={recommendedTemplates}
                  categories={categories}
                  onUseTemplate={handleUseTemplate}
                />
              </TabsContent>
            </div>
          </Tabs>
        </ModernCard>

        {/* Automation Builder Dialog */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden rounded-2xl">
            <AutomationBuilder
              template={selectedTemplate}
              onSave={async (workflow) => {
                const created = await createWorkflow(workflow);
                if (created) {
                  setBuilderOpen(false);
                  setSelectedTemplate(null);
                }
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
            <AutomationTemplateGallery
              templates={templates}
              recommendedTemplates={recommendedTemplates}
              categories={categories}
              onUseTemplate={handleUseTemplate}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FixlifyAutomationsPage;
