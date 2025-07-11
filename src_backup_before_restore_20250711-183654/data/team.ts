
import { TeamMember } from "@/types/team";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const teamMembers: TeamMember[] = [];

// Function to fetch team members from Supabase
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      throw error;
    }

    // Convert profiles to TeamMember format
    const members: TeamMember[] = (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.name || 'Unknown Name',
      email: `${profile.name?.toLowerCase().replace(/\s+/g, '.')}@fixlyfy.com`,
      role: profile.role as any || "technician",
      status: "active",
      avatar: profile.avatar_url || undefined,
      lastLogin: profile.updated_at,
    }));

    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    toast.error("Failed to load team members");
    return [];
  }
};

// Function to update team members with generated test data
export const updateTeamMembers = (newMembers: TeamMember[]): TeamMember[] => {
  // In a real app, this would update the database
  // Here, we're just returning the new data for display
  return [...teamMembers, ...newMembers];
};

// Function to add a team member to Supabase
export const addTeamMember = async (member: Omit<TeamMember, "id">): Promise<TeamMember | null> => {
  try {
    // Generate a UUID for the new team member
    const newId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: newId,
        name: member.name,
        role: member.role,
        avatar_url: member.avatar,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || 'Unknown',
      email: `${data.name?.toLowerCase().replace(/\s+/g, '.')}@fixlyfy.com`,
      role: data.role as any,
      status: "active",
      avatar: data.avatar_url,
      lastLogin: data.updated_at,
    };
  } catch (error) {
    console.error("Error adding team member:", error);
    toast.error("Failed to add team member");
    return null;
  }
};
