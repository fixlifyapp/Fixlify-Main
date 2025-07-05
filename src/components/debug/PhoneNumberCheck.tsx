
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const PhoneNumberCheck = () => {
  const { user } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkPhoneNumbers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Checking phone numbers for user:', user.email);
      
      // Check telnyx_phone_numbers table
      const { data: telnyxNumbers, error: telnyxError } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user.id);

      if (telnyxError) {
        console.error('Error fetching Telnyx numbers:', telnyxError);
      } else {
        console.log('Telnyx phone numbers:', telnyxNumbers);
        setPhoneNumbers(telnyxNumbers || []);
      }

      // Also test the function that sends SMS
      console.log('Testing phone number lookup in SMS functions...');
      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-estimate-sms', {
        body: { 
          action: 'test_phone_lookup',
          estimateId: 'test-id',
          recipientPhone: '+1234567890'
        }
      });

      if (functionError) {
        console.error('Error from SMS function test:', functionError);
      } else {
        console.log('SMS function test response:', functionData);
      }

    } catch (error) {
      console.error('Error checking phone numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Number Assignment Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Account: {user?.email}
        </p>
        
        <Button onClick={checkPhoneNumbers} disabled={loading}>
          {loading ? 'Checking...' : 'Check My Phone Numbers'}
        </Button>

        {phoneNumbers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Your Phone Numbers:</h4>
            {phoneNumbers.map((number, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="font-mono text-lg">{number.phone_number}</div>
                <div className="text-sm text-muted-foreground">
                  Status: {number.status} | Created: {new Date(number.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  User ID: {number.user_id}
                </div>
                <div className="text-sm text-muted-foreground">
                  Purchased At: {number.purchased_at ? new Date(number.purchased_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}

        {phoneNumbers.length === 0 && !loading && (
          <div className="text-sm text-amber-600">
            No phone numbers found in database for your account.
            <br />
            Your account email: {user?.email}
            <br />
            Your user ID: {user?.id}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
