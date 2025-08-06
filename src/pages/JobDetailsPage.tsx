import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { TabsContent } from "@/components/ui/tabs";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { JobDetailsProvider } from "@/components/jobs/context/JobDetailsContext";
import { JobOverview } from "@/components/jobs/JobOverview";
import { ModernJobEstimatesTab } from "@/components/jobs/overview/ModernJobEstimatesTab";
import { ModernJobInvoicesTab } from "@/components/jobs/overview/ModernJobInvoicesTab";
import { JobPayments } from "@/components/jobs/JobPayments";
import { JobHistory } from "@/components/jobs/JobHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { hasPermission } = useRBAC();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleEstimateConverted = () => {
    setActiveTab("invoices");
    toast.success('Estimate converted to invoice successfully');
  };

  const exportJobData = () => {
    toast.success('Job data export started');
    console.log('Exporting job data for:', jobId);
  };
  
  // Validate job ID format
  const isValidJobId = (id: string) => {
    return /^J-\d+$/.test(id);
  };
  
  if (!jobId) {
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Job not found</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">No job ID provided.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!isValidJobId(jobId)) {
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Invalid Job ID</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Job ID "{jobId}" is not in the correct format. Expected format: J-####
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <JobDetailsProvider jobId={jobId}>
        <div className="container mx-auto px-2 sm:px-4 space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={() => navigate('/jobs')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Jobs</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            {hasPermission('export_job_data') && (
              <Button 
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={exportJobData}
                className="gap-1 sm:gap-2"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
          
          <Card className="border-0 shadow-lg">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <JobDetailsHeader />
              
              <JobDetailsTabs 
                value={activeTab} 
                onValueChange={setActiveTab}
              >
                <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                  <JobOverview />
                </TabsContent>
                
                <TabsContent value="estimates" className="mt-4 sm:mt-6">
                  <ModernJobEstimatesTab 
                    onEstimateConverted={handleEstimateConverted}
                  />
                </TabsContent>
                
                <TabsContent value="invoices" className="mt-4 sm:mt-6">
                  <ModernJobInvoicesTab />
                </TabsContent>
                
                <TabsContent value="payments" className="mt-4 sm:mt-6">
                  <JobPayments />
                </TabsContent>
                
                <TabsContent value="history" className="mt-4 sm:mt-6">
                  <JobHistory />
                </TabsContent>
              </JobDetailsTabs>
            </div>
          </Card>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;