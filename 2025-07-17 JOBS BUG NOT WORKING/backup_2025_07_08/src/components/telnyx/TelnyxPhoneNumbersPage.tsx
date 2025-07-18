
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PhoneNumberPurchase } from '../connect/PhoneNumberPurchase';
import { PhoneNumberVerification } from './PhoneNumberVerification';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';

interface OwnedNumber {
  id: string;
  phone_number: string;
  status: string;
  country_code: string;
  area_code?: string;
  purchased_at?: string;
  configured_at?: string;
  webhook_url?: string;
  user_id?: string;
  monthly_cost?: number;
  setup_cost?: number;
}

export function TelnyxPhoneNumbersPage() {
  const queryClient = useQueryClient();

  // Fetch owned numbers
  const { data: ownedNumbers = [], isLoading: isLoadingOwned } = useQuery({
    queryKey: ['telnyx-owned-numbers'],
    queryFn: async () => {
      try {
        console.log('Fetching owned numbers...');
        const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('Error fetching owned numbers:', error);
          throw error;
        }
        console.log('Owned numbers:', data);
        return data.phone_numbers || [];
      } catch (error) {
        console.error('Failed to fetch owned numbers:', error);
        return [];
      }
    }
  });

  // Configure number mutation
  const configureNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      console.log('Configuring number:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'configure',
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Configure error:', error);
        throw error;
      }
      console.log('Configure response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully configured:', data);
      toast.success('Number configured for AI calls');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error) => {
      console.error('Configure error:', error);
      toast.error(`Failed to configure number: ${error.message}`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Phone Number Verification Section */}
      <PhoneNumberVerification />

      {/* Purchase Numbers Section */}
      <PhoneNumberPurchase />

      {/* Owned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Telnyx Numbers ({ownedNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOwned ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your numbers...</p>
            </div>
          ) : ownedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
              <p className="text-muted-foreground mb-4">
                Use the verification tool above to check if +14375249932 is assigned to your account, 
                or search and purchase a new phone number to get started with AI dispatcher
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ownedNumbers.map((number: OwnedNumber) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg">
                        {formatPhoneForDisplay(number.phone_number)}
                      </h3>
                      <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                      {(number.monthly_cost === 0 && number.setup_cost === 0) && (
                        <Badge variant="outline" className="text-green-600">
                          🧪 Test Number
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {number.purchased_at && (
                        <div>Added: {new Date(number.purchased_at).toLocaleDateString()}</div>
                      )}
                      {number.configured_at && (
                        <div>Configured: {new Date(number.configured_at).toLocaleDateString()}</div>
                      )}
                      {(number.monthly_cost !== undefined && number.setup_cost !== undefined) && (
                        <div>
                          Cost: ${number.setup_cost} setup + ${number.monthly_cost}/month
                          {number.monthly_cost === 0 && number.setup_cost === 0 && ' (Free!)'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {number.configured_at ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        AI Ready
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => configureNumberMutation.mutate(number.phone_number)}
                        disabled={configureNumberMutation.isPending}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure AI
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-blue-600">📞 For Test Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Perfect for development and testing</li>
                <li>• Configure AI dispatcher for free</li>
                <li>• Test call flows and responses</li>
                <li>• No real costs involved</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-green-600">🚀 For Production</h5>
              <ul className="space-y-1 text-sm">
                <li>• Purchase real Telnyx numbers</li>
                <li>• Configure webhooks in Telnyx dashboard</li>
                <li>• Set up AI dispatcher for live calls</li>
                <li>• Monitor call logs and performance</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">🧪 Testing Your Setup</h5>
            <p className="text-sm text-blue-700">
              After verifying and configuring your phone number, you can test the AI dispatcher by calling the number. 
              Check the "Call History" tab to see call logs and transcripts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
