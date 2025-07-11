
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessIntelligenceDashboard } from "./BusinessIntelligenceDashboard";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { ReportScheduler } from "./ReportScheduler";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Brain,
  Target,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

export const AdvancedReportsPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleExportReport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const handleScheduleReport = () => {
    toast.success("Report scheduled successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Analytics & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExportReport("pdf")}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport("excel")}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleScheduleReport}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BusinessIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Custom Report Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom reports with drag-and-drop widgets and advanced filters
                </p>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Launch Report Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <ReportScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
};
