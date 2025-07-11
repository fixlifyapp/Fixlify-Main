import { supabase } from "@/integrations/supabase/client";

export const debugMessagingServices = async () => {
  console.log("🔍 Starting messaging services debug...");
  
  const results = {
    auth: { status: "❌", message: "" },
    telnyxConfig: { status: "❌", message: "" },
    mailgunConfig: { status: "❌", message: "" },
    phoneNumbers: { status: "❌", message: "" },
    companySettings: { status: "❌", message: "" }
  };

  try {
    // 1. Check authentication
    console.log("1️⃣ Checking authentication...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      results.auth.message = "Not authenticated";
    } else {
      results.auth.status = "✅";
      results.auth.message = `Authenticated as: ${user.email}`;
    }

    // 2. Check Telnyx phone numbers
    console.log("2️⃣ Checking Telnyx phone numbers...");
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active');
    
    if (phoneError) {
      results.phoneNumbers.message = `Database error: ${phoneError.message}`;
    } else if (!phoneNumbers || phoneNumbers.length === 0) {
      results.phoneNumbers.message = "No active phone numbers found";
    } else {
      results.phoneNumbers.status = "✅";
      results.phoneNumbers.message = `Found ${phoneNumbers.length} active phone number(s): ${phoneNumbers.map(p => p.phone_number).join(', ')}`;
    }

    // 3. Check company settings
    console.log("3️⃣ Checking company settings...");
    const { data: companySettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', user?.id || '')
      .maybeSingle();
    
    if (settingsError) {
      results.companySettings.message = `Database error: ${settingsError.message}`;
    } else if (!companySettings) {
      results.companySettings.message = "No company settings found";
    } else {
      results.companySettings.status = "✅";
      results.companySettings.message = `Company: ${companySettings.company_name || 'Not set'}`;
    }

    // 4. Test Telnyx configuration
    console.log("4️⃣ Testing Telnyx configuration...");
    try {
      const { data: telnyxTest, error: telnyxError } = await supabase.functions.invoke('test-telnyx-connection', {
        body: {}
      });
      
      if (telnyxError) {
        results.telnyxConfig.message = `Edge function error: ${telnyxError.message}`;
      } else if (telnyxTest?.success) {
        results.telnyxConfig.status = "✅";
        results.telnyxConfig.message = "Telnyx API key is configured";
      } else {
        results.telnyxConfig.message = telnyxTest?.error || "Telnyx configuration test failed";
      }
    } catch (error) {
      results.telnyxConfig.message = `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // 5. Test Mailgun configuration (check if we can invoke the function)
    console.log("5️⃣ Testing Mailgun configuration...");
    try {
      // We'll do a dry run by checking if the edge function exists
      const testEmail = {
        estimateId: "test-123",
        recipientEmail: "test@example.com"
      };
      
      // This will fail but we can check the error to see if it's a config issue
      const { error: mailgunError } = await supabase.functions.invoke('send-estimate', {
        body: testEmail
      });
      
      if (mailgunError?.message?.includes('not found')) {
        results.mailgunConfig.message = "Send-estimate function not found";
      } else if (mailgunError?.message?.includes('authentication')) {
        results.mailgunConfig.message = "Authentication issue";
      } else {
        // If we get here, the function exists and is callable
        results.mailgunConfig.status = "⚠️";
        results.mailgunConfig.message = "Edge function is accessible (actual config not tested)";
      }
    } catch (error) {
      results.mailgunConfig.message = `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

  } catch (error) {
    console.error("Debug error:", error);
  }

  // Print results
  console.log("\n📊 MESSAGING SERVICES DEBUG RESULTS:");
  console.log("=====================================");
  Object.entries(results).forEach(([service, result]) => {
    console.log(`${result.status} ${service}: ${result.message}`);
  });
  console.log("=====================================\n");

  return results;
};

// Function to test sending a message
export const testSendMessage = async (phone: string, message: string) => {
  console.log("📱 Testing SMS send to:", phone);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ Not authenticated");
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: phone,
        message: message,
        user_id: user.id
      }
    });

    if (error) {
      console.error("❌ SMS send error:", error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      console.log("✅ SMS sent successfully!");
      return { success: true, messageId: data.messageId };
    } else {
      console.error("❌ SMS send failed:", data?.error);
      return { success: false, error: data?.error || "Unknown error" };
    }
  } catch (error) {
    console.error("❌ Test error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Function to test sending an email
export const testSendEmail = async (email: string, estimateId: string) => {
  console.log("📧 Testing email send to:", email);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimateId,
        recipientEmail: email
      }
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      console.log("✅ Email sent successfully!");
      return { success: true, messageId: data.messageId };
    } else {
      console.error("❌ Email send failed:", data?.error);
      return { success: false, error: data?.error || "Unknown error" };
    }
  } catch (error) {
    console.error("❌ Test error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}; 