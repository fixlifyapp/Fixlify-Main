
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Settings, ExternalLink, Zap, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const PhoneNumberManagement = () => {
  // Get both Telnyx numbers and regular phone numbers
  const { data: allNumbers = [], isLoading } = useQuery({
    queryKey: ['phone-numbers-management'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.phone_numbers || [];
    }
  });

  const { data: telnyxConfig } = useQuery({
    queryKey: ['telnyx-config'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'get_config' }
      });

      if (error) throw error;
      return data.config;
    }
  });

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Phone Number Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your Telnyx phone numbers and AI dispatcher settings
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
          {isLoading ? (
            <div>Loading your phone numbers...</div>
          ) : allNumbers.length === 0 ? (
            <div className="text-center py-8">
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
            </div>
          ) : (
            <div className="space-y-4">
              {allNumbers.map((number: any) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatPhoneNumber(number.phone_number)}
                      </span>
                      <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                      {(number.ai_dispatcher_enabled || number.configured_for_ai || number.configured_at) && (
                        <Badge variant="outline" className="text-green-600">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Ready
                        </Badge>
                      )}
                      {number.source === 'telnyx_table' && (
                        <Badge variant="outline" className="text-blue-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Telnyx
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {number.purchased_at && (
                        <span>Added: {new Date(number.purchased_at).toLocaleDateString()}</span>
                      )}
                      {number.configured_at && (
                        <span className="ml-4">
                          AI Configured: {new Date(number.configured_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <a href="/settings/phone-numbers">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Telnyx Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">API Configuration</h4>
              <p className="text-sm text-muted-foreground">
                {telnyxConfig?.api_key_configured ? 
                  'Telnyx API key is configured and ready' : 
                  'Telnyx API key needs to be configured'
                }
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
    </div>
  );
};
