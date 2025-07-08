import { supabase } from "@/integrations/supabase/client";
import { generateNextId } from "./idGeneration";

export const debugJobCreation = async () => {
  console.log("🔍 Starting job creation debug...");
  
  const results = {
    auth: { success: false, message: "", data: null as any },
    idGeneration: { success: false, message: "", data: null as any },
    permissions: { success: false, message: "", data: null as any },
    configItems: { success: false, message: "", data: null as any },
    testCreate: { success: false, message: "", data: null as any }
  };

  try {
    // 1. Check authentication
    console.log("1️⃣ Checking authentication...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      results.auth.message = "Not authenticated";
    } else {
      results.auth.success = true;
      results.auth.message = `Authenticated as: ${user.email}`;
      results.auth.data = { userId: user.id, email: user.email };
    }

    // 2. Test ID generation
    console.log("2️⃣ Testing ID generation...");
    try {
      const testId = await generateNextId('job');
      results.idGeneration.success = true;
      results.idGeneration.message = `Generated test ID: ${testId}`;
      results.idGeneration.data = { generatedId: testId };
    } catch (error) {
      results.idGeneration.message = `ID generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // 3. Check permissions
    console.log("3️⃣ Checking permissions...");
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      results.permissions.success = true;
      results.permissions.message = `User role: ${profile?.role || 'No role found'}`;
      results.permissions.data = { role: profile?.role };
    }

    // 4. Check configuration items
    console.log("4️⃣ Checking configuration items...");
    const { data: jobTypes } = await supabase
      .from('config_items')
      .select('*')
      .eq('category', 'job_type')
      .eq('user_id', user?.id || '');
    
    const { data: jobStatuses } = await supabase
      .from('config_items')
      .select('*')
      .eq('category', 'job_status')
      .eq('user_id', user?.id || '');
    
    results.configItems.success = true;
    results.configItems.message = `Found ${jobTypes?.length || 0} job types, ${jobStatuses?.length || 0} job statuses`;
    results.configItems.data = { 
      jobTypes: jobTypes?.map(jt => jt.name) || [],
      jobStatuses: jobStatuses?.map(js => js.name) || []
    };

    // 5. Test creating a minimal job
    console.log("5️⃣ Testing minimal job creation...");
    if (user) {
      // First get a client
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .limit(1);
      
      if (clients && clients.length > 0) {
        const testJobData = {
          id: await generateNextId('job'),
          client_id: clients[0].id,
          title: 'Debug Test Job',
          status: 'scheduled',
          user_id: user.id,
          created_by: user.id,
          tags: [],
          tasks: []
        };

        console.log("Test job data:", testJobData);

        const { data: createdJob, error: createError } = await supabase
          .from('jobs')
          .insert(testJobData)
          .select()
          .single();

        if (createError) {
          results.testCreate.message = `Job creation failed: ${createError.message}`;
          console.error("Job creation error details:", createError);
        } else {
          results.testCreate.success = true;
          results.testCreate.message = `Test job created successfully: ${createdJob.id}`;
          results.testCreate.data = createdJob;

          // Clean up test job
          await supabase.from('jobs').delete().eq('id', createdJob.id);
          console.log("Test job cleaned up");
        }
      } else {
        results.testCreate.message = "No clients found to test with";
      }
    }

  } catch (error) {
    console.error("Debug error:", error);
  }

  // Print results
  console.log("\n📊 JOB CREATION DEBUG RESULTS:");
  console.log("=====================================");
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${test}: ${result.message}`);
    if (result.data) {
      console.log(`   Data:`, result.data);
    }
  });
  console.log("=====================================\n");

  return results;
};

// Function to check id_counters table
export const checkIdCounters = async () => {
  console.log("🔢 Checking ID counters...");
  
  try {
    const { data: counters, error } = await supabase
      .from('id_counters')
      .select('*')
      .order('entity_type');
    
    if (error) {
      console.error("Error fetching counters:", error);
      return { success: false, error: error.message };
    }

    console.log("ID Counters:");
    console.table(counters);
    
    return { success: true, counters };
  } catch (error) {
    console.error("Error checking counters:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to reset job counter if needed
export const resetJobCounter = async (startValue: number = 2000) => {
  console.log("🔄 Resetting job counter to:", startValue);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from('id_counters')
      .upsert({
        entity_type: 'job',
        prefix: 'J',
        current_value: startValue,
        start_value: startValue,
        user_id: user.id
      }, {
        onConflict: 'entity_type,user_id'
      });
    
    if (error) {
      console.error("Error resetting counter:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Job counter reset successfully");
    return { success: true };
  } catch (error) {
    console.error("Error resetting counter:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 