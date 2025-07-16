import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useJobTypes } from "@/hooks/useConfigItems";
import { debugJobCreation, checkIdCounters } from "@/utils/debug-job-creation";
import { Bug, Plus, CheckCircle2, XCircle } from "lucide-react";

const JobCreationTestPage = () => {
  console.log("🧪 JobCreationTestPage loaded");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [jobTitle, setJobTitle] = useState("Test Job");
  const [jobType, setJobType] = useState("");
  
  const { addJob } = useJobs();
  const { clients, isLoading: clientsLoading } = useClients();
  const { items: jobTypes } = useJobTypes();
  
  const handleCreateTestJob = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }
    
    setIsCreating(true);
    try {
      const jobData = {
        client_id: selectedClientId,
        title: jobTitle,
        job_type: jobType || jobTypes.find(jt => jt.is_default)?.name || 'General Service',
        description: 'Test job created from debug page',
        status: 'New',
        tags: ['test', 'debug'],
        tasks: ['Test task 1', 'Test task 2']
      };
      
      console.log("Creating job with data:", jobData);
      const createdJob = await addJob(jobData);
      
      if (createdJob) {
        toast.success(`Job created successfully! ID: ${createdJob.id}`);
        console.log("Created job:", createdJob);
      }
    } catch (error) {
      console.error("Job creation error:", error);
      toast.error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleRunDebug = async () => {
    const results = await debugJobCreation();
    console.log("Debug results:", results);
  };
  
  const handleCheckCounters = async () => {
    const results = await checkIdCounters();
    console.log("Counter check results:", results);
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Creation Test Page</h1>
          <p className="text-muted-foreground mt-2">Debug and test job creation functionality</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button onClick={handleRunDebug} variant="outline">
            <Bug className="mr-2 h-4 w-4" />
            Run Full Debug
          </Button>
          <Button onClick={handleCheckCounters} variant="outline">
            Check ID Counters
          </Button>
        </div>
        
        {/* Test Job Creation */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Job</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="none" disabled>No clients found</SelectItem>
                  ) : (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email || 'No email'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name} {type.is_default && '(Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleCreateTestJob} 
              disabled={isCreating || !selectedClientId}
              className="w-full"
            >
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Job
                </>
              )}
            </Button>
          </div>
        </Card>
        
        {/* Instructions */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Run Full Debug" to check all job creation requirements</li>
            <li>Check the browser console for detailed debug output</li>
            <li>If ID generation fails, click "Check ID Counters"</li>
            <li>Try creating a test job using the form above</li>
            <li>Look for specific error messages in the console</li>
          </ol>
          
          <div className="mt-4 p-4 bg-background rounded-lg">
            <h4 className="font-semibold mb-2">Common Issues:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <span><strong>No clients:</strong> Create at least one client first</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <span><strong>ID generation fails:</strong> Check id_counters table permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <span><strong>Status error:</strong> Ensure job_statuses table has entries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span><strong>Success:</strong> Job ID will be shown in toast notification</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default JobCreationTestPage; 