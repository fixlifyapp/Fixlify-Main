// Enhanced Profile type that extends Supabase database types
import type { Database } from '@/integrations/supabase/types';
import type { Profile as BaseProfile } from './profile';

// Extract the base types from Supabase
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Extend the database type with our enhancements
export interface ProfileDatabase extends ProfileRow {
  // Ensure required fields (id is the user's UUID)
  created_at: string;
  updated_at: string;
  
  // Business hours as structured data
  business_hours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

// Profile with related data from joins
export interface ProfileWithDatabaseRelations extends ProfileDatabase {
  // From team_member_skills table
  skills?: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  
  // From service_areas table
  service_areas?: Array<{
    id: string;
    name: string;
    zip_code: string;
    created_at: string;
  }>;
  
  // From team_member_commissions table
  commission?: {
    id: string;
    base_rate: number;
    rules: any;
    fees: any;
    created_at: string;
    updated_at: string;
  };
}

// Create type for database operations
export type CreateProfileDatabase = ProfileInsert;
export type UpdateProfileDatabase = ProfileUpdate;

// Type guard to validate database profile
export function isValidDatabaseProfile(data: any): data is ProfileDatabase {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string'
  );
}

// Convert database profile to our Profile type
export function databaseProfileToProfile(dbProfile: ProfileRow): BaseProfile {
  return {
    id: dbProfile.id,
    created_at: dbProfile.created_at ?? new Date().toISOString(),
    updated_at: dbProfile.updated_at ?? new Date().toISOString(),
    
    // Identity fields
    name: dbProfile.name,
    avatar_url: dbProfile.avatar_url,
    
    // Contact fields
    phone: dbProfile.phone,
    email: dbProfile.email,
    
    // Role and permissions
    role: dbProfile.role,
    status: dbProfile.status,
    is_public: dbProfile.is_public,
    available_for_jobs: dbProfile.available_for_jobs,
    
    // Business info
    business_niche: dbProfile.business_niche,
    referral_source: dbProfile.referral_source,
    
    // Settings
    two_factor_enabled: dbProfile.two_factor_enabled,
    call_masking_enabled: dbProfile.call_masking_enabled,
    uses_two_factor: dbProfile.two_factor_enabled, // Map to legacy field
    
    // Scheduling
    schedule_color: dbProfile.schedule_color,
    labor_cost_per_hour: dbProfile.labor_cost_per_hour,
    
    // Internal
    internal_notes: dbProfile.internal_notes,
  };
}
