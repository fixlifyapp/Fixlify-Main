// UNIFIED CLIENT TYPE DEFINITIONS
// Single source of truth for all client-related types

export interface UnifiedClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  company?: string;
  notes?: string;
  status?: string;
  type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  user_id?: string;
}

// Legacy aliases for backward compatibility
export type Client = UnifiedClient;
export type ClientData = UnifiedClient;

// Form data type for client creation/editing
export interface ClientFormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  type?: string;
  notes?: string;
  tags?: string[];
}

// Client with additional computed properties
export interface ClientWithMetadata extends UnifiedClient {
  jobCount?: number;
  totalRevenue?: number;
  lastJobDate?: string;
  lastContactDate?: string;
}

// Client filter and search options
export interface ClientFilters {
  status?: string[];
  type?: string[];
  tags?: string[];
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Client sort options
export type ClientSortField = 'name' | 'created_at' | 'updated_at' | 'status' | 'type';
export type ClientSortDirection = 'asc' | 'desc';

export interface ClientSortOptions {
  field: ClientSortField;
  direction: ClientSortDirection;
}