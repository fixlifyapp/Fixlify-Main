// Re-export the main useJobs hook for backward compatibility
// This file should be removed once all imports are updated
export { useJobs } from './useJobs';
export type { Job, JobStatus, CreateJobInput, UpdateJobInput } from '@/types/job';
