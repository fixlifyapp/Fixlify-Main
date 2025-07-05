
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

      // Also check via edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (functionError) {
        console.error('Error from function:', functionError);
      } else {
        console.log('Function response:', functionData);
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
                <div className="font-mono">{number.phone_number}</div>
                <div className="text-sm text-muted-foreground">
                  Status: {number.status} | Added: {new Date(number.purchased_at || number.created_at).toLocaleDateString()}
                </div>
                {number.ai_dispatcher_enabled && (
                  <div className="text-sm text-green-600">AI Dispatcher Enabled</div>
                )}
              </div>
            ))}
          </div>
        )}

        {phoneNumbers.length === 0 && !loading && (
          <div className="text-sm text-amber-600">
            No phone numbers found in database. You may need to add your Telnyx number to the system.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
