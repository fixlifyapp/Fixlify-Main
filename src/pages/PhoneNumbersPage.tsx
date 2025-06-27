import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, Phone, Search, CheckCircle, XCircle, DollarSign, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';

export default function PhoneNumbersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    area_code: '',
    locality: '',
    number_type: 'local'
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch user's phone numbers
  const { data: userNumbers = [], isLoading: isLoadingUserNumbers } = useQuery({
    queryKey: ['user-phone-numbers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch available phone numbers from your Telnyx account
  const { data: availableNumbers = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['available-phone-numbers'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'list_available_from_telnyx' // New action to get your purchased Telnyx numbers
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        console.error('Error fetching available numbers:', response.error);
        // Fallback to database numbers if Telnyx fails
        const { data, error } = await supabase
          .from('telnyx_phone_numbers')
          .select('*')
          .or('status.eq.available,status.is.null')
          .is('user_id', null)
          .order('phone_number');

        if (error) throw error;
        return data || [];
      }

      return response.data?.available_numbers || [];
    }
  });

  // Manual sync user numbers
  const manualSyncMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'manual_sync_user_numbers'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to sync numbers');
      }

      return response.data;
    },
    onSuccess: (data) => {
      console.log('Manual sync result:', data);
      queryClient.invalidateQueries({ queryKey: ['available-phone-numbers'] });
      toast.success('Numbers synced!', {
        description: data.message || 'Your Telnyx numbers are now available'
      });
    },
    onError: (error: any) => {
      console.error('Manual sync error:', error);
      toast.error('Sync failed', {
        description: error.message || 'Unable to sync numbers'
      });
    }
  });

  // Test Telnyx connection
  const testTelnyxMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'test_telnyx_connection'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to test connection');
      }

      return response.data;
    },
    onSuccess: (data) => {
      console.log('Telnyx test result:', data);
      if (data.success) {
        toast.success('Telnyx API connected!', {
          description: `Found ${data.data?.data?.length || 0} numbers in your account`
        });
      } else {
        toast.error('Telnyx API connection failed', {
          description: data.error || 'Unknown error'
        });
      }
    },
    onError: (error: any) => {
      console.error('Telnyx test error:', error);
      toast.error('Test failed', {
        description: error.message || 'Unable to test Telnyx connection'
      });
    }
  });

  // Search for new numbers from Telnyx
  const searchNumbers = async () => {
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'search',
          ...searchParams
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to search for numbers');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Failed to search for numbers');
      }

      setSearchResults(result.available_numbers || []);
      
      if (result.available_numbers?.length === 0) {
        setSearchError('No numbers found for the specified criteria. Try a different area code or location.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Failed to search for numbers');
      toast.error('Search failed', {
        description: error.message || 'Unable to search for phone numbers'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Purchase a new number from Telnyx
  const purchaseMutation = useMutation({
    mutationFn: async ({ phoneNumber, source }: { phoneNumber: string; source?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'purchase',
          phone_number: phoneNumber,
          source: source
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to purchase number');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Failed to purchase number');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['available-phone-numbers'] });
      setSearchResults([]);
      toast.success('Phone number purchased!', {
        description: `${data.phone_number} has been added to your account`
      });
    },
    onError: (error: any) => {
      toast.error('Purchase failed', {
        description: error.message || 'Unable to purchase phone number'
      });
    }
  });

  // Claim an available number (assign to user)
  const claimMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // Update the number in database to assign it to the user
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .update({
          user_id: user?.id,
          status: 'active',
          purchased_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
        .or('status.eq.available,status.is.null')
        .is('user_id', null)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['available-phone-numbers'] });
      toast.success('Phone number claimed!', {
        description: `${data.phone_number} has been assigned to your account`
      });
    },
    onError: (error: any) => {
      toast.error('Claim failed', {
        description: error.message || 'Unable to claim phone number'
      });
    }
  });

  // Release a number back to available pool
  const releaseMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .update({
          user_id: null,
          status: 'available'
        })
        .eq('phone_number', phoneNumber)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['available-phone-numbers'] });
      toast.success('Phone number released', {
        description: `${data.phone_number} is now available for others to claim`
      });
    },
    onError: (error: any) => {
      toast.error('Release failed', {
        description: error.message || 'Unable to release phone number'
      });
    }
  });

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return number;
  };

  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Manage your phone numbers for AI-powered calls"
        icon={Phone}
        badges={[
          { text: "Telnyx Integration", icon: Building2, variant: "fixlyfy" },
          { text: "AI Ready", icon: CheckCircle, variant: "success" },
          { text: "Free Setup", icon: DollarSign, variant: "info" }
        ]}
      />

      <Tabs defaultValue="my-numbers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-numbers">My Numbers</TabsTrigger>
          <TabsTrigger value="available">Available Numbers</TabsTrigger>
          <TabsTrigger value="purchase">Purchase New</TabsTrigger>
        </TabsList>

        <TabsContent value="my-numbers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Your Phone Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUserNumbers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">You don't have any phone numbers yet.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Check available numbers or purchase a new one to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userNumbers.map((number) => (
                    <div key={number.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{formatPhoneNumber(number.phone_number)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {number.area_code && <span>Area: {number.area_code}</span>}
                            {number.locality && <span>• {number.locality}</span>}
                            {number.region && <span>• {number.region}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">FREE</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => releaseMutation.mutate(number.phone_number)}
                          disabled={releaseMutation.isPending}
                        >
                          {releaseMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Release'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Available Numbers from Your Telnyx Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    These are numbers you've already purchased in Telnyx. Users can claim them for <span className="font-semibold">FREE</span>!
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => manualSyncMutation.mutate()}
                    disabled={manualSyncMutation.isPending}
                  >
                    {manualSyncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Phone className="h-4 w-4 mr-2" />
                    )}
                    Sync Your Numbers
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testTelnyxMutation.mutate()}
                    disabled={testTelnyxMutation.isPending}
                  >
                    {testTelnyxMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Test API
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['available-phone-numbers'] })}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {isLoadingAvailable ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No available numbers from your Telnyx account.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Purchase numbers in your Telnyx dashboard first, then they'll appear here for your users to claim.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableNumbers.map((number) => (
                    <div key={number.id || number.phone_number} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{formatPhoneNumber(number.phone_number)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {number.area_code && <span>Area: {number.area_code}</span>}
                            {number.locality && <span>• {number.locality}</span>}
                            {number.region && <span>• {number.region}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => claimMutation.mutate(number.phone_number)}
                        disabled={claimMutation.isPending}
                        size="sm"
                      >
                        {claimMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Purchase New Number from Telnyx
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Numbers purchased here will be automatically assigned to your account and charged to your Telnyx billing.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Number Type</Label>
                  <RadioGroup
                    value={searchParams.number_type}
                    onValueChange={(value) => setSearchParams({ ...searchParams, number_type: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="local" />
                      <Label htmlFor="local" className="font-normal">Local Number</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="toll_free" id="toll_free" />
                      <Label htmlFor="toll_free" className="font-normal">Toll-Free Number</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area_code">Area Code</Label>
                    <Input
                      id="area_code"
                      placeholder="e.g., 415"
                      value={searchParams.area_code}
                      onChange={(e) => setSearchParams({ ...searchParams, area_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="locality">City/Locality</Label>
                    <Input
                      id="locality"
                      placeholder="e.g., San Francisco"
                      value={searchParams.locality}
                      onChange={(e) => setSearchParams({ ...searchParams, locality: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={searchNumbers}
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching Telnyx...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Available Numbers
                    </>
                  )}
                </Button>
              </div>

              {searchError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Available Numbers from Telnyx</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{formatPhoneNumber(result.phone_number)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {result.region_information && (
                              <>
                                {result.region_information.city && <span>{result.region_information.city}</span>}
                                {result.region_information.region && <span>• {result.region_information.region}</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">
                          ${result.cost_information?.monthly_cost || '1.00'}/mo
                        </span>
                        <Button
                          onClick={() => purchaseMutation.mutate({ 
                            phoneNumber: result.phone_number,
                            source: result.source 
                          })}
                          disabled={purchaseMutation.isPending}
                          size="sm"
                        >
                          {purchaseMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Purchase'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
} 