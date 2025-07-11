
export interface AIDispatcherConfig {
  id: string;
  phone_number_id: string;
  business_name: string;
  business_type: string;
  business_greeting?: string;
  diagnostic_fee: number;
  emergency_surcharge: number;
  hourly_rate: number;
  voice_selection: string;
  emergency_detection_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIDispatcherCallLog {
  id: string;
  phone_number_id: string;
  call_sid?: string;
  contact_id?: string;
  client_phone: string;
  call_duration?: number;
  call_status: string;
  resolution_type?: string;
  appointment_scheduled: boolean;
  appointment_data?: any;
  customer_satisfaction_score?: number;
  ai_transcript?: string;
  call_summary?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface AIAnalytics {
  totalCalls: number;
  resolvedCalls: number;
  transferredCalls: number;
  successRate: number;
  averageCallDuration: number;
  appointmentsScheduled: number;
  customerSatisfactionAverage: number;
  recentCalls: Array<{
    id: string;
    clientPhone: string;
    duration: number;
    status: string;
    resolutionType: string;
    appointmentScheduled: boolean;
    customerSatisfaction: number;
    startedAt: string;
    summary: string;
  }>;
}

export type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export type BusinessType = 
  | 'HVAC'
  | 'Plumbing' 
  | 'Electrical'
  | 'General Contractor'
  | 'Appliance Repair'
  | 'Handyman'
  | 'Roofing'
  | 'Flooring'
  | 'Painting'
  | 'General Service';

export type ResolutionType = 'resolved' | 'transferred' | 'voicemail' | 'abandoned';

export type TimeframeOption = 'today' | 'week' | 'month' | 'year';
