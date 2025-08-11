import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Phone, 
  Plus,
  Settings,
  Trash2,
  Star,
  Bot,
  MessageSquare,
  PhoneCall,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumber } from "@/utils/phone-utils";
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
  friendly_name?: string;
  status: string;
  is_primary: boolean;
  is_active: boolean;
  ai_dispatcher_enabled: boolean;
  capabilities?: {
    sms?: boolean;
    voice?: boolean;
    mms?: boolean;
  };
  locality?: string;
  region?: string;
  monthly_price: number;
  purchased_at?: string;
  next_billing_date?: string;
}

export default function PhoneNumberManagementPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<PhoneNumber | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's phone numbers
  const fetchPhoneNumbers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'purchased')
        .order('is_primary', { ascending: false })
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, [user]);

  // Set a number as primary
  const setPrimaryNumber = async (numberId: string) => {
    setUpdatingId(numberId);
    try {
      // First, unset all other numbers as primary
      await supabase
        .from('phone_numbers')
        .update({ is_primary: false })
        .eq('user_id', user?.id)
        .neq('id', numberId);

      // Then set this number as primary
      const { error } = await supabase
        .from('phone_numbers')
        .update({ is_primary: true })
        .eq('id', numberId);

      if (error) throw error;

      toast.success('Primary number updated');
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error setting primary number:', error);
      toast.error('Failed to update primary number');
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle AI dispatcher
  const toggleAIDispatcher = async (numberId: string, enabled: boolean) => {
    setUpdatingId(numberId);
    try {
      const { error } = await supabase
        .from('phone_numbers')
        .update({ ai_dispatcher_enabled: enabled })
        .eq('id', numberId);

      if (error) throw error;

      toast.success(enabled ? 'AI Dispatcher enabled' : 'AI Dispatcher disabled');
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error toggling AI dispatcher:', error);
      toast.error('Failed to update AI dispatcher setting');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete (release) a phone number
  const deletePhoneNumber = async () => {
    if (!numberToDelete) return;

    setDeletingId(numberToDelete.id);
    try {
      // Update status to released instead of deleting
      const { error } = await supabase
        .from('phone_numbers')
        .update({ 
          status: 'available',
          user_id: null,
          purchased_by: null,
          purchased_at: null,
          is_primary: false,
          ai_dispatcher_enabled: false
        })
        .eq('id', numberToDelete.id);

      if (error) throw error;

      toast.success('Phone number released successfully');
      setShowDeleteDialog(false);
      setNumberToDelete(null);
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error releasing phone number:', error);
      toast.error('Failed to release phone number');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate total monthly cost
  const totalMonthlyCost = phoneNumbers.reduce((sum, num) => sum + (num.monthly_price || 0), 0);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Phone Numbers</h1>
        <p className="text-muted-foreground">
          Manage your phone numbers, configure AI features, and monitor usage
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Numbers</p>
              <p className="text-2xl font-bold">{phoneNumbers.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Numbers</p>
              <p className="text-2xl font-bold">
                {phoneNumbers.filter(n => n.is_active).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Enabled</p>
              <p className="text-2xl font-bold">
                {phoneNumbers.filter(n => n.ai_dispatcher_enabled).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalMonthlyCost.toFixed(2)}
                <span className="text-sm font-normal ml-1">(Free Beta)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Number Button */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/settings/phone-numbers/purchase')}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Get New Phone Number
        </Button>
      </div>

      {/* Phone Numbers List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : phoneNumbers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Phone Numbers Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get your first phone number to start sending SMS and receiving calls
            </p>
            <Button onClick={() => navigate('/settings/phone-numbers/purchase')}>
              <Plus className="h-4 w-4 mr-2" />
              Get Your First Number
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {phoneNumbers.map((number) => (
            <Card key={number.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {formatPhoneNumber(number.phone_number)}
                      </h3>
                      {number.is_primary && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      {number.is_active ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    {number.friendly_name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {number.friendly_name}
                      </p>
                    )}
                    
                    {number.locality && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {number.locality}, {number.region}
                      </p>
                    )}
                    
                    <div className="flex gap-2 mb-3">
                      {number.capabilities?.sms && (
                        <Badge variant="outline" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          SMS
                        </Badge>
                      )}
                      {number.capabilities?.voice && (
                        <Badge variant="outline" className="gap-1">
                          <PhoneCall className="h-3 w-3" />
                          Voice
                        </Badge>
                      )}
                      {number.ai_dispatcher_enabled && (
                        <Badge variant="outline" className="gap-1 bg-purple-50">
                          <Bot className="h-3 w-3" />
                          AI Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-green-600 font-medium">FREE</span>
                        <span className="line-through ml-1">
                          ${number.monthly_price}/month
                        </span>
                      </div>
                      {number.purchased_at && (
                        <p className="mt-1">
                          Purchased: {new Date(number.purchased_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {!number.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryNumber(number.id)}
                        disabled={updatingId === number.id}
                      >
                        {updatingId === number.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        <span className="ml-2">Set as Primary</span>
                      </Button>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`ai-${number.id}`}
                        checked={number.ai_dispatcher_enabled}
                        onCheckedChange={(checked) => toggleAIDispatcher(number.id, checked)}
                        disabled={updatingId === number.id}
                      />
                      <Label htmlFor={`ai-${number.id}`} className="cursor-pointer">
                        AI Dispatcher
                      </Label>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/settings/phone-numbers/${number.id}/configure`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    
                    {!number.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setNumberToDelete(number);
                          setShowDeleteDialog(true);
                        }}
                        disabled={deletingId === number.id}
                      >
                        {deletingId === number.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="ml-2">Release</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release {numberToDelete && formatPhoneNumber(numberToDelete.phone_number)}? 
              This action cannot be undone and you may not be able to get this number back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePhoneNumber}
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