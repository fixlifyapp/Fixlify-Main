import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, RefreshCw, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';
import { useAuth } from '@/hooks/use-auth';

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  user_id?: string;
  area_code?: string;
  locality?: string;
  region?: string;
  country_code?: string;
  features?: string[];
  monthly_cost?: number;
  setup_cost?: number;
  purchased_at?: string;
}

export const TelnyxPhoneManagementFixed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [manualPhone, setManualPhone] = useState('');

  // Fetch all phone numbers and categorize them
  const { data: phoneData = { owned: [], available: [] }, isLoading, refetch } = useQuery({
    queryKey: ['telnyx-all-phone-numbers'],
    queryFn: async () => {
      console.log('Fetching all phone numbers...');
      
      // Get all numbers from the database
      const { data: allNumbers, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .order('phone_number');

      if (error) {
        console.error('Error fetching numbers:', error);
        throw error;
      }

      // Categorize numbers
      const owned = allNumbers.filter(n => n.user_id === user?.id);
      const available = allNumbers.filter(n => !n.user_id || n.user_id === null);

      console.log('Categorized numbers:', { 
        total: allNumbers.length, 
        owned: owned.length, 
        available: available.length 
      });

      return { owned, available };
    },
    enabled: !!user
  });

  // Sync with Telnyx
  const syncMutation = useMutation({
    mutationFn: async () => {
      console.log('Syncing with Telnyx...');
      const { data, error } = await supabase.functions.invoke('sync-telnyx-numbers', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced?.total || 0} numbers from Telnyx`);
      refetch();
    },
    onError: (error) => {
      console.error('Sync error:', error);
      toast.error('Failed to sync with Telnyx');
    }
  });

  // Claim a phone number
  const claimMutation = useMutation({
    mutationFn: async (phoneNumber: PhoneNumber) => {
      console.log('Claiming number:', phoneNumber.phone_number);
      
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ 
          user_id: user?.id,
          status: 'active'
        })
        .eq('id', phoneNumber.id)
        .is('user_id', null);

      if (error) throw error;
    },
    onSuccess: (_, phoneNumber) => {
      toast.success(`Successfully claimed ${formatPhoneForDisplay(phoneNumber.phone_number)}`);
      refetch();
    },
    onError: (error) => {
      console.error('Claim error:', error);
      toast.error('Failed to claim phone number');
    }
  });

  // Release a phone number
  const releaseMutation = useMutation({
    mutationFn: async (phoneNumber: PhoneNumber) => {
      console.log('Releasing number:', phoneNumber.phone_number);
      
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ 
          user_id: null,
          status: 'available'
        })
        .eq('id', phoneNumber.id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: (_, phoneNumber) => {
      toast.success(`Released ${formatPhoneForDisplay(phoneNumber.phone_number)}`);
      refetch();
    },
    onError: (error) => {
      console.error('Release error:', error);
      toast.error('Failed to release phone number');
    }
  });

  // Add manual phone number
  const addManualMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // Format phone number
      let formatted = phoneNumber.replace(/\D/g, '');
      if (formatted.length === 10) {
        formatted = `+1${formatted}`;
      } else if (formatted.length === 11 && formatted.startsWith('1')) {
        formatted = `+${formatted}`;
      } else if (!formatted.startsWith('+')) {
        formatted = `+${formatted}`;
      }

      console.log('Adding manual number:', formatted);

      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .insert({
          phone_number: formatted,
          status: 'available',
          country_code: 'US',
          area_code: formatted.substring(2, 5),
          monthly_cost: 0,
          setup_cost: 0,
          purchased_at: new Date().toISOString()
        });

      if (error) {
        if (error.message.includes('duplicate')) {
          throw new Error('This phone number already exists');
        }
        throw error;
      }

      return formatted;
    },
    onSuccess: (phoneNumber) => {
      toast.success(`Added ${phoneNumber} to available numbers`);
      setManualPhone('');
      refetch();
    },
    onError: (error: Error) => {
      console.error('Add manual error:', error);
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header with sync button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="h-6 w-6" />
          Phone Number Management
        </h2>
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Sync from Telnyx
        </Button>
      </div>

      {/* Your Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Your Phone Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : phoneData.owned.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No phone numbers claimed yet</p>
              <p className="text-sm mt-2">Claim an available number below to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {phoneData.owned.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatPhoneForDisplay(number.phone_number)}</p>
                      <p className="text-sm text-muted-foreground">
                        {number.locality || number.area_code || 'Area'} 
                        {number.area_code && ` (${number.area_code})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => releaseMutation.mutate(number)}
                      disabled={releaseMutation.isPending}
                    >
                      Release
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Your Available Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          {phoneData.available.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No available numbers in your Telnyx account.</p>
              <p className="text-sm mt-2">Purchase new numbers or sync from Telnyx.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {phoneData.available.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatPhoneForDisplay(number.phone_number)}</p>
                      <p className="text-sm text-muted-foreground">
                        {number.locality || number.area_code || 'Area'} 
                        {number.area_code && ` (${number.area_code})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Available</Badge>
                    <Button
                      size="sm"
                      onClick={() => claimMutation.mutate(number)}
                      disabled={claimMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Claim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Add Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Phone Number Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-phone">Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="manual-phone"
                  type="tel"
                  placeholder="+1 (416) 555-1234"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && manualPhone) {
                      addManualMutation.mutate(manualPhone);
                    }
                  }}
                />
                <Button
                  onClick={() => addManualMutation.mutate(manualPhone)}
                  disabled={!manualPhone || addManualMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Add phone numbers manually for testing or if sync is not working
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase New Section */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase New</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Need more phone numbers? Purchase them directly from your Telnyx account.
          </p>
          <Button
            onClick={() => window.open('https://portal.telnyx.com/#/app/numbers/search', '_blank')}
          >
            Go to Telnyx Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
