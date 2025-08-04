// Single source of truth for Job types
// This should be the ONLY Job interface in the entire codebase

export interface Job {
  // Core fields (from database)
  id: string;
  client_id: string | null;
  created_by: string | null; // UUID of creator
  user_id: string | null; // UUID of owner
  
  // Job details
  title: string;
  description: string | null;
  status: JobStatus;
  service: string | null;
  job_type: string | null;
  lead_source: string | null;
  
  // Scheduling
  date: string | null; // ISO timestamp
  schedule_start: string | null; // ISO timestamp
  schedule_end: string | null; // ISO timestamp
  
  // Financial
  revenue: number; // Use revenue consistently (not total)
  
  // Assignment
  technician_id: string | null;
  property_id: string | null;
  
  // Location
  address: string | null;
  
  // Metadata
  tags: string[];
  notes: string | null;
  tasks: any[]; // JSONB in database
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // Soft delete
  
  // Automation
  created_by_automation: string | null;
  automation_triggered_at: string | null;
  
  // Organization (optional)
  organization_id: string | null;
  
  // Relations (populated by queries)
  client?: Client;
  technician?: Profile;
  estimates?: Estimate[];
  invoices?: Invoice[];
  payments?: Payment[];
  messages?: Message[];
  attachments?: Attachment[];
}

// Strict job status enum
export enum JobStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

// For creating jobs
export interface CreateJobInput {
  client_id: string;
  title?: string; // Optional, will be auto-generated
  description?: string;
  status?: JobStatus;
  service?: string;
  job_type?: string;
  lead_source?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  revenue?: number;
  technician_id?: string;
  property_id?: string;
  address?: string;
  tags?: string[];
  notes?: string;
  tasks?: any[];
}

// For updating jobs
export interface UpdateJobInput extends Partial<CreateJobInput> {
  // All fields optional for updates
}

// Type guards
export function isValidJobStatus(status: string): status is JobStatus {
  return Object.values(JobStatus).includes(status as JobStatus);
}

// Validation
export function validateJob(data: any): Job {
  if (!data.id || typeof data.id !== 'string') {
    throw new Error('Invalid job: missing id');
  }
  
  // Ensure arrays are arrays
  data.tags = Array.isArray(data.tags) ? data.tags : [];
  data.tasks = Array.isArray(data.tasks) ? data.tasks : [];
  
  // Ensure numbers are numbers
  data.revenue = typeof data.revenue === 'number' ? data.revenue : 0;
  
  // Validate status
  if (data.status && !isValidJobStatus(data.status)) {
    console.warn(`Invalid job status: ${data.status}, defaulting to scheduled`);
    data.status = JobStatus.SCHEDULED;
  }
  
  return data as Job;
}
