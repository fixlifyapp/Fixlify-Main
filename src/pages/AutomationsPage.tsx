
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
  ];

  return (
    <PageLayout>
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
    </PageLayout>
  );
};

export default AutomationsPage;
