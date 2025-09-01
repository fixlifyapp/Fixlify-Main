// Test AI Dispatcher Setup - Run this in browser console
// This tests both the webhook and MCP server

(async function testAIDispatcher() {
    console.log("=== Testing AI Dispatcher Setup ===");
    
    const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";
    
    // Test 1: Public Webhook (Dynamic Variables)
    console.log("\n1. Testing Public Webhook...");
    try {
        const webhookResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/telnyx-public-webhook?apikey=${ANON_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone_number: "+1234567890",
                    from: "+1234567890",
                    event: "webhook.test"
                })
            }
        );
        
        const webhookData = await webhookResponse.json();
        console.log("✅ Webhook Response:", webhookData);
        
        if (webhookData.business_name && webhookData.agent_name) {
            console.log("✅ Dynamic variables working!");
            console.log(`   Business: ${webhookData.business_name}`);
            console.log(`   Agent: ${webhookData.agent_name}`);
        }
    } catch (error) {
        console.error("❌ Webhook test failed:", error);
    }
    
    // Test 2: MCP Server Tools List
    console.log("\n2. Testing MCP Server...");
    try {
        const mcpResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/mcp-appointment-server?apikey=${ANON_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "tools/list",
                    params: {}
                })
            }
        );
        
        const mcpData = await mcpResponse.json();
        console.log("✅ MCP Tools Response:", mcpData);
        
        if (mcpData.result?.tools) {
            console.log("✅ Available tools:");
            mcpData.result.tools.forEach(tool => {
                console.log(`   - ${tool.name}: ${tool.description}`);
            });
        }
    } catch (error) {
        console.error("❌ MCP test failed:", error);
    }
    
    // Test 3: Check Availability Tool
    console.log("\n3. Testing Check Availability Tool...");
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        const availabilityResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/mcp-appointment-server?apikey=${ANON_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 2,
                    method: "tools/call",
                    params: {
                        name: "check_availability",
                        arguments: {
                            date: dateStr,
                            service_type: "HVAC"
                        }
                    }
                })
            }
        );
        
        const availabilityData = await availabilityResponse.json();
        console.log("✅ Availability Check:", availabilityData);
        
        if (availabilityData.result?.available_slots) {
            console.log(`✅ Available slots for ${dateStr}:`);
            console.log(`   ${availabilityData.result.available_slots.join(", ")}`);
        }
    } catch (error) {
        console.error("❌ Availability check failed:", error);
    }
    
    console.log("\n=== Test Complete ===");
    console.log("\nURLs for Telnyx Configuration:");
    console.log(`Webhook URL: ${SUPABASE_URL}/functions/v1/telnyx-public-webhook?apikey=${ANON_KEY}`);
    console.log(`MCP Server URL: ${SUPABASE_URL}/functions/v1/mcp-appointment-server?apikey=${ANON_KEY}`);
})();
