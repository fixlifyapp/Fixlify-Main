
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import CommunicationHistory from './CommunicationHistory';
import CommunicationTemplates from './CommunicationTemplates';
import { CommunicationAutomations } from './CommunicationAutomations';
import { SendCommunicationDialog } from './SendCommunicationDialog';
import { MessageSquare, Mail, Phone, Settings, Plus } from 'lucide-react';

export const ConnectCenter = () => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connect Center"
        actions={
          <SendCommunicationDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </SendCommunicationDialog>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Automations</span>
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <CommunicationHistory />
        </TabsContent>

        <TabsContent value="templates">
          <CommunicationTemplates />
        </TabsContent>

        <TabsContent value="automations">
          <CommunicationAutomations />
        </TabsContent>

        <TabsContent value="phone">
          <div className="text-center py-8">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Phone Management</h3>
            <p className="text-muted-foreground">
              Phone number management and call features coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectCenter;
