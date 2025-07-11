
import { generateTestTeamMembers } from "./team-generator";
import { generateTestClients } from "./client-generator"; 
import { generateTestJobs } from "./job-generator";

export const generateAllTestData = async (clientCount: number = 20, jobCount: number = 40): Promise<string[]> => {
  try {
    console.log(`Starting generation of ${clientCount} clients and ${jobCount} jobs`);
    
    // Generate team members
    await generateTestTeamMembers();
    
    // Generate clients 
    const clientIds = await generateTestClients(clientCount);
    console.log(`Generated ${clientIds.length} client IDs`);
    
    // Then generate jobs for those clients
    if (clientIds.length > 0) {
      await generateTestJobs(clientIds, jobCount);
    } else {
      console.warn("No client IDs available, skipping job generation");
    }
    
    return clientIds;
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
};

export const useTestData = () => {
  return {
    generateAllTestData,
    generateTestClients,
    generateTestJobs,
    generateTestTeamMembers
  };
};

// Re-export all individual generators
export * from './team-generator';
export * from './client-generator';
export * from './job-generator';
export * from './types';
export * from './helpers';
