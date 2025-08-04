// Profile type definitions for users and technicians
import type { BaseEntity } from './base';

export interface Profile extends BaseEntity {
  // Identity
  name?: string | null;
  avatar_url?: string | null;
  
  // Contact
  phone?: string | null;
  email?: string | null;
  
  // Role and permissions
  role?: string | null;
  status?: string | null;
  is_public?: boolean | null;
  available_for_jobs?: boolean | null;
  
  // Business info
  business_niche?: string | null;
  referral_source?: string | null;
  
  // Settings
  two_factor_enabled?: boolean | null;
  call_masking_enabled?: boolean | null;
  uses_two_factor?: boolean | null;
  
  // Scheduling
  schedule_color?: string | null;
  labor_cost_per_hour?: number | null;
  
  // Internal
  internal_notes?: string | null;
  
  // Relations (populated by queries)
  skills?: ProfileSkill[];
  service_areas?: ServiceArea[];
  commission?: TeamMemberCommission | null;
}

export interface ProfileSkill {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_code: string;
  user_id: string;
  created_at: string;
}

export interface TeamMemberCommission {
  id: string;
  user_id: string;
  base_rate: number;
  rules: any;
  fees: any;
  created_at: string;
  updated_at: string;
}

// Type for technician selection
export interface TechnicianProfile extends Profile {
  available_for_jobs: boolean;
  skills: ProfileSkill[];
  service_areas: ServiceArea[];
}
