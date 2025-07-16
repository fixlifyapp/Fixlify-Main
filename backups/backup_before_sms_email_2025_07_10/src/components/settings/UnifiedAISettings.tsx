
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Settings, Phone } from 'lucide-react';
import { SimplifiedAISettings } from './SimplifiedAISettings';
import { AIAssistantManager } from './AIAssistantManager';

export const UnifiedAISettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Assistant & Dispatcher Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assistant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="dispatcher" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Dispatcher
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assistant" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure your AI Assistant that handles incoming calls with dynamic prompts and variable substitution.
              </div>
              <AIAssistantManager />
            </TabsContent>
            
            <TabsContent value="dispatcher" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure general AI dispatcher settings and phone number routing.
              </div>
              <SimplifiedAISettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
