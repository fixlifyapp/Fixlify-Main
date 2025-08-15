import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Mail, Zap, ExternalLink, Bot, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailConfiguration } from './EmailConfiguration';
import CompanyEmailSettings from './CompanyEmailSettings';
export const SettingsIntegrations = () => {
  // Get both Telnyx numbers and regular phone numbers
  const {
    data: allNumbers = [],
    isLoading
  } = useQuery({
    queryKey: ['phone-numbers-management'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'list'
        }
      });
      if (error) throw error;
      return data.phone_numbers || [];
    }
  });
  const {
    data: telnyxConfig
  } = useQuery({
    queryKey: ['telnyx-config'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'get_config'
        }
      });
      if (error) throw error;
      return data.config;
    }
  });
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Manage your integrations and external services
        </p>
      </div>

      <Tabs defaultValue="phone" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Numbers
          </TabsTrigger>
          
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messaging
          </TabsTrigger>
          
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            API & Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Phone Number Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage your phone numbers and AI dispatcher settings
              </p>
            </div>
            <Button asChild>
              <a href="/settings/phone-numbers" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Phone Numbers
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Your Phone Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div>Loading your phone numbers...</div> : allNumbers.length === 0 ? <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No phone numbers configured</h4>
                  <p className="text-muted-foreground mb-4">
                    Purchase or add your Telnyx phone numbers to enable AI dispatcher
                  </p>
                  <Button asChild>
                    <a href="/settings/phone-numbers">
                      Go to Phone Numbers
                    </a>
                  </Button>
                </div> : <div className="space-y-4">
                  {allNumbers.map((number: any) => <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {formatPhoneNumber(number.phone_number)}
                          </span>
                          <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                            {number.status}
                          </Badge>
                          {(number.ai_dispatcher_enabled || number.configured_for_ai || number.configured_at) && <Badge variant="outline" className="text-green-600">
                              <Bot className="h-3 w-3 mr-1" />
                              AI Ready
                            </Badge>}
                          {number.source === 'telnyx_table' && <Badge variant="outline" className="text-blue-600">
                              <Zap className="h-3 w-3 mr-1" />
                              Telnyx
                            </Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {number.purchased_at && <span>Added: {new Date(number.purchased_at).toLocaleDateString()}</span>}
                          {number.configured_at && <span className="ml-4">
                              AI Configured: {new Date(number.configured_at).toLocaleDateString()}
                            </span>}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" asChild>
                        <a href="/settings/phone-numbers">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </a>
                      </Button>
                    </div>)}
                </div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Phone System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">API Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    {telnyxConfig?.api_key_configured ? 'Phone system API key is configured and ready' : 'Phone system API key needs to be configured'}
                  </p>
                </div>
                <Badge variant={telnyxConfig?.api_key_configured ? 'default' : 'destructive'}>
                  {telnyxConfig?.api_key_configured ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">✅ Telnyx Benefits</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Simple API integration</li>
                    <li>• Real-time webhooks</li>
                    <li>• Global phone numbers</li>
                    <li>• High-quality voice calls</li>
                    <li>• Built-in SMS support</li>
                    <li>• Competitive pricing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">🚀 AI Dispatcher Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 24/7 call answering</li>
                    <li>• Appointment scheduling</li>
                    <li>• Customer information capture</li>
                    <li>• Emergency detection</li>
                    <li>• Call transcription</li>
                    <li>• CRM integration</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">📞 Your Telnyx Number</h5>
                <p className="text-sm text-blue-700">
                  You have the Telnyx number +14375249932. Use "Add Existing Number" in the Phone Numbers section to connect it to your account for full AI dispatcher capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Two-Way Email System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompanyEmailSettings />
              </CardContent>
            </Card>
            
            <EmailConfiguration />
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS & Messaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Telnyx SMS</h4>
                    <p className="text-sm text-muted-foreground">
                      Send and receive SMS messages through your Telnyx phone numbers
                    </p>
                  </div>
                  <Badge variant="default">
                    <Zap className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">SMS Features Available</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Two-way SMS conversations</li>
                    <li>• Automated appointment reminders</li>
                    <li>• Customer notifications</li>
                    <li>• Integration with your CRM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API & Webhooks Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Mailgun Email Webhook</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Configure Mailgun to forward incoming emails to your Fixlify account.
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs font-mono break-all">
                      https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/email-webhook
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Add this URL as a route action in your Mailgun dashboard for .*@fixlify.app
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">SMS Webhook</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Telnyx webhook for incoming SMS messages.
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs font-mono break-all">
                      https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};