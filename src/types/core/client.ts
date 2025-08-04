// Client type definitions with proper structure
import type { BaseOrganizationEntity, ContactInfo, Metadata } from './base';

export interface Client extends BaseOrganizationEntity, ContactInfo, Metadata {
  // Identity
  name: string;
  company?: string | null;
  
  // Status and categorization
  status?: string | null;
  type?: string | null;
  
  // Relations (populated by queries)
  jobs?: Array<{
    id: string;
    title: string;
    status: string;
    revenue: number;
    created_at: string;
  }>;
  
  // Computed fields
  jobCount?: number;
  totalRevenue?: number;
  lastJobDate?: string | null;
  lastContactDate?: string | null;
}

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

// Client with additional metadata
export interface ClientWithMetadata extends Client {
  jobCount: number;
  totalRevenue: number;
  lastJobDate?: string | null;
  lastContactDate?: string | null;
}
