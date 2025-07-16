import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { PhoneNumberManager } from "@/components/settings/PhoneNumberManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, TestTube } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const PhoneNumbersSettingsPage = () => {
  const { session } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Test SMS from Fixlify - " + new Date().toLocaleString());

  const sendTestSMS = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("telnyx-sms", {
        body: {
          recipientPhone: testPhone,
          message: testMessage
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("SMS sent successfully!");
        console.log("SMS sent:", data);
      } else {
        toast.error(data.error || "Failed to send SMS");
      }
    } catch (error) {
      console.error("SMS error:", error);
      toast.error("Failed to send SMS");
    } finally {
      setTesting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Manage phone numbers for SMS messaging"
        icon={Phone}
        badges={[
          { text: "SMS", icon: MessageSquare, variant: "success" },
          { text: "Telnyx Integration", icon: Phone, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        {/* Phone Number Manager */}
        <PhoneNumberManager />

        {/* Test SMS Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test SMS
            </CardTitle>
            <CardDescription>
              Send a test SMS to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  placeholder="Your test message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                onClick={sendTestSMS}
                disabled={testing || !testPhone}
                className="w-full sm:w-auto"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Test SMS
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Telnyx API Key</span>
                <Badge variant={session ? "success" : "destructive"}>
                  {session ? "Configured" : "Not Configured"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Authentication</span>
                <Badge variant={session ? "success" : "destructive"}>
                  {session ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                <p className="font-medium mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure Telnyx API key is set in Supabase Edge Functions</li>
                  <li>Verify phone numbers are in E.164 format (+1234567890)</li>
                  <li>Check that you have an active phone number assigned</li>
                  <li>Make sure your Telnyx account has SMS credits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PhoneNumbersSettingsPage;
