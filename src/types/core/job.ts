// Job type definitions with proper type relationships
import type { BaseOrganizationEntity, Metadata } from './base';
import type { Client } from './client';
import type { Profile } from './profile';
import type { Estimate } from './estimate';
import type { Invoice } from './invoice';
import type { Payment } from './payment';

// Strict job status enum
export enum JobStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface Job extends BaseOrganizationEntity, Metadata {
  // Client relationship
  client_id: string | null;
  
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
  revenue: number; // Primary field for job value
  
  // Assignment
  technician_id: string | null;
  property_id: string | null;
  
  // Location
  address: string | null;
  
  // Additional data
  tasks: any[]; // JSONB in database
  
  // Automation
  created_by_automation: string | null;
  automation_triggered_at: string | null;
  
  // Relations (properly typed, populated by queries)
  client?: Client;
  technician?: Profile;
  estimates?: Estimate[];
  invoices?: Invoice[];
  payments?: Payment[];
  messages?: any[]; // TODO: Create Message type
  attachments?: any[]; // TODO: Create Attachment type
}

// Job with all relations loaded
export interface JobWithRelations extends Job {
  client: Client;
  technician?: Profile;
  estimates: Estimate[];
  invoices: Invoice[];
  payments: Payment[];
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

// Backward compatibility support
export interface JobWithCompatibility extends Job {
  // Support both field names
  total?: number; // Deprecated, use revenue
  clientId?: string; // Deprecated, use client_id
}
