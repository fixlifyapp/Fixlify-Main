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
  Loader2
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
}

export const PhoneNumberPurchase = () => {
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();

  // Search for available numbers
  const searchNumbers = async () => {
    if (!user?.id) {
      toast.error("Please login to search for phone numbers");
      return;
    }

    setIsSearching(true);
    try {
      // For now, get from database (mock numbers)
      // In production, this would call Telnyx API
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'available')
        .ilike('phone_number', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      
      setAvailableNumbers(data || []);
      
      if (data?.length === 0) {
        toast.info("No numbers found. Try a different search.");
      }
    } catch (error) {
      console.error('Error searching numbers:', error);
      toast.error('Failed to search phone numbers');
    } finally {
      setIsSearching(false);
    }
  };

  // Load initial available numbers
  useEffect(() => {
    searchNumbers();
  }, [user]);

  // Purchase a phone number
  const purchaseNumber = async () => {
    if (!selectedNumber || !user?.id) return;

    setIsPurchasing(true);
    try {
      // Update the phone number record to mark it as purchased
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          status: 'purchased',
          purchased_by: user.id,
          user_id: user.id,
          purchased_at: new Date().toISOString(),
          friendly_name: `My Number ${selectedNumber.phone_number}`,
          // Set as primary if user has no other numbers
          is_primary: await checkIfFirstNumber()
        })
        .eq('id', selectedNumber.id)
        .eq('status', 'available'); // Extra safety check

      if (updateError) throw updateError;

      // Log the purchase
      await supabase
        .from('communication_logs')
        .insert({
          user_id: user.id,
          type: 'system',
          direction: 'internal',
          status: 'completed',
          content: `Phone number ${selectedNumber.phone_number} purchased`,
          metadata: {
            phone_number: selectedNumber.phone_number,
            price: selectedNumber.price,
            monthly_price: selectedNumber.monthly_price
          }
        });

      toast.success(`Successfully purchased ${formatPhoneNumber(selectedNumber.phone_number)}!`);
      
      // Refresh the list
      setShowConfirmDialog(false);
      setSelectedNumber(null);
      searchNumbers();
      
      // Redirect to phone management page
      setTimeout(() => {
        window.location.href = '/settings/phone-numbers';
      }, 2000);
      
    } catch (error) {
      console.error('Error purchasing number:', error);
      toast.error('Failed to purchase phone number');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Check if this is the user's first number
  const checkIfFirstNumber = async () => {
    const { count } = await supabase
      .from('phone_numbers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('status', 'purchased');
    
    return count === 0;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Search Available Phone Numbers
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
                onKeyPress={(e) => e.key === 'Enter' && searchNumbers()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchNumbers} 
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Numbers</CardTitle>
          <p className="text-sm text-muted-foreground">
            All numbers are currently free ($0/month) during beta
          </p>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : availableNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No available numbers found. Try searching with different criteria.
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
                            {number.locality}, {number.region}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {number.capabilities?.sms && (
                            <Badge variant="secondary" className="text-xs">SMS</Badge>
                          )}
                          {number.capabilities?.voice && (
                            <Badge variant="secondary" className="text-xs">Voice</Badge>
                          )}
                          {number.capabilities?.mms && (
                            <Badge variant="secondary" className="text-xs">MMS</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium text-green-600">
                            FREE (Beta)
                          </span>
                          <span className="text-muted-foreground line-through ml-2">
                            ${number.monthly_price}/mo
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedNumber(number);
                          setShowConfirmDialog(true);
                        }}
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
            <DialogTitle>Confirm Phone Number Purchase</DialogTitle>
            <DialogDescription>
              You're about to purchase this phone number. It will be added to your account immediately.
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
                    <span>{selectedNumber.locality}, {selectedNumber.region}</span>
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
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    This number will be configured for SMS and voice calls. 
                    You can enable AI features after purchase.
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
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Purchasing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};