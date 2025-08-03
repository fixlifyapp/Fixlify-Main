import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { SimplifiedAutomationSystem } from '@/components/automations/SimplifiedAutomationSystem';
import { TestAutomationTriggers } from '@/components/automations/TestAutomationTriggers';
import { WorkflowExecutionMonitor } from '@/components/automations/WorkflowExecutionMonitor';
import { AutomationTestPanel } from '@/components/automations/AutomationTestPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Bot, TrendingUp, Settings, Play, Monitor, Bug } from "lucide-react";

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
              Workflow Builder
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Execution Monitor
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Triggers
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Panel
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-6">
            <SimplifiedAutomationSystem />
          </TabsContent>
          
          <TabsContent value="monitor" className="mt-6">
            <WorkflowExecutionMonitor />
          </TabsContent>
          
          <TabsContent value="test" className="mt-6">
            <TestAutomationTriggers />
          </TabsContent>
          
          <TabsContent value="debug" className="mt-6">
            <AutomationTestPanel />
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </PageLayout>
  );
};

export default AutomationsPage;