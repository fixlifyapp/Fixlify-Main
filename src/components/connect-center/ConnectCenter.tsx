
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, FileText, Bot, TrendingUp, Users, Phone } from "lucide-react";
import { SimpleMessagesInterface } from "@/components/connect/components/SimpleMessagesInterface";
import { SimpleEmailInterface } from "@/components/connect/components/SimpleEmailInterface";
import { CallsList } from "@/components/connect/CallsList";
import { CommunicationTemplates } from "./CommunicationTemplates";
import { CommunicationAutomations } from "./CommunicationAutomations";

interface ModernCardProps {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  children?: React.ReactNode;
}

const ModernCard = ({ title, icon: Icon, description, children }: ModernCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </CardHeader>
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

export const ConnectCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connect Center</h1>
        <p className="text-muted-foreground">
          Unified communication hub for managing messages, emails, and client interactions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard
              title="Messages"
              icon={MessageSquare}
              description="SMS conversations with clients"
            >
              <div className="text-2xl font-bold">142</div>
              <p className="text-sm text-green-600">+12% this week</p>
            </ModernCard>

            <ModernCard
              title="Emails"
              icon={Mail}
              description="Email communications sent"
            >
              <div className="text-2xl font-bold">89</div>
              <p className="text-sm text-blue-600">+8% this week</p>
            </ModernCard>

            <ModernCard
              title="Templates"
              icon={FileText}
              description="Message templates available"
            >
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-gray-600">6 categories</p>
            </ModernCard>

            <ModernCard
              title="Automations"
              icon={Bot}
              description="Active automation workflows"
            >
              <div className="text-2xl font-bold">7</div>
              <p className="text-sm text-purple-600">3 running now</p>
            </ModernCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">SMS sent to John Smith</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Estimate email sent</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Automation triggered</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Communication Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Rate</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-semibold">2.3 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Client Satisfaction</span>
                    <span className="font-semibold">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messages This Month</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <SimpleMessagesInterface />
        </TabsContent>

        <TabsContent value="email">
          <SimpleEmailInterface />
        </TabsContent>

        <TabsContent value="calls">
          <CallsList />
        </TabsContent>

        <TabsContent value="templates">
          <CommunicationTemplates />
        </TabsContent>

        <TabsContent value="automations">
          <CommunicationAutomations />
        </TabsContent>

      </Tabs>
    </div>
  );
};
