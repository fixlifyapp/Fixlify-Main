import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const { addJob, refreshJobs } = useJobs();
  
  // Decode the client ID in case it was URL encoded
  const decodedClientId = clientId ? decodeURIComponent(clientId) : null;
  
  console.log("🔍 ClientDetailPage - params:", { clientId, decodedClientId });
  
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        refreshJobs();
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleJobSuccess = (job: any) => {
    navigate(`/jobs/${job.id}`);
  };

  if (!decodedClientId) {
    console.error("❌ ClientDetailPage - No client ID provided");
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Client not found</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">No client ID provided.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/clients')}
            >
              Back to Clients
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  console.log("✅ ClientDetailPage - Valid client ID, rendering client details for:", decodedClientId);

  return (
    <PageLayout>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Client Details</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View and manage client information.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateJobModalOpen(true)} 
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto flex-shrink-0"
          size="sm"
        >
          <Plus size={16} className="mr-2" /> 
          <span>Create Job</span>
        </Button>
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        <ClientForm clientId={decodedClientId} onCreateJob={() => setIsCreateJobModalOpen(true)} />
      </div>
      
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={decodedClientId}
        onJobCreated={handleJobCreated}
        onSuccess={handleJobSuccess}
      />
    </PageLayout>
  );
};

export default ClientDetailPage;
