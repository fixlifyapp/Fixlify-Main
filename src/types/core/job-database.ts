// Enhanced Job type that extends Supabase database types
import type { Database } from '@/integrations/supabase/types';
import type { Job as BaseJob, JobStatus } from './job';
import type { Client } from './client';
import type { Profile } from './profile';
import type { Estimate } from './estimate';
import type { Invoice } from './invoice';
import type { Payment } from './payment';

// Extract the base types from Supabase
type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

// Extend the database type with our enhancements
export interface JobDatabase extends JobRow {
  // Override status to use our enum
  status: JobStatus | null;
  
  // Ensure arrays are properly typed
  tags: string[];
  tasks: any[];
  
  // Ensure required fields
  revenue: number;
  created_at: string;
  updated_at: string;
}

// Job with all relations properly typed
export interface JobWithDatabaseRelations extends JobDatabase {
  // Relations from database joins
  client?: Client;
  technician?: Profile;
  
  // Relations from separate queries
  estimates?: Estimate[];
  invoices?: Invoice[];
  payments?: Payment[];
  messages?: any[]; // TODO: Create Message type
  attachments?: any[]; // TODO: Create Attachment type
}

// Create type for database operations
export interface CreateJobDatabase extends Omit<JobInsert, 'status'> {
  status?: JobStatus;
}

export interface UpdateJobDatabase extends Omit<JobUpdate, 'status'> {
  status?: JobStatus;
}

// Type guard to validate database job
export function isValidDatabaseJob(data: any): data is JobDatabase {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    (!data.status || Object.values(JobStatus).includes(data.status))
  );
}

// Convert database job to our Job type
export function databaseJobToJob(dbJob: JobRow): BaseJob {
  return {
    ...dbJob,
    // Ensure required fields have defaults
    revenue: dbJob.revenue ?? 0,
    tags: Array.isArray(dbJob.tags) ? dbJob.tags : [],
    tasks: Array.isArray(dbJob.tasks) ? dbJob.tasks : [],
    title: dbJob.title ?? '',
    status: (dbJob.status as JobStatus) ?? JobStatus.SCHEDULED,
    created_at: dbJob.created_at ?? new Date().toISOString(),
    updated_at: dbJob.updated_at ?? new Date().toISOString(),
    
    // Handle nullable fields
    client_id: dbJob.client_id,
    created_by: dbJob.created_by,
    user_id: dbJob.user_id,
    description: dbJob.description,
    service: dbJob.service,
    job_type: dbJob.job_type,
    lead_source: dbJob.lead_source,
    date: dbJob.date,
    schedule_start: dbJob.schedule_start,
    schedule_end: dbJob.schedule_end,
    technician_id: dbJob.technician_id,
    property_id: dbJob.property_id,
    address: dbJob.address,
    notes: dbJob.notes,
    deleted_at: dbJob.deleted_at,
    created_by_automation: dbJob.created_by_automation,
    automation_triggered_at: dbJob.automation_triggered_at,
    organization_id: dbJob.organization_id,
  };
}
