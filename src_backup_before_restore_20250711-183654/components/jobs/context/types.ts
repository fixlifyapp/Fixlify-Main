export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  clients?: any; // Full client object
  service: string;
  address: string;
  phone: string;
  email: string;
  total: number;
  status?: string;
  description?: string;
  tags?: string[];
  technician_id?: string;
  schedule_start?: string;
  schedule_end?: string;
  job_type?: string;
  lead_source?: string;
  tasks?: string[];
  title?: string;
}

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
