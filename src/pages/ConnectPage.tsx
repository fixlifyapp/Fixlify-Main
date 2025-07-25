import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Bot, 
  Plus,
  Settings
} from "lucide-react";
import { ConnectKPICards } from "@/components/connect/ConnectKPICards";
import { SimpleMessagesInterface } from "@/components/connect/components/SimpleMessagesInterface";
import { SimpleEmailInterface } from "@/components/connect/components/SimpleEmailInterface";
import { CallsList } from "@/components/connect/CallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";

const ConnectPage = () => {
  const [activeTab, setActiveTab] = useState("messages");

  const handleNewAction = () => {
    // Handle new action based on active tab
    switch(activeTab) {
      case "messages":
        console.log("New SMS conversation");
        break;
      case "email":
        console.log("New email");
        break;
      case "calls":
        console.log("New call");
        break;
      case "ai-calls":
        console.log("New AI call");
        break;
    }
  };

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Connect"
          subtitle="Unified communication hub"
          icon={MessageSquare}
          badges={[
            { text: "SMS & Calls", icon: Phone, variant: "fixlyfy" },
            { text: "Email", icon: Mail, variant: "info" }
          ]}
          actionButton={{
            text: "New Message",
            icon: Plus,
            onClick: handleNewAction
          }}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in" delay={150}>
        <ConnectKPICards className="mb-6" activeTab={activeTab} />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger 
                value="messages" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger 
                value="calls" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Phone className="h-4 w-4" />
                Calls
              </TabsTrigger>
              <TabsTrigger 
                value="ai-calls" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Bot className="h-4 w-4" />
                AI Calls
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="messages" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">SMS Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      Send and receive SMS messages via Telnyx
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <SimpleMessagesInterface />
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Send and manage emails via Mailgun
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <SimpleEmailInterface />
              </TabsContent>

              <TabsContent value="calls" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Voice Calls</h3>
                    <p className="text-sm text-muted-foreground">
                      Make and receive calls via Telnyx
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <CallsList />
              </TabsContent>

              <TabsContent value="ai-calls" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered voice calls via Telnyx
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <AIAgentDashboard />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </AnimatedContainer>
    </PageLayout>
  );
};

export default ConnectPage;