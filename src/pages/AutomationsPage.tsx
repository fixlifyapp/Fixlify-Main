import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { SimplifiedAutomationSystem } from '@/components/automations/SimplifiedAutomationSystem';
import { AutomationHealthCheck } from '@/components/automations/AutomationHealthCheck';
import { AutomationTestRunner } from '@/components/automations/AutomationTestRunner';
import { AutomationAnalytics } from '@/components/automations/analytics/AutomationAnalytics';
import { AutomationMonitor } from '@/components/automations/monitor/AutomationMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Workflow, BarChart3, Monitor, Heart } from "lucide-react";

export default function AutomationsPage() {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
        <p className="text-gray-600 mt-2">Create and manage automated workflows to streamline your business processes</p>
      </div>
      
      <AnimatedContainer>
        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-6">
            <SimplifiedAutomationSystem />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <AutomationAnalytics />
          </TabsContent>
          
          <TabsContent value="monitor" className="mt-6">
            <AutomationMonitor />
          </TabsContent>
          
          <TabsContent value="health" className="mt-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">System Health Check</h3>
                  <AutomationHealthCheck />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Test Runner</h3>
                  <AutomationTestRunner />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </PageLayout>
  );
}