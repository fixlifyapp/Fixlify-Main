
import { Database } from "@/integrations/supabase/types";

export type JobInfo = {
  id: string;
  title: string;
  description: string;
  scheduleDate: string;
  scheduleTime: string;
  type: string;
  tags: string[];
  team: string;
  source: string;
  clientId: string;
  revenue?: number;
  date: string;
  status: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
};

export type Call = {
  id: string;
  direction: "inbound" | "outbound";
  ai_transcript: string | null;
  appointment_data: any;
  appointment_scheduled: boolean | null;
  call_duration: number | null;
  call_started_at: string | null;
  call_status: string;
  call_summary: string | null;
  client_phone: string;
  contact_id: string | null;
  connect_contact_id: string | null;
  connect_instance_id: string | null;
  created_at: string;
  customer_intent: string | null;
  customer_phone: string | null;
  customer_satisfaction_score: number | null;
  ended_at: string | null;
  phone_number_id: string;
  resolution_type: string | null;
  started_at: string;
  successful_resolution: boolean | null;
  client: {
    id: string;
    name: string;
    phone: string;
  };
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
};
