
// Job-related types
export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  clients?: any;
  service?: string;
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
