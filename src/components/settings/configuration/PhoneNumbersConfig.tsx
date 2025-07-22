import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search, Plus, MapPin, Hash, Globe, Trash2, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  user_id: string | null;
  country_code: string;
  area_code: string;
  monthly_cost: string;
  setup_cost: string;
  ai_dispatcher_enabled: boolean;
  created_at: string;
  purchased_at: string | null;
}

interface AvailableNumber {
  phone_number: string;
  region_information: any;
  features: string[];
  cost_information: any;
  source: 'telnyx';
}

export function PhoneNumbersConfig() {
  const [searchType, setSearchType] = useState<'city' | 'area-code' | 'local' | 'toll-free'>('city');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('CA');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const queryClient = useQueryClient();

  // Fetch owned phone numbers
  const { data: ownedNumbers = [], isLoading } = useQuery({
    queryKey: ['owned-phone-numbers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch available phone numbers to claim
  const { data: availableToClaimNumbers = [] } = useQuery({
    queryKey: ['available-to-claim-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'available')
        .is('user_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Claim available number mutation
  const claimNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to claim a phone number');
      }
      
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .update({
          user_id: user.id,
          status: 'active',
          purchased_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
        .eq('status', 'available')
        .is('user_id', null)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to claim phone number: ' + error.message);
      }
      
      if (!data) {
        throw new Error('Phone number is no longer available to claim');
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(`🎉 Number ${data.phone_number} claimed successfully!`);
      queryClient.invalidateQueries({ queryKey: ['owned-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['available-to-claim-numbers'] });
    },
    onError: (error) => {
      toast.error(`Failed to claim number: ${error.message}`);
    }
  });

  // Unassign/Release phone number mutation
  const unassignNumberMutation = useMutation({
    mutationFn: async (phoneNumber: PhoneNumber) => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .update({
          user_id: null,
          status: 'available',
          ai_dispatcher_enabled: false
        })
        .eq('id', phoneNumber.id)
        .eq('user_id', phoneNumber.user_id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to release phone number: ' + error.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Number ${data.phone_number} released and is now available for others`);
      queryClient.invalidateQueries({ queryKey: ['owned-phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['available-to-claim-numbers'] });
      setShowUnassignDialog(false);
      setSelectedNumber(null);
    },
    onError: (error) => {
      toast.error(`Failed to release number: ${error.message}`);
    }
  });

  // Search for new numbers
  const searchNumbers = async () => {
    if (!searchValue.trim() && searchType !== 'toll-free' && searchType !== 'local') {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      let searchParams: any = {
        action: 'search',
        country_code: country
      };

      switch (searchType) {
        case 'area-code':
          searchParams.area_code = searchValue;
          break;
        case 'city':
          searchParams.locality = searchValue;
          searchParams.administrative_area = searchValue;
          break;
        case 'local':
          searchParams.number_type = 'local';
          if (searchValue) {
            searchParams.area_code = searchValue;
          }
          break;
        case 'toll-free':
          searchParams.number_type = 'toll_free';
          break;
      }

      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: searchParams
      });

      if (error) throw error;
      
      setAvailableNumbers(data.available_numbers || []);
      
      if (data.available_numbers?.length > 0) {
        toast.success(`Found ${data.available_numbers.length} available numbers`);
      } else {
        toast.info('No numbers found for your search criteria. Try different parameters.');
      }
    } catch (error) {
      toast.error(`Failed to search for numbers: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Purchase number mutation
  const purchaseNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'purchase',
          phone_number: phoneNumber,
          country_code: country
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`📞 Number ${data.phone_number} purchased successfully for $0!`);
      queryClient.invalidateQueries({ queryKey: ['owned-phone-numbers'] });
      setAvailableNumbers(prev => prev.filter(num => num.phone_number !== data.phone_number));
    },
    onError: (error) => {
      toast.error(`Failed to purchase number: ${error.message}`);
    }
  });

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'area-code':
        return country === 'CA' ? 'e.g., 416, 604, 514' : 'e.g., 212, 310, 415';
      case 'city':
        return country === 'CA' ? 'e.g., Toronto, Vancouver, Montreal' : 'e.g., New York, Los Angeles, San Francisco';
      case 'local':
        return 'Optional: Enter area code for local numbers';
      case 'toll-free':
        return 'Search toll-free numbers (800, 888, 877, etc.)';
      default:
        return 'Enter search term';
    }
  };

  const canadianCities = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'];
  const usCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  const cities = country === 'CA' ? canadianCities : usCities;

  return (
    <div className="space-y-6">
      {/* Owned Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers
          </CardTitle>
          <CardDescription>
            Manage your active phone numbers and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : ownedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No phone numbers configured</p>
              <p className="text-sm text-gray-400">Purchase or claim a number below to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownedNumbers.map((number: PhoneNumber) => (
                <div key={number.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">
                          {formatPhoneForDisplay(number.phone_number)}
                        </h3>
                        <Badge variant="default">Active</Badge>
                        {number.ai_dispatcher_enabled && (
                          <Badge variant="outline" className="text-green-600">
                            AI Enabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {number.country_code === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'} • 
                        Area Code: {number.area_code} • 
                        Monthly: ${number.monthly_cost}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => {
                        setSelectedNumber(number);
                        setShowUnassignDialog(true);
                      }}
                    >
                      <UserX className="h-4 w-4" />
                      Release
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Numbers to Claim */}
      {availableToClaimNumbers.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Phone className="h-5 w-5" />
              Available Numbers to Claim - FREE!
            </CardTitle>
            <CardDescription className="text-green-700">
              These numbers are available in the system and can be claimed instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableToClaimNumbers.map((number: PhoneNumber) => (
              <div key={number.id} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-xl text-green-800">
                        {formatPhoneForDisplay(number.phone_number)}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        🎁 FREE TO CLAIM
                      </Badge>
                    </div>
                    <div className="text-sm text-green-700">
                      <span className="font-medium">
                        {number.country_code === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'} • 
                        Area Code: {number.area_code} • 
                        Setup: FREE • Monthly: FREE
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => claimNumberMutation.mutate(number.phone_number)}
                    disabled={claimNumberMutation.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4" />
                    {claimNumberMutation.isPending ? 'Claiming...' : 'Claim Now'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search & Purchase New Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Purchase New Numbers
          </CardTitle>
          <CardDescription>
            Find and purchase new phone numbers - All numbers are currently FREE!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-type">Search Type</Label>
              <Select value={searchType} onValueChange={(value: 'city' | 'area-code' | 'local' | 'toll-free') => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City/Region
                    </div>
                  </SelectItem>
                  <SelectItem value="area-code">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Area Code
                    </div>
                  </SelectItem>
                  <SelectItem value="local">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Local Numbers
                    </div>
                  </SelectItem>
                  <SelectItem value="toll-free">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Toll-Free
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-value">
                {searchType === 'area-code' ? 'Area Code' : 
                 searchType === 'city' ? 'City/Region' : 
                 searchType === 'local' ? 'Area Code (Optional)' : 
                 'Search Toll-Free'}
              </Label>
              {searchType === 'city' ? (
                <Select value={searchValue} onValueChange={setSearchValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="search-value"
                  placeholder={getSearchPlaceholder()}
                  value={searchValue}
                  onChange={(e) => {
                    if (searchType === 'area-code' || searchType === 'local') {
                      setSearchValue(e.target.value.replace(/\D/g, '').slice(0, 3));
                    } else {
                      setSearchValue(e.target.value);
                    }
                  }}
                  maxLength={searchType === 'area-code' || searchType === 'local' ? 3 : undefined}
                />
              )}
            </div>
          </div>

          <Button 
            onClick={searchNumbers}
            disabled={isSearching || (!searchValue && searchType !== 'toll-free' && searchType !== 'local')}
            className="w-full"
          >
            {isSearching ? 'Searching...' : 'Search Available Numbers'}
          </Button>

          {/* Search Results */}
          {availableNumbers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Numbers ({availableNumbers.length})</h4>
              <div className="grid grid-cols-1 gap-3">
                {availableNumbers.map((number) => (
                  <div
                    key={number.phone_number}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-lg">
                          {formatPhoneForDisplay(number.phone_number)}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          📞 Telnyx Number
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          💰 FREE
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>
                          {number.region_information?.[0]?.region_name || (country === 'CA' ? 'Canada' : 'United States')}, {' '}
                          {number.region_information?.[0]?.rate_center || 'Local Area'}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span>Setup: FREE</span>
                          <span>Monthly: FREE</span>
                          <div className="flex gap-1">
                            {number.features?.includes('voice') && (
                              <Badge variant="outline" className="text-xs">Voice</Badge>
                            )}
                            {number.features?.includes('sms') && (
                              <Badge variant="outline" className="text-xs">SMS</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => purchaseNumberMutation.mutate(number.phone_number)}
                      disabled={purchaseNumberMutation.isPending}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {purchaseNumberMutation.isPending ? 'Purchasing...' : 'Get for FREE'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release {selectedNumber && formatPhoneForDisplay(selectedNumber.phone_number)}? 
              This will make it available for other users to claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNumber && unassignNumberMutation.mutate(selectedNumber)}
              className="bg-red-600 hover:bg-red-700"
            >
              Release Number
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 