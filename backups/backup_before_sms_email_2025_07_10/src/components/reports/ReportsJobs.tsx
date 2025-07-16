
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportsJobsProps {
  period: string;
  isLoading?: boolean;
}

interface Job {
  id: string;
  client: string;
  service: string;
  technician: string;
  date: Date;
  duration: number;
  revenue: number;
}

export const ReportsJobs = ({ period, isLoading: externalLoading }: ReportsJobsProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching completed jobs data...");
        
        // Fetch completed jobs from Supabase
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, service, date, schedule_start, schedule_end, revenue, client_id, technician_id, status')
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(10);

        if (jobsError) {
          console.error("Error fetching jobs:", jobsError);
          setError(`Failed to fetch jobs: ${jobsError.message}`);
          setLoading(false);
          return;
        }

        console.log("Jobs data received:", jobsData);
        
        if (!jobsData || jobsData.length === 0) {
          console.log("No completed jobs found in database");
          setJobs([]);
          setLoading(false);
          return;
        }

        // Get all client IDs to fetch client data
        const clientIds = jobsData.map(job => job.client_id).filter(Boolean);
        
        // Handle case where no client IDs exist
        if (clientIds.length === 0) {
          console.log("No client IDs found in jobs");
          setJobs([]);
          setLoading(false);
          return;
        }
        
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);

        if (clientsError) {
          console.error("Error fetching clients:", clientsError);
        }

        console.log("Clients data received:", clientsData);

        // Get all technician IDs to fetch technician data
        const technicianIds = jobsData
          .map(job => job.technician_id)
          .filter(id => id !== null && id !== undefined) as string[];
        
        let technicianMap = new Map();
        
        if (technicianIds.length > 0) {
          const { data: techniciansData, error: techniciansError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', technicianIds);

          if (techniciansError) {
            console.error("Error fetching technicians:", techniciansError);
          } else {
            console.log("Technicians data received:", techniciansData);
            
            // Create maps for quick lookups
            if (techniciansData) {
              techniciansData.forEach(tech => {
                technicianMap.set(tech.id, tech.name || 'Unnamed Technician');
              });
            }
          }
        }

        // Create map for client lookups
        const clientMap = new Map();
        if (clientsData) {
          clientsData.forEach(client => {
            clientMap.set(client.id, client.name);
          });
        }

        // Format job data
        const formattedJobs = jobsData.map(job => {
          const startTime = job.schedule_start ? new Date(job.schedule_start) : new Date(job.date);
          const endTime = job.schedule_end ? new Date(job.schedule_end) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000));
          
          // Handle revenue parsing safely
          const revenue = job.revenue !== null && job.revenue !== undefined
            ? typeof job.revenue === 'number'
              ? job.revenue
              : typeof job.revenue === 'string'
                ? parseFloat(job.revenue)
                : 0
            : 0;
          
          return {
            id: job.id,
            client: job.client_id ? (clientMap.get(job.client_id) || 'Unknown Client') : 'Unknown Client',
            service: job.service || 'General Service',
            technician: job.technician_id ? (technicianMap.get(job.technician_id) || 'Unassigned') : 'Unassigned',
            date: new Date(job.date),
            duration: durationMinutes,
            revenue: revenue,
          };
        });
        
        console.log("Formatted jobs:", formattedJobs);
        setJobs(formattedJobs);
      } catch (error: any) {
        console.error('Error fetching jobs data:', error);
        setError(`Failed to load jobs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [period]);

  // Render mobile card view
  const renderMobileJobs = () => {
    return jobs.map((job) => (
      <div key={job.id} className="fixlyfy-card mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-base">Job #{job.id}</span>
          <Badge className="bg-fixlyfy/10 text-fixlyfy text-base">
            {job.service}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-base">
          <div>
            <p className="text-fixlyfy-text-secondary">Client:</p>
            <p>{job.client}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Technician:</p>
            <p>{job.technician}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Date:</p>
            <p>{format(job.date, 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Duration:</p>
            <p>{Math.floor(job.duration / 60)}h {job.duration % 60}m</p>
          </div>
          <div className="col-span-2">
            <p className="text-fixlyfy-text-secondary">Revenue:</p>
            <p className="font-medium">${job.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    ));
  };

  // Use external loading state if provided, otherwise use internal loading state
  const isLoadingData = externalLoading !== undefined ? externalLoading : loading;

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Recent Completed Jobs</h2>
      </div>
      <div className="overflow-hidden">
        {isLoadingData ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <p className="text-fixlyfy-text-secondary mt-2">
              Use the "Generate Test Data" button at the top of the page to create sample jobs.
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-fixlyfy-text-secondary">
              No completed jobs found. Use the "Generate Test Data" button to create sample jobs.
            </p>
          </div>
        ) : isMobile ? (
          <div className="p-4">
            {renderMobileJobs()}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Job #</TableHead>
                <TableHead className="text-base">Client</TableHead>
                <TableHead className="text-base">Service</TableHead>
                <TableHead className="text-base">Technician</TableHead>
                <TableHead className="text-base">Date</TableHead>
                <TableHead className="text-base">Duration</TableHead>
                <TableHead className="text-base">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, idx) => (
                <TableRow 
                  key={job.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50"}
                >
                  <TableCell className="font-medium text-base">
                    {job.id}
                  </TableCell>
                  <TableCell className="text-base">
                    {job.client}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-fixlyfy/10 text-fixlyfy text-base">
                      {job.service}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-base">
                    {job.technician}
                  </TableCell>
                  <TableCell className="text-base">
                    {format(job.date, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-base">
                    {Math.floor(job.duration / 60)}h {job.duration % 60}m
                  </TableCell>
                  <TableCell className="font-medium text-base">
                    ${job.revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
