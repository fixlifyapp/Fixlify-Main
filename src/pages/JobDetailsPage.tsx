
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { TabsContent } from "@/components/ui/tabs";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { JobDetailsProvider, useJobDetails } from "@/components/jobs/context/JobDetailsContext";
import { JobOverview } from "@/components/jobs/JobOverview";
import { ModernJobEstimatesTab } from "@/components/jobs/overview/ModernJobEstimatesTab";
import { ModernJobInvoicesTab } from "@/components/jobs/overview/ModernJobInvoicesTab";
import { JobPayments } from "@/components/jobs/JobPayments";
import { JobHistory } from "@/components/jobs/JobHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useInvoices } from "@/hooks/useInvoices";
import { usePayments } from "@/hooks/usePayments";

// Inner component that uses hooks within the provider
const JobDetailsContent = ({ jobId }: { jobId: string }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Get data for progress indicator
  const { estimates } = useEstimates(jobId);
  const { invoices } = useInvoices(jobId);
  const { payments } = usePayments(jobId);

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleEstimateConverted = () => {
    setActiveTab("invoices");
    toast.success('Estimate converted to invoice successfully');
  };

  // Calculate progress data
  const estimateCount = estimates?.length || 0;
  const invoiceCount = invoices?.length || 0;
  const paymentCount = payments?.length || 0;
  const hasApprovedEstimate = estimates?.some(e => e.status === 'approved' || e.status === 'converted') || false;
  const hasSentInvoice = invoices?.some(i => i.status === 'sent' || i.status === 'paid' || i.status === 'partial') || false;
  const hasPayments = paymentCount > 0;
  const outstandingBalance = invoices?.reduce((sum, inv) => {
    const balance = inv.balance_due ?? inv.balance ?? (inv.total - (inv.amount_paid || 0));
    return sum + (balance > 0 ? balance : 0);
  }, 0) || 0;

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-none overflow-x-hidden">
      <JobDetailsHeader />

      <div className="w-full mt-6">
        <JobDetailsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          estimateCount={estimateCount}
          invoiceCount={invoiceCount}
          paymentCount={paymentCount}
          hasApprovedEstimate={hasApprovedEstimate}
          hasSentInvoice={hasSentInvoice}
          hasPayments={hasPayments}
          outstandingBalance={outstandingBalance}
        >
          {/* Lazy load tabs - only render active tab to prevent duplicate data fetches */}
          <TabsContent value="overview" className="mt-0">
            {activeTab === "overview" && <JobOverview jobId={jobId} />}
          </TabsContent>
          <TabsContent value="estimates" className="mt-0">
            {activeTab === "estimates" && (
              <ModernJobEstimatesTab
                jobId={jobId}
                onEstimateConverted={handleEstimateConverted}
              />
            )}
          </TabsContent>
          <TabsContent value="invoices" className="mt-0">
            {activeTab === "invoices" && <ModernJobInvoicesTab jobId={jobId} />}
          </TabsContent>
          <TabsContent value="payments" className="mt-0">
            {activeTab === "payments" && <JobPayments jobId={jobId} />}
          </TabsContent>
          <TabsContent value="history" className="mt-0">
            {activeTab === "history" && <JobHistory jobId={jobId} />}
          </TabsContent>
        </JobDetailsTabs>
      </div>
    </div>
  );
};

// Validate job ID format
const isValidJobId = (jobId: string) => {
  // Job IDs should start with J- followed by numbers
  return /^J-\d+$/.test(jobId);
};

const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

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
        <JobDetailsContent jobId={jobId} />
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
