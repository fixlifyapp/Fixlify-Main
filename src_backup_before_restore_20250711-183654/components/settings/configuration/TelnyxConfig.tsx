
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, ExternalLink, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TelnyxConfig = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [testNumber, setTestNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const testSMS = async () => {
    if (!testNumber) {
      toast.error('Please enter a phone number to test');
      return;
    }

    setIsTesting(true);
    try {
      // Get current user ID for message storage
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: testNumber,
          message: 'Test SMS from Fixlify - Your SMS configuration is working correctly!',
          user_id: userId,
          test: true
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error('Failed to send test SMS: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast.error('Failed to send test SMS');
    } finally {
      setIsTesting(false);
    }
  };

  const formatPhoneNumber = (number) => {
    if (!number) return '';
    return number.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Telnyx SMS Configuration
        </CardTitle>
        <CardDescription>
          Manage your Telnyx phone numbers and SMS settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Your Phone Numbers</Label>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading phone numbers...</div>
          ) : phoneNumbers.length > 0 ? (
            <div className="grid gap-2 mt-2">
              {phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatPhoneNumber(phone.phone_number)}</div>
                    <div className="text-sm text-muted-foreground">{phone.friendly_name || 'No name set'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={phone.status === 'active' ? 'default' : 'secondary'}>
                      {phone.status}
                    </Badge>
                    {phone.capabilities?.sms && (
                      <Badge variant="outline">SMS</Badge>
                    )}
                    {phone.capabilities?.voice && (
                      <Badge variant="outline">Voice</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No phone numbers configured</div>
          )}
        </div>

        <div>
          <Label htmlFor="testNumber">Test SMS</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="testNumber"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="+1234567890"
              disabled={isTesting}
            />
            <Button 
              onClick={testSMS} 
              disabled={isTesting || !testNumber}
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? 'Sending...' : 'Test SMS'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Send a test SMS to verify your Telnyx configuration
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="https://portal.telnyx.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Telnyx Portal
            </a>
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Create a Telnyx account and purchase phone numbers</li>
            <li>Configure your messaging profile in Telnyx portal</li>
            <li>Add your Telnyx API key in the secrets section</li>
            <li>Phone numbers will be automatically synced</li>
            <li>Use the test function above to verify SMS functionality</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
