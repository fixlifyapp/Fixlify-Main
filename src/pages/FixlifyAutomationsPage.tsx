
import React, { useState } from 'react';
import { useAutomations } from '@/hooks/automations/useAutomations';
import { useAutomationTemplates } from '@/hooks/automations/useAutomationTemplates';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AutomationBuilder } from '@/components/automations/AutomationBuilder';
import { AutomationTemplateGallery } from '@/components/automations/AutomationTemplateGallery';
import { AutomationAnalytics } from '@/components/automations/AutomationAnalytics';
import { AutomationWorkflowList } from '@/components/automations/AutomationWorkflowList';
import { 
  Zap, 
  Plus, 
  TrendingUp, 
  Settings, 
  Play, 
  Pause, 
  BarChart3,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  Workflow
} from 'lucide-react';
import { toast } from 'sonner';

const FixlifyAutomationsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
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

  const handleUseTemplate = async (template) => {
    try {
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

  const handleExecuteWorkflow = async (workflowId) => {
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
      color: 'from-fixlyfy to-fixlyfy-light',
      trend: '+12%'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      trend: '+5%'
    },
    {
      title: 'Recent Executions',
      value: metrics.recentExecutions,
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      trend: '+23%'
    },
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows,
      icon: Workflow,
      color: 'from-purple-500 to-purple-600',
      trend: '+8%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-fixlyfy to-fixlyfy-light animate-pulse mx-auto"></div>
          <p className="text-fixlyfy font-medium">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent">
              Automations Center
            </h1>
            <p className="text-gray-600 text-lg">
              Streamline your workflow with intelligent automation
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <GradientButton
              onClick={() => setTemplatesOpen(true)}
              variant="info"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Star className="w-4 h-4" />
              Use Templates
            </GradientButton>
            <GradientButton
              onClick={handleCreateFromScratch}
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Create Automation
            </GradientButton>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <ModernCard key={index} variant="elevated" hoverable className="group">
              <ModernCardContent className="p-6">
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
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
            >
              <Star className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

          <TabsContent value="analytics" className="space-y-6">
            <AutomationAnalytics workflows={workflows} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <AutomationTemplateGallery
              templates={templates}
              recommendedTemplates={recommendedTemplates}
              categories={categories}
              onUseTemplate={handleUseTemplate}
            />
          </TabsContent>
        </Tabs>

        {/* Automation Builder Dialog */}
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto automation-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent">
                {selectedTemplate ? 'Edit Automation' : 'Create New Automation'}
              </DialogTitle>
            </DialogHeader>
            <AutomationBuilder
              template={selectedTemplate}
              onSave={(workflow) => {
                createWorkflow(workflow);
                setBuilderOpen(false);
                setSelectedTemplate(null);
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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent">
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
