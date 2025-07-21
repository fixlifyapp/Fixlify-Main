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
import { CommunicationTemplates } from './CommunicationTemplates';
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
    <PageLayout>
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
              <ModernCard>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </div>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
              </ModernCard>
              <ModernCard>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SMS Sent</p>
                    <p className="text-2xl font-bold">856</p>
                    <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                  </div>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
              </ModernCard>
              <ModernCard>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">68.5%</p>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </ModernCard>
              <ModernCard>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                    <p className="text-2xl font-bold">24.8%</p>
                    <p className="text-xs text-muted-foreground">+4.1% from last month</p>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </ModernCard>
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
}