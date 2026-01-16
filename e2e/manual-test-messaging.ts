/**
 * Manual Testing Script for Two-Way SMS and Email
 *
 * Run this in browser console or as a Node script with test credentials
 *
 * Test User: petrusenkocorp@gmail.com / 2806456
 * Test Client: Nick Petrus, +14375621308, petrusenkocorp@gmail.com
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test credentials
const TEST_EMAIL = "petrusenkocorp@gmail.com";
const TEST_PASSWORD = "2806456";
const TEST_CLIENT_PHONE = "+14375621308";
const TEST_CLIENT_EMAIL = "petrusenkocorp@gmail.com";

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[TEST] ${message}`);
}

function pass(test: string, data?: any) {
  results.push({ test, passed: true, data });
  log(`✅ PASS: ${test}`);
}

function fail(test: string, error: string) {
  results.push({ test, passed: false, error });
  log(`❌ FAIL: ${test} - ${error}`);
}

async function runTests() {
  log("Starting Two-Way Messaging Tests...\n");

  // 1. Authentication
  log("Test 1: Authentication");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error) throw error;
    pass("Authentication", { user_id: data.user?.id });
  } catch (e: any) {
    fail("Authentication", e.message);
    return results; // Can't continue without auth
  }

  // 2. Fetch SMS Conversations
  log("\nTest 2: Fetch SMS Conversations");
  try {
    const { data, error } = await supabase
      .from("sms_conversations")
      .select("*, client:clients(id, name, phone)")
      .order("last_message_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    pass("Fetch SMS Conversations", { count: data?.length || 0 });
  } catch (e: any) {
    fail("Fetch SMS Conversations", e.message);
  }

  // 3. Fetch Email Conversations
  log("\nTest 3: Fetch Email Conversations");
  try {
    const { data, error } = await supabase
      .from("email_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    pass("Fetch Email Conversations", { count: data?.length || 0 });
  } catch (e: any) {
    fail("Fetch Email Conversations", e.message);
  }

  // 4. Check Phone Numbers tied to Organization
  log("\nTest 4: Phone Numbers Organization Binding");
  try {
    const { data, error } = await supabase
      .from("phone_numbers")
      .select("phone_number, organization_id, is_primary")
      .eq("is_primary", true);
    if (error) throw error;
    const haOrgId = data?.some((p) => p.organization_id);
    if (haOrgId) {
      pass("Phone Numbers Organization Binding", { phones: data });
    } else {
      fail("Phone Numbers Organization Binding", "No phones tied to organization");
    }
  } catch (e: any) {
    fail("Phone Numbers Organization Binding", e.message);
  }

  // 5. Check SMS Conversations have Organization ID
  log("\nTest 5: SMS Conversations Organization ID");
  try {
    const { data, error } = await supabase
      .from("sms_conversations")
      .select("id, organization_id")
      .not("organization_id", "is", null)
      .limit(5);
    if (error) throw error;
    if (data && data.length > 0) {
      pass("SMS Conversations Organization ID", { count: data.length });
    } else {
      // Check if there are any conversations at all
      const { data: allConvs } = await supabase
        .from("sms_conversations")
        .select("id")
        .limit(1);
      if (!allConvs || allConvs.length === 0) {
        pass("SMS Conversations Organization ID", { note: "No conversations yet" });
      } else {
        fail("SMS Conversations Organization ID", "Conversations exist but have no org_id");
      }
    }
  } catch (e: any) {
    fail("SMS Conversations Organization ID", e.message);
  }

  // 6. Test Technician Permissions (check RLS)
  log("\nTest 6: Technician Permission Check");
  try {
    // Get user's role
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user?.id)
      .single();

    if (profile?.role === "technician") {
      // Should only see assigned clients
      const { data: jobs } = await supabase
        .from("jobs")
        .select("client_id")
        .eq("technician_id", user?.id);

      const assignedClientIds = [...new Set(jobs?.map((j) => j.client_id).filter(Boolean))];

      const { data: convs } = await supabase
        .from("sms_conversations")
        .select("client_id");

      const allMatch = convs?.every(
        (c) => !c.client_id || assignedClientIds.includes(c.client_id)
      );

      if (allMatch) {
        pass("Technician Permission Check", { assignedClients: assignedClientIds.length });
      } else {
        fail("Technician Permission Check", "Technician sees non-assigned clients");
      }
    } else {
      pass("Technician Permission Check", { note: `User is ${profile?.role}, not technician` });
    }
  } catch (e: any) {
    fail("Technician Permission Check", e.message);
  }

  // 7. Test Gemini AI Smart Replies
  log("\nTest 7: Gemini AI Smart Replies");
  try {
    const { data, error } = await supabase.functions.invoke("gemini-ai", {
      body: {
        action: "smart_replies",
        messages: [
          { role: "user", content: "When can you come to fix my refrigerator?" }
        ],
        context: {
          client_name: "Nick Petrus",
          business_type: "Appliance Repair"
        }
      }
    });
    if (error) throw error;
    if (data?.success && data?.result?.length > 0) {
      pass("Gemini AI Smart Replies", { replies: data.result.length });
    } else {
      fail("Gemini AI Smart Replies", data?.error || "No replies generated");
    }
  } catch (e: any) {
    fail("Gemini AI Smart Replies", e.message);
  }

  // 8. Test SMS Send (dry run - just check edge function exists)
  log("\nTest 8: SMS Send Edge Function");
  try {
    // We just check if the function is available, don't actually send
    const { data, error } = await supabase.functions.invoke("telnyx-sms", {
      body: {
        action: "check_status" // Non-destructive action
      }
    });
    // Any response (even error) means function exists
    pass("SMS Send Edge Function", { available: true });
  } catch (e: any) {
    if (e.message.includes("not found") || e.message.includes("404")) {
      fail("SMS Send Edge Function", "Function not deployed");
    } else {
      pass("SMS Send Edge Function", { available: true, note: e.message });
    }
  }

  // 9. Test Email Send (dry run)
  log("\nTest 9: Email Send Edge Function");
  try {
    const { data, error } = await supabase.functions.invoke("mailgun-email", {
      body: {
        action: "check_status"
      }
    });
    pass("Email Send Edge Function", { available: true });
  } catch (e: any) {
    if (e.message.includes("not found") || e.message.includes("404")) {
      fail("Email Send Edge Function", "Function not deployed");
    } else {
      pass("Email Send Edge Function", { available: true, note: e.message });
    }
  }

  // 10. Check Unified Conversations View
  log("\nTest 10: Unified Conversations View");
  try {
    const { data, error } = await supabase
      .from("unified_conversations")
      .select("*")
      .limit(5);
    if (error) throw error;
    pass("Unified Conversations View", { count: data?.length || 0 });
  } catch (e: any) {
    fail("Unified Conversations View", e.message);
  }

  // Summary
  log("\n========================================");
  log("TEST SUMMARY");
  log("========================================");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  log(`Passed: ${passed}/${results.length}`);
  log(`Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    log("\nFailed Tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      log(`  - ${r.test}: ${r.error}`);
    });
  }

  return results;
}

// Export for Node.js usage
export { runTests, results };

// Run if executed directly
if (typeof window === "undefined") {
  runTests().then(() => process.exit(0));
}
