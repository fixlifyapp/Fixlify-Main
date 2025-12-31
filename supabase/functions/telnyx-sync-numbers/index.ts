import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelnyxNumber {
  phone_number: string;
  status: string;
  connection_name?: string;
  connection_id?: string;
  purchased_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELNYX_API_KEY = Deno.env.get("TELNYX_API_KEY");
    const TELNYX_MESSAGING_PROFILE_ID = Deno.env.get("TELNYX_MESSAGING_PROFILE_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELNYX_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    if (!TELNYX_MESSAGING_PROFILE_ID) {
      throw new Error("TELNYX_MESSAGING_PROFILE_ID not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch numbers from Fixlify messaging profile ONLY
    console.log(`Fetching numbers from messaging profile: ${TELNYX_MESSAGING_PROFILE_ID}`);
    const telnyxResponse = await fetch(
      `https://api.telnyx.com/v2/messaging_profiles/${TELNYX_MESSAGING_PROFILE_ID}/phone_numbers?page[size]=100`,
      {
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!telnyxResponse.ok) {
      const error = await telnyxResponse.text();
      throw new Error(`Telnyx API error: ${error}`);
    }

    const telnyxData = await telnyxResponse.json();
    const telnyxNumbers: TelnyxNumber[] = telnyxData.data || [];
    console.log(`Found ${telnyxNumbers.length} numbers in Fixlify profile`);

    // 2. Fetch all numbers from database (excluding released)
    const { data: dbNumbers, error: dbError } = await supabase
      .from("phone_numbers")
      .select("id, phone_number, status, pool_status, organization_id")
      .neq("status", "released");

    if (dbError) throw dbError;
    console.log(`Found ${dbNumbers?.length || 0} active numbers in database`);

    // 3. Create maps for comparison
    const telnyxMap = new Map(telnyxNumbers.map(n => [n.phone_number, n]));
    const dbMap = new Map((dbNumbers || []).map(n => [n.phone_number, n]));

    const results = {
      added: [] as string[],
      removed: [] as string[],
      updated: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    };

    // 4. Add numbers that exist in Telnyx profile but not in DB
    for (const [phone, telnyxNum] of telnyxMap) {
      if (!dbMap.has(phone)) {
        console.log(`Adding ${phone} to database...`);
        const { error: insertError } = await supabase
          .from("phone_numbers")
          .insert({
            phone_number: phone,
            status: "purchased",
            pool_status: "available",
            is_admin_purchased: true,
            telnyx_id: phone,
            purchased_at: new Date().toISOString(),
            capabilities: { sms: true, voice: true },
          });

        if (insertError) {
          console.error(`Error adding ${phone}:`, insertError);
          results.errors.push(`Failed to add ${phone}: ${insertError.message}`);
        } else {
          results.added.push(phone);
        }
      }
    }

    // 5. Mark numbers removed from profile as released
    // Only if they were admin purchased and not assigned to an org
    for (const [phone, dbNum] of dbMap) {
      if (!telnyxMap.has(phone)) {
        // Skip if assigned to organization (don't auto-release assigned numbers)
        if (dbNum.organization_id) {
          console.log(`Skipping ${phone} - assigned to org`);
          results.skipped.push(phone);
          continue;
        }

        console.log(`Marking ${phone} as released (removed from profile)...`);
        const { error: updateError } = await supabase
          .from("phone_numbers")
          .update({
            status: "released",
            pool_status: null,
          })
          .eq("id", dbNum.id);

        if (updateError) {
          console.error(`Error updating ${phone}:`, updateError);
          results.errors.push(`Failed to update ${phone}: ${updateError.message}`);
        } else {
          results.removed.push(phone);
        }
      }
    }

    // 6. Reactivate released numbers if they reappear in profile
    const { data: releasedNumbers } = await supabase
      .from("phone_numbers")
      .select("id, phone_number")
      .eq("status", "released");

    for (const released of releasedNumbers || []) {
      if (telnyxMap.has(released.phone_number)) {
        console.log(`Reactivating ${released.phone_number}...`);
        const { error: updateError } = await supabase
          .from("phone_numbers")
          .update({
            status: "purchased",
            pool_status: "available"
          })
          .eq("id", released.id);

        if (!updateError) {
          results.updated.push(released.phone_number);
        }
      }
    }

    console.log("Sync complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        profileId: TELNYX_MESSAGING_PROFILE_ID,
        telnyxCount: telnyxNumbers.length,
        dbCount: dbNumbers?.length || 0,
        added: results.added,
        removed: results.removed,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
