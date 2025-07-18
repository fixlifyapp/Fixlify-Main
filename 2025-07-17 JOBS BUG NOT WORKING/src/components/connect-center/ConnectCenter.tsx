import { useState } from 'react';
import { MessageSquare, Mail, Phone, History, Send, Plus, Settings, Activity, Users, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { SMSConversations } from './SMSConversations';
import { SendCommunicationDialog } from './SendCommunicationDialog';
import { CommunicationHistory } from './CommunicationHistory';
import CommunicationTemplates from './CommunicationTemplates';
import { CommunicationAutomations } from './CommunicationAutomations';
import { useAuth } from '@/hooks/use-auth';

export function ConnectCenter() {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'email' | 'sms'>('email');
  const { user } = useAuth();

  const handleSendClick = (type: 'email' | 'sms') => {
    setSelectedType(type);
    setSendDialogOpen(true);
  };

  const badges = [
    {
      text: "SMS Active",
      icon: Phone,
      variant: "success" as const
    },
    {
      text: "Email Coming Soon",
      icon: Mail,
      variant: "info" as const
    }
  ];

  return (
    <PageLayout className="p-6">
      <PageHeader
        title="Connect Center"
        subtitle="Manage all your communications in one place"
        icon={MessageSquare}
        badges={badges}
        actionButton={{
          text: "New Message",
          icon: Plus,
          onClick: () => handleSendClick('sms')
        }}
      />

      <AnimatedContainer>
        <Tabs defaultValue="sms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sms">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="templates">
              <MessageSquare className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Settings className="h-4 w-4 mr-2" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms">
            <SMSConversations />
          </TabsContent>

          <TabsContent value="history">
            <CommunicationHistory />
          </TabsContent>

          <TabsContent value="templates">
            <CommunicationTemplates />
          </TabsContent>

          <TabsContent value="automations">
            <CommunicationAutomations />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ModernCard 
                title="Emails Sent" 
                value="1,234"
                icon={Mail}
                description="+20.1% from last month"
              />
              <ModernCard 
                title="SMS Sent" 
                value="856"
                icon={Phone}
                description="+15.3% from last month"
              />
              <ModernCard 
                title="Open Rate" 
                value="68.5%"
                icon={Activity}
                description="+2.5% from last month"
              />
              <ModernCard 
                title="Response Rate" 
                value="24.8%"
                icon={Users}
                description="+4.1% from last month"
              />
            </div>
            
            <div className="grid gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Overview</CardTitle>
                  <CardDescription>
                    Track your communication metrics and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Detailed analytics coming soon
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <SendCommunicationDialog 
          open={sendDialogOpen} 
          onOpenChange={setSendDialogOpen}
          defaultType={selectedType}
        />
      </AnimatedContainer>
    </PageLayout>
  );
};

export default ConnectCenter;
