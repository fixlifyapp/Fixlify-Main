
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { TeamMembersTab } from "@/components/settings/team-tabs/TeamMembersTab";
import { RolesPermissionsTab } from "@/components/settings/team-tabs/RolesPermissionsTab";
import { InvitationsTab } from "@/components/settings/team-tabs/InvitationsTab";
import { Users, Shield, Mail } from "lucide-react";

export const TeamManagementTabs = () => {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <ModernCard variant="elevated">
      <ModernCardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 h-auto p-0 bg-fixlyfy-bg-interface">
            <TabsTrigger 
              value="members" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger 
              value="invitations" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Invitations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="p-6">
            <TeamMembersTab />
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
  );
};
