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
  CheckCircle,
  AlertCircle,
  MapPin,
  Loader2,
  RefreshCw,
  Building2,
  Star
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

interface PoolNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  locality?: string;
  region?: string;
  pool_status: string;
  created_at: string;
}

interface OrgNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  is_primary: boolean;
  status: string;
  assigned_at?: string;
}

interface PhonePoolSelectorProps {
  onNumberChange?: () => void;
}

export const PhonePoolSelector = ({ onNumberChange }: PhonePoolSelectorProps) => {
  const [poolNumbers, setPoolNumbers] = useState<PoolNumber[]>([]);
  const [orgNumbers, setOrgNumbers] = useState<OrgNumber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PoolNumber | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();

  // Fetch available pool numbers and org's assigned numbers
  const fetchNumbers = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch available pool numbers
      const { data: pool, error: poolError } = await supabase
        .from('phone_numbers')
        .select('id, phone_number, friendly_name, locality, region, pool_status, created_at')
        .eq('pool_status', 'available')
        .is('organization_id', null)
        .order('created_at', { ascending: false });

      if (poolError) throw poolError;
      setPoolNumbers(pool || []);

      // Fetch organization's assigned numbers
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        const { data: orgNums, error: orgError } = await supabase
          .from('phone_numbers')
          .select('id, phone_number, friendly_name, is_primary, status, assigned_at')
          .eq('organization_id', profile.organization_id)
          .eq('pool_status', 'assigned')
          .order('is_primary', { ascending: false });

        if (orgError) throw orgError;
        setOrgNumbers(orgNums || []);
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, [user]);

  // Assign a pool number to organization
  const assignNumber = async () => {
    if (!selectedNumber || !user?.id) return;

    setIsAssigning(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-org-assign-number', {
        body: {
          phoneNumber: selectedNumber.phone_number,
          setAsPrimary: orgNumbers.length === 0 // Auto-set as primary if first number
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${formatPhoneNumber(selectedNumber.phone_number)} assigned to your organization!`);
        setShowConfirmDialog(false);
        setSelectedNumber(null);
        fetchNumbers();
        onNumberChange?.();
      } else {
        // Show detailed error from server
        const errorMsg = data?.error || 'Failed to assign number';
        console.error('Assignment failed:', data);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error assigning number:', error);
      // Show user-friendly error with details
      const message = error.message || 'Failed to assign phone number';
      toast.error(message, { duration: 5000 });
    } finally {
      setIsAssigning(false);
    }
  };

  // Set a number as primary
  const setPrimary = async (phoneId: string) => {
    try {
      // First, unset current primary
      await supabase
        .from('phone_numbers')
        .update({ is_primary: false })
        .neq('id', phoneId);

      // Set new primary
      const { error } = await supabase
        .from('phone_numbers')
        .update({ is_primary: true })
        .eq('id', phoneId);

      if (error) throw error;

      toast.success('Primary number updated');
      fetchNumbers();
    } catch (error) {
      console.error('Error setting primary:', error);
      toast.error('Failed to update primary number');
    }
  };

  // Release number back to pool
  const releaseNumber = async (phoneNumber: string) => {
    if (!confirm('Release this number back to the pool? Other organizations will be able to claim it.')) {
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user!.id)
        .single();

      const { data, error } = await supabase.rpc('release_phone_to_pool', {
        p_phone_number: phoneNumber,
        p_organization_id: profile?.organization_id
      });

      if (error) throw error;

      if (data) {
        toast.success('Number released back to pool');
        fetchNumbers();
        onNumberChange?.();
      } else {
        toast.error('Failed to release number');
      }
    } catch (error) {
      console.error('Error releasing number:', error);
      toast.error('Failed to release phone number');
    }
  };

  const filteredPool = poolNumbers.filter(n =>
    n.phone_number.includes(searchQuery) ||
    n.locality?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization's Current Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Organization's Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orgNumbers.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your organization doesn't have any phone numbers yet. Select one from the available pool below.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {orgNumbers.map((number) => (
                <div
                  key={number.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-fixlyfy" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatPhoneNumber(number.phone_number)}</span>
                        {number.is_primary && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      {number.friendly_name && (
                        <p className="text-sm text-muted-foreground">{number.friendly_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!number.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(number.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => releaseNumber(number.phone_number)}
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

      {/* Available Pool Numbers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Available Phone Numbers
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchNumbers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {poolNumbers.length} numbers available in the pool
          </p>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by number or location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="e.g., 415 or San Francisco"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Numbers Grid */}
          {filteredPool.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No numbers match your search.' : 'No phone numbers available in the pool.'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your administrator to add more numbers to the pool.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPool.map((number) => (
                <Card key={number.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedNumber(number);
                    setShowConfirmDialog(true);
                  }}
                >
                  <CardContent className="p-4">
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
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          Available
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Phone Number to Organization</DialogTitle>
            <DialogDescription>
              This number will be assigned to your organization. All team members will be able to use it for SMS and calls.
            </DialogDescription>
          </DialogHeader>

          {selectedNumber && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Phone Number:</span>
                  <span className="font-mono">{formatPhoneNumber(selectedNumber.phone_number)}</span>
                </div>
                {selectedNumber.locality && (
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{selectedNumber.locality}, {selectedNumber.region || 'US'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Set as Primary:</span>
                  <span>{orgNumbers.length === 0 ? 'Yes (first number)' : 'No'}</span>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  This number is pre-configured and ready for immediate use with SMS and voice calls.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={assignNumber}
              disabled={isAssigning}
              className="bg-fixlyfy hover:bg-fixlyfy/90"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign to Organization
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
