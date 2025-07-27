export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          business_greeting: string | null
          business_name: string
          business_type: string
          created_at: string
          diagnostic_fee: number | null
          emergency_detection_enabled: boolean | null
          emergency_surcharge: number | null
          hourly_rate: number | null
          id: string
          phone_number_id: string
          updated_at: string
          user_id: string | null
          voice_selection: string | null
        }
        Insert: {
          business_greeting?: string | null
          business_name?: string
          business_type?: string
          created_at?: string
          diagnostic_fee?: number | null
          emergency_detection_enabled?: boolean | null
          emergency_surcharge?: number | null
          hourly_rate?: number | null
          id?: string
          phone_number_id: string
          updated_at?: string
          user_id?: string | null
          voice_selection?: string | null
        }
        Update: {
          business_greeting?: string | null
          business_name?: string
          business_type?: string
          created_at?: string
          diagnostic_fee?: number | null
          emergency_detection_enabled?: boolean | null
          emergency_surcharge?: number | null
          hourly_rate?: number | null
          id?: string
          phone_number_id?: string
          updated_at?: string
          user_id?: string | null
          voice_selection?: string | null
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
      automation_execution_logs: {
        Row: {
          actions_executed: Json | null
          automation_id: string | null
          completed_at: string | null
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          location_used: string | null
          organization_id: string | null
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
          id?: string
          location_used?: string | null
          organization_id?: string | null
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
          id?: string
          location_used?: string | null
          organization_id?: string | null
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
            foreignKeyName: "automation_execution_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "automation_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          id: string
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
          id?: string
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
          id?: string
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
          id: string
          mailgun_api_key: string | null
          mailgun_config: Json | null
          mailgun_domain: string | null
          mailgun_settings: Json | null
          phone_number_limit: number | null
          phone_numbers_used: number | null
          service_radius: number | null
          service_zip_codes: string | null
          tax_id: string | null
          team_size: string | null
          updated_at: string
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
          id?: string
          mailgun_api_key?: string | null
          mailgun_config?: Json | null
          mailgun_domain?: string | null
          mailgun_settings?: Json | null
          phone_number_limit?: number | null
          phone_numbers_used?: number | null
          service_radius?: number | null
          service_zip_codes?: string | null
          tax_id?: string | null
          team_size?: string | null
          updated_at?: string
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
          id?: string
          mailgun_api_key?: string | null
          mailgun_config?: Json | null
          mailgun_domain?: string | null
          mailgun_settings?: Json | null
          phone_number_limit?: number | null
          phone_numbers_used?: number | null
          service_radius?: number | null
          service_zip_codes?: string | null
          tax_id?: string | null
          team_size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_value: string | null
          entity_type: string
          field_type: string
          id: string
          name: string
          options: Json | null
          placeholder: string | null
          required: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          entity_type: string
          field_type: string
          id?: string
          name: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
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
          client_id: string | null
          client_name: string | null
          created_at: string | null
          email_address: string
          id: string
          is_archived: boolean | null
          is_starred: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          subject: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          email_address: string
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          subject?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          email_address?: string
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          address: string | null
          automation_triggered_at: string | null
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
          property_id: string | null
          revenue: number | null
          schedule_end: string | null
          schedule_start: string | null
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
          automation_triggered_at?: string | null
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
          property_id?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
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
          automation_triggered_at?: string | null
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
          property_id?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
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
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
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
          our_price?: number | null
          parent_id?: string
          parent_type?: string
          quantity?: number
          taxable?: boolean
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
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
          id: string
          mailgun_domain: string | null
          organization_id: string
          sms_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_from_email?: string | null
          default_from_name?: string | null
          email_enabled?: boolean | null
          id?: string
          mailgun_domain?: string | null
          organization_id: string
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_from_email?: string | null
          default_from_name?: string | null
          email_enabled?: boolean | null
          id?: string
          mailgun_domain?: string | null
          organization_id?: string
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          brand_color: string | null
          business_hours: Json | null
          company_address: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          id: string
          organization_id: string
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          brand_color?: string | null
          business_hours?: Json | null
          company_address?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          id?: string
          organization_id: string
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          brand_color?: string | null
          business_hours?: Json | null
          company_address?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          id?: string
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
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
          payment_date?: string
          payment_number?: string
          processed_by?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          ai_dispatcher_enabled: boolean | null
          ai_settings: Json | null
          area_code: string | null
          assigned_to: string | null
          billing_status: string | null
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
          is_primary: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          monthly_price: number | null
          next_billing_date: string | null
          phone_number: string
          phone_number_type: string | null
          price: number | null
          price_unit: string | null
          purchase_date: string | null
          purchased_at: string | null
          purchased_by: string | null
          rate_center: string | null
          region: string | null
          retail_monthly_price: number | null
          retail_price: number | null
          status: string | null
          telnyx_connection_id: string | null
          telnyx_phone_number_id: string | null
          updated_at: string
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          area_code?: string | null
          assigned_to?: string | null
          billing_status?: string | null
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
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          next_billing_date?: string | null
          phone_number: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchase_date?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          retail_monthly_price?: number | null
          retail_price?: number | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          area_code?: string | null
          assigned_to?: string | null
          billing_status?: string | null
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
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          next_billing_date?: string | null
          phone_number?: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchase_date?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          retail_monthly_price?: number | null
          retail_price?: number | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
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
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
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
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
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
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
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
      secure_client_sessions: {
        Row: {
          client_portal_user_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          ip_address: unknown | null
          resource: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
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
          user_id: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
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
          phone?: string | null
          role?: string
          service_area?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      assign_phone_to_user: {
        Args: {
          p_user_email: string
          p_phone_number: string
          p_is_primary?: boolean
        }
        Returns: boolean
      }
      check_communication_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          service: string
          health_status: string
          last_success: string
          total_24h: number
          success_rate: number
        }[]
      }
      check_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_products_access: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_time_based_automations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_data: {
        Args: { user_email: string }
        Returns: {
          table_name: string
          record_count: number
        }[]
      }
      check_user_products_by_email: {
        Args: { p_email: string }
        Returns: Json
      }
      check_user_products_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_all_user_data: {
        Args: { p_keep_system_users?: boolean; p_dry_run?: boolean }
        Returns: Json
      }
      cleanup_old_communication_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_my_products: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_product_manual: {
        Args: {
          p_name: string
          p_category: string
          p_price?: number
          p_ourprice?: number
          p_description?: string
        }
        Returns: {
          category: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          ourprice: number | null
          price: number
          sku: string | null
          tags: string[] | null
          taxable: boolean | null
          updated_at: string | null
          user_id: string | null
        }
      }
      debug_job_access: {
        Args: { p_client_id?: string }
        Returns: {
          check_name: string
          result: string
          details: Json
        }[]
      }
      debug_niche_switch: {
        Args: { p_new_niche: string }
        Returns: Json
      }
      delete_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_job_as_admin: {
        Args: { job_id: string }
        Returns: Json
      }
      delete_job_with_related_data: {
        Args: { job_id: string }
        Returns: Json
      }
      delete_user_with_data: {
        Args: { user_email: string }
        Returns: undefined
      }
      diagnose_product_creation: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
        }[]
      }
      execute_automation: {
        Args: { p_automation_id: string; p_trigger_data?: Json }
        Returns: string
      }
      generate_approval_token: {
        Args: {
          p_document_type: string
          p_document_id: string
          p_document_number: string
          p_client_id: string
          p_client_name?: string
          p_client_email?: string
          p_client_phone?: string
        }
        Returns: string
      }
      generate_next_id: {
        Args: { p_entity_type: string }
        Returns: string
      }
      generate_portal_access: {
        Args: {
          p_client_id: string
          p_permissions?: Json
          p_hours_valid?: number
          p_domain?: string
        }
        Returns: string
      }
      get_automation_analytics: {
        Args: { org_id: string }
        Returns: {
          totalrules: number
          activerules: number
          totalexecutions: number
          successrate: number
          messagessent: number
          responsesreceived: number
          revenuegenerated: number
          recentexecutions: number
        }[]
      }
      get_client_jobs: {
        Args: { p_client_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          title: string
          status: string
          job_type: string
          service: string
          date: string
          schedule_start: string
          revenue: number
          address: string
          created_at: string
        }[]
      }
      get_connect_statistics: {
        Args: { user_id_param: string }
        Returns: {
          total_conversations: number
          active_conversations: number
          new_today: number
          response_rate: number
        }[]
      }
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_data_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_default_job_statuses: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          color: string
          sequence: number
          is_default: boolean
        }[]
      }
      get_enhanced_portal_data: {
        Args: { p_client_id: string }
        Returns: Json
      }
      get_highest_document_number: {
        Args: { p_user_id: string; p_document_type: string }
        Returns: number
      }
      get_job_portal_data: {
        Args: { p_job_number: string }
        Returns: Json
      }
      get_jobs_with_outdated_config: {
        Args: { p_user_id: string }
        Returns: {
          job_id: string
          job_title: string
          current_job_type: string
          current_tags: string[]
          current_lead_source: string
          suggested_job_type: string
          available_tags: string[]
          available_lead_sources: string[]
        }[]
      }
      get_message_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_messages: number
          received_messages: number
          sent_messages: number
          messages_today: number
          messages_this_week: number
          messages_this_month: number
          active_today: number
          total_communications: number
          email_count: number
          call_count: number
          total_calls: number
          incoming_calls: number
          outgoing_calls: number
          avg_call_duration: number
          ai_calls_handled: number
          ai_success_rate: number
          avg_ai_duration: number
          ai_calls_today: number
        }[]
      }
      get_message_template: {
        Args: { p_user_id: string; p_name: string; p_type: string }
        Returns: {
          id: string
          content: string
          variables: Json
        }[]
      }
      get_next_document_number: {
        Args: { p_entity_type: string }
        Returns: string
      }
      get_next_job_status_sequence: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_popular_warranties_by_job_type: {
        Args: { p_job_type: string; p_limit?: number }
        Returns: {
          warranty_id: string
          warranty_name: string
          purchase_count: number
          popularity_percentage: number
        }[]
      }
      get_product_with_computed_fields: {
        Args: { product_row: Database["public"]["Tables"]["products"]["Row"] }
        Returns: Json
      }
      get_service_areas: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
          zip_code: string
        }[]
      }
      get_task_context: {
        Args: { task_id: string }
        Returns: Json
      }
      get_team_member_commission: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          user_id: string
          base_rate: number
          rules: Json
          fees: Json
          created_at: string
          updated_at: string
        }[]
      }
      get_team_member_skills: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_phone_number: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_primary_phone: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      handle_job_portal_request: {
        Args: { p_job_number: string }
        Returns: Json
      }
      increment_automation_metrics: {
        Args: { workflow_id: string; success: boolean }
        Returns: undefined
      }
      increment_workflow_metrics: {
        Args: {
          workflow_id: string
          execution_count?: number
          success_count?: number
        }
        Returns: undefined
      }
      initialize_niche_data: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: undefined
      }
      initialize_remaining_niches: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: undefined
      }
      initialize_user_data: {
        Args:
          | { p_user_id: string }
          | { p_user_id: string; p_business_niche?: string }
        Returns: undefined
      }
      initialize_user_data_complete: {
        Args: { p_user_id: string; p_business_niche?: string }
        Returns: undefined
      }
      initialize_user_data_complete_enhanced: {
        Args: { p_user_id: string; p_business_niche?: string }
        Returns: undefined
      }
      initialize_user_data_with_enhanced_niche_data: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: Json
      }
      initialize_user_defaults: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      load_my_niche_products: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      load_niche_products_direct: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: Json
      }
      log_communication: {
        Args: {
          p_user_id: string
          p_type: string
          p_from: string
          p_to: string
          p_content: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource?: string
          p_details?: Json
          p_user_id?: string
        }
        Returns: undefined
      }
      migrate_job_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      normalize_phone_number: {
        Args: { phone_input: string }
        Returns: string
      }
      populate_niche_products: {
        Args: { p_niche: string }
        Returns: number
      }
      populate_painting_products_for_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      populate_products_for_user_by_email: {
        Args: { p_email: string; p_niche?: string }
        Returns: Json
      }
      process_email_template: {
        Args: { p_template_name: string; p_variables: Json; p_user_id?: string }
        Returns: {
          subject: string
          html_content: string
        }[]
      }
      process_pending_automations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_job_revenue: {
        Args: { job_id_param: string }
        Returns: number
      }
      refresh_user_products: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reload_products_for_current_niche: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      repair_user_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          business_niche: string
          status: string
          products_loaded: number
          errors: Json
        }[]
      }
      safe_insert_products: {
        Args: { p_products: Json; p_user_id: string }
        Returns: Json
      }
      safe_reset_document_counter: {
        Args: {
          p_user_id: string
          p_document_type: string
          p_new_start_value?: number
        }
        Returns: Json
      }
      send_invoice_sms: {
        Args: { invoice_id: string; recipient_phone: string; message: string }
        Returns: Json
      }
      suggest_safe_reset_value: {
        Args: { p_user_id: string; p_document_type: string }
        Returns: number
      }
      switch_business_niche_comprehensive: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: Json
      }
      test_create_products: {
        Args: { p_user_id: string; p_business_niche: string }
        Returns: Json
      }
      test_products_functionality: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_products_visibility: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      trigger_automation_manually: {
        Args: { automation_id: string; test_data?: Json }
        Returns: Json
      }
      update_team_member_commission: {
        Args: { user_id: string; base_rate: number; rules: Json; fees: Json }
        Returns: undefined
      }
      validate_portal_access: {
        Args: {
          p_access_token: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
