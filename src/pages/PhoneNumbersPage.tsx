import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Phone, Building2, CheckCircle, DollarSign } from 'lucide-react';
import { PhoneNumberPurchase } from '../components/connect/PhoneNumberPurchase';
import { TelnyxPhoneStatus } from '../components/connect/TelnyxPhoneStatus';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function PhoneNumbersPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Manage your phone numbers for SMS, voice calls, and AI dispatcher"
        icon={Phone}
        badges={[
          { text: "Telnyx Integration", icon: Building2, variant: "fixlyfy" },
          { text: "AI Ready", icon: CheckCircle, variant: "success" },
          { text: "Two-way Communication", icon: Phone, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        {/* Status Overview */}
        <TelnyxPhoneStatus />

        {/* Phone Management Tabs */}
        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Numbers</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <PhoneNumberPurchase />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Telnyx Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-secondary/50 rounded-lg font-mono">
                      <p>VITE_TELNYX_API_KEY={import.meta.env.VITE_TELNYX_API_KEY ? '✓ Set' : '✗ Not Set'}</p>
                      <p>VITE_TELNYX_CONNECTION_ID={import.meta.env.VITE_TELNYX_CONNECTION_ID || 'Not Set'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Webhook URLs</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">SMS Webhook:</p>
                    <code className="block p-2 bg-secondary/50 rounded text-xs">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/sms-receiver
                    </code>
                    <p className="text-muted-foreground">Voice Webhook:</p>
                    <code className="block p-2 bg-secondary/50 rounded text-xs">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/telnyx-voice-webhook
                    </code>
                    <p className="text-muted-foreground">Status Webhook:</p>
                    <code className="block p-2 bg-secondary/50 rounded text-xs">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/telnyx-status-webhook
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Features</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Two-way SMS messaging</li>
                    <li>• Voice calls with recording</li>
                    <li>• AI dispatcher for intelligent call routing</li>
                    <li>• Real-time transcription</li>
                    <li>• Call analytics and reporting</li>
                    <li>• Webhook event tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}