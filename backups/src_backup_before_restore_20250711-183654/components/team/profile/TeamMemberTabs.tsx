
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { CommissionsTab } from "./CommissionsTab";
import { AIInsightsTab } from "./AIInsightsTab";
import { TeamMemberProfile } from "@/types/team-member";
import { Brain } from "lucide-react";

interface TeamMemberTabsProps {
  member: TeamMemberProfile;
  isEditing: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export const TeamMemberTabs = ({
  member,
  isEditing,
  activeTab,
  setActiveTab,
  isAdmin,
}: TeamMemberTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <Card className="border-fixlyfy-border shadow-sm">
        <div className="px-4 pt-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile" className="flex-1 sm:flex-initial">
              Profile
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex-1 sm:flex-initial">
              Commissions
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="ai-insights"
                className="flex-1 sm:flex-initial flex items-center gap-1"
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="px-4 pb-4">
          <TabsContent value="profile" className="mt-4 space-y-4">
            <ProfileTab member={member} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="commissions" className="mt-4 space-y-4">
            <CommissionsTab member={member} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-4 space-y-4">
            <AIInsightsTab member={member} isEditing={isEditing} />
          </TabsContent>
        </div>
      </Card>
    </Tabs>
  );
};
