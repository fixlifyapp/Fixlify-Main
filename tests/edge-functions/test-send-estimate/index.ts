import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: Environment Variables
    console.log("🔍 Test 1: Checking environment variables...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");    
    testResults.tests.push({
      name: "Environment Variables",
      status: "checked",
      details: {
        supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
        supabaseServiceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
        mailgunApiKey: mailgunApiKey ? `✅ Set (${mailgunApiKey.substring(0, 10)}...)` : "❌ Missing",
        mailgunDomain: mailgunDomain || "Not set (will use default: fixlify.app)"
      }
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test 2: Get auth from request
    console.log("🔍 Test 2: Checking authentication...");
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      user = authUser;      
      testResults.tests.push({
        name: "Authentication",
        status: authError ? "failed" : "passed",
        details: {
          hasAuthHeader: "✅ Yes",
          userAuthenticated: authError ? "❌ No" : "✅ Yes",
          userId: user?.id || "N/A",
          error: authError?.message
        }
      });
    } else {
      testResults.tests.push({
        name: "Authentication",
        status: "skipped",
        details: {
          hasAuthHeader: "❌ No",
          note: "Using service role for testing"
        }
      });
    }

    // Test 3: Get a sample estimate
    console.log("🔍 Test 3: Fetching sample estimate...");
    const { data: estimates, error: estimateError } = await supabase
      .from("estimates")
      .select(`
        *,
        jobs!inner(
          *,
          clients!inner(*)
        ),
        line_items!line_items_parent_id_fkey(*)
      `)
      .limit(1);
    if (estimateError || !estimates || estimates.length === 0) {
      testResults.tests.push({
        name: "Fetch Estimate",
        status: "failed",
        details: {
          error: estimateError?.message || "No estimates found"
        }
      });
    } else {
      const estimate = estimates[0];
      testResults.tests.push({
        name: "Fetch Estimate",
        status: "passed",
        details: {
          estimateId: estimate.id,
          estimateNumber: estimate.estimate_number,
          clientName: estimate.jobs?.clients?.name,
          clientEmail: estimate.jobs?.clients?.email,
          total: estimate.total,
          lineItemCount: estimate.line_items?.length || 0
        }
      });

      // Test 4: Get user profile
      console.log("🔍 Test 4: Fetching user profile...");
      const userId = user?.id || estimate.user_id;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_name, company_email, company_phone, company_address, brand_color")
        .eq("id", userId)
        .single();
      testResults.tests.push({
        name: "Fetch Profile",
        status: profileError ? "failed" : "passed",
        details: {
          companyName: profile?.company_name || "Not set",
          companyEmail: profile?.company_email || "Not set",
          hasCompanyInfo: profile ? "✅ Yes" : "❌ No",
          error: profileError?.message
        }
      });

      // Test 5: Test mailgun-email function
      console.log("🔍 Test 5: Testing mailgun-email function...");
      const testEmailPayload = {
        to: "test@example.com",
        subject: "Test Email from test-send-estimate",
        text: "This is a test email to verify Mailgun configuration",
        html: "<p>This is a test email to verify Mailgun configuration</p>",
        from: profile?.company_email || "noreply@fixlify.app",
        userId: userId
      };

      try {
        const mailgunResponse = await fetch(`${supabaseUrl}/functions/v1/mailgun-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(testEmailPayload)
        });
        const mailgunResult = await mailgunResponse.text();
        let parsedResult;
        try {
          parsedResult = JSON.parse(mailgunResult);
        } catch {
          parsedResult = mailgunResult;
        }

        testResults.tests.push({
          name: "Mailgun Email Function",
          status: mailgunResponse.ok ? "passed" : "failed",
          details: {
            statusCode: mailgunResponse.status,
            response: parsedResult,
            testPayload: testEmailPayload
          }
        });
      } catch (mailgunError) {
        testResults.tests.push({
          name: "Mailgun Email Function",
          status: "failed",
          details: {
            error: mailgunError.message,
            testPayload: testEmailPayload
          }
        });
      }

      // Test 6: Test actual send-estimate function
      console.log("🔍 Test 6: Testing send-estimate function...");      try {
        const sendEstimateResponse = await fetch(`${supabaseUrl}/functions/v1/send-estimate`, {
          method: "POST",
          headers: {
            "Authorization": authHeader || `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            estimateId: estimate.id,
            recipientEmail: "test@example.com",
            customMessage: "This is a test from test-send-estimate function"
          })
        });

        const sendEstimateResult = await sendEstimateResponse.text();
        let parsedSendResult;
        try {
          parsedSendResult = JSON.parse(sendEstimateResult);
        } catch {
          parsedSendResult = sendEstimateResult;
        }

        testResults.tests.push({
          name: "Send Estimate Function",
          status: sendEstimateResponse.ok ? "passed" : "failed",
          details: {
            statusCode: sendEstimateResponse.status,
            response: parsedSendResult
          }
        });
      } catch (sendError) {        testResults.tests.push({
          name: "Send Estimate Function",
          status: "failed",
          details: {
            error: sendError.message
          }
        });
      }
    }

    // Test 7: Check communication logs
    console.log("🔍 Test 7: Checking communication logs...");
    const { data: recentLogs, error: logsError } = await supabase
      .from("communication_logs")
      .select("*")
      .eq("type", "email")
      .order("created_at", { ascending: false })
      .limit(5);

    testResults.tests.push({
      name: "Communication Logs",
      status: logsError ? "failed" : "passed",
      details: {
        recentEmailCount: recentLogs?.length || 0,
        logs: recentLogs?.map(log => ({
          id: log.id,
          status: log.status,
          to: log.to_address,
          created: log.created_at
        })),
        error: logsError?.message
      }
    });
    // Summary
    const passedTests = testResults.tests.filter(t => t.status === "passed").length;
    const failedTests = testResults.tests.filter(t => t.status === "failed").length;
    const skippedTests = testResults.tests.filter(t => t.status === "skipped").length;

    testResults.summary = {
      total: testResults.tests.length,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      status: failedTests === 0 ? "✅ All tests passed!" : "❌ Some tests failed"
    };

    console.log("Test results:", JSON.stringify(testResults, null, 2));

    return new Response(
      JSON.stringify(testResults, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Test error:", error);
    testResults.error = error.message;
    testResults.stack = error.stack;
    
    return new Response(
      JSON.stringify(testResults, null, 2),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});