import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Search, 
  Plus, 
  Trash2, 
  Loader2, 
  MessageSquare,
  DollarSign,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: 'active' | 'inactive' | 'pending';
  locality?: string;
  region?: string;
  monthly_cost?: number;
  features?: string[];
  created_at: string;
}

interface AvailableNumber {
  phoneNumber: string;
  locality?: string;
  region?: string;
  rateCenter?: string;
  monthlyCost: number;
  setupCost: number;
  features: string[];
}

export const PhoneNumberManager = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [areaCode, setAreaCode] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);

  // Load user's phone numbers
  const loadPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      
      if (data?.success && data?.phoneNumbers) {
        setPhoneNumbers(data.phoneNumbers);
      } else {
        throw new Error(data?.error || 'Failed to load phone numbers');
      }
    } catch (error: any) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  // Search for available numbers
  const searchNumbers = async () => {
    if (!areaCode || areaCode.length !== 3) {
      toast.error('Please enter a valid 3-digit area code');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'search',
          areaCode,
          limit: 20
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.numbers) {
        setAvailableNumbers(data.numbers);
        if (data.numbers.length === 0) {
          toast.info('No numbers available in this area code');
        }
      } else {
        throw new Error(data?.error || 'Failed to search numbers');
      }
    } catch (error: any) {
      console.error('Error searching numbers:', error);
      toast.error(error.message || 'Failed to search for numbers');
    } finally {
      setIsSearching(false);
    }
  };

  // Purchase a phone number
  const purchaseNumber = async () => {
    if (!selectedNumber) return;

    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'purchase',
          phoneNumber: selectedNumber.phoneNumber
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Successfully purchased ${selectedNumber.phoneNumber}`);
        setShowSearchDialog(false);
        setSelectedNumber(null);
        setAvailableNumbers([]);
        setAreaCode('');
        await loadPhoneNumbers();
      } else {
        throw new Error(data?.error || 'Failed to purchase number');
      }
    } catch (error: any) {
      console.error('Error purchasing number:', error);
      toast.error(error.message || 'Failed to purchase phone number');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Release a phone number
  const releaseNumber = async (phoneNumber: PhoneNumber) => {
    if (!confirm(`Are you sure you want to release ${phoneNumber.phone_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'release',
          phoneNumber: phoneNumber.phone_number
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Successfully released ${phoneNumber.phone_number}`);
        await loadPhoneNumbers();
      } else {
        throw new Error(data?.error || 'Failed to release number');
      }
    } catch (error: any) {
      console.error('Error releasing number:', error);
      toast.error(error.message || 'Failed to release phone number');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>
                Manage your Telnyx phone numbers for SMS communications
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowSearchDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Phone Number
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No phone numbers yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add a phone number to start sending SMS messages
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((number) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{formatPhoneNumber(number.phone_number)}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {number.locality && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {number.locality}, {number.region}
                          </span>
                        )}
                        {number.monthly_cost && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${number.monthly_cost}/month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                      {number.status}
                    </Badge>
                    {number.features?.includes('sms') && (
                      <Badge variant="outline" className="gap-1">
                        <MessageSquare className="h-3 w-3" />
                        SMS
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => releaseNumber(number)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Search for available phone numbers in your area
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="search" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Numbers</TabsTrigger>
              <TabsTrigger value="info">Pricing & Info</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="areaCode">Area Code</Label>
                    <Input
                      id="areaCode"
                      placeholder="e.g., 212, 415, 305"
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      onKeyDown={(e) => e.key === 'Enter' && searchNumbers()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={searchNumbers}
                      disabled={isSearching || !areaCode}
                      className="gap-2"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>

                {availableNumbers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Found {availableNumbers.length} available numbers
                    </p>
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {availableNumbers.map((number) => (
                        <div
                          key={number.phoneNumber}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedNumber?.phoneNumber === number.phoneNumber
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedNumber(number)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedNumber?.phoneNumber === number.phoneNumber && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {formatPhoneNumber(number.phoneNumber)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {number.locality && `${number.locality}, `}
                                  {number.region} • ${number.monthlyCost}/month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pricing Information</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Phone numbers typically cost $1-2/month</li>
                    <li>• SMS messages are charged per message sent</li>
                    <li>• No setup fees for most numbers</li>
                    <li>• You can release numbers at any time</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Features Included</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Send and receive SMS messages</li>
                    <li>• Use for estimate and invoice notifications</li>
                    <li>• Integrate with automation workflows</li>
                    <li>• Full Telnyx API capabilities</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSearchDialog(false);
              setSelectedNumber(null);
              setAvailableNumbers([]);
              setAreaCode('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={purchaseNumber}
              disabled={!selectedNumber || isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase Number
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};