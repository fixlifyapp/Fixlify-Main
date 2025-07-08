import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { debugMessagingServices, testSendMessage, testSendEmail } from "@/utils/debug-messaging";
import { quickSetup, addTestPhoneNumber } from "@/utils/setup-messaging-services";
import { MessageCircle, Mail, AlertCircle, CheckCircle2, XCircle, Settings } from "lucide-react";

const MessagingDebugPage = () => {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Test message from Fixlify");
  const [testEmail, setTestEmail] = useState("");
  const [testEstimateId, setTestEstimateId] = useState("");
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRunningSetup, setIsRunningSetup] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");

  useEffect(() => {
    runDebug();
  }, []);

  const runDebug = async () => {
    setIsDebugging(true);
    try {
      const results = await debugMessagingServices();
      setDebugResults(results);
    } catch (error) {
      console.error("Debug failed:", error);
      toast.error("Failed to run debug");
    } finally {
      setIsDebugging(false);
    }
  };

  const runQuickSetup = async () => {
    setIsRunningSetup(true);
    try {
      await quickSetup();
      // Refresh debug results after setup
      await runDebug();
    } catch (error) {
      console.error("Quick setup failed:", error);
      toast.error("Quick setup failed");
    } finally {
      setIsRunningSetup(false);
    }
  };

  const handleAddPhoneNumber = async () => {
    if (!testPhoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const result = await addTestPhoneNumber(testPhoneNumber);
      if (result.success) {
        toast.success(result.message);
        setTestPhoneNumber("");
        await runDebug(); // Refresh status
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to add phone number");
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSendingSMS(true);
    try {
      const result = await testSendMessage(testPhone, testMessage);
      if (result.success) {
        toast.success("SMS sent successfully!");
      } else {
        toast.error(`SMS failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("SMS test failed");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testEstimateId) {
      toast.error("Please enter both email and estimate ID");
      return;
    }

    setIsSendingEmail(true);
    try {
      const result = await testSendEmail(testEmail, testEstimateId);
      if (result.success) {
        toast.success("Email sent successfully!");
      } else {
        toast.error(`Email failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Email test failed");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "✅":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "❌":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "⚠️":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Messaging Services Debug</h1>
          <p className="text-muted-foreground mt-2">
            Test and debug SMS (Telnyx) and Email (Mailgun) services
          </p>
        </div>

        {/* Quick Setup */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Quick Setup</h2>
            </div>
            <Button 
              onClick={runQuickSetup} 
              disabled={isRunningSetup}
              variant="default"
            >
              {isRunningSetup ? "Setting up..." : "Run Quick Setup"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This will check your configuration and provide setup instructions
          </p>
          
          {/* Add Phone Number */}
          <div className="mt-4 p-4 bg-background rounded-lg">
            <Label htmlFor="addPhone">Add Test Phone Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="addPhone"
                type="tel"
                placeholder="+1234567890"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddPhoneNumber}
                disabled={!testPhoneNumber}
                size="sm"
              >
                Add Number
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add a phone number for testing (include country code)
            </p>
          </div>
        </Card>

        {/* Debug Results */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Service Status</h2>
            <Button onClick={runDebug} disabled={isDebugging}>
              {isDebugging ? "Running..." : "Refresh"}
            </Button>
          </div>

          {debugResults ? (
            <div className="space-y-3">
              {Object.entries(debugResults).map(([service, result]: [string, any]) => (
                <div key={service} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <p className="font-medium capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading debug information...</p>
          )}
        </Card>

        {/* SMS Test */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Test SMS (Telnyx)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="testPhone">Phone Number</Label>
              <Input
                id="testPhone"
                type="tel"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <div>
              <Label htmlFor="testMessage">Message</Label>
              <Textarea
                id="testMessage"
                placeholder="Enter test message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleTestSMS} 
              disabled={isSendingSMS || !testPhone}
              className="w-full"
            >
              {isSendingSMS ? "Sending..." : "Send Test SMS"}
            </Button>
          </div>
        </Card>

        {/* Email Test */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Test Email (Mailgun)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="testEstimateId">Estimate ID</Label>
              <Input
                id="testEstimateId"
                placeholder="Enter a valid estimate ID"
                value={testEstimateId}
                onChange={(e) => setTestEstimateId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be a valid estimate ID from your database
              </p>
            </div>

            <Button 
              onClick={handleTestEmail} 
              disabled={isSendingEmail || !testEmail || !testEstimateId}
              className="w-full"
            >
              {isSendingEmail ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li className="font-medium">Add Secrets in Supabase Dashboard:
              <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                <li>Go to: <code className="bg-background px-1 rounded">Settings → Edge Functions → Secrets</code></li>
                <li>Add <code className="bg-background px-1 rounded">TELNYX_API_KEY</code> - Get from telnyx.com</li>
                <li>Add <code className="bg-background px-1 rounded">MAILGUN_API_KEY</code> - Get from mailgun.com</li>
              </ul>
            </li>
            <li className="font-medium">Deploy Edge Functions:
              <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                <li>Run: <code className="bg-background px-1 rounded">supabase functions deploy</code></li>
                <li>Or deploy via Supabase Dashboard</li>
              </ul>
            </li>
            <li className="font-medium">Add Phone Number:
              <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                <li>Use the "Add Test Phone Number" form above</li>
                <li>Or go to Settings → Configuration → Phone Numbers in the app</li>
              </ul>
            </li>
            <li className="font-medium">Configure Mailgun Domain:
              <ul className="list-disc list-inside ml-4 mt-1 font-normal">
                <li>Verify domain <code className="bg-background px-1 rounded">fixlify.app</code> in Mailgun</li>
                <li>Add DNS records as instructed by Mailgun</li>
              </ul>
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Important: After adding secrets, you may need to redeploy your edge functions for changes to take effect.
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MessagingDebugPage; 