// This file defines the data models that will be used with Supabase
// These match the tables defined in the Pre-Supabase Integration Checklist

import { UserRole } from "@/components/auth/types";
import { PaymentMethod, PaymentStatus } from "@/types/payment";

// User model
export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended" | "inactive";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Client model
export interface DbClient {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Job model
export interface DbJob {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | string;
  tags?: string[];
  technician_id?: string;
  schedule_start?: string;
  schedule_end?: string;
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Estimate model
export interface DbEstimate {
  id: string;
  job_id: string;
  total: number;
  items: EstimateItem[];
  upsells?: EstimateItem[];
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

interface EstimateItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

// Invoice model
export interface DbInvoice {
  id: string;
  job_id: string;
  estimate_id?: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  balance_due: number;
  paid_at?: string;
  items: InvoiceItem[];
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

// Payment model
export interface DbPayment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  technician_id?: string;
  reference?: string;
  notes?: string;
  created_by: string; // user_id
  created_at: string;
}

// Product model
export interface DbProduct {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  taxable: boolean;
  tags?: string[];
  sku?: string;
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Task model
export interface DbTask {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to?: string; // user_id
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Attachment model
export interface DbAttachment {
  id: string;
  job_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string; // user_id
  created_at: string;
}

// Message model
export interface DbMessage {
  id: string;
  job_id: string;
  user_id: string;
  type: "sms" | "email";
  direction: "in" | "out";
  content: string;
  timestamp: string;
  status?: "delivered" | "read" | "failed";
  created_at: string;
}

// Automation model
export interface DbAutomation {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  recipient_id?: string;
  conditions?: Record<string, any>[];
  status: "active" | "inactive" | "draft";
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Tag model
export interface DbTag {
  id: string;
  name: string;
  category: "job" | "client" | "product" | string;
  color?: string;
  created_by: string; // user_id
  created_at: string;
}
