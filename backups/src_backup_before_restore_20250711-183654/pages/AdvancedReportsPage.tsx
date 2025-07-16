
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, Settings, BarChart3, Filter } from "lucide-react";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { ReportTemplates } from "@/components/reports/ReportTemplates";
import { ScheduledReports } from "@/components/reports/ScheduledReports";
import { ExportCenter } from "@/components/reports/ExportCenter";
import { ReportAnalytics } from "@/components/reports/ReportAnalytics";

const AdvancedReportsPage = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  return (
    <PageLayout>
      <PageHeader
        title="Advanced Reports & Analytics"
        subtitle="Comprehensive reporting system with custom templates, scheduling, and multi-format exports"
        icon={FileText}
        badges={[
          { text: "Custom Templates", icon: FileText, variant: "fixlyfy" },
          { text: "Auto Scheduling", icon: Calendar, variant: "success" },
          { text: "Multi-Format Export", icon: Download, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="exports">Export Center</TabsTrigger>
            <TabsTrigger value="analytics">Report Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-6">
            <ReportBuilder activeTemplate={activeTemplate} />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <ReportTemplates onTemplateSelect={setActiveTemplate} />
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-6">
            <ScheduledReports />
          </TabsContent>
          
          <TabsContent value="exports" className="space-y-6">
            <ExportCenter />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <ReportAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdvancedReportsPage;
