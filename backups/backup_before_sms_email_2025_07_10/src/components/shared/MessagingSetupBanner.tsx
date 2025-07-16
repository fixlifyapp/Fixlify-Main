import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { checkSecretsConfigured } from "@/utils/setup-messaging-services";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const MessagingSetupBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    hasPhoneNumber: false,
    hasSecrets: false,
    isChecking: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      // Check phone numbers
      const { data: phoneNumbers } = await supabase
        .from('telnyx_phone_numbers')
        .select('phone_number')
        .eq('status', 'active')
        .limit(1);
      
      const hasPhoneNumber = phoneNumbers && phoneNumbers.length > 0;
      
      // Check secrets
      const secrets = await checkSecretsConfigured();
      const hasSecrets = secrets.telnyx || secrets.mailgun;
      
      setSetupStatus({
        hasPhoneNumber,
        hasSecrets,
        isChecking: false
      });
      
      // Show banner if setup is incomplete
      setShowBanner(!hasPhoneNumber || !hasSecrets);
    } catch (error) {
      console.error("Error checking setup:", error);
      setSetupStatus(prev => ({ ...prev, isChecking: false }));
    }
  };

  if (!showBanner || setupStatus.isChecking) {
    return null;
  }

  const isTestNumber = setupStatus.hasPhoneNumber; // We know it's the test number if it exists

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>Messaging Setup Required</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>To send SMS and emails, please complete the following:</p>
        
        <div className="space-y-1 mt-2">
          {!setupStatus.hasSecrets && (
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <span>Add API keys in Supabase Dashboard</span>
            </div>
          )}
          
          {setupStatus.hasPhoneNumber && isTestNumber && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span>Replace test phone number with your Telnyx number</span>
            </div>
          )}
          
          {!setupStatus.hasPhoneNumber && (
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <span>Add a phone number for SMS</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/messaging-debug')}
          >
            Setup Guide
          </Button>
          
          {!setupStatus.hasSecrets && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Supabase Dashboard
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}; 