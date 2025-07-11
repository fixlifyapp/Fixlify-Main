
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";
import { getRandomElement, getRandomInt, getRandomName } from "./helpers";

// Generate test team members data
export const generateTestTeamMembers = async (count: number = 6): Promise<TeamMember[]> => {
  // Check for existing team members first to avoid duplicating test data
  console.log("Checking for existing team members...");
  const { data: existingTeamMembers, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing team members:", checkError);
    throw checkError;
  }
  
  if (existingTeamMembers && existingTeamMembers.length > 0) {
    console.log("Team members already exist - fetching existing members");
    
    // Fetch existing team members instead of returning empty array
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
      
    if (error) {
      console.error("Error fetching existing team members:", error);
      throw error;
    }
    
    // Convert Supabase profiles to TeamMember format
    const teamMembers: TeamMember[] = profiles?.map(profile => ({
      id: profile.id,
      name: profile.name || 'Unknown',
      // Generate email since it's not in the profiles table
      email: `user-${profile.id.substring(0, 8)}@fixlyfy.com`,
      role: (profile.role as "admin" | "manager" | "dispatcher" | "technician") || "technician",
      status: "active" as "active" | "suspended",
      avatar: profile.avatar_url || "https://github.com/shadcn.png",
      lastLogin: profile.updated_at,
    })) || [];
    
    console.log(`Fetched ${teamMembers.length} existing team members`);
    return teamMembers;
  }
  
  console.log(`Generating ${count} test team members...`);
  
  const teamMembers: TeamMember[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(["James", "Robert", "John", "Michael", "David", "Sarah", "Jennifer", "Emily", "Jessica", "Ava", "Muhammad", "Wei", "Chen", "Priya", "Ananya", "Omar", "Zara", "Carlos", "Sofia", "Olivia"]);
    const lastName = getRandomElement(["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Wang", "Kim", "Singh", "Lee", "Khan", "Zhang", "Chen", "Nguyen", "Ahmed"]);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fixlyfy.com`;
    
    // Ensure we have a good distribution of roles
    let role;
    if (i === 0) {
      role = "admin"; // First member is admin
    } else if (i === 1) {
      role = "manager"; // Second member is manager
    } else if (i === 2 || i === 3) {
      role = "dispatcher"; // Two dispatchers
    } else {
      role = "technician"; // Rest are technicians
    }
    
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - getRandomInt(0, 14));

    // Define status options with explicit type
    const statusOptions = ["active", "suspended"] as const;
    // Fix the typing issue by using a proper array instead of readonly array
    const status = getRandomElement(Array.from(statusOptions)) as "active" | "suspended";
    
    teamMembers.push({
      id: `team-${i + 1}`,
      name: name,
      email: email,
      role: role as "admin" | "manager" | "dispatcher" | "technician",
      status: status,
      avatar: "https://github.com/shadcn.png",
      lastLogin: lastLoginDate.toISOString(),
    });
  }
  
  try {
    console.log("Inserting test team members into database...");
    console.log("Sample team member data:", teamMembers[0]);
    
    // Actually insert the team members into the profiles table
    const profilesData = teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      // We need to include email in the TeamMember interface for UI display,
      // but don't include it in the profiles table data since that table doesn't have an email field
      role: member.role,
      avatar_url: member.avatar,
      updated_at: member.lastLogin
    }));
    
    // Insert into Supabase
    const { error } = await supabase
      .from('profiles')
      .insert(profilesData);
    
    if (error) {
      console.error("Error inserting team members:", error);
      throw error;
    }
    
    console.log(`Successfully created ${teamMembers.length} team members in Supabase`);
    
    // Return the generated team members
    return teamMembers;
  } catch (error) {
    console.error("Error generating test team members:", error);
    throw error;
  }
};
