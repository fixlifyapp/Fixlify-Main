import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
}

export const setupMessagingServices = async () => {
  console.log("🔧 Starting messaging services setup...");
  
  const results = {
    phoneNumber: { success: false, message: "" },
    testTelnyx: { success: false, message: "" },
    testMailgun: { success: false, message: "" }
  };

  try {
    // 1. Check if we need to add a phone number
    const { data: phoneNumbers } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active');
    
    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.log("📱 No active phone numbers found. You need to add one.");
      results.phoneNumber.message = "No active phone numbers. Please add one in Settings > Communications";
    } else {
      results.phoneNumber.success = true;
      results.phoneNumber.message = `Found ${phoneNumbers.length} active phone number(s)`;
    }

    // 2. Test Telnyx configuration
    try {
      const { data: telnyxTest, error: telnyxError } = await supabase.functions.invoke('test-telnyx-connection', {
        body: {}
      });
      
      if (telnyxError) {
        results.testTelnyx.message = `Edge function error: ${telnyxError.message}`;
      } else if (telnyxTest?.success) {
        results.testTelnyx.success = true;
        results.testTelnyx.message = "Telnyx is configured correctly";
      } else {
        results.testTelnyx.message = telnyxTest?.error || "Telnyx test failed";
      }
    } catch (error) {
      results.testTelnyx.message = "Could not test Telnyx connection";
    }

    // 3. Instructions for setting up secrets
    console.log("\n📋 SETUP INSTRUCTIONS:");
    console.log("====================");
    console.log("1. Go to Supabase Dashboard > Settings > Edge Functions");
    console.log("2. Add these secrets:");
    console.log("   - TELNYX_API_KEY: Your Telnyx API key");
    console.log("   - MAILGUN_API_KEY: Your Mailgun API key");
    console.log("3. Deploy edge functions if not already deployed");
    console.log("4. Add a phone number in Settings > Communications");
    console.log("====================\n");

  } catch (error) {
    console.error("Setup error:", error);
  }

  return results;
};

// Function to add a test phone number (for development)
export const addTestPhoneNumber = async (phoneNumber: string) => {
  console.log("📱 Adding test phone number:", phoneNumber);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if number already exists
    const { data: existing } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (existing) {
      // Update status to active
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ status: 'active' })
        .eq('phone_number', phoneNumber);
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true, message: "Phone number activated" };
    }

    // Add new phone number
    const { error } = await supabase
      .from('telnyx_phone_numbers')
      .insert({
        phone_number: phoneNumber,
        user_id: user.id,
        status: 'active',
        capabilities: {
          sms: true,
          voice: true,
          mms: false
        },
        purchased_at: new Date().toISOString()
      });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: "Phone number added successfully" };
  } catch (error) {
    console.error("Error adding phone number:", error);
    return { success: false, message: "Failed to add phone number" };
  }
};

// Function to check if secrets are configured (by testing edge functions)
export const checkSecretsConfigured = async () => {
  const results = {
    telnyx: false,
    mailgun: false
  };

  // Test Telnyx
  try {
    const { data, error } = await supabase.functions.invoke('test-telnyx-connection');
    results.telnyx = !error && data?.success === true;
  } catch {
    results.telnyx = false;
  }

  // We can't directly test Mailgun without sending an email,
  // but we can check if the edge function is accessible
  try {
    const { error } = await supabase.functions.invoke('send-document-email', {
      body: { documentType: 'estimate', documentId: 'test', recipientEmail: 'test@test.com' }
    });
    // If we get an error about the estimate not being found,
    // it means the function is accessible (good)
    results.mailgun = error?.message?.includes('not found') || false;
  } catch {
    results.mailgun = false;
  }

  return results;
};

// Quick setup helper
export const quickSetup = async () => {
  console.log("🚀 Running quick setup...");
  
  // 1. Check current status
  const setupStatus = await setupMessagingServices();
  
  // 2. Check secrets
  const secrets = await checkSecretsConfigured();
  
  // 3. If no phone number, add a test one
  if (!setupStatus.phoneNumber.success) {
    console.log("📱 No phone number found. Please add one through the UI.");
    toast.error("No phone number configured. Go to Settings > Communications to add one.");
  }
  
  // 4. Report status
  console.log("\n📊 QUICK SETUP RESULTS:");
  console.log("======================");
  console.log(`Phone Numbers: ${setupStatus.phoneNumber.success ? '✅' : '❌'} ${setupStatus.phoneNumber.message}`);
  console.log(`Telnyx Secret: ${secrets.telnyx ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Mailgun Secret: ${secrets.mailgun ? '✅ Likely configured' : '❌ Not configured'}`);
  console.log("======================\n");
  
  if (!secrets.telnyx || !secrets.mailgun) {
    console.log("⚠️ IMPORTANT: You need to add secrets in Supabase Dashboard");
    console.log("Go to: Settings > Edge Functions > Secrets");
    console.log("Add: TELNYX_API_KEY and MAILGUN_API_KEY");
    
    toast.error("Missing API keys. Check console for setup instructions.");
  } else if (setupStatus.phoneNumber.success) {
    toast.success("Messaging services are configured!");
  }
  
  return {
    phoneNumbers: setupStatus.phoneNumber,
    secrets
  };
}; 