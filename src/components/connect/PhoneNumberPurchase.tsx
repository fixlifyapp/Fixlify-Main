import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search, Plus, MapPin, Hash, Globe, Loader2, CheckCircle, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";
import { useAuth } from "@/hooks/use-auth";
import { TelnyxSyncButton } from "./TelnyxSyncButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AvailableNumber {
  phone_number: string;
  locality?: string;
  region?: string;
  rate_center?: string;
  features: string[];
  cost?: {
    monthly_rental_rate: string;
    upfront_cost: string;
  };
}

export function PhoneNumberPurchase() {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<'area-code' | 'locality'>('area-code');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('US');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Check for claimable numbers (from your Telnyx account)
  const { data: claimableNumbers = [], refetch: refetchClaimable } = useQuery({
    queryKey: ['claimable-phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .is('assigned_to', null)
        .eq('is_active', true)
        .order('phone_number');

      if (error) throw error;
      return data || [];
    }
  });

  // Get user's existing phone numbers
  const { data: userNumbers = [] } = useQuery({
    queryKey: ['user-phone-numbers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('assigned_to', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Search for new numbers from Telnyx
  const searchNumbers = async () => {
    if (!searchValue && searchType !== 'locality') {
      toast.error('Please enter a search value');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-manager', {
        body: {
          action: 'search_available_numbers',
          area_code: searchType === 'area-code' ? searchValue : undefined,
          locality: searchType === 'locality' ? searchValue : undefined,
          country
        }
      });

      if (error) throw error;

      if (data.success) {
        setAvailableNumbers(data.numbers);
        if (data.numbers.length === 0) {
          toast.info('No numbers found. Try a different search.');
        }
      } else {
        toast.error(data.error || 'Failed to search numbers');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for numbers');
    } finally {
      setIsSearching(false);
    }
  };

  // Claim existing number mutation
  const claimNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!user?.id) {
        throw new Error('You must be logged in to claim a phone number');
      }

      const { data, error } = await supabase
        .from('phone_numbers')
        .update({ assigned_to: user.id })
        .eq('phone_number', phoneNumber)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, phoneNumber) => {
      toast.success(`Successfully claimed ${formatPhoneForDisplay(data?.phone_number || phoneNumber)}`);
      queryClient.invalidateQueries({ queryKey: ['claimable-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
    },
    onError: (error) => {
      console.error('Claim error:', error);
      toast.error('Failed to claim phone number');
    }
  });

  // Purchase new number mutation
  const purchaseNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!user?.id) {
        throw new Error('You must be logged in to purchase a phone number');
      }

      const { data, error } = await supabase.functions.invoke('telnyx-phone-manager', {
        body: {
          action: 'purchase_number',
          phone_number: phoneNumber,
          user_id: user.id
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to purchase number');
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success('Successfully purchased phone number!');
      queryClient.invalidateQueries({ queryKey: ['user-phone-numbers'] });
      setAvailableNumbers([]);
      setSearchValue('');
    },
    onError: (error: any) => {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase phone number');
    }
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number Management
          </div>
          <TelnyxSyncButton />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User's Current Numbers */}
        {userNumbers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Your Phone Numbers</h3>
            <div className="grid gap-2">
              {userNumbers.map((number) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{formatPhoneForDisplay(number.phone_number)}</span>
                    <Badge variant="outline" className="text-xs">
                      {number.phone_number.slice(2, 5)}
                    </Badge>
                    {number.ai_dispatcher_enabled && (
                      <Badge className="text-xs">AI Enabled</Badge>
                    )}
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="existing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Your Available Numbers</TabsTrigger>
            <TabsTrigger value="purchase">Purchase New</TabsTrigger>
          </TabsList>

          {/* Existing Numbers Tab */}
          <TabsContent value="existing" className="space-y-4">
            {claimableNumbers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  These numbers are already in your Telnyx account and ready to use:
                </p>
                <div className="grid gap-2">
                  {claimableNumbers.map((number) => (
                    <div
                      key={number.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{formatPhoneForDisplay(number.phone_number)}</span>
                        <Badge variant="outline" className="text-xs">
                          {number.phone_number.slice(2, 5)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => claimNumberMutation.mutate(number.phone_number)}
                        disabled={claimNumberMutation.isPending}
                      >
                        {claimNumberMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Claim
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available numbers in your Telnyx account.</p>
                <p className="text-sm mt-2">Purchase new numbers or sync from Telnyx.</p>
              </div>
            )}
          </TabsContent>

          {/* Purchase New Numbers Tab */}
          <TabsContent value="purchase" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search-type">Search By</Label>
                <Select value={searchType} onValueChange={(v: any) => setSearchType(v)}>
                  <SelectTrigger id="search-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area-code">Area Code</SelectItem>
                    <SelectItem value="locality">City/Locality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search-value">
                  {searchType === 'area-code' ? 'Area Code' : 'City Name'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="search-value"
                    placeholder={searchType === 'area-code' ? '416' : 'Toronto'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchNumbers()}
                  />
                  <Button
                    onClick={searchNumbers}
                    disabled={isSearching}
                    size="icon"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {availableNumbers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Found {availableNumbers.length} available numbers from Telnyx
                </p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableNumbers.map((number) => (
                    <div
                      key={number.phone_number}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{formatPhoneForDisplay(number.phone_number)}</span>
                        {number.locality && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {number.locality}
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          {number.features?.includes('sms') && (
                            <Badge variant="secondary" className="text-xs">SMS</Badge>
                          )}
                          {number.features?.includes('voice') && (
                            <Badge variant="secondary" className="text-xs">Voice</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {number.cost && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${number.cost.monthly_rental_rate}/mo
                            </p>
                            {number.cost.upfront_cost !== "0.00" && (
                              <p className="text-xs text-muted-foreground">
                                Setup: ${number.cost.upfront_cost}
                              </p>
                            )}
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => purchaseNumberMutation.mutate(number.phone_number)}
                          disabled={purchaseNumberMutation.isPending}
                        >
                          {purchaseNumberMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-1" />
                              Purchase
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}