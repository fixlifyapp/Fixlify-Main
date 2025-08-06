import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationInitializer } from './AutomationInitializer';
import { AutomationMonitor } from './monitor/AutomationMonitor';

export const AutomationSetup: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automation Setup</h1>
        <p className="text-muted-foreground">
          Set up automated workflows for job status changes, client communications, and more.
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup & Templates</TabsTrigger>
          <TabsTrigger value="monitor">System Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <AutomationInitializer />
        </TabsContent>

        <TabsContent value="monitor">
          <AutomationMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};