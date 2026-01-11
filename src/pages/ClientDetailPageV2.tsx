import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { useClientCompleteData } from "@/hooks/useClientCompleteData";
import {
  ClientHeaderCard,
  ClientStatsRow,
  ContactInfoCard,
  RecentJobsCard,
  PaymentHistoryCard,
  PropertiesCard
} from "@/components/clients/detail-v2";
import { ClientCustomFieldsCard } from "@/components/clients/ClientCustomFieldsCard";
import { Settings2 } from "lucide-react";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { PropertyCreateDialog } from "@/components/clients/client-form/PropertyCreateDialog";
import { useState } from "react";
import { toast } from "sonner";

// Loading skeleton for the page
const ClientDetailSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {/* Header skeleton */}
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="flex items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-border/50 bg-card p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>

    {/* Content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  </div>
);

// Error state component
const ClientDetailError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
    <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load client</h2>
    <p className="text-sm text-muted-foreground mb-4">
      There was an error loading the client data. Please try again.
    </p>
    <Button onClick={onRetry} variant="outline" className="gap-2">
      <RefreshCw className="h-4 w-4" />
      Try Again
    </Button>
  </div>
);

const ClientDetailPageV2 = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  const {
    client,
    stats,
    recentJobs,
    recentPayments,
    properties,
    totalJobsCount,
    totalPaymentsCount,
    totalRevenue,
    isLoading,
    hasError,
    refresh,
    clearError
  } = useClientCompleteData({
    clientId: clientId || '',
    enableRealtime: true
  });

  const handleCall = () => {
    if (client?.phone) {
      window.location.href = `tel:${client.phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const handleMessage = () => {
    if (client?.phone) {
      window.location.href = `sms:${client.phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      window.location.href = `mailto:${client.email}`;
    } else {
      toast.error('No email address available');
    }
  };

  const handleCreateJob = () => {
    setIsCreateJobOpen(true);
  };

  const handleAddProperty = () => {
    setIsAddPropertyOpen(true);
  };

  const handlePropertyCreated = () => {
    refresh();
  };

  const handleJobCreated = () => {
    refresh();
  };

  if (!clientId) {
    navigate('/clients');
    return null;
  }

  return (
    <PageLayout>
      <div className="space-y-4">
        {/* Back button and refresh */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>

          {!isLoading && !hasError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && <ClientDetailSkeleton />}

        {/* Error state */}
        {hasError && !isLoading && <ClientDetailError onRetry={clearError} />}

        {/* Content */}
        {!isLoading && !hasError && client && (
          <div className="space-y-4">
            {/* Header Card */}
            <ClientHeaderCard
              client={client}
              onCall={handleCall}
              onMessage={handleMessage}
              onEmail={handleEmail}
              onCreateJob={handleCreateJob}
            />

            {/* Stats Row */}
            <ClientStatsRow stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Jobs & Payments */}
              <div className="lg:col-span-2 space-y-4">
                <RecentJobsCard
                  jobs={recentJobs}
                  totalCount={totalJobsCount}
                  clientId={clientId}
                />
                <PaymentHistoryCard
                  payments={recentPayments}
                  totalCount={totalPaymentsCount}
                  totalRevenue={totalRevenue}
                  clientId={clientId}
                />
              </div>

              {/* Right Column - Contact, Properties & Custom Fields */}
              <div className="space-y-4">
                <ContactInfoCard client={client} />
                <PropertiesCard
                  properties={properties}
                  onAddProperty={handleAddProperty}
                />

                {/* Custom Fields */}
                <div className="rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Custom Fields</h3>
                  </div>
                  <div className="p-4">
                    <ClientCustomFieldsCard clientId={clientId} embedded />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not found state */}
        {!isLoading && !hasError && !client && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Client not found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The client you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/clients')} variant="outline">
              Back to Clients
            </Button>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <ScheduleJobModal
        open={isCreateJobOpen}
        onOpenChange={setIsCreateJobOpen}
        preselectedClientId={clientId}
        onSuccess={handleJobCreated}
      />

      {/* Add Property Dialog */}
      <PropertyCreateDialog
        open={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        clientId={clientId}
        onPropertyCreated={handlePropertyCreated}
      />
    </PageLayout>
  );
};

export default ClientDetailPageV2;
