export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advanced_workflow_executions: {
        Row: {
          completed_at: string | null
          context_data: Json | null
          created_at: string | null
          current_step: number | null
          error: string | null
          error_step: number | null
          execution_log: Json | null
          id: string
          organization_id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string | null
          current_step?: number | null
          error?: string | null
          error_step?: number | null
          execution_log?: Json | null
          id?: string
          organization_id: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string | null
          current_step?: number | null
          error?: string | null
          error_step?: number | null
          execution_log?: Json | null
          id?: string
          organization_id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advanced_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "advanced_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_workflow_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
          usage_count: number | null
          workflow_config: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          workflow_config: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          workflow_config?: Json
        }
        Relationships: []
      }
      advanced_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          organization_id: string
          settings: Json
          steps: Json
          trigger_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          organization_id: string
          settings?: Json
          steps?: Json
          trigger_config?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          organization_id?: string
          settings?: Json
          steps?: Json
          trigger_config?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agent_configs: {
        Row: {
          agent_name: string | null
          ai_assistant_id: string | null
          aws_region: string | null
          base_prompt: string | null
          business_hours: Json | null
          business_niche: string
          company_name: string | null
          connect_instance_arn: string | null
          created_at: string
          custom_prompt_additions: string | null
          diagnostic_price: number
          emergency_surcharge: number
          greeting_template: string | null
          id: string
          is_active: boolean | null
          service_areas: Json | null
          service_types: Json | null
          telnyx_assistant_config: Json | null
          updated_at: string
          user_id: string
          voice_id: string | null
        }
        Insert: {
          agent_name?: string | null
          ai_assistant_id?: string | null
          aws_region?: string | null
          base_prompt?: string | null
          business_hours?: Json | null
          business_niche?: string
          company_name?: string | null
          connect_instance_arn?: string | null
          created_at?: string
          custom_prompt_additions?: string | null
          diagnostic_price?: number
          emergency_surcharge?: number
          greeting_template?: string | null
          id?: string
          is_active?: boolean | null
          service_areas?: Json | null
          service_types?: Json | null
          telnyx_assistant_config?: Json | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
        }
        Update: {
          agent_name?: string | null
          ai_assistant_id?: string | null
          aws_region?: string | null
          base_prompt?: string | null
          business_hours?: Json | null
          business_niche?: string
          company_name?: string | null
          connect_instance_arn?: string | null
          created_at?: string
          custom_prompt_additions?: string | null
          diagnostic_price?: number
          emergency_surcharge?: number
          greeting_template?: string | null
          id?: string
          is_active?: boolean | null
          service_areas?: Json | null
          service_types?: Json | null
          telnyx_assistant_config?: Json | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      ai_assistant_templates: {
        Row: {
          base_prompt: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          base_prompt: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          base_prompt?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      ai_call_logs: {
        Row: {
          action_taken: string | null
          ai_agent: string | null
          client_id: string | null
          created_at: string | null
          duration: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          phone_number: string | null
          sentiment: string | null
          started_at: string | null
          success: boolean | null
          transcript: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          ai_agent?: string | null
          client_id?: string | null
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          sentiment?: string | null
          started_at?: string | null
          success?: boolean | null
          transcript?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          ai_agent?: string | null
          client_id?: string | null
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          sentiment?: string | null
          started_at?: string | null
          success?: boolean | null
          transcript?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_call_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_dispatcher_call_logs: {
        Row: {
          ai_transcript: string | null
          appointment_data: Json | null
          appointment_scheduled: boolean | null
          call_duration: number | null
          call_started_at: string | null
          call_status: string
          call_summary: string | null
          client_phone: string
          connect_contact_id: string | null
          connect_instance_id: string | null
          contact_id: string | null
          created_at: string
          customer_intent: string | null
          customer_phone: string | null
          customer_satisfaction_score: number | null
          ended_at: string | null
          id: string
          phone_number_id: string
          resolution_type: string | null
          started_at: string
          successful_resolution: boolean | null
        }
        Insert: {
          ai_transcript?: string | null
          appointment_data?: Json | null
          appointment_scheduled?: boolean | null
          call_duration?: number | null
          call_started_at?: string | null
          call_status?: string
          call_summary?: string | null
          client_phone: string
          connect_contact_id?: string | null
          connect_instance_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_intent?: string | null
          customer_phone?: string | null
          customer_satisfaction_score?: number | null
          ended_at?: string | null
          id?: string
          phone_number_id: string
          resolution_type?: string | null
          started_at?: string
          successful_resolution?: boolean | null
        }
        Update: {
          ai_transcript?: string | null
          appointment_data?: Json | null
          appointment_scheduled?: boolean | null
          call_duration?: number | null
          call_started_at?: string | null
          call_status?: string
          call_summary?: string | null
          client_phone?: string
          connect_contact_id?: string | null
          connect_instance_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_intent?: string | null
          customer_phone?: string | null
          customer_satisfaction_score?: number | null
          ended_at?: string | null
          id?: string
          phone_number_id?: string
          resolution_type?: string | null
          started_at?: string
          successful_resolution?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_dispatcher_call_logs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "available_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_dispatcher_call_logs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_dispatcher_configs: {
        Row: {
          additional_info: string | null
          agent_name: string | null
          agent_personality: string | null
          ai_capabilities: string | null
          assistant_id: string | null
          business_greeting: string | null
          business_name: string
          business_niche: string | null
          business_type: string
          call_transfer_message: string | null
          capabilities: string | null
          company_name: string | null
          created_at: string
          diagnostic_fee: number | null
          dynamic_variables: Json | null
          emergency_detection_enabled: boolean | null
          emergency_hours: string | null
          emergency_surcharge: number | null
          greeting_message: string | null
          hourly_rate: number | null
          hours_of_operation: string | null
          id: string
          instructions: string | null
          payment_methods: string | null
          phone_number_id: string
          scheduling_rules: string | null
          service_area: string | null
          services_offered: string | null
          telnyx_config: Json | null
          updated_at: string
          user_id: string | null
          voice_selection: string | null
          voicemail_detection_message: string | null
          warranty_info: string | null
          webhook_url: string | null
        }
        Insert: {
          additional_info?: string | null
          agent_name?: string | null
          agent_personality?: string | null
          ai_capabilities?: string | null
          assistant_id?: string | null
          business_greeting?: string | null
          business_name?: string
          business_niche?: string | null
          business_type?: string
          call_transfer_message?: string | null
          capabilities?: string | null
          company_name?: string | null
          created_at?: string
          diagnostic_fee?: number | null
          dynamic_variables?: Json | null
          emergency_detection_enabled?: boolean | null
          emergency_hours?: string | null
          emergency_surcharge?: number | null
          greeting_message?: string | null
          hourly_rate?: number | null
          hours_of_operation?: string | null
          id?: string
          instructions?: string | null
          payment_methods?: string | null
          phone_number_id: string
          scheduling_rules?: string | null
          service_area?: string | null
          services_offered?: string | null
          telnyx_config?: Json | null
          updated_at?: string
          user_id?: string | null
          voice_selection?: string | null
          voicemail_detection_message?: string | null
          warranty_info?: string | null
          webhook_url?: string | null
        }
        Update: {
          additional_info?: string | null
          agent_name?: string | null
          agent_personality?: string | null
          ai_capabilities?: string | null
          assistant_id?: string | null
          business_greeting?: string | null
          business_name?: string
          business_niche?: string | null
          business_type?: string
          call_transfer_message?: string | null
          capabilities?: string | null
          company_name?: string | null
          created_at?: string
          diagnostic_fee?: number | null
          dynamic_variables?: Json | null
          emergency_detection_enabled?: boolean | null
          emergency_hours?: string | null
          emergency_surcharge?: number | null
          greeting_message?: string | null
          hourly_rate?: number | null
          hours_of_operation?: string | null
          id?: string
          instructions?: string | null
          payment_methods?: string | null
          phone_number_id?: string
          scheduling_rules?: string | null
          service_area?: string | null
          services_offered?: string | null
          telnyx_config?: Json | null
          updated_at?: string
          user_id?: string | null
          voice_selection?: string | null
          voicemail_detection_message?: string | null
          warranty_info?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_dispatcher_configs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: true
            referencedRelation: "available_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_dispatcher_configs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: true
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          action_taken: boolean | null
          content: string
          context: Json | null
          created_at: string
          feedback: string | null
          id: string
          is_helpful: boolean | null
          recommendation_type: string
          shown_at: string
          user_id: string
        }
        Insert: {
          action_taken?: boolean | null
          content: string
          context?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          recommendation_type: string
          shown_at?: string
          user_id: string
        }
        Update: {
          action_taken?: boolean | null
          content?: string
          context?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          recommendation_type?: string
          shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointment_slots: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          is_available: boolean | null
          technician_id: string | null
          time: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          technician_id?: string | null
          time: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          technician_id?: string | null
          time?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          client_id: string | null
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          created_via: string | null
          customer_name: string
          customer_phone: string | null
          device_type: string | null
          id: string
          issue_description: string | null
          notes: string | null
          phone: string
          scheduled_date: string | null
          service_type: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_via?: string | null
          customer_name: string
          customer_phone?: string | null
          device_type?: string | null
          id?: string
          issue_description?: string | null
          notes?: string | null
          phone: string
          scheduled_date?: string | null
          service_type?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          client_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_via?: string | null
          customer_name?: string
          customer_phone?: string | null
          device_type?: string | null
          id?: string
          issue_description?: string | null
          notes?: string | null
          phone?: string
          scheduled_date?: string | null
          service_type?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          automation_id: string | null
          created_at: string | null
          delay_minutes: number | null
          id: string
          order_index: number | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          automation_id?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          order_index?: number | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          automation_id?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_analytics: {
        Row: {
          avg_execution_time: number | null
          created_at: string | null
          date: string
          execution_count: number | null
          failure_count: number | null
          id: string
          revenue_impact: number | null
          success_count: number | null
          success_rate: number | null
          total_execution_time: number | null
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          avg_execution_time?: number | null
          created_at?: string | null
          date: string
          execution_count?: number | null
          failure_count?: number | null
          id?: string
          revenue_impact?: number | null
          success_count?: number | null
          success_rate?: number | null
          total_execution_time?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          avg_execution_time?: number | null
          created_at?: string | null
          date?: string
          execution_count?: number | null
          failure_count?: number | null
          id?: string
          revenue_impact?: number | null
          success_count?: number | null
          success_rate?: number | null
          total_execution_time?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_analytics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_analytics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_conditions: {
        Row: {
          automation_id: string | null
          condition_group: number | null
          created_at: string | null
          field_name: string
          id: string
          operator: string
          value: string | null
        }
        Insert: {
          automation_id?: string | null
          condition_group?: number | null
          created_at?: string | null
          field_name: string
          id?: string
          operator: string
          value?: string | null
        }
        Update: {
          automation_id?: string | null
          condition_group?: number | null
          created_at?: string | null
          field_name?: string
          id?: string
          operator?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_conditions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_deduplication: {
        Row: {
          created_at: string | null
          execution_hash: string
          id: string
          job_id: string
          new_status: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          execution_hash: string
          id?: string
          job_id: string
          new_status: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          execution_hash?: string
          id?: string
          job_id?: string
          new_status?: string
          workflow_id?: string
        }
        Relationships: []
      }
      automation_execution_logs: {
        Row: {
          actions_executed: Json | null
          automation_id: string | null
          completed_at: string | null
          created_at: string | null
          details: Json | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          location_used: string | null
          organization_id: string | null
          paused_at: string | null
          resume_at: string | null
          started_at: string | null
          status: string
          trigger_data: Json | null
          trigger_matched_conditions: Json | null
          trigger_type: string
          weather_conditions: Json | null
          workflow_id: string | null
        }
        Insert: {
          actions_executed?: Json | null
          automation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          location_used?: string | null
          organization_id?: string | null
          paused_at?: string | null
          resume_at?: string | null
          started_at?: string | null
          status: string
          trigger_data?: Json | null
          trigger_matched_conditions?: Json | null
          trigger_type: string
          weather_conditions?: Json | null
          workflow_id?: string | null
        }
        Update: {
          actions_executed?: Json | null
          automation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          location_used?: string | null
          organization_id?: string | null
          paused_at?: string | null
          resume_at?: string | null
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_matched_conditions?: Json | null
          trigger_type?: string
          weather_conditions?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_execution_tracker: {
        Row: {
          created_at: string | null
          execution_minute: string
          id: string
          job_id: string
          status_change: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          execution_minute: string
          id?: string
          job_id: string
          status_change: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          execution_minute?: string
          id?: string
          job_id?: string
          status_change?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_tracker_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_tracker_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_history: {
        Row: {
          actions_executed: Json | null
          created_at: string | null
          error_details: Json | null
          execution_status: string | null
          execution_time_ms: number | null
          id: string
          trigger_id: string | null
          variables_used: Json | null
          workflow_id: string
        }
        Insert: {
          actions_executed?: Json | null
          created_at?: string | null
          error_details?: Json | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          trigger_id?: string | null
          variables_used?: Json | null
          workflow_id: string
        }
        Update: {
          actions_executed?: Json | null
          created_at?: string | null
          error_details?: Json | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          trigger_id?: string | null
          variables_used?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_history_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_history_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_performance: {
        Row: {
          actions_executed: number | null
          automation_id: string | null
          created_at: string
          date: string
          engagement_rate: number | null
          id: string
          success_rate: number | null
          triggers_fired: number | null
        }
        Insert: {
          actions_executed?: number | null
          automation_id?: string | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          success_rate?: number | null
          triggers_fired?: number | null
        }
        Update: {
          actions_executed?: number | null
          automation_id?: string | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          success_rate?: number | null
          triggers_fired?: number | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          actions_executed: number | null
          automation_id: string | null
          completed_at: string | null
          context_data: Json | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          trigger_data: Json | null
        }
        Insert: {
          actions_executed?: number | null
          automation_id?: string | null
          completed_at?: string | null
          context_data?: Json | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
        }
        Update: {
          actions_executed?: number | null
          automation_id?: string | null
          completed_at?: string | null
          context_data?: Json | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
        }
        Relationships: []
      }
      automation_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          cron_job_name: string | null
          id: string
          is_active: boolean | null
          last_run: string | null
          metadata: Json | null
          next_run: string | null
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          cron_job_name?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          metadata?: Json | null
          next_run?: string | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          cron_job_name?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          metadata?: Json | null
          next_run?: string | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_template_usage: {
        Row: {
          id: string
          template_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          template_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          template_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automation_templates: {
        Row: {
          action_type: string
          average_revenue: number | null
          badge: string | null
          category: string
          config: Json | null
          created_at: string | null
          description: string | null
          estimated_time: string | null
          estimated_time_saved: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          preview_image_url: string | null
          required_integrations: string[] | null
          success_rate: number | null
          tags: string[] | null
          template_config: Json
          trigger_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          action_type: string
          average_revenue?: number | null
          badge?: string | null
          category: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          estimated_time_saved?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          preview_image_url?: string | null
          required_integrations?: string[] | null
          success_rate?: number | null
          tags?: string[] | null
          template_config?: Json
          trigger_type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          action_type?: string
          average_revenue?: number | null
          badge?: string | null
          category?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_time?: string | null
          estimated_time_saved?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          preview_image_url?: string | null
          required_integrations?: string[] | null
          success_rate?: number | null
          tags?: string[] | null
          template_config?: Json
          trigger_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_trigger_queue: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          old_record_data: Json | null
          processed: boolean | null
          processed_at: string | null
          record_data: Json
          table_name: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          old_record_data?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          record_data: Json
          table_name: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          old_record_data?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          record_data?: Json
          table_name?: string
        }
        Relationships: []
      }
      automation_triggers: {
        Row: {
          automation_id: string | null
          conditions: Json | null
          created_at: string | null
          id: string
          trigger_config: Json | null
          trigger_type: string
        }
        Insert: {
          automation_id?: string | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          trigger_config?: Json | null
          trigger_type: string
        }
        Update: {
          automation_id?: string | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          trigger_config?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_variables: {
        Row: {
          created_at: string
          data_source: string | null
          description: string | null
          field_path: string | null
          id: string
          name: string
          variable_key: string
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          description?: string | null
          field_path?: string | null
          id?: string
          name: string
          variable_key: string
        }
        Update: {
          created_at?: string
          data_source?: string | null
          description?: string | null
          field_path?: string | null
          id?: string
          name?: string
          variable_key?: string
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          action_config: Json | null
          action_type: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          delivery_window: Json | null
          description: string | null
          edges: Json | null
          enabled: boolean | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          last_triggered_at: string | null
          multi_channel_config: Json | null
          name: string
          nodes: Json | null
          organization_id: string
          performance_metrics: Json | null
          settings: Json | null
          status: string | null
          steps: Json | null
          success_count: number | null
          template_config: Json | null
          template_id: string | null
          trigger_conditions: Json | null
          trigger_config: Json | null
          trigger_type: string | null
          triggers: Json | null
          updated_at: string | null
          user_id: string
          visual_config: Json | null
          workflow_config: Json | null
          workflow_type: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_window?: Json | null
          description?: string | null
          edges?: Json | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          last_triggered_at?: string | null
          multi_channel_config?: Json | null
          name: string
          nodes?: Json | null
          organization_id: string
          performance_metrics?: Json | null
          settings?: Json | null
          status?: string | null
          steps?: Json | null
          success_count?: number | null
          template_config?: Json | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          triggers?: Json | null
          updated_at?: string | null
          user_id: string
          visual_config?: Json | null
          workflow_config?: Json | null
          workflow_type?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_window?: Json | null
          description?: string | null
          edges?: Json | null
          enabled?: boolean | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          last_triggered_at?: string | null
          multi_channel_config?: Json | null
          name?: string
          nodes?: Json | null
          organization_id?: string
          performance_metrics?: Json | null
          settings?: Json | null
          status?: string | null
          steps?: Json | null
          success_count?: number | null
          template_config?: Json | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          triggers?: Json | null
          updated_at?: string | null
          user_id?: string
          visual_config?: Json | null
          workflow_config?: Json | null
          workflow_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          is_paused: boolean | null
          last_triggered_at: string | null
          name: string
          organization_id: string | null
          success_count: number | null
          template_id: string | null
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_triggered_at?: string | null
          name: string
          organization_id?: string | null
          success_count?: number | null
          template_id?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_triggered_at?: string | null
          name?: string
          organization_id?: string | null
          success_count?: number | null
          template_id?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "automation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      call_conversations: {
        Row: {
          action_items: string[] | null
          ai_notes: string | null
          call_direction: string | null
          call_duration: number | null
          call_id: string | null
          call_status: string | null
          caller_number: string | null
          client_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          phone_number: string
          sentiment: string | null
          summary: string | null
          topics: string[] | null
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_items?: string[] | null
          ai_notes?: string | null
          call_direction?: string | null
          call_duration?: number | null
          call_id?: string | null
          call_status?: string | null
          caller_number?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          phone_number: string
          sentiment?: string | null
          summary?: string | null
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_items?: string[] | null
          ai_notes?: string | null
          call_direction?: string | null
          call_duration?: number | null
          call_id?: string | null
          call_status?: string | null
          caller_number?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          phone_number?: string
          sentiment?: string | null
          summary?: string | null
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "call_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          client_id: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          ended_at: string | null
          id: string
          notes: string | null
          phone_number: string | null
          recording_url: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_quality_logs: {
        Row: {
          audio_level: number | null
          call_control_id: string
          connection_state: string | null
          created_at: string | null
          id: string
          jitter: number | null
          packets_lost: number | null
          round_trip_time: number | null
          timestamp: string
        }
        Insert: {
          audio_level?: number | null
          call_control_id: string
          connection_state?: string | null
          created_at?: string | null
          id?: string
          jitter?: number | null
          packets_lost?: number | null
          round_trip_time?: number | null
          timestamp: string
        }
        Update: {
          audio_level?: number | null
          call_control_id?: string
          connection_state?: string | null
          created_at?: string | null
          id?: string
          jitter?: number | null
          packets_lost?: number | null
          round_trip_time?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      call_routing_logs: {
        Row: {
          ai_enabled: boolean
          call_control_id: string | null
          caller_phone: string
          company_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          phone_number: string
          routing_decision: string
        }
        Insert: {
          ai_enabled: boolean
          call_control_id?: string | null
          caller_phone: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number: string
          routing_decision: string
        }
        Update: {
          ai_enabled?: boolean
          call_control_id?: string | null
          caller_phone?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string
          routing_decision?: string
        }
        Relationships: []
      }
      client_custom_field_values: {
        Row: {
          client_id: string
          created_at: string | null
          custom_field_id: string
          id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          custom_field_id: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          custom_field_id?: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_custom_field_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          job_id: string | null
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      client_notifications: {
        Row: {
          client_id: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_portal_access: {
        Row: {
          access_token: string
          client_id: string
          created_at: string | null
          document_id: string
          document_type: string
          domain_restriction: string | null
          expires_at: string
          id: string
          ip_restrictions: string[] | null
          max_uses: number | null
          permissions: Json | null
          use_count: number | null
          used_at: string | null
        }
        Insert: {
          access_token: string
          client_id: string
          created_at?: string | null
          document_id: string
          document_type: string
          domain_restriction?: string | null
          expires_at: string
          id?: string
          ip_restrictions?: string[] | null
          max_uses?: number | null
          permissions?: Json | null
          use_count?: number | null
          used_at?: string | null
        }
        Update: {
          access_token?: string
          client_id?: string
          created_at?: string | null
          document_id?: string
          document_type?: string
          domain_restriction?: string | null
          expires_at?: string
          id?: string
          ip_restrictions?: string[] | null
          max_uses?: number | null
          permissions?: Json | null
          use_count?: number | null
          used_at?: string | null
        }
        Relationships: []
      }
      client_properties: {
        Row: {
          address: string | null
          city: string | null
          client_id: string
          country: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          notes: string | null
          property_name: string
          property_type: string | null
          state: string | null
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_id: string
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          property_name: string
          property_type?: string | null
          state?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_id?: string
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          property_name?: string
          property_type?: string | null
          state?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      communication_logs: {
        Row: {
          client_id: string | null
          communication_type: string | null
          content: string | null
          created_at: string | null
          delivered_at: string | null
          direction: string
          document_id: string | null
          document_type: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          from_address: string
          from_number: string | null
          id: string
          idempotency_key: string | null
          job_id: string | null
          metadata: Json | null
          recipient: string | null
          sent_at: string | null
          status: string
          subject: string | null
          to_address: string
          type: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          document_id?: string | null
          document_type?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          from_address: string
          from_number?: string | null
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          metadata?: Json | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          to_address: string
          type: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          document_id?: string | null
          document_type?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          from_address?: string
          from_number?: string | null
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          metadata?: Json | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          to_address?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "communication_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          business_hours: Json | null
          business_niche: string | null
          business_type: string | null
          client_portal_url: string | null
          company_address: string | null
          company_city: string | null
          company_country: string | null
          company_description: string | null
          company_email: string | null
          company_email_address: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_state: string | null
          company_tagline: string | null
          company_timezone: string | null
          company_website: string | null
          company_zip: string | null
          created_at: string
          custom_domain: string | null
          custom_domain_name: string | null
          domain_verification_status: string | null
          email_domain_name: string | null
          email_from_address: string | null
          email_from_name: string | null
          gst_hst_number: string | null
          id: string
          insurance_policy_number: string | null
          mailgun_api_key: string | null
          mailgun_config: Json | null
          mailgun_domain: string | null
          mailgun_settings: Json | null
          organization_id: string | null
          phone_number_limit: number | null
          phone_numbers_used: number | null
          service_radius: number | null
          service_zip_codes: string | null
          tax_id: string | null
          team_size: string | null
          updated_at: string
          upsell_config: Json | null
          user_id: string
        }
        Insert: {
          business_hours?: Json | null
          business_niche?: string | null
          business_type?: string | null
          client_portal_url?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_description?: string | null
          company_email?: string | null
          company_email_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_state?: string | null
          company_tagline?: string | null
          company_timezone?: string | null
          company_website?: string | null
          company_zip?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_name?: string | null
          domain_verification_status?: string | null
          email_domain_name?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          gst_hst_number?: string | null
          id?: string
          insurance_policy_number?: string | null
          mailgun_api_key?: string | null
          mailgun_config?: Json | null
          mailgun_domain?: string | null
          mailgun_settings?: Json | null
          organization_id?: string | null
          phone_number_limit?: number | null
          phone_numbers_used?: number | null
          service_radius?: number | null
          service_zip_codes?: string | null
          tax_id?: string | null
          team_size?: string | null
          updated_at?: string
          upsell_config?: Json | null
          user_id: string
        }
        Update: {
          business_hours?: Json | null
          business_niche?: string | null
          business_type?: string | null
          client_portal_url?: string | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_description?: string | null
          company_email?: string | null
          company_email_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_state?: string | null
          company_tagline?: string | null
          company_timezone?: string | null
          company_website?: string | null
          company_zip?: string | null
          created_at?: string
          custom_domain?: string | null
          custom_domain_name?: string | null
          domain_verification_status?: string | null
          email_domain_name?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          gst_hst_number?: string | null
          id?: string
          insurance_policy_number?: string | null
          mailgun_api_key?: string | null
          mailgun_config?: Json | null
          mailgun_domain?: string | null
          mailgun_settings?: Json | null
          organization_id?: string | null
          phone_number_limit?: number | null
          phone_numbers_used?: number | null
          service_radius?: number | null
          service_zip_codes?: string | null
          tax_id?: string | null
          team_size?: string | null
          updated_at?: string
          upsell_config?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_value: string | null
          description: string | null
          entity_type: string
          field_type: string
          id: string
          name: string
          options: Json | null
          organization_id: string | null
          placeholder: string | null
          required: boolean | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          description?: string | null
          entity_type: string
          field_type: string
          id?: string
          name: string
          options?: Json | null
          organization_id?: string | null
          placeholder?: string | null
          required?: boolean | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          description?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          organization_id?: string | null
          placeholder?: string | null
          required?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          permissions: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          permissions?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          permissions?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_approvals: {
        Row: {
          approval_token: string
          approved_at: string | null
          client_email: string | null
          client_id: string
          client_name: string | null
          client_phone: string | null
          client_response: string | null
          created_at: string
          document_id: string
          document_number: string
          document_type: string
          expires_at: string
          id: string
          ip_address: string | null
          signature_data: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          approval_token: string
          approved_at?: string | null
          client_email?: string | null
          client_id: string
          client_name?: string | null
          client_phone?: string | null
          client_response?: string | null
          created_at?: string
          document_id: string
          document_number: string
          document_type: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          approval_token?: string
          approved_at?: string | null
          client_email?: string | null
          client_id?: string
          client_name?: string | null
          client_phone?: string | null
          client_response?: string | null
          created_at?: string
          document_id?: string
          document_number?: string
          document_type?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      email_conversations: {
        Row: {
          assigned_to: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          email_address: string
          id: string
          is_archived: boolean | null
          is_starred: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          organization_id: string | null
          subject: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          email_address: string
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id?: string | null
          subject?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          email_address?: string
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          organization_id?: string | null
          subject?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          attachments: Json | null
          body: string
          conversation_id: string | null
          created_at: string | null
          direction: string
          email_id: string | null
          from_email: string
          html_body: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          organization_id: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
          to_email: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          conversation_id?: string | null
          created_at?: string | null
          direction: string
          email_id?: string | null
          from_email: string
          html_body?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          conversation_id?: string | null
          created_at?: string | null
          direction?: string
          email_id?: string | null
          from_email?: string
          html_body?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "email_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_communications: {
        Row: {
          content: string
          created_at: string | null
          estimate_id: string
          id: string
          metadata: Json | null
          recipient_email: string | null
          recipient_phone: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          estimate_id: string
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          estimate_id?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_communications_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          approved_at: string | null
          client_id: string | null
          client_signature: string | null
          contact_role: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number | null
          estimate_number: string
          id: string
          items: Json | null
          job_id: string
          notes: string | null
          portal_access_token: string | null
          sent_at: string | null
          signature_ip: string | null
          signature_timestamp: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          title: string | null
          total: number
          updated_at: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          client_signature?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          estimate_number: string
          id?: string
          items?: Json | null
          job_id: string
          notes?: string | null
          portal_access_token?: string | null
          sent_at?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string | null
          total?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          client_signature?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          estimate_number?: string
          id?: string
          items?: Json | null
          job_id?: string
          notes?: string | null
          portal_access_token?: string | null
          sent_at?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string | null
          total?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimates_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimates_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "fk_estimates_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      id_counters: {
        Row: {
          created_at: string | null
          current_value: number
          entity_type: string
          id: string
          prefix: string
          start_value: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          entity_type: string
          id?: string
          prefix: string
          start_value?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          entity_type?: string
          id?: string
          prefix?: string
          start_value?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_communications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          recipient_email: string | null
          recipient_phone: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_communications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          automation_triggered_at: string | null
          balance: number | null
          balance_due: number | null
          client_id: string | null
          contact_role: string | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          discount_amount: number | null
          due_date: string | null
          estimate_id: string | null
          id: string
          invoice_number: string
          issue_date: string
          items: Json | null
          job_id: string
          notes: string | null
          paid_at: string | null
          payment_link: string | null
          payment_status: string | null
          portal_access_token: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          title: string | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          automation_triggered_at?: string | null
          balance?: number | null
          balance_due?: number | null
          client_id?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          discount_amount?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          items?: Json | null
          job_id: string
          notes?: string | null
          paid_at?: string | null
          payment_link?: string | null
          payment_status?: string | null
          portal_access_token?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          automation_triggered_at?: string | null
          balance?: number | null
          balance_due?: number | null
          client_id?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          discount_amount?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json | null
          job_id?: string
          notes?: string | null
          paid_at?: string | null
          payment_link?: string | null
          payment_status?: string | null
          portal_access_token?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "fk_invoices_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          job_id: string
          mime_type: string | null
          organization_id: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          organization_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          organization_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_custom_field_values: {
        Row: {
          created_at: string | null
          custom_field_id: string
          id: string
          job_id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          custom_field_id: string
          id?: string
          job_id: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          custom_field_id?: string
          id?: string
          job_id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      job_history: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          job_id: string
          meta: Json | null
          new_value: Json | null
          old_value: Json | null
          title: string
          type: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
          visibility: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          job_id: string
          meta?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          title: string
          type: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          visibility?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          job_id?: string
          meta?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          title?: string
          type?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "call_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_idx"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_idx"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_history_job_id_idx"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_overview: {
        Row: {
          billing_contact: Json | null
          created_at: string
          emergency_contact: Json | null
          id: string
          job_id: string
          previous_service_date: string | null
          property_age: string | null
          property_size: string | null
          property_type: string | null
          updated_at: string
          warranty_info: Json | null
        }
        Insert: {
          billing_contact?: Json | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          job_id: string
          previous_service_date?: string | null
          property_age?: string | null
          property_size?: string | null
          property_type?: string | null
          updated_at?: string
          warranty_info?: Json | null
        }
        Update: {
          billing_contact?: Json | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          job_id?: string
          previous_service_date?: string | null
          property_age?: string | null
          property_size?: string | null
          property_type?: string | null
          updated_at?: string
          warranty_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "job_overview_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_overview_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_overview_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          sequence: number | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          sequence?: number | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          sequence?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_types: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string | null
          appointment_status: string | null
          automation_triggered_at: string | null
          booked_via: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_automation: string | null
          date: string | null
          deleted_at: string | null
          description: string | null
          id: string
          job_type: string | null
          lead_source: string | null
          notes: string | null
          organization_id: string | null
          property_id: string | null
          revenue: number | null
          schedule_end: string | null
          schedule_start: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          service: string | null
          status: string | null
          tags: string[] | null
          tasks: Json | null
          technician_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          appointment_status?: string | null
          automation_triggered_at?: string | null
          booked_via?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_automation?: string | null
          date?: string | null
          deleted_at?: string | null
          description?: string | null
          id: string
          job_type?: string | null
          lead_source?: string | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          tasks?: Json | null
          technician_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          appointment_status?: string | null
          automation_triggered_at?: string | null
          booked_via?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_automation?: string | null
          date?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_type?: string | null
          lead_source?: string | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          tasks?: Json | null
          technician_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_automation_fkey"
            columns: ["created_by_automation"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_automation_fkey"
            columns: ["created_by_automation"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "client_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      line_items: {
        Row: {
          created_at: string
          description: string
          discount: number | null
          id: string
          organization_id: string | null
          our_price: number | null
          parent_id: string
          parent_type: string
          quantity: number
          taxable: boolean
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number | null
          id?: string
          organization_id?: string | null
          our_price?: number | null
          parent_id: string
          parent_type: string
          quantity?: number
          taxable?: boolean
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number | null
          id?: string
          organization_id?: string | null
          our_price?: number | null
          parent_id?: string
          parent_type?: string
          quantity?: number
          taxable?: boolean
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          subject: string | null
          type: string
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_communication_settings: {
        Row: {
          created_at: string | null
          default_from_email: string | null
          default_from_name: string | null
          email_enabled: boolean | null
          email_visibility_mode: string | null
          id: string
          mailgun_domain: string | null
          organization_email_address: string | null
          organization_id: string
          sms_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_from_email?: string | null
          default_from_name?: string | null
          email_enabled?: boolean | null
          email_visibility_mode?: string | null
          id?: string
          mailgun_domain?: string | null
          organization_email_address?: string | null
          organization_id: string
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_from_email?: string | null
          default_from_name?: string | null
          email_enabled?: boolean | null
          email_visibility_mode?: string | null
          id?: string
          mailgun_domain?: string | null
          organization_email_address?: string | null
          organization_id?: string
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_document_settings: {
        Row: {
          created_at: string | null
          default_tax_rate: number | null
          estimate_terms_text: string | null
          estimate_validity_days: number | null
          footer_confidentiality_text: string | null
          footer_contact_text: string | null
          footer_show_website: boolean | null
          footer_thank_you_message: string | null
          id: string
          invoice_late_fee_text: string | null
          invoice_payment_terms: string | null
          organization_id: string
          show_company_logo: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_tax_rate?: number | null
          estimate_terms_text?: string | null
          estimate_validity_days?: number | null
          footer_confidentiality_text?: string | null
          footer_contact_text?: string | null
          footer_show_website?: boolean | null
          footer_thank_you_message?: string | null
          id?: string
          invoice_late_fee_text?: string | null
          invoice_payment_terms?: string | null
          organization_id: string
          show_company_logo?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_tax_rate?: number | null
          estimate_terms_text?: string | null
          estimate_validity_days?: number | null
          footer_confidentiality_text?: string | null
          footer_contact_text?: string | null
          footer_show_website?: boolean | null
          footer_thank_you_message?: string | null
          id?: string
          invoice_late_fee_text?: string | null
          invoice_payment_terms?: string | null
          organization_id?: string
          show_company_logo?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_document_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          brand_color: string | null
          business_hours: Json | null
          company_address: string | null
          company_city: string | null
          company_country: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          company_state: string | null
          company_zip: string | null
          created_at: string | null
          gst_hst_number: string | null
          id: string
          insurance_policy_number: string | null
          organization_id: string
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          brand_color?: string | null
          business_hours?: Json | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_state?: string | null
          company_zip?: string | null
          created_at?: string | null
          gst_hst_number?: string | null
          id?: string
          insurance_policy_number?: string | null
          organization_id: string
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          brand_color?: string | null
          business_hours?: Json | null
          company_address?: string | null
          company_city?: string | null
          company_country?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_state?: string | null
          company_zip?: string | null
          created_at?: string | null
          gst_hst_number?: string | null
          id?: string
          insurance_policy_number?: string | null
          organization_id?: string
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          balance: number | null
          client_id: string | null
          created_at: string
          date: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          method: string
          notes: string | null
          organization_id: string | null
          payment_date: string
          payment_number: string
          processed_by: string | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          balance?: number | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method: string
          notes?: string | null
          organization_id?: string | null
          payment_date?: string
          payment_number: string
          processed_by?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          balance?: number | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method?: string
          notes?: string | null
          organization_id?: string | null
          payment_date?: string
          payment_number?: string
          processed_by?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_number_billing_history: {
        Row: {
          amount: number
          billed_at: string | null
          billing_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          phone_number_id: string | null
          status: string | null
          stripe_payment_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          billed_at?: string | null
          billing_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          phone_number_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          billed_at?: string | null
          billing_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          phone_number_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_number_billing_history_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "available_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_number_billing_history_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          ai_assistant_id: string | null
          ai_dispatcher_enabled: boolean | null
          ai_settings: Json | null
          ai_voice_settings: Json | null
          area_code: string | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          billing_status: string | null
          call_routing: Json | null
          capabilities: Json | null
          configured_for_ai: boolean | null
          connect_contact_flow_id: string | null
          connect_instance_id: string | null
          connect_phone_number_arn: string | null
          connect_queue_id: string | null
          country_code: string
          created_at: string
          friendly_name: string | null
          id: string
          is_active: boolean | null
          is_admin_purchased: boolean | null
          is_primary: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          mcp_enabled: boolean | null
          mcp_integration_secret: string | null
          mcp_server_id: string | null
          mcp_webhook_url: string | null
          metadata: Json | null
          monthly_price: number | null
          next_billing_date: string | null
          organization_id: string | null
          phone_number: string
          phone_number_type: string | null
          pool_status: string | null
          price: number | null
          price_unit: string | null
          purchase_date: string | null
          purchased_at: string | null
          purchased_by: string | null
          rate_center: string | null
          region: string | null
          retail_monthly_price: number | null
          retail_price: number | null
          sms_settings: Json | null
          status: string | null
          telnyx_connection_id: string | null
          telnyx_id: string | null
          telnyx_phone_number_id: string | null
          telnyx_settings: Json | null
          updated_at: string
          user_id: string | null
          webhook_settings: Json | null
          webhook_url: string | null
        }
        Insert: {
          ai_assistant_id?: string | null
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          ai_voice_settings?: Json | null
          area_code?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          billing_status?: string | null
          call_routing?: Json | null
          capabilities?: Json | null
          configured_for_ai?: boolean | null
          connect_contact_flow_id?: string | null
          connect_instance_id?: string | null
          connect_phone_number_arn?: string | null
          connect_queue_id?: string | null
          country_code?: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin_purchased?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          mcp_enabled?: boolean | null
          mcp_integration_secret?: string | null
          mcp_server_id?: string | null
          mcp_webhook_url?: string | null
          metadata?: Json | null
          monthly_price?: number | null
          next_billing_date?: string | null
          organization_id?: string | null
          phone_number: string
          phone_number_type?: string | null
          pool_status?: string | null
          price?: number | null
          price_unit?: string | null
          purchase_date?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          retail_monthly_price?: number | null
          retail_price?: number | null
          sms_settings?: Json | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_id?: string | null
          telnyx_phone_number_id?: string | null
          telnyx_settings?: Json | null
          updated_at?: string
          user_id?: string | null
          webhook_settings?: Json | null
          webhook_url?: string | null
        }
        Update: {
          ai_assistant_id?: string | null
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          ai_voice_settings?: Json | null
          area_code?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          billing_status?: string | null
          call_routing?: Json | null
          capabilities?: Json | null
          configured_for_ai?: boolean | null
          connect_contact_flow_id?: string | null
          connect_instance_id?: string | null
          connect_phone_number_arn?: string | null
          connect_queue_id?: string | null
          country_code?: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin_purchased?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          mcp_enabled?: boolean | null
          mcp_integration_secret?: string | null
          mcp_server_id?: string | null
          mcp_webhook_url?: string | null
          metadata?: Json | null
          monthly_price?: number | null
          next_billing_date?: string | null
          organization_id?: string | null
          phone_number?: string
          phone_number_type?: string | null
          pool_status?: string | null
          price?: number | null
          price_unit?: string | null
          purchase_date?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          retail_monthly_price?: number | null
          retail_price?: number | null
          sms_settings?: Json | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_id?: string | null
          telnyx_phone_number_id?: string | null
          telnyx_settings?: Json | null
          updated_at?: string
          user_id?: string | null
          webhook_settings?: Json | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      portal_activity_logs: {
        Row: {
          action: string
          client_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "portal_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_documents: {
        Row: {
          client_id: string
          created_at: string | null
          document_type: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_downloadable: boolean | null
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          document_type: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_downloadable?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_downloadable?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_preferences: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          language: string | null
          notification_preferences: Json | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_sessions: {
        Row: {
          access_token: string
          client_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_accessed_at: string | null
          permissions: Json | null
          user_agent: string | null
        }
        Insert: {
          access_token: string
          client_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          permissions?: Json | null
          user_agent?: string | null
        }
        Update: {
          access_token?: string
          client_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          permissions?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          ourprice: number | null
          price: number
          sku: string | null
          tags: string[] | null
          taxable: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          ourprice?: number | null
          price?: number
          sku?: string | null
          tags?: string[] | null
          taxable?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          ourprice?: number | null
          price?: number
          sku?: string | null
          tags?: string[] | null
          taxable?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          available_for_jobs: boolean | null
          avatar_url: string | null
          brand_color: string | null
          business_hours: Json | null
          business_niche: string | null
          call_masking_enabled: boolean | null
          company_address: string | null
          company_email: string | null
          company_email_address: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          custom_role_id: string | null
          email: string | null
          has_completed_onboarding: boolean | null
          id: string
          internal_notes: string | null
          is_public: boolean | null
          labor_cost_per_hour: number | null
          name: string | null
          organization_id: string | null
          phone: string | null
          referral_source: string | null
          role: string | null
          schedule_color: string | null
          status: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
          uses_two_factor: boolean | null
          website: string | null
        }
        Insert: {
          available_for_jobs?: boolean | null
          avatar_url?: string | null
          brand_color?: string | null
          business_hours?: Json | null
          business_niche?: string | null
          call_masking_enabled?: boolean | null
          company_address?: string | null
          company_email?: string | null
          company_email_address?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          custom_role_id?: string | null
          email?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          internal_notes?: string | null
          is_public?: boolean | null
          labor_cost_per_hour?: number | null
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          referral_source?: string | null
          role?: string | null
          schedule_color?: string | null
          status?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          uses_two_factor?: boolean | null
          website?: string | null
        }
        Update: {
          available_for_jobs?: boolean | null
          avatar_url?: string | null
          brand_color?: string | null
          business_hours?: Json | null
          business_niche?: string | null
          call_masking_enabled?: boolean | null
          company_address?: string | null
          company_email?: string | null
          company_email_address?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          custom_role_id?: string | null
          email?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          internal_notes?: string | null
          is_public?: boolean | null
          labor_cost_per_hour?: number | null
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          referral_source?: string | null
          role?: string | null
          schedule_color?: string | null
          status?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          uses_two_factor?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_contacts: {
        Row: {
          can_approve_work: boolean | null
          client_id: string
          created_at: string | null
          id: string
          is_billing_contact: boolean | null
          is_primary_contact: boolean | null
          notes: string | null
          property_id: string
          receives_estimates: boolean | null
          receives_invoices: boolean | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          can_approve_work?: boolean | null
          client_id: string
          created_at?: string | null
          id?: string
          is_billing_contact?: boolean | null
          is_primary_contact?: boolean | null
          notes?: string | null
          property_id: string
          receives_estimates?: boolean | null
          receives_invoices?: boolean | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          can_approve_work?: boolean | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_billing_contact?: boolean | null
          is_primary_contact?: boolean | null
          notes?: string | null
          property_id?: string
          receives_estimates?: boolean | null
          receives_invoices?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "client_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: string[] | null
          report_id: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[] | null
          report_id?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[] | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          id: string
          is_public: boolean | null
          name: string
          template_id: string | null
          updated_at: string | null
          widgets: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          template_id?: string | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_id?: string | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Relationships: []
      }
      scheduled_workflow_executions: {
        Row: {
          context: Json | null
          created_at: string | null
          error: string | null
          execution_id: string
          id: string
          resume_at: string
          resume_from_step: number
          status: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error?: string | null
          execution_id: string
          id?: string
          resume_at: string
          resume_from_step: number
          status?: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error?: string | null
          execution_id?: string
          id?: string
          resume_at?: string
          resume_from_step?: number
          status?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_client_sessions: {
        Row: {
          client_portal_user_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_revoked: boolean | null
          last_accessed_at: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          client_portal_user_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          client_portal_user_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_conversations: {
        Row: {
          client_id: string | null
          client_phone: string
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          phone_number: string
          status: string
          stopped_at: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_phone: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          phone_number: string
          status?: string
          stopped_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          client_phone?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          phone_number?: string
          status?: string
          stopped_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_messages: {
        Row: {
          communication_log_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          direction: string
          external_id: string | null
          from_number: string
          id: string
          message: string | null
          metadata: Json | null
          raw_data: Json | null
          status: string
          to_number: string
          updated_at: string | null
        }
        Insert: {
          communication_log_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          direction: string
          external_id?: string | null
          from_number: string
          id?: string
          message?: string | null
          metadata?: Json | null
          raw_data?: Json | null
          status?: string
          to_number: string
          updated_at?: string | null
        }
        Update: {
          communication_log_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          external_id?: string | null
          from_number?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          raw_data?: Json | null
          status?: string
          to_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_communication_log_id_fkey"
            columns: ["communication_log_id"]
            isOneToOne: false
            referencedRelation: "communication_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "sms_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_opt_outs: {
        Row: {
          conversation_id: string | null
          id: string
          keyword: string | null
          opted_out_at: string | null
          phone_number: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          keyword?: string | null
          opted_out_at?: string | null
          phone_number: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          keyword?: string | null
          opted_out_at?: string | null
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_opt_outs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_opt_outs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "sms_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_webhook_logs: {
        Row: {
          created_at: string | null
          error: string | null
          event_type: string | null
          id: string
          payload: Json | null
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          created_by_automation: string | null
          description: string
          due_date: string | null
          id: string
          job_id: string | null
          notes: string | null
          organization_id: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_automation?: string | null
          description: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_automation?: string | null
          description?: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_automation_fkey"
            columns: ["created_by_automation"]
            isOneToOne: false
            referencedRelation: "automation_workflow_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_automation_fkey"
            columns: ["created_by_automation"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          name: string
          organization_id: string | null
          phone: string | null
          role: string
          service_area: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          name: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          service_area?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          service_area?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_commissions: {
        Row: {
          base_rate: number | null
          created_at: string | null
          fees: Json | null
          id: string
          rules: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_rate?: number | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          rules?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_rate?: number | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          rules?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_member_skills: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      telnyx_calls: {
        Row: {
          appointment_scheduled: boolean | null
          call_control_id: string | null
          call_status: string | null
          caller_phone: string | null
          conference_id: string | null
          conference_role: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          phone_number: string | null
          recording_url: string | null
          started_at: string | null
          status: string | null
          to_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_scheduled?: boolean | null
          call_control_id?: string | null
          call_status?: string | null
          caller_phone?: string | null
          conference_id?: string | null
          conference_role?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          to_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_scheduled?: boolean | null
          call_control_id?: string | null
          call_status?: string | null
          caller_phone?: string | null
          conference_id?: string | null
          conference_role?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          to_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          context: Json | null
          created_at: string
          element: string | null
          id: string
          page: string
          user_id: string
        }
        Insert: {
          action_type: string
          context?: Json | null
          created_at?: string
          element?: string | null
          id?: string
          page: string
          user_id: string
        }
        Update: {
          action_type?: string
          context?: Json | null
          created_at?: string
          element?: string | null
          id?: string
          page?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ai_preferences: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          permission: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          compact_view: boolean | null
          created_at: string
          currency: string | null
          dark_mode: boolean | null
          date_format: string | null
          default_landing_page: string | null
          default_tax_rate: number | null
          email_notifications: boolean | null
          id: string
          invoice_alerts: boolean | null
          job_reminders: boolean | null
          language: string | null
          marketing_updates: boolean | null
          notification_email: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          sound_effects: boolean | null
          tax_label: string | null
          tax_region: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compact_view?: boolean | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          date_format?: string | null
          default_landing_page?: string | null
          default_tax_rate?: number | null
          email_notifications?: boolean | null
          id?: string
          invoice_alerts?: boolean | null
          job_reminders?: boolean | null
          language?: string | null
          marketing_updates?: boolean | null
          notification_email?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          sound_effects?: boolean | null
          tax_label?: string | null
          tax_region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compact_view?: boolean | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          date_format?: string | null
          default_landing_page?: string | null
          default_tax_rate?: number | null
          email_notifications?: boolean | null
          id?: string
          invoice_alerts?: boolean | null
          job_reminders?: boolean | null
          language?: string | null
          marketing_updates?: boolean | null
          notification_email?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          sound_effects?: boolean | null
          tax_label?: string | null
          tax_region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      warranty_analytics: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          job_id: string | null
          job_type: string | null
          job_value: number | null
          purchased_at: string
          service_category: string | null
          user_id: string
          warranty_id: string
          warranty_name: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: string | null
          job_value?: number | null
          purchased_at?: string
          service_category?: string | null
          user_id: string
          warranty_id: string
          warranty_name: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: string | null
          job_value?: number | null
          purchased_at?: string
          service_category?: string | null
          user_id?: string
          warranty_id?: string
          warranty_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_analytics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "warranty_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_cache: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          weather_data: Json
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          weather_data: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          weather_data?: Json
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          attempts: number | null
          created_at: string
          data: Json
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          last_attempt_at: string | null
          status: string | null
          webhook_url: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          data: Json
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          last_attempt_at?: string | null
          status?: string | null
          webhook_url?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          data?: Json
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          status?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          id: string
          request_body: Json | null
          response_body: Json | null
          webhook_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          request_body?: Json | null
          response_body?: Json | null
          webhook_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          request_body?: Json | null
          response_body?: Json | null
          webhook_name?: string | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          current_step_id: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          organization_id: string
          started_at: string | null
          status: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_step_id?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id: string
          started_at?: string | null
          status?: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_step_id?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          organization_id?: string
          started_at?: string | null
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "advanced_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_schedules: {
        Row: {
          cron_expression: string | null
          enabled: boolean | null
          id: string
          last_run_at: string | null
          next_run_at: string | null
          organization_id: string
          timezone: string | null
          workflow_id: string | null
        }
        Insert: {
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          organization_id: string
          timezone?: string | null
          workflow_id?: string | null
        }
        Update: {
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          organization_id?: string
          timezone?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "advanced_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_id: string | null
          id: string
          input_data: Json | null
          organization_id: string
          output_data: Json | null
          started_at: string | null
          status: string
          step_id: string
          step_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          input_data?: Json | null
          organization_id: string
          output_data?: Json | null
          started_at?: string | null
          status?: string
          step_id: string
          step_type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          input_data?: Json | null
          organization_id?: string
          output_data?: Json | null
          started_at?: string | null
          status?: string
          step_id?: string
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_executions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_triggers: {
        Row: {
          conditions: Json
          enabled: boolean | null
          id: string
          organization_id: string
          trigger_type: string
          workflow_id: string | null
        }
        Insert: {
          conditions?: Json
          enabled?: boolean | null
          id?: string
          organization_id: string
          trigger_type: string
          workflow_id?: string | null
        }
        Update: {
          conditions?: Json
          enabled?: boolean | null
          id?: string
          organization_id?: string
          trigger_type?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_triggers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "advanced_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      automation_cron_status: {
        Row: {
          failed_runs: number | null
          is_active: boolean | null
          job_name: string | null
          last_run: string | null
          last_run_ended: string | null
          schedule: string | null
          success_rate: number | null
          successful_runs: number | null
          total_runs: number | null
        }
        Relationships: []
      }
      automation_health: {
        Row: {
          completed_last_hour: number | null
          currently_pending: number | null
          currently_processing: number | null
          failed_last_hour: number | null
          last_failed_at: string | null
          last_successful_at: string | null
        }
        Relationships: []
      }
      automation_system_health: {
        Row: {
          active_workflows: number | null
          completed_last_hour: number | null
          failed_last_hour: number | null
          last_failure: string | null
          last_success: string | null
          pending_count: number | null
          running_count: number | null
        }
        Relationships: []
      }
      automation_workflow_status: {
        Row: {
          created_at: string | null
          execution_count: number | null
          execution_status: string | null
          id: string | null
          is_active: boolean | null
          last_triggered_at: string | null
          name: string | null
          pending_executions: number | null
          status: string | null
          step_count: number | null
          trigger_type: string | null
        }
        Insert: {
          created_at?: string | null
          execution_count?: number | null
          execution_status?: never
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string | null
          pending_executions?: never
          status?: string | null
          step_count?: never
          trigger_type?: string | null
        }
        Update: {
          created_at?: string | null
          execution_count?: number | null
          execution_status?: never
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string | null
          pending_executions?: never
          status?: string | null
          step_count?: never
          trigger_type?: string | null
        }
        Relationships: []
      }
      available_phone_numbers: {
        Row: {
          capabilities: Json | null
          country_code: string | null
          friendly_name: string | null
          id: string | null
          locality: string | null
          monthly_price: number | null
          phone_number: string | null
          phone_number_type: string | null
          purchase_price: number | null
          region: string | null
          status: string | null
        }
        Insert: {
          capabilities?: Json | null
          country_code?: string | null
          friendly_name?: string | null
          id?: string | null
          locality?: string | null
          monthly_price?: number | null
          phone_number?: string | null
          phone_number_type?: string | null
          purchase_price?: number | null
          region?: string | null
          status?: string | null
        }
        Update: {
          capabilities?: Json | null
          country_code?: string | null
          friendly_name?: string | null
          id?: string | null
          locality?: string | null
          monthly_price?: number | null
          phone_number?: string | null
          phone_number_type?: string | null
          purchase_price?: number | null
          region?: string | null
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          phone_number: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          phone_number?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          phone_number?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_jobs: {
        Row: {
          client_id: string | null
          client_name: string | null
          date: string | null
          date_day: string | null
          date_month: string | null
          date_week: string | null
          day: number | null
          id: string | null
          month: number | null
          revenue: number | null
          status: string | null
          technician_id: string | null
          technician_name: string | null
          title: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      job_revenue_summary: {
        Row: {
          calculated_revenue: number | null
          job_id: string | null
          job_status: string | null
          job_title: string | null
          paid_invoices: number | null
          pending_revenue: number | null
          recorded_revenue: number | null
          total_invoiced: number | null
          total_invoices: number | null
          unpaid_invoices: number | null
        }
        Relationships: []
      }
      warranty_analytics_summary: {
        Row: {
          avg_job_value: number | null
          job_type: string | null
          month: string | null
          popularity_percentage: number | null
          purchase_count: number | null
          warranty_id: string | null
          warranty_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_phone_to_organization: {
        Args: {
          p_assigned_by: string
          p_organization_id: string
          p_phone_number: string
        }
        Returns: boolean
      }
      assign_phone_to_user: {
        Args: {
          p_is_primary?: boolean
          p_phone_number: string
          p_user_email: string
        }
        Returns: boolean
      }
      bytea_to_text: { Args: { data: string }; Returns: string }
      can_access_organization_email: {
        Args: { p_conversation_id?: string; p_organization_id: string }
        Returns: boolean
      }
      check_automation_triggers: { Args: never; Returns: undefined }
      check_communication_health: {
        Args: never
        Returns: {
          health_status: string
          last_success: string
          service: string
          success_rate: number
          total_24h: number
        }[]
      }
      check_condition_triggers: { Args: never; Returns: undefined }
      check_invoice_overdue_triggers: { Args: never; Returns: undefined }
      check_maintenance_triggers: { Args: never; Returns: undefined }
      check_overdue_tasks: { Args: never; Returns: undefined }
      check_products_access: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_recent_automation_execution: {
        Args: {
          p_job_id: string
          p_trigger_type: string
          p_workflow_id: string
        }
        Returns: boolean
      }
      check_schedule_condition: {
        Args: { workflow: Record<string, unknown> }
        Returns: boolean
      }
      check_time_based_automations: { Args: never; Returns: undefined }
      check_trigger_conditions: {
        Args: { conditions: Json; new_record: Json; old_record: Json }
        Returns: boolean
      }
      check_user_data: {
        Args: { user_email: string }
        Returns: {
          record_count: number
          table_name: string
        }[]
      }
      check_user_products_by_email: { Args: { p_email: string }; Returns: Json }
      check_user_products_status: { Args: never; Returns: Json }
      clean_duplicate_automation_logs: { Args: never; Returns: number }
      cleanup_all_user_data: {
        Args: { p_dry_run?: boolean; p_keep_system_users?: boolean }
        Returns: Json
      }
      cleanup_old_automation_logs: { Args: never; Returns: undefined }
      cleanup_old_communication_logs: { Args: never; Returns: undefined }
      cleanup_stuck_automations: { Args: never; Returns: undefined }
      clear_my_products: { Args: never; Returns: Json }
      create_automation_log_for_processing: {
        Args: {
          p_trigger_data: Json
          p_trigger_type: string
          p_workflow_id: string
        }
        Returns: string
      }
      create_product_manual: {
        Args: {
          p_category: string
          p_description?: string
          p_name: string
          p_ourprice?: number
          p_price?: number
        }
        Returns: {
          category: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          ourprice: number | null
          price: number
          sku: string | null
          tags: string[] | null
          taxable: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      debug_job_access: {
        Args: { p_client_id?: string }
        Returns: {
          check_name: string
          details: Json
          result: string
        }[]
      }
      debug_niche_switch: { Args: { p_new_niche: string }; Returns: Json }
      delete_all_users: { Args: never; Returns: Json }
      delete_job_as_admin: { Args: { job_id: string }; Returns: Json }
      delete_job_with_related_data: { Args: { job_id: string }; Returns: Json }
      delete_user_with_data: {
        Args: { user_email: string }
        Returns: undefined
      }
      diagnose_product_creation: {
        Args: never
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      each: { Args: { hs: unknown }; Returns: Record<string, unknown>[] }
      exec_query: { Args: { sql: string }; Returns: Json }
      execute_automation: {
        Args: { p_automation_id: string; p_trigger_data?: Json }
        Returns: string
      }
      execute_automation_for_record:
        | {
            Args: {
              context_data_param: Json
              org_id_param: string
              trigger_type_param: string
            }
            Returns: undefined
          }
        | {
            Args: {
              context_data: Json
              org_id: string
              trigger_type_val: string
            }
            Returns: undefined
          }
      execute_automation_log: { Args: { p_log_id: string }; Returns: Json }
      find_organization_by_email_address: {
        Args: { p_email_address: string }
        Returns: {
          organization_id: string
          organization_name: string
        }[]
      }
      generate_approval_token: {
        Args: {
          p_client_email?: string
          p_client_id: string
          p_client_name?: string
          p_client_phone?: string
          p_document_id: string
          p_document_number: string
          p_document_type: string
        }
        Returns: string
      }
      generate_execution_hash: {
        Args: {
          p_job_id: string
          p_new_status: string
          p_time_window?: number
          p_workflow_id: string
        }
        Returns: string
      }
      generate_next_id: { Args: { p_entity_type: string }; Returns: string }
      generate_organization_email_address: {
        Args: { p_company_name: string; p_organization_id: string }
        Returns: string
      }
      generate_portal_access: {
        Args: {
          p_client_id: string
          p_domain?: string
          p_hours_valid?: number
          p_permissions?: Json
        }
        Returns: string
      }
      get_automation_analytics: {
        Args: { org_id: string }
        Returns: {
          activerules: number
          messagessent: number
          recentexecutions: number
          responsesreceived: number
          revenuegenerated: number
          successrate: number
          totalexecutions: number
          totalrules: number
        }[]
      }
      get_batch_client_stats:
        | {
            Args: { p_client_ids: string[] }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_batch_client_stats(p_client_ids => _text), public.get_batch_client_stats(p_client_ids => _uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
        | {
            Args: { p_client_ids: string[] }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_batch_client_stats(p_client_ids => _text), public.get_batch_client_stats(p_client_ids => _uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
      get_client_complete_data: { Args: { p_client_id: string }; Returns: Json }
      get_client_jobs: {
        Args: { p_client_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          address: string
          created_at: string
          date: string
          id: string
          job_type: string
          revenue: number
          schedule_start: string
          service: string
          status: string
          title: string
        }[]
      }
      get_client_statistics: {
        Args: { p_user_id: string }
        Returns: {
          active_clients: number
          average_client_value: number
          new_this_month: number
          retention_rate: number
          total_clients: number
          total_revenue: number
        }[]
      }
      get_connect_statistics: {
        Args: { user_id_param: string }
        Returns: {
          active_conversations: number
          new_today: number
          response_rate: number
          total_conversations: number
        }[]
      }
      get_current_user_info: { Args: never; Returns: Json }
      get_data_summary: { Args: never; Returns: Json }
      get_default_job_statuses: {
        Args: never
        Returns: {
          color: string
          is_default: boolean
          name: string
          sequence: number
        }[]
      }
      get_enhanced_portal_data: { Args: { p_client_id: string }; Returns: Json }
      get_job_portal_data: { Args: { p_job_number: string }; Returns: Json }
      get_jobs_with_outdated_config: {
        Args: { p_user_id: string }
        Returns: {
          available_lead_sources: string[]
          available_tags: string[]
          current_job_type: string
          current_lead_source: string
          current_tags: string[]
          job_id: string
          job_title: string
          suggested_job_type: string
        }[]
      }
      get_message_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_today: number
          ai_calls_handled: number
          ai_calls_today: number
          ai_success_rate: number
          avg_ai_duration: number
          avg_call_duration: number
          call_count: number
          email_count: number
          incoming_calls: number
          messages_this_month: number
          messages_this_week: number
          messages_today: number
          outgoing_calls: number
          received_messages: number
          sent_messages: number
          total_calls: number
          total_communications: number
          total_messages: number
        }[]
      }
      get_message_template: {
        Args: { p_name: string; p_type: string; p_user_id: string }
        Returns: {
          content: string
          id: string
          variables: Json
        }[]
      }
      get_next_document_number: {
        Args: { p_entity_type: string; p_user_id?: string }
        Returns: string
      }
      get_next_job_status_sequence: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_org_primary_phone: {
        Args: { p_organization_id: string }
        Returns: string
      }
      get_pending_automations: {
        Args: never
        Returns: {
          log_id: string
          trigger_data: Json
          workflow_id: string
        }[]
      }
      get_popular_warranties_by_job_type: {
        Args: { p_job_type: string; p_limit?: number }
        Returns: {
          popularity_percentage: number
          purchase_count: number
          warranty_id: string
          warranty_name: string
        }[]
      }
      get_product_with_computed_fields: {
        Args: { product_row: Database["public"]["Tables"]["products"]["Row"] }
        Returns: Json
      }
      get_secret_keys: { Args: never; Returns: string[] }
      get_service_areas: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
          zip_code: string
        }[]
      }
      get_service_role_key: { Args: never; Returns: string }
      get_task_context: { Args: { task_id: string }; Returns: Json }
      get_team_member_commission: {
        Args: { p_team_member_id: string }
        Returns: {
          base_rate: number
          created_at: string
          fees: Json
          id: string
          rules: Json
          updated_at: string
          user_id: string
        }[]
      }
      get_team_member_skills: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_phone_number: { Args: { p_user_id: string }; Returns: string }
      get_user_primary_phone: { Args: { p_user_id: string }; Returns: string }
      get_user_role: { Args: { user_uuid: string }; Returns: string }
      handle_job_portal_request: {
        Args: { p_job_number: string }
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_automation_metrics: {
        Args: { success: boolean; workflow_id: string }
        Returns: undefined
      }
      increment_workflow_metrics: {
        Args: {
          execution_count?: number
          success_count?: number
          workflow_id: string
        }
        Returns: undefined
      }
      initialize_niche_data: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: undefined
      }
      initialize_remaining_niches: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: undefined
      }
      initialize_user_data:
        | { Args: { p_user_id: string }; Returns: undefined }
        | {
            Args: { p_business_niche?: string; p_user_id: string }
            Returns: undefined
          }
      initialize_user_data_complete: {
        Args: { p_business_niche?: string; p_user_id: string }
        Returns: undefined
      }
      initialize_user_data_complete_enhanced: {
        Args: { p_business_niche?: string; p_user_id: string }
        Returns: undefined
      }
      initialize_user_data_with_enhanced_niche_data: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: Json
      }
      initialize_user_defaults: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_valid_job_status: { Args: { p_status: string }; Returns: boolean }
      load_my_niche_products: { Args: never; Returns: Json }
      load_niche_products_direct: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: Json
      }
      log_communication: {
        Args: {
          p_content: string
          p_from: string
          p_metadata?: Json
          p_to: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      manually_process_automation: { Args: { p_log_id: string }; Returns: Json }
      migrate_job_tasks: { Args: never; Returns: undefined }
      normalize_phone_number: { Args: { phone_input: string }; Returns: string }
      populate_niche_products: { Args: { p_niche: string }; Returns: number }
      populate_painting_products_for_user: { Args: never; Returns: Json }
      populate_products_for_user_by_email: {
        Args: { p_email: string; p_niche?: string }
        Returns: Json
      }
      process_all_pending_automations: { Args: never; Returns: Json }
      process_automation_system: { Args: never; Returns: undefined }
      process_email_template: {
        Args: { p_template_name: string; p_user_id?: string; p_variables: Json }
        Returns: {
          html_content: string
          subject: string
        }[]
      }
      process_pending_automation_log: {
        Args: { log_id: string }
        Returns: Json
      }
      process_pending_automation_logs: { Args: never; Returns: undefined }
      process_pending_automations: { Args: never; Returns: undefined }
      process_scheduled_workflow_executions: { Args: never; Returns: undefined }
      recalculate_job_revenue: { Args: { p_job_id: string }; Returns: number }
      refresh_user_products: { Args: never; Returns: Json }
      release_phone_to_pool: {
        Args: { p_organization_id: string; p_phone_number: string }
        Returns: boolean
      }
      reload_products_for_current_niche: { Args: never; Returns: Json }
      repair_user_products: {
        Args: never
        Returns: {
          business_niche: string
          email: string
          errors: Json
          products_loaded: number
          status: string
          user_id: string
        }[]
      }
      safe_insert_products: {
        Args: { p_products: Json; p_user_id: string }
        Returns: Json
      }
      send_invoice_sms: {
        Args: { invoice_id: string; message: string; recipient_phone: string }
        Returns: Json
      }
      switch_business_niche_comprehensive: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: Json
      }
      test_create_products: {
        Args: { p_business_niche: string; p_user_id: string }
        Returns: Json
      }
      test_job_status_automation:
        | {
            Args: { p_job_id: string; p_new_status: string; p_user_id?: string }
            Returns: {
              conditions_met: boolean
              execution_id: string
              has_conditions: boolean
              steps_count: number
              workflow_id: string
              workflow_name: string
            }[]
          }
        | {
            Args: {
              p_job_id: string
              p_new_status?: string
              p_old_status?: string
            }
            Returns: Json
          }
      test_products_functionality: { Args: never; Returns: Json }
      test_products_visibility: { Args: never; Returns: Json }
      text_to_bytea: { Args: { data: string }; Returns: string }
      trigger_automation_manually:
        | { Args: { automation_id: string; test_data?: Json }; Returns: Json }
        | { Args: { p_workflow_id: string }; Returns: Json }
      update_automation_analytics: { Args: never; Returns: undefined }
      update_document_counter_higher_only: {
        Args: {
          p_document_type: string
          p_new_number: number
          p_user_id: string
        }
        Returns: Json
      }
      update_team_member_commission: {
        Args: { base_rate: number; fees: Json; rules: Json; user_id: string }
        Returns: undefined
      }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      validate_job_status_transition: {
        Args: { p_new_status: string; p_old_status: string }
        Returns: boolean
      }
      validate_portal_access: {
        Args: {
          p_access_token: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      validate_workflow_for_execution: {
        Args: { workflow_id: string }
        Returns: {
          error_message: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
