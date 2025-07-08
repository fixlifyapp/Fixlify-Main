
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Workflow, BookOpen, BarChart3, MessageSquare, Target } from "lucide-react";
import { TeamCollaborationDashboard } from "@/components/team/TeamCollaborationDashboard";
import { TeamWorkflowManager } from "@/components/team/TeamWorkflowManager";
import { TeamKnowledgeBase } from "@/components/team/TeamKnowledgeBase";

const TeamCollaborationPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Team Collaboration & Management"
        subtitle="Advanced team collaboration tools, workflow management, and knowledge sharing"
        icon={Users}
        badges={[
          { text: "Real-time", icon: MessageSquare, variant: "fixlyfy" },
          { text: "Workflows", icon: Workflow, variant: "success" },
          { text: "Knowledge", icon: BookOpen, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Team Dashboard</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Manager</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <TeamCollaborationDashboard />
          </TabsContent>
          
          <TabsContent value="workflows" className="space-y-6">
            <TeamWorkflowManager />
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-6">
            <TeamKnowledgeBase />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TeamCollaborationPage;
