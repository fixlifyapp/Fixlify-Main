// Example component demonstrating the improved type system
import type { Job, JobWithRelations } from '@/types/core/job';
import type { Client } from '@/types/core/client';
import type { Profile } from '@/types/core/profile';

interface JobCardProps {
  job: JobWithRelations;
}

export const JobCardExample = ({ job }: JobCardProps) => {
  // ✅ Full TypeScript support - autocomplete works!
  const clientName = job.client?.name || 'Unknown Client';
  const clientEmail = job.client?.email;
  const technicianName = job.technician?.name || 'Unassigned';
  
  // ✅ Type safety prevents errors
  // TypeScript knows client might be undefined, so we use optional chaining
  const hasClientPhone = job.client?.phone !== undefined;
  
  // ✅ Access nested properties safely
  const firstEstimate = job.estimates?.[0];
  const estimateTotal = firstEstimate?.total || 0;
  
  // ✅ IntelliSense shows all available properties
  const totalPaid = job.payments?.reduce((sum, payment) => {
    return sum + payment.amount; // TypeScript knows payment.amount is number
  }, 0) || 0;
  
  return (
    <div className="p-4 border rounded-lg">
      <h3>Job #{job.id}</h3>
      <p>Client: {clientName}</p>
      {clientEmail && <p>Email: {clientEmail}</p>}
      <p>Technician: {technicianName}</p>
      <p>Revenue: ${job.revenue}</p>
      <p>Estimates: {job.estimates?.length || 0}</p>
      <p>Total Paid: ${totalPaid}</p>
    </div>
  );
};

// Example of type guard usage
function processJob(data: unknown): Job | null {
  if (!data || typeof data !== 'object') return null;
  
  const job = data as any;
  
  // Validate required fields
  if (!job.id || !job.title || !job.status) {
    return null;
  }
  
  // Return typed job
  return job as Job;
}
