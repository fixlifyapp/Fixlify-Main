import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Phone, Bot, FileText, Zap } from "lucide-react";
import { MessagesListWrapper } from "@/components/connect/MessagesListWrapper";
import { EmailsList } from "@/components/connect/EmailsList";
import { CallsList } from "@/components/connect/CallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { CommunicationTemplates } from "./CommunicationTemplates";
import { CommunicationAutomations } from "./CommunicationAutomations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ConnectCenter = () => {
  const [activeTab, setActiveTab] = useState("sms");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Connect Center</h1>
          <p className="text-muted-foreground mt-1">
            Unified communication hub for SMS, Email, Voice Calls, and AI-powered interactions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="sms" className="flex items-center gap-2 py-3">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 py-3">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2 py-3">
            <Phone className="h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="ai-calls" className="flex items-center gap-2 py-3">
            <Bot className="h-4 w-4" />
            AI Calls
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2 py-3">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Messages</CardTitle>
              <CardDescription>
                Send and receive text messages with your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesListWrapper />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Communications</CardTitle>
              <CardDescription>
                Manage email conversations with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Calls</CardTitle>
              <CardDescription>
                View call history and manage phone communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Voice Assistant</CardTitle>
              <CardDescription>
                Configure and monitor AI-powered voice interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAgentDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Create and manage reusable message templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Automations</CardTitle>
              <CardDescription>
                Set up automated communication workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationAutomations />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
