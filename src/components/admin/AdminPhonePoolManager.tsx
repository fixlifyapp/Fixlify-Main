import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Search,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  MapPin,
  Loader2,
  RefreshCw,
  RefreshCcw,
  Building2,
  Package,
  Users,
  TrendingUp
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TelnyxNumber {
  phone_number: string;
  locality?: string;
  region?: string;
  country_code?: string;
  features?: string[];
  monthly_cost?: number;
}

interface PoolNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  locality?: string;
  region?: string;
  pool_status: string;
  organization_id?: string;
  organization_name?: string;
  assigned_at?: string;
  status: string;
}

interface PoolStats {
  total: number;
  available: number;
  assigned: number;
}

export const AdminPhonePoolManager = () => {
  const [telnyxNumbers, setTelnyxNumbers] = useState<TelnyxNumber[]>([]);
  const [poolNumbers, setPoolNumbers] = useState<PoolNumber[]>([]);
  const [stats, setStats] = useState<PoolStats>({ total: 0, available: 0, assigned: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();

  // Sync numbers between Telnyx and database
  const syncNumbers = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sync-numbers');

      if (error) throw error;

      if (data?.success) {
        const { added, removed, updated, errors } = data;
        let message = 'Sync completed: ';
        if (added?.length) message += `${added.length} added, `;
        if (removed?.length) message += `${removed.length} removed, `;
        if (updated?.length) message += `${updated.length} updated, `;
        if (errors?.length) message += `${errors.length} errors`;
        if (message === 'Sync completed: ') message += 'No changes needed';

        toast.success(message);
        fetchPoolData(); // Refresh the list
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Failed to sync numbers');
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch pool numbers and stats
  const fetchPoolData = async () => {
    setIsLoading(true);
    try {
      // Fetch all pool numbers with org info
      const { data: numbers, error } = await supabase
        .from('phone_numbers')
        .select(`
          id,
          phone_number,
          friendly_name,
          locality,
          region,
          pool_status,
          organization_id,
          assigned_at,
          status,
          organizations:organization_id (name)
        `)
        .eq('is_admin_purchased', true)
        .order('pool_status', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNumbers = (numbers || []).map(n => ({
        ...n,
        organization_name: (n.organizations as any)?.name
      }));

      setPoolNumbers(formattedNumbers);

      // Calculate stats
      const available = formattedNumbers.filter(n => n.pool_status === 'available').length;
      const assigned = formattedNumbers.filter(n => n.pool_status === 'assigned').length;
      setStats({
        total: formattedNumbers.length,
        available,
        assigned
      });
    } catch (error) {
      console.error('Error fetching pool data:', error);
      toast.error('Failed to load pool data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolData();
  }, []);

  // Search Telnyx for available numbers
  const searchTelnyxNumbers = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-search', {
        body: {
          areaCode: searchQuery,
          limit: 50,
          refreshFromTelnyx: true
        }
      });

      if (error) throw error;

      if (data?.success && data?.numbers) {
        // Filter out numbers already in our pool
        const poolPhones = new Set(poolNumbers.map(p => p.phone_number));
        const available = data.numbers.filter((n: any) => !poolPhones.has(n.phone_number));
        setTelnyxNumbers(available);
        toast.success(`Found ${available.length} available numbers`);
      } else {
        throw new Error(data?.error || 'Failed to search');
      }
    } catch (error) {
      console.error('Error searching Telnyx:', error);
      toast.error('Failed to search Telnyx numbers');
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle number selection
  const toggleSelection = (phoneNumber: string) => {
    const newSelection = new Set(selectedNumbers);
    if (newSelection.has(phoneNumber)) {
      newSelection.delete(phoneNumber);
    } else {
      newSelection.add(phoneNumber);
    }
    setSelectedNumbers(newSelection);
  };

  // Select all visible numbers
  const selectAll = () => {
    const newSelection = new Set(telnyxNumbers.map(n => n.phone_number));
    setSelectedNumbers(newSelection);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNumbers(new Set());
  };

  // Bulk purchase selected numbers
  const bulkPurchase = async () => {
    if (selectedNumbers.size === 0) {
      toast.error('No numbers selected');
      return;
    }

    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-admin-bulk-purchase', {
        body: {
          phoneNumbers: Array.from(selectedNumbers)
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Successfully purchased ${data.purchased?.length || 0} numbers to pool`);
        setShowConfirmDialog(false);
        setSelectedNumbers(new Set());
        setTelnyxNumbers([]);
        fetchPoolData();
      } else {
        throw new Error(data?.error || 'Failed to purchase');
      }
    } catch (error: any) {
      console.error('Error purchasing:', error);
      toast.error(error.message || 'Failed to purchase numbers');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Release number back to Telnyx (delete from pool)
  const releaseToTelnyx = async (phoneNumber: string) => {
    if (!confirm('This will release the number back to Telnyx. Are you sure?')) {
      return;
    }

    try {
      // For now, just mark as available in pool
      // Full release would require Telnyx API call
      const { error } = await supabase
        .from('phone_numbers')
        .update({
          pool_status: 'available',
          organization_id: null,
          assigned_at: null,
          assigned_by: null,
          is_primary: false
        })
        .eq('phone_number', phoneNumber);

      if (error) throw error;

      toast.success('Number released to pool');
      fetchPoolData();
    } catch (error) {
      console.error('Error releasing:', error);
      toast.error('Failed to release number');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total in Pool</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned to Orgs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pool" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pool">Pool Management</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Numbers</TabsTrigger>
        </TabsList>

        {/* Pool Management Tab */}
        <TabsContent value="pool">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Phone Number Pool</CardTitle>
                  <CardDescription>
                    Manage all phone numbers in the system pool
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={syncNumbers}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 mr-2" />
                    )}
                    Sync with Telnyx
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchPoolData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : poolNumbers.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No numbers in pool. Go to "Purchase Numbers" tab to add numbers.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolNumbers.map((number) => (
                      <TableRow key={number.id}>
                        <TableCell className="font-mono font-medium">
                          {formatPhoneNumber(number.phone_number)}
                        </TableCell>
                        <TableCell>
                          {number.locality ? `${number.locality}, ${number.region}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={number.pool_status === 'available' ? 'outline' : 'default'}
                            className={number.pool_status === 'available' ? 'border-green-600 text-green-600' : ''}
                          >
                            {number.pool_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {number.organization_name || '-'}
                        </TableCell>
                        <TableCell>
                          {number.pool_status === 'assigned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => releaseToTelnyx(number.phone_number)}
                            >
                              Release to Pool
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">Ready for assignment</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Numbers Tab */}
        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Numbers from Telnyx</CardTitle>
              <CardDescription>
                Search and bulk purchase phone numbers to add to the pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Section */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="area-code">Area Code (optional)</Label>
                  <Input
                    id="area-code"
                    placeholder="e.g., 415, 212, 604"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchTelnyxNumbers()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={searchTelnyxNumbers} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search Telnyx
                  </Button>
                </div>
              </div>

              {/* Selection Controls */}
              {telnyxNumbers.length > 0 && (
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedNumbers.size} of {telnyxNumbers.length} selected
                    </span>
                    <Button variant="link" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="link" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={selectedNumbers.size === 0}
                    className="bg-fixlyfy hover:bg-fixlyfy/90"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase {selectedNumbers.size} Numbers
                  </Button>
                </div>
              )}

              {/* Numbers Grid */}
              {telnyxNumbers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search Telnyx to find available phone numbers</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {telnyxNumbers.map((number) => (
                    <div
                      key={number.phone_number}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedNumbers.has(number.phone_number)
                          ? 'border-fixlyfy bg-fixlyfy/5 ring-2 ring-fixlyfy'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleSelection(number.phone_number)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedNumbers.has(number.phone_number)
                            ? 'border-fixlyfy bg-fixlyfy'
                            : 'border-gray-300'
                        }`}>
                          {selectedNumbers.has(number.phone_number) && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-medium">
                            {formatPhoneNumber(number.phone_number)}
                          </p>
                          {number.locality && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {number.locality}, {number.region}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase {selectedNumbers.size} phone numbers from Telnyx and add them to the pool.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                This action will charge your Telnyx account for the purchased numbers.
              </AlertDescription>
            </Alert>

            <div className="max-h-48 overflow-auto border rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {Array.from(selectedNumbers).map((num) => (
                  <span key={num} className="font-mono text-sm">
                    {formatPhoneNumber(num)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={bulkPurchase}
              disabled={isPurchasing}
              className="bg-fixlyfy hover:bg-fixlyfy/90"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Purchasing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
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
