
// Centralized portal types
export interface ClientPortalAccess {
  id: string;
  access_token: string;
  client_id: string;
  document_type: string;
  document_id: string;
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  expires_at: string;
  use_count: number;
  max_uses?: number;
  used_at?: string;
  domain_restriction?: string;
  ip_restrictions?: string[];
  created_at: string;
}

export interface PortalSession {
  id: string;
  access_token: string;
  client_id: string;
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  expires_at: string;
  is_active: boolean;
  last_accessed_at?: string;
  created_at: string;
}

export interface PortalActivityLog {
  id: string;
  client_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PortalValidationResult {
  valid: boolean;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  permissions?: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  error?: string;
}
