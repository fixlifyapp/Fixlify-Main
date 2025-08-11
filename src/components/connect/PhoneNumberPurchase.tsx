import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, DollarSign, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/utils/phone-utils';

interface AvailablePhoneNumber {
  id?: string;
  phone_number: string;
  friendly_name?: string;
  locality?: string;
  region?: string;
  country_code?: string;
  capabilities?: {
    sms: boolean;
    voice: boolean;
    mms: boolean;
  };
  price?: number;
  monthly_price?: number;
}

export const PhoneNumberPurchase: React.FC = () => {
  const { user } = useAuth();
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [userPhoneNumbers, setUserPhoneNumbers] = useState<any[]>([]);

  useEffect(() => {
    fetchAvailableNumbers();
    fetchUserPhoneNumbers();
  }, [user]);

  const fetchAvailableNumbers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'available')
        .limit(20);

      if (error) throw error;
      setAvailableNumbers(data || []);
    } catch (error) {
      console.error('Error fetching available numbers:', error);
      toast.error('Failed to load available phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPhoneNumbers = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'purchased');

      if (error) throw error;
      setUserPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching user phone numbers:', error);
    }
  };

  const searchPhoneNumbers = async () => {
    if (!searchQuery) {
      fetchAvailableNumbers();
      return;
    }

    try {
      setIsLoading(true);
      
      // Search in available phone numbers
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'available')
        .or(`locality.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setAvailableNumbers(data || []);
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      toast.error('Failed to search phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePhoneNumber = async (phoneNumber: AvailablePhoneNumber) => {
    if (!user?.id) {
      toast.error('Please login to purchase a phone number');
      return;
    }

    try {
      setIsPurchasing(phoneNumber.phone_number);
      
      // Check if user already has 5 phone numbers (limit for free tier)
      if (userPhoneNumbers.length >= 5) {
        toast.error('You have reached the maximum limit of 5 phone numbers for the free tier');
        return;
      }

      // Update the phone number record in database
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          status: 'purchased',
          purchased_by: user.id,
          user_id: user.id,
          purchased_at: new Date().toISOString(),
          is_primary: userPhoneNumbers.length === 0, // First number is primary
          is_active: true
        })
        .eq('phone_number', phoneNumber.phone_number)
        .eq('status', 'available');

      if (updateError) throw updateError;

      // Configure webhooks for the number (if using real Telnyx)
      if (phoneNumber.phone_number.startsWith('+1437') || phoneNumber.phone_number.startsWith('+1437')) {
        try {
          const { error: webhookError } = await supabase.functions.invoke('manage-phone-numbers', {
            body: {
              action: 'configure_webhooks',
              phone_number: phoneNumber.phone_number,
              user_id: user.id
            }
          });
          
          if (webhookError) {
            console.error('Webhook configuration failed:', webhookError);
            // Don't fail the purchase, just warn
            toast.warning('Phone number purchased but webhook configuration failed. Please configure manually.');
          }
        } catch (webhookErr) {
          console.error('Webhook configuration error:', webhookErr);
        }
      }

      toast.success(`Successfully purchased ${formatPhoneNumber(phoneNumber.phone_number)}!`);
      
      // Refresh lists
      await fetchAvailableNumbers();
      await fetchUserPhoneNumbers();
      
    } catch (error: any) {
      console.error('Error purchasing phone number:', error);
      toast.error('Failed to purchase phone number: ' + error.message);
    } finally {
      setIsPurchasing(null);
    }
  };

  const filteredNumbers = availableNumbers.filter(num => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      num.phone_number.includes(query) ||
      num.locality?.toLowerCase().includes(query) ||
      num.region?.toLowerCase().includes(query) ||
      num.friendly_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Purchase Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by area code, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPhoneNumbers()}
              className="flex-1"
            />
            <Button onClick={searchPhoneNumbers} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          {userPhoneNumbers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You have {userPhoneNumbers.length} phone number{userPhoneNumbers.length > 1 ? 's' : ''} purchased. 
                {5 - userPhoneNumbers.length > 0 && ` You can purchase ${5 - userPhoneNumbers.length} more.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Numbers (Free During Beta)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading available numbers...</p>
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No available phone numbers found.</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching for a different area or contact support.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNumbers.map((number) => (
                <Card key={number.phone_number} className="relative">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">
                            {formatPhoneNumber(number.phone_number)}
                          </p>
                          {number.locality && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {number.locality}, {number.region}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          FREE
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {number.capabilities?.sms && (
                          <Badge variant="outline" className="text-xs">SMS</Badge>
                        )}
                        {number.capabilities?.voice && (
                          <Badge variant="outline" className="text-xs">Voice</Badge>
                        )}
                        {number.capabilities?.mms && (
                          <Badge variant="outline" className="text-xs">MMS</Badge>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Setup Fee:</span>
                          <span className="font-semibold text-green-600">$0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Monthly:</span>
                          <span className="font-semibold text-green-600">$0.00/mo</span>
                        </div>
                        
                        <Button
                          onClick={() => purchasePhoneNumber(number)}
                          disabled={isPurchasing === number.phone_number || userPhoneNumbers.length >= 5}
                          className="w-full"
                          size="sm"
                        >
                          {isPurchasing === number.phone_number ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Purchasing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Get This Number
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
