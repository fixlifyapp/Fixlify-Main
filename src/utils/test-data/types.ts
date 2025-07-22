
// Common interfaces used across test data generators

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  state: string;
  type: string;
  status: string; // Allow any string to match database
  notes?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  company?: string;
  country?: string;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  schedule_start: string;
  schedule_end: string;
  technician_id?: string;
  service: string;
  revenue?: number;
  tags?: string[];
  notes?: string;
}
