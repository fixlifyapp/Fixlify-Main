import { useState } from 'react';
import { MessageSquare, Mail, Phone, History, Send, Plus, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Connect Center</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleSendClick('email')}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button onClick={() => handleSendClick('sms')} variant="secondary">
            <Phone className="h-4 w-4 mr-2" />
            Send SMS
          </Button>
        </div>
      </div>

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
            <MessageSquare className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms">
          <SMSConversations />
        </TabsContent>

        <TabsContent value="history">
          <CommunicationHistory />        </TabsContent>

        <TabsContent value="templates">
          <CommunicationTemplates />
        </TabsContent>

        <TabsContent value="automations">
          <CommunicationAutomations />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">856</div>
                <p className="text-xs text-muted-foreground">+15.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.5%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">+4.1% from last month</p>
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
    </div>
  );
}