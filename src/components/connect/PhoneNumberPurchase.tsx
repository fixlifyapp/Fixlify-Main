import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  Search, 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  DollarSign,
  Loader2,
  RefreshCw,
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPhoneNumber } from "@/utils/phone-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvailableNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  locality?: string;
  region?: string;
  country_code?: string;
  capabilities?: {
    sms?: boolean;
    voice?: boolean;
    mms?: boolean;
  };
  price: number;
  monthly_price: number;
  telnyx_id?: string;
  metadata?: any;
}

export const PhoneNumberPurchase = () => {
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();

  // Search for available numbers from Telnyx
  const searchNumbers = async (refreshFromTelnyx = false) => {
    if (!user?.id) {
      toast.error("Please login to search for phone numbers");
      return;
    }

    if (refreshFromTelnyx) {
      setIsRefreshing(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      // Call edge function to search numbers
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'telnyx-phone-search',
        {
          body: {
            areaCode: searchQuery,
            refreshFromTelnyx: refreshFromTelnyx,
            limit: 50
          }
        }
      );

      if (functionError) throw functionError;
      
      if (functionData?.success && functionData?.numbers) {
        setAvailableNumbers(functionData.numbers);
        
        if (refreshFromTelnyx) {
          toast.success(`Refreshed ${functionData.numbers.length} numbers from Telnyx`);
        } else if (functionData.numbers.length === 0) {
          toast.info("No numbers found. Try refreshing from Telnyx.");
        }
      } else {
        throw new Error(functionData?.error || 'Failed to fetch numbers');
      }
    } catch (error) {
      console.error('Error searching numbers:', error);
      toast.error('Failed to search phone numbers');
    } finally {
      setIsSearching(false);
      setIsRefreshing(false);
    }
  };

  // Load initial available numbers
  useEffect(() => {
    searchNumbers(false);
  }, [user]);

  // Purchase a phone number
  const purchaseNumber = async () => {
    if (!selectedNumber || !user?.id) return;

    setIsPurchasing(true);
    try {
      // Call edge function to purchase/assign number
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'telnyx-phone-purchase',
        {
          body: {
            phoneNumber: selectedNumber.phone_number,
            userId: user.id,
            telnyxId: selectedNumber.telnyx_id
          }
        }
      );

      if (functionError) throw functionError;
      
      if (functionData?.success) {
        toast.success(`Successfully assigned ${formatPhoneNumber(selectedNumber.phone_number)}!`);
        
        // Refresh the list
        setShowConfirmDialog(false);
        setSelectedNumber(null);
        searchNumbers(false);
        
        // Redirect to phone management page
        setTimeout(() => {
          window.location.href = '/settings/phone-numbers';
        }, 2000);
      } else {
        throw new Error(functionData?.error || 'Failed to purchase number');
      }
      
    } catch (error) {
      console.error('Error purchasing number:', error);
      toast.error('Failed to purchase phone number');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telnyx Profile Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          <strong>Telnyx Integration Active</strong><br/>
          Showing numbers from your Telnyx messaging profile. All numbers are pre-configured for SMS and voice.
        </AlertDescription>
      </Alert>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Search Telnyx Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Area Code or Number</Label>
              <Input
                id="search"
                placeholder="e.g., 415 or leave empty for all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchNumbers(false)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={() => searchNumbers(false)} 
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
              
              <Button 
                onClick={() => searchNumbers(true)}
                disabled={isRefreshing}
                variant="outline"
                title="Refresh from Telnyx"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click "Refresh" to fetch the latest available numbers from your Telnyx profile
          </p>
        </CardContent>
      </Card>

      {/* Available Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Numbers from Telnyx</CardTitle>
          <p className="text-sm text-muted-foreground">
            {availableNumbers.length} numbers available • Free during beta ($0/month)
          </p>
        </CardHeader>
        <CardContent>
          {isSearching || isRefreshing ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : availableNumbers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No available numbers found in your Telnyx profile.
              </p>
              <Button 
                onClick={() => searchNumbers(true)}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh from Telnyx
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableNumbers.map((number) => (
                <Card key={number.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-semibold text-lg">
                          {formatPhoneNumber(number.phone_number)}
                        </div>
                        
                        {number.locality && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {number.locality}, {number.region || 'US'}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">SMS</Badge>
                          <Badge variant="secondary" className="text-xs">Voice</Badge>
                          <Badge variant="secondary" className="text-xs">MMS</Badge>
                          {number.metadata?.from_profile && (
                            <Badge variant="default" className="text-xs">
                              <Wifi className="h-3 w-3 mr-1" />
                              Profile
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium text-green-600">
                            FREE (Beta)
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedNumber(number);
                          setShowConfirmDialog(true);
                        }}
                        className="bg-fixlyfy hover:bg-fixlyfy/90"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Get Number
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Phone Number Assignment</DialogTitle>
            <DialogDescription>
              This Telnyx number will be assigned to your account for SMS and voice communications.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNumber && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Phone Number:</span>
                  <span>{formatPhoneNumber(selectedNumber.phone_number)}</span>
                </div>
                {selectedNumber.locality && (
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{selectedNumber.locality}, {selectedNumber.region || 'US'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Monthly Cost:</span>
                  <span className="text-green-600 font-medium">FREE (Beta)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Setup Fee:</span>
                  <span className="text-green-600 font-medium">$0.00</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    This number is from your Telnyx messaging profile and is ready for immediate use with SMS, voice calls, and AI features.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={purchaseNumber}
              disabled={isPurchasing}
              className="bg-fixlyfy hover:bg-fixlyfy/90"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};