
import { supabase } from "@/integrations/supabase/client";
import { 
  getRandomElement, 
  getRandomDate, 
  getRandomInt,
  serviceTypes
} from "./helpers";

export const generateTestJobs = async (clientIds: string[], count: number = 40): Promise<void> => {
  if (clientIds.length === 0) {
    console.error("No client IDs provided for job generation");
    throw new Error("No client IDs available to create jobs");
  }
  
  // Check for existing jobs first to avoid duplicating test data
  console.log("Checking for existing jobs...");
  const { data: existingJobs, error: checkError } = await supabase
    .from('jobs')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing jobs:", checkError);
    throw checkError;
  }
  
  if (existingJobs && existingJobs.length > 0) {
    console.log("Jobs already exist - skipping job generation");
    return;
  }
  
  const jobs: any[] = [];
  const now = new Date();
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - 2);
  const futureDate = new Date();
  futureDate.setMonth(now.getMonth() + 2);
  
  const statuses = ["scheduled", "in-progress", "completed", "canceled", "pending"];
  
  console.log(`Generating ${count} test jobs for ${clientIds.length} clients...`);
  
  for (let i = 0; i < count; i++) {
    const clientId = getRandomElement(clientIds);
    const status = getRandomElement(statuses);
    const scheduledDate = getRandomDate(pastDate, futureDate);
    
    // Calculate end time (1-5 hours after start)
    const endDate = new Date(scheduledDate);
    endDate.setHours(endDate.getHours() + getRandomInt(1, 5));
    
    const jobId = `JOB-${2000 + i + 1}`;
    
    const serviceType = getRandomElement(serviceTypes);
    const tagName = serviceType.split(' ')[0];
    
    jobs.push({
      id: jobId,
      client_id: clientId,
      title: serviceType,
      description: getRandomElement([
        "Customer reported issues with system performance",
        "Routine maintenance and inspection required",
        "Complete system replacement needed",
        "Emergency repair requested",
        "Follow-up service to previous repair",
        "New installation project",
        "System efficiency evaluation",
        "Parts replacement needed"
      ]),
      status: status,
      date: scheduledDate.toISOString(),
      schedule_start: scheduledDate.toISOString(),
      schedule_end: endDate.toISOString(),
      service: serviceType,
      revenue: status === "completed" ? getRandomInt(200, 2500) : status === "in-progress" ? getRandomInt(100, 2000) : 0,
      tags: [tagName],
      notes: getRandomElement([undefined, "Rush job", "Requires specialized equipment", "Second floor unit", "Hard to access location"])
    });
  }
  
  try {
    console.log("Inserting test jobs into database...");
    console.log("Sample job data:", jobs[0]);
    
    // Insert into Supabase in batches to avoid payload size limits
    const batchSize = 10;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const { error } = await supabase.from('jobs').insert(batch);
      
      if (error) {
        console.error(`Error generating jobs batch ${i}-${i+batchSize}:`, error);
        throw error;
      }
    }
    
    console.log(`Successfully created ${jobs.length} jobs`);
  } catch (error) {
    console.error("Error generating test jobs:", error);
    throw error;
  }
};
