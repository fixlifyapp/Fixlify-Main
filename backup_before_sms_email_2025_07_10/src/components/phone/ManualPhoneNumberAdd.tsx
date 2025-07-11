import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ManualPhoneNumberAdd() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNumbers = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .order('phone_number');
      
      if (error) throw error;
      setNumbers(data || []);
    } catch (error) {
      console.error('Error fetching numbers:', error);
      toast.error('Failed to fetch numbers');
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchNumbers();
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+${cleaned}`;
    if (cleaned.length <= 4) return `+${cleaned[0]} (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleAddNumber = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Extract area code from formatted number
      const cleaned = phoneNumber.replace(/\D/g, '');      const areaCode = cleaned.slice(1, 4);
      
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .insert({
          phone_number: `+${cleaned}`,
          status: 'available',
          country_code: 'US',
          area_code: areaCode,
          features: ['sms', 'voice', 'mms'],
          monthly_cost: 0,
          setup_cost: 0,
          purchased_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Phone number added successfully!');
      setPhoneNumber('');
      await fetchNumbers();
    } catch (error: any) {
      console.error('Error adding number:', error);
      if (error.code === '23505') {
        toast.error('This phone number already exists');
      } else {
        toast.error('Failed to add phone number');
      }
    } finally {
      setLoading(false);
    }
  };
  const syncWithTelnyx = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list_available_from_telnyx' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Found ${data.total} numbers from Telnyx`);
        await fetchNumbers();
      }
    } catch (error) {
      console.error('Error syncing with Telnyx:', error);
      toast.error('Failed to sync with Telnyx');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Phone Number Manually</CardTitle>
          <CardDescription>
            Add your newly purchased Telnyx phone number to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="flex-1"
              />
              <Button onClick={handleAddNumber} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Number
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Enter the phone number in any format. It will be automatically formatted as +1 (XXX) XXX-XXXX
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={syncWithTelnyx}
              disabled={loading}
              className="w-full"
            >              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync with Telnyx Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Current Phone Numbers</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchNumbers}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {numbers.length === 0 ? (
              <p className="text-muted-foreground">No phone numbers found</p>
            ) : (
              numbers.map((number: any) => (                <div key={number.phone_number} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{number.phone_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {number.status} | Area Code: {number.area_code}
                      {number.user_id && ' | Claimed'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}