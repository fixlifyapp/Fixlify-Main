import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Bot, 
  Plus,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { MessagesListWrapper } from "@/components/connect/MessagesListWrapper";
import { EmailsList } from "@/components/connect/EmailsList";
import { CallsList } from "@/components/connect/CallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { ConnectCenterKPICards } from "@/components/connect-center/ConnectCenterKPICards";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("sms");

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Connect Center"
          subtitle="Unified communication hub for SMS, Email, Voice Calls, and AI-powered interactions"
          icon={MessageSquare}
          badges={[
            { text: "Communications", icon: MessageSquare, variant: "fixlyfy" },
            { text: "AI Powered", icon: Bot, variant: "info" }
          ]}
          actionButton={{
            text: "New Message",
            icon: Plus,
            onClick: () => {
              // Handle new message action based on active tab
              console.log("New message for tab:", activeTab);
            }
          }}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in" delay={150}>
        <ConnectCenterKPICards className="mb-6" />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in" delay={200}>
        <ModernCard variant="glass" className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
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
            </TabsList>

            <TabsContent value="sms" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">SMS Messages</h3>
                  <p className="text-sm text-muted-foreground">
                    Send and receive text messages with your clients
                  </p>
                </div>
              </div>
              <MessagesListWrapper />
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Email Communications</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage email conversations with clients
                  </p>
                </div>
              </div>
              <EmailsList />
            </TabsContent>

            <TabsContent value="calls" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Voice Calls</h3>
                  <p className="text-sm text-muted-foreground">
                    View call history and manage phone communications
                  </p>
                </div>
              </div>
              <CallsList />
            </TabsContent>

            <TabsContent value="ai-calls" className="space-y-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure and monitor AI-powered voice interactions
                  </p>
                </div>
              </div>
              <AIAgentDashboard />
            </TabsContent>
          </Tabs>
        </ModernCard>
      </AnimatedContainer>
    </PageLayout>
  );
};

export default ConnectCenterPage;
