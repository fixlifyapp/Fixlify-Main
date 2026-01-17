import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { GradientButton } from "@/components/ui/gradient-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus, Shield, Upload, Loader2, UserPlus, Users, Target, Zap, TrendingUp, Settings, Mail } from "lucide-react";
import { AddTeamMemberModal } from "@/components/team/AddTeamMemberModal";
import { UserCardRow } from "@/components/team/UserCardRow";
import { useRBAC } from "@/components/auth/RBACProvider";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamMember } from "@/types/team";
import { TeamMemberProfile } from "@/types/team-member";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TeamInvitations } from "@/components/team/TeamInvitations";
import { RolesPermissionsTab } from "@/components/settings/team-tabs/RolesPermissionsTab";
import { InvitationsTab } from "@/components/settings/team-tabs/InvitationsTab";

// Helper function to convert TeamMember to TeamMemberProfile
const convertToTeamMemberProfile = (member: TeamMember): TeamMemberProfile => {
  return {
    ...member,
    isPublic: true,
    availableForJobs: true,
    twoFactorEnabled: false,
    callMaskingEnabled: false,
    laborCostPerHour: 50,
    skills: [],
    serviceAreas: [],
    scheduleColor: "#6366f1",
    internalNotes: "",
    usesTwoFactor: false
  };
};
const TeamManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const navigate = useNavigate();
  const {
    hasRole,
    hasPermission
  } = useRBAC();
  const isAdmin = hasRole('admin');
  const canViewUsers = hasPermission('users.view');

  // Fetch team members from Supabase on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        if (!canViewUsers) {
          setIsLoading(false);
          return;
        }
        const {
          data,
          error
        } = await supabase.from('profiles').select('*');
        if (error) {
          console.error("Error fetching team members:", error);
          setTeamMembers([]);
        } else if (data) {
          const members: TeamMember[] = data.map(profile => ({
            id: profile.id,
            name: profile.name || profile.email?.split('@')[0] || 'Unknown User',
            email: profile.email || `user-${profile.id.substring(0, 8)}@fixlyfy.com`,
            role: profile.role as "admin" | "manager" | "dispatcher" | "technician" || "technician",
            status: "active",
            avatar: profile.avatar_url || "https://github.com/shadcn.png",
            lastLogin: profile.updated_at
          }));
          setTeamMembers(members);
        }
      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
        toast.error("Failed to load team members");
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMembers();
  }, [canViewUsers]);

  // Filter members
  useEffect(() => {
    let result = teamMembers;
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      result = result.filter(member => member.name.toLowerCase().includes(lowercaseTerm) || member.email.toLowerCase().includes(lowercaseTerm));
    }
    if (roleFilter) {
      result = result.filter(member => member.role === roleFilter);
    }
    if (statusFilter) {
      result = result.filter(member => member.status === statusFilter);
    }
    setFilteredMembers(result);
  }, [searchTerm, roleFilter, statusFilter, teamMembers]);
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  const handleFilterRole = (role: string | null) => {
    setRoleFilter(role);
  };
  const handleFilterStatus = (status: string | null) => {
    setStatusFilter(status);
  };
  const handleAddNewMember = () => {
    if (isAdmin) {
      setIsModalOpen(true);
    }
  };
  const handleViewTeamMember = (id: string) => {
    navigate(`/team/${id}`);
  };
  const handleImportTestData = async () => {
    setIsImporting(true);
    try {
      toast.info("Importing test team data...");
      const newMembers = await generateTestTeamMembers(6);
      if (newMembers.length > 0) {
        setTeamMembers(prevMembers => [...prevMembers, ...newMembers]);
        toast.success(`Successfully imported ${newMembers.length} team members!`);
      } else {
        toast.info("No new team members imported");
      }
    } catch (error) {
      console.error("Error importing test team data:", error);
      toast.error("Failed to import test team data");
    } finally {
      setIsImporting(false);
    }
  };

  // Show permission error if user can't view users
  if (!canViewUsers) {
    return <PageLayout>
        <AnimatedContainer animation="fade-in">
          <PageHeader title="Team Management" subtitle="Manage your team members and track performance" icon={Users} />
        </AnimatedContainer>
        <AnimatedContainer animation="fade-in" delay={100}>
          <ModernCard variant="glass" className="p-8">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to view team management.
              </p>
            </div>
          </ModernCard>
        </AnimatedContainer>
      </PageLayout>;
  }
  return <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader title="Team Management" subtitle="Manage your team members, roles, and permissions" icon={Users} badges={[{
        text: "Performance Tracking",
        icon: Target,
        variant: "fixlyfy"
      }, {
        text: "Real-time Collaboration",
        icon: Zap,
        variant: "success"
      }, {
        text: "Growth Analytics",
        icon: TrendingUp,
        variant: "info"
      }]} actionButton={isAdmin ? {
        text: "Invite Team Member",
        icon: UserPlus,
        onClick: handleAddNewMember
      } : undefined} />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in" delay={100}>
        <ModernCard variant="elevated">
          <ModernCardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 h-auto p-0 bg-fixlyfy-bg-interface">
                <TabsTrigger value="members" className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </TabsTrigger>
                <TabsTrigger value="roles" className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles & Permissions
                </TabsTrigger>
                <TabsTrigger value="invitations" className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invitations
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="p-0">
                {isAdmin && <div className="p-6 border-b">
                    <div className="flex justify-end mb-4">
                      
                    </div>
                  </div>}

                <div className="p-6">
                  <TeamFilters onSearch={handleSearch} onFilterRole={handleFilterRole} onFilterStatus={handleFilterStatus} searchTerm={searchTerm} roleFilter={roleFilter} statusFilter={statusFilter} />
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? <TableRow>
                          <td colSpan={6} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <Loader2 size={24} className="animate-spin text-primary" />
                              <span>Loading team members...</span>
                            </div>
                          </td>
                        </TableRow> : filteredMembers.length === 0 ? <TableRow>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <UserPlus size={24} className="text-muted-foreground/50" />
                              {searchTerm || roleFilter || statusFilter ? "No team members match your filters" : "No team members yet. Click 'Import Test Data' to add some sample data."}
                            </div>
                          </td>
                        </TableRow> : filteredMembers.map(member => <UserCardRow key={member.id} user={convertToTeamMemberProfile(member)} />)}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="roles" className="p-6">
                <RolesPermissionsTab />
              </TabsContent>
              
              <TabsContent value="invitations" className="p-6">
                <InvitationsTab />
              </TabsContent>
            </Tabs>
          </ModernCardContent>
        </ModernCard>
      </AnimatedContainer>
      
      <AddTeamMemberModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </PageLayout>;
};
export default TeamManagementPage;