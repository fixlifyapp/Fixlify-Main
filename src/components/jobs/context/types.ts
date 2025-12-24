import type { Job, JobWithRelations } from '@/types/core/job';
import type { Client } from '@/types/core/client';

// Tenant contact info from property
export interface TenantInfo {
  name?: string;
  phone?: string;
  email?: string;
}

// Extended Job type with UI-specific fields and backward compatibility
export type JobInfo = JobWithRelations & {
  // Backward compatibility aliases
  clientId?: string; // Alias for client_id
  client?: string | Client; // Can be client name string or full Client object
  clients?: Client; // Legacy: Full client object (use client instead)
  service?: string;
  address?: string;
  phone?: string;
  email?: string;
  total?: number; // Deprecated: Use revenue instead
  // Tenant contact info (from property)
  tenantInfo?: TenantInfo;
};

export interface JobDetailsContextType {
  job: JobInfo | null;
  isLoading: boolean;
  currentStatus: string;
  invoiceAmount: number;
  balance: number;
  refreshJob: () => void;
  refreshFinancials: () => void;
  financialRefreshTrigger: number;
  updateJobStatus: (newStatus: string) => Promise<void>;
}
