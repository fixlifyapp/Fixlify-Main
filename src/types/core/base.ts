// Base types shared across all entities to avoid circular dependencies

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BaseOrganizationEntity extends BaseEntity {
  organization_id?: string | null;
  user_id?: string | null;
  created_by?: string | null;
}

// Common field types
export interface ContactInfo {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

// Common metadata
export interface Metadata {
  tags?: string[];
  notes?: string | null;
}
