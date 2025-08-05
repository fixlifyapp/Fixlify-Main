import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { SimplifiedAutomationSystem } from '@/components/automations/SimplifiedAutomationSystem';
import { WorkflowExecutionMonitor } from '@/components/automations/WorkflowExecutionMonitor';
import { AdvancedWorkflowBuilder } from '@/components/automations/workflows/AdvancedWorkflowBuilder';
import { AutomationAnalytics } from '@/components/automations/analytics/AutomationAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Bot, TrendingUp, Settings, Play, Monitor } from "lucide-react";

const AutomationsPage = () => {
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="AI Automation Center"
          subtitle="Create intelligent workflows and automate your business processes"
          icon={Zap}
          badges={[
            { text: "AI Powered", icon: Bot, variant: "fixlyfy" },
            { text: "Smart Workflows", icon: Settings, variant: "info" },
            { text: "Performance", icon: TrendingUp, variant: "success" }
          ]}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Simple Builder
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Advanced Builder
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-6">
            <SimplifiedAutomationSystem />
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <div className="space-y-6">
              <AdvancedWorkflowBuilder />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <AutomationAnalytics />
          </TabsContent>
          
          <TabsContent value="monitor" className="mt-6">
            <WorkflowExecutionMonitor />
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </PageLayout>
  );
};

export default AutomationsPage;