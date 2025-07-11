import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, RefreshCw, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface TelnyxPhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export function PhoneNumberManager() {
  const { session } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<TelnyxPhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const fetchPhoneNumbers = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const assignPhoneToMe = async (phoneId: string) => {
    if (!session?.user?.id) return;
    
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ user_id: session.user.id })
        .eq('id', phoneId);

      if (error) throw error;
      
      toast.success('Phone number assigned successfully!');
      await fetchPhoneNumbers();
    } catch (error) {
      console.error('Error assigning phone:', error);
      toast.error('Failed to assign phone number');
    } finally {
      setAssigning(false);
    }
  };

  const unassignPhone = async (phoneId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ user_id: null })
        .eq('id', phoneId);

      if (error) throw error;
      
      toast.success('Phone number unassigned');
      await fetchPhoneNumbers();
    } catch (error) {
      console.error('Error unassigning phone:', error);
      toast.error('Failed to unassign phone number');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, [session?.user?.id]);

  const myPhones = phoneNumbers.filter(p => p.user_id === session?.user?.id);
  const availablePhones = phoneNumbers.filter(p => !p.user_id && p.status === 'active');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Number Management
            </CardTitle>
            <CardDescription>
              Manage phone numbers for SMS messaging
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPhoneNumbers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* My Phone Numbers */}
        <div>
          <h3 className="font-medium mb-3">My Phone Numbers</h3>
          {myPhones.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              You don't have any phone numbers assigned. Assign one from available numbers below.
            </div>
          ) : (
            <div className="space-y-2">
              {myPhones.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{phone.phone_number}</span>
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unassignPhone(phone.id)}
                    disabled={assigning}
                  >
                    Unassign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Phone Numbers */}
        <div>
          <h3 className="font-medium mb-3">Available Phone Numbers</h3>
          {availablePhones.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              No available phone numbers. All numbers are currently assigned.
            </div>
          ) : (
            <div className="space-y-2">
              {availablePhones.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{phone.phone_number}</span>
                    <Badge variant="secondary" className="text-xs">
                      Available
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => assignPhoneToMe(phone.id)}
                    disabled={assigning || myPhones.length > 0}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Me
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• You need a phone number assigned to send SMS messages</li>
            <li>• The system will auto-assign an available number when you first send an SMS</li>
            <li>• You can manually assign/unassign numbers here</li>
            <li>• Only one phone number can be assigned per user</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
