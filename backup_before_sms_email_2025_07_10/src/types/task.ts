export interface Task {
  id: string;
  description: string;
  job_id?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_by?: string | null;
  created_by_automation?: string | null;
  organization_id?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  description: string;
  job_id?: string;
  client_id?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateTaskInput {
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}
