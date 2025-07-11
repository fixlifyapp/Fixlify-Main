export interface TriggerAction {
  type: 'appointment_tomorrow' | 'overdue_invoice' | 'maintenance_reminder' | 'seasonal_reminder';
  data: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: string;
    conditions?: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  enabled: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  rule_id: string;
  trigger_type: string;
  trigger_data: Record<string, any>;
  actions_executed: Array<{
    type: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
  organization_id: string;
  created_at: string;
}