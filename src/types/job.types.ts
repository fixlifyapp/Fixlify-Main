// Job-related types are now in @/types/job.ts
// This file is kept for backward compatibility only

export { Job, JobStatus, CreateJobInput, UpdateJobInput } from '@/types/job';

// Task type remains here as it's not part of the core Job type
export interface Task {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
