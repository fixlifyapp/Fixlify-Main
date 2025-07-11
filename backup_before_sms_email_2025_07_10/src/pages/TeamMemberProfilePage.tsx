
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { TeamMemberHeader } from "@/components/team/profile/TeamMemberHeader";
import { TeamMemberTabs } from "@/components/team/profile/TeamMemberTabs";
import { LoadingState } from "@/components/team/profile/LoadingState";
import { NotFoundState } from "@/components/team/profile/NotFoundState";
import { useTeamMemberData } from "@/hooks/useTeamMemberData";
import { supabase } from "@/integrations/supabase/client";

const TeamMemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { member, isLoading, error, refetch } = useTeamMemberData(id);
  
  // Check permissions
  const isAdmin = hasRole('admin');
  const canEditProfile = hasPermission('users.edit');
  const canViewProfile = hasPermission('users.view');
  
  // If not authorized to view profiles, redirect
  useEffect(() => {
    if (!isLoading && !canViewProfile) {
      toast.error("You don't have permission to view team member profiles");
      navigate("/admin/team");
    }
  }, [isLoading, canViewProfile, navigate]);
  
  // Only admins can edit team members
  const canEditTeamMembers = canEditProfile;
  
  const handleGoBack = () => {
    navigate("/admin/team");
  };
  
  const handleSave = async () => {
    if (!member) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: member.name,
          avatar_url: member.avatar,
          status: member.status,
          is_public: member.isPublic,
          available_for_jobs: member.availableForJobs,
          phone: member.phone?.[0] || null,
          two_factor_enabled: member.twoFactorEnabled,
          call_masking_enabled: member.callMaskingEnabled,
          labor_cost_per_hour: member.laborCostPerHour,
          schedule_color: member.scheduleColor,
          internal_notes: member.internalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
        
      if (error) throw error;
      
      toast.success("Team member profile updated successfully");
      setIsEditing(false);
      
      // Refetch to get updated data
      refetch();
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!member || error) {
    return <NotFoundState onGoBack={handleGoBack} error={error} />;
  }
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header section */}
          <TeamMemberHeader 
            member={member}
            isEditing={isEditing}
            canEdit={canEditTeamMembers}
            onGoBack={handleGoBack}
            onEdit={handleEdit}
            onSave={handleSave}
            isSaving={isSaving}
          />
          
          {/* Tabs section */}
          <TeamMemberTabs 
            member={member}
            isEditing={isEditing}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamMemberProfilePage;
