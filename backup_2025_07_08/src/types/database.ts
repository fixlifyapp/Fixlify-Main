export interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  country_code: string;
  region?: string;
  locality?: string;
  address_requirements?: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: string;
  monthly_price: number;
  monthly_cost?: number; // Added for Telnyx compatibility
  purchased_by?: string;
  purchased_at?: string;
  assigned_to?: string;
  webhook_url?: string;
  ai_dispatcher_enabled?: boolean;
  configured_for_ai?: boolean; // Added for AI configuration status
  configured_at?: string; // Added for AI configuration timestamp
  connect_phone_number_arn?: string;
  connect_instance_id?: string;
  source?: string; // Added to track data source (telnyx_table, phone_table, etc)
  created_at: string;
  updated_at: string;
}

// AI Response types
export interface AIResponse {
  recommendations: string[];
  insights: string[];
  actionItems: string[];
  generatedText?: string;
  businessData?: BusinessMetrics;
}

export interface BusinessMetrics {
  totalRevenue: number;
  jobsCompleted: number;
  averageJobValue: number;
  customerSatisfaction: number;
  lastRefreshed?: string;
  clients?: number;
  jobs?: number;
  revenue?: number;
  metrics?: {
    totalRevenue: number;
    jobsCompleted: number;
    averageJobValue: number;
    customerSatisfaction: number;
    clients?: {
      total: number;
    };
    jobs?: {
      total: number;
      scheduled: number;
    };
    revenue?: {
      total: number;
    };
  };
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

export interface TeamMemberSkill {
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

export interface ProfileRow {
  id: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  is_public?: boolean;
  available_for_jobs?: boolean;
  two_factor_enabled?: boolean;
  call_masking_enabled?: boolean;
  labor_cost_per_hour?: number;
  schedule_color?: string;
  internal_notes?: string;
  uses_two_factor?: boolean;
}

export interface UpdateTeamMemberCommissionParams {
  user_id: string;
  base_rate: number;
  rules: any;
  fees: any;
}
