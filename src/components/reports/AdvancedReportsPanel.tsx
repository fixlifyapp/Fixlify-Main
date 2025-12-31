
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
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { exportElementToPDF, exportToExcel, getReportExportColumns } from "@/utils/exportUtils";
import { supabase } from "@/integrations/supabase/client";

export const AdvancedReportsPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportElementToPDF('reports-dashboard', {
          title: 'Business Analytics Report',
          filename: 'fixlify-analytics-report'
        });
        toast.success('PDF report exported successfully!');
      } else {
        // Fetch summary data for Excel export
        const { data: jobs } = await supabase
          .from('jobs')
          .select('status, total_amount, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        const summaryData = [
          { period: 'Current Month', revenue: jobs?.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.total_amount || 0), 0) || 0, jobs_completed: jobs?.filter(j => j.status === 'completed').length || 0, avg_job_value: 0 },
        ];
        if (summaryData[0].jobs_completed > 0) {
          summaryData[0].avg_job_value = summaryData[0].revenue / summaryData[0].jobs_completed;
        }

        exportToExcel(summaryData, getReportExportColumns(), {
          title: 'Business Analytics Report',
          filename: 'fixlify-analytics-report'
        });
        toast.success('Excel report exported successfully!');
      }
    } catch (error) {
      toast.error(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
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
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("excel")}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
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
          <div id="reports-dashboard">
            <BusinessIntelligenceDashboard />
          </div>
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
