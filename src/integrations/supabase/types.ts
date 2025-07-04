export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      automation_communication_logs: {
        Row: {
          automation_id: string | null
          communication_type: string | null
          content: string | null
          cost: number | null
          created_at: string | null
          created_by_automation: string | null
          direction: string | null
          error_details: Json | null
          external_id: string | null
          from_email: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_response: Json | null
          recipient: string | null
          response_received: boolean | null
          response_received_at: string | null
          status: string | null
          subject: string | null
          to_email: string | null
          to_number: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          automation_id?: string | null
          communication_type?: string | null
          content?: string | null
          cost?: number | null
          created_at?: string | null
          created_by_automation?: string | null
          direction?: string | null
          error_details?: Json | null
          external_id?: string | null
          from_email?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_response?: Json | null
          recipient?: string | null
          response_received?: boolean | null
          response_received_at?: string | null
          status?: string | null
          subject?: string | null
          to_email?: string | null
          to_number?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          automation_id?: string | null
          communication_type?: string | null
          content?: string | null
          cost?: number | null
          created_at?: string | null
          created_by_automation?: string | null
          direction?: string | null
          error_details?: Json | null
          external_id?: string | null
          from_email?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_response?: Json | null
          recipient?: string | null
          response_received?: boolean | null
          response_received_at?: string | null
          status?: string | null
          subject?: string | null
          to_email?: string | null
          to_number?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_communication_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_communication_logs_created_by_automation_fkey"
            columns: ["created_by_automation"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_communication_logs_workflow_id_fkey"
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
      automation_message_queue: {
        Row: {
          content: Json
          created_at: string | null
          delivery_window: Json | null
          error_message: string | null
          id: string
          message_type: string
          metadata: Json | null
          organization_id: string | null
          recipient: string
          retry_count: number | null
          scheduled_at: string
          sent_at: string | null
          status: string
          step_id: string
          updated_at: string | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          delivery_window?: Json | null
          error_message?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          organization_id?: string | null
          recipient: string
          retry_count?: number | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          step_id: string
          updated_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          delivery_window?: Json | null
          error_message?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          organization_id?: string | null
          recipient?: string
          retry_count?: number | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          step_id?: string
          updated_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_message_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_message_queue_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          last_used_at: string | null
          marketing_formula: string | null
          name: string
          preview_text: string | null
          subject: string | null
          tone: string | null
          type: string
          updated_at: string
          use_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          marketing_formula?: string | null
          name: string
          preview_text?: string | null
          subject?: string | null
          tone?: string | null
          type: string
          updated_at?: string
          use_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          marketing_formula?: string | null
          name?: string
          preview_text?: string | null
          subject?: string | null
          tone?: string | null
          type?: string
          updated_at?: string
          use_count?: number | null
          variables?: Json | null
        }
        Relationships: []
      }
      automation_messages: {
        Row: {
          client_id: string | null
          cost: number | null
          created_at: string | null
          error_message: string | null
          fallback_channel: string | null
          fallback_sent_at: string | null
          fallback_status: string | null
          id: string
          job_id: string | null
          message_content: string
          message_type: string
          metadata: Json | null
          organization_id: string
          primary_status: string | null
          recipient: string
          replied_at: string | null
          reply_content: string | null
          sender: string
          sent_at: string | null
          subject: string | null
          workflow_id: string | null
        }
        Insert: {
          client_id?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          fallback_channel?: string | null
          fallback_sent_at?: string | null
          fallback_status?: string | null
          id?: string
          job_id?: string | null
          message_content: string
          message_type: string
          metadata?: Json | null
          organization_id: string
          primary_status?: string | null
          recipient: string
          replied_at?: string | null
          reply_content?: string | null
          sender: string
          sent_at?: string | null
          subject?: string | null
          workflow_id?: string | null
        }
        Update: {
          client_id?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          fallback_channel?: string | null
          fallback_sent_at?: string | null
          fallback_status?: string | null
          id?: string
          job_id?: string | null
          message_content?: string
          message_type?: string
          metadata?: Json | null
          organization_id?: string
          primary_status?: string | null
          recipient?: string
          replied_at?: string | null
          reply_content?: string | null
          sender?: string
          sent_at?: string | null
          subject?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_messages_workflow_id_fkey"
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
          clicked_at: string | null
          client_id: string
          content: string | null
          created_at: string
          delivered_at: string | null
          direction: string | null
          error_message: string | null
          external_id: string | null
          from_address: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          opened_at: string | null
          provider: string
          recipient: string
          sent_at: string | null
          status: string | null
          subject: string | null
          to_address: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          client_id: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          from_address?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          provider: string
          recipient: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_address?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          client_id?: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          from_address?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          provider?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_address?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
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
      communication_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
          preview_data: Json | null
          subject: string | null
          type: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          preview_data?: Json | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          preview_data?: Json | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      conversations: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
          company_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          message_id: string | null
          metadata: Json | null
          status: string | null
          subject: string
          template_id: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          message_id?: string | null
          metadata?: Json | null
          status?: string | null
          subject: string
          template_id?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          message_id?: string | null
          metadata?: Json | null
          status?: string | null
          subject?: string
          template_id?: string | null
          thread_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "email_conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "email_conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_conversations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "automation_message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          clicked_at: string | null
          conversation_id: string | null
          created_at: string | null
          delivery_status: string | null
          direction: string
          id: string
          mailgun_message_id: string | null
          opened_at: string | null
          recipient_email: string
          sender_email: string
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          clicked_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          delivery_status?: string | null
          direction: string
          id?: string
          mailgun_message_id?: string | null
          opened_at?: string | null
          recipient_email: string
          sender_email: string
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          clicked_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          delivery_status?: string | null
          direction?: string
          id?: string
          mailgun_message_id?: string | null
          opened_at?: string | null
          recipient_email?: string
          sender_email?: string
          subject?: string | null
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
      email_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string | null
          client_id: string | null
          created_at: string
          direction: string
          email_address: string
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          status: string | null
          subject: string
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          direction: string
          email_address: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          status?: string | null
          subject: string
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          direction?: string
          email_address?: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          status?: string | null
          subject?: string
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_communications: {
        Row: {
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          communication_type: string
          content: string | null
          created_at: string
          estimate_id: string
          estimate_number: string | null
          external_id: string | null
          id: string
          portal_link_included: boolean | null
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type: string
          content?: string | null
          created_at?: string
          estimate_id: string
          estimate_number?: string | null
          external_id?: string | null
          id?: string
          portal_link_included?: boolean | null
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type?: string
          content?: string | null
          created_at?: string
          estimate_id?: string
          estimate_number?: string | null
          external_id?: string | null
          id?: string
          portal_link_included?: boolean | null
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
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
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          communication_type: string
          content: string | null
          created_at: string
          external_id: string | null
          id: string
          invoice_id: string
          invoice_number: string | null
          portal_link_included: boolean | null
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type: string
          content?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_id: string
          invoice_number?: string | null
          portal_link_included?: boolean | null
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type?: string
          content?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_id?: string
          invoice_number?: string | null
          portal_link_included?: boolean | null
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
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
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          message_content: string
          template_name: string
          template_type: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          message_content: string
          template_name: string
          template_type: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          message_content?: string
          template_name?: string
          template_type?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string | null
          created_at: string | null
          direction: string
          id: string
          media_url: string | null
          message_sid: string | null
          read_at: string | null
          recipient: string | null
          sender: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          conversation_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          message_sid?: string | null
          read_at?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          message_sid?: string | null
          read_at?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      phone_number_assignments: {
        Row: {
          ai_settings: Json | null
          assigned_at: string
          assigned_name: string | null
          call_settings: Json | null
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          phone_number: string
          purchase_id: string | null
          sms_settings: Json | null
          updated_at: string
        }
        Insert: {
          ai_settings?: Json | null
          assigned_at?: string
          assigned_name?: string | null
          call_settings?: Json | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          purchase_id?: string | null
          sms_settings?: Json | null
          updated_at?: string
        }
        Update: {
          ai_settings?: Json | null
          assigned_at?: string
          assigned_name?: string | null
          call_settings?: Json | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          purchase_id?: string | null
          sms_settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_number_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_number_assignments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "phone_number_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_number_billing: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          call_minutes: number | null
          company_id: string | null
          created_at: string
          due_date: string
          id: string
          monthly_fee: number
          paid_at: string | null
          phone_number: string
          purchase_id: string | null
          sms_count: number | null
          status: string
          total_amount: number
          updated_at: string
          usage_charges: number | null
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          call_minutes?: number | null
          company_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          monthly_fee: number
          paid_at?: string | null
          phone_number: string
          purchase_id?: string | null
          sms_count?: number | null
          status?: string
          total_amount: number
          updated_at?: string
          usage_charges?: number | null
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          call_minutes?: number | null
          company_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          monthly_fee?: number
          paid_at?: string | null
          phone_number?: string
          purchase_id?: string | null
          sms_count?: number | null
          status?: string
          total_amount?: number
          updated_at?: string
          usage_charges?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_number_billing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_number_billing_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "phone_number_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_number_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          monthly_fee: number
          name: string
          price_per_number: number
          setup_fee: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name: string
          price_per_number?: number
          setup_fee?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name?: string
          price_per_number?: number
          setup_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      phone_number_purchases: {
        Row: {
          company_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          monthly_fee: number
          phone_number: string
          plan_id: string | null
          purchase_price: number
          purchased_at: string
          status: string
          telnyx_number_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_fee: number
          phone_number: string
          plan_id?: string | null
          purchase_price: number
          purchased_at?: string
          status?: string
          telnyx_number_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_fee?: number
          phone_number?: string
          plan_id?: string | null
          purchase_price?: number
          purchased_at?: string
          status?: string
          telnyx_number_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_number_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_number_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "phone_number_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          ai_dispatcher_enabled: boolean | null
          ai_settings: Json | null
          assigned_to: string | null
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
          latitude: number | null
          locality: string | null
          longitude: number | null
          monthly_price: number | null
          phone_number: string
          phone_number_type: string | null
          price: number | null
          price_unit: string | null
          purchased_at: string | null
          purchased_by: string | null
          rate_center: string | null
          region: string | null
          status: string | null
          telnyx_connection_id: string | null
          telnyx_phone_number_id: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          assigned_to?: string | null
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
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          phone_number: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          ai_dispatcher_enabled?: boolean | null
          ai_settings?: Json | null
          assigned_to?: string | null
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
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          phone_number?: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          status?: string | null
          telnyx_connection_id?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string
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
      portal_messages: {
        Row: {
          attachments: Json | null
          client_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          job_id: string | null
          message: string
          reply_to: string | null
          sender_name: string
          sender_type: string
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          client_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message: string
          reply_to?: string | null
          sender_name: string
          sender_type: string
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message?: string
          reply_to?: string | null
          sender_name?: string
          sender_type?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_revenue_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "portal_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "portal_messages"
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
          ai_transcript: string | null
          answered_at: string | null
          appointment_data: Json | null
          appointment_scheduled: boolean | null
          call_control_id: string | null
          call_duration: number | null
          call_session_id: string | null
          call_status: string | null
          client_id: string | null
          created_at: string | null
          direction: string | null
          duration_seconds: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          phone_number: string | null
          phone_number_id: string | null
          started_at: string | null
          status: string | null
          streaming_active: boolean | null
          to_number: string | null
          user_id: string | null
        }
        Insert: {
          ai_transcript?: string | null
          answered_at?: string | null
          appointment_data?: Json | null
          appointment_scheduled?: boolean | null
          call_control_id?: string | null
          call_duration?: number | null
          call_session_id?: string | null
          call_status?: string | null
          client_id?: string | null
          created_at?: string | null
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          phone_number_id?: string | null
          started_at?: string | null
          status?: string | null
          streaming_active?: boolean | null
          to_number?: string | null
          user_id?: string | null
        }
        Update: {
          ai_transcript?: string | null
          answered_at?: string | null
          appointment_data?: Json | null
          appointment_scheduled?: boolean | null
          call_control_id?: string | null
          call_duration?: number | null
          call_session_id?: string | null
          call_status?: string | null
          client_id?: string | null
          created_at?: string | null
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          phone_number_id?: string | null
          started_at?: string | null
          status?: string | null
          streaming_active?: boolean | null
          to_number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telnyx_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telnyx_calls_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "telnyx_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      telnyx_configurations: {
        Row: {
          ai_settings: Json | null
          api_key_configured: boolean | null
          app_id: string | null
          business_settings: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          voice_settings: Json | null
          webhook_url: string | null
        }
        Insert: {
          ai_settings?: Json | null
          api_key_configured?: boolean | null
          app_id?: string | null
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          voice_settings?: Json | null
          webhook_url?: string | null
        }
        Update: {
          ai_settings?: Json | null
          api_key_configured?: boolean | null
          app_id?: string | null
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          voice_settings?: Json | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      telnyx_phone_numbers: {
        Row: {
          ai_dispatcher_config: Json | null
          ai_dispatcher_enabled: boolean | null
          area_code: string | null
          call_routing_stats: Json | null
          configured_at: string | null
          connection_id: string | null
          country_code: string | null
          created_at: string | null
          features: Json | null
          id: string
          last_call_routed_to: string | null
          locality: string | null
          messaging_profile_id: string | null
          monthly_cost: number | null
          order_id: string | null
          phone_number: string
          purchased_at: string | null
          rate_center: string | null
          region: string | null
          setup_cost: number | null
          status: string | null
          telnyx_phone_number_id: string | null
          updated_at: string | null
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          ai_dispatcher_config?: Json | null
          ai_dispatcher_enabled?: boolean | null
          area_code?: string | null
          call_routing_stats?: Json | null
          configured_at?: string | null
          connection_id?: string | null
          country_code?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          last_call_routed_to?: string | null
          locality?: string | null
          messaging_profile_id?: string | null
          monthly_cost?: number | null
          order_id?: string | null
          phone_number: string
          purchased_at?: string | null
          rate_center?: string | null
          region?: string | null
          setup_cost?: number | null
          status?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          ai_dispatcher_config?: Json | null
          ai_dispatcher_enabled?: boolean | null
          area_code?: string | null
          call_routing_stats?: Json | null
          configured_at?: string | null
          connection_id?: string | null
          country_code?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          last_call_routed_to?: string | null
          locality?: string | null
          messaging_profile_id?: string | null
          monthly_cost?: number | null
          order_id?: string | null
          phone_number?: string
          purchased_at?: string | null
          rate_center?: string | null
          region?: string | null
          setup_cost?: number | null
          status?: string | null
          telnyx_phone_number_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_url?: string | null
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
      claim_phone_number: {
        Args: { p_phone_number: string; p_user_id: string }
        Returns: {
          ai_dispatcher_config: Json | null
          ai_dispatcher_enabled: boolean | null
          area_code: string | null
          call_routing_stats: Json | null
          configured_at: string | null
          connection_id: string | null
          country_code: string | null
          created_at: string | null
          features: Json | null
          id: string
          last_call_routed_to: string | null
          locality: string | null
          messaging_profile_id: string | null
          monthly_cost: number | null
          order_id: string | null
          phone_number: string
          purchased_at: string | null
          rate_center: string | null
          region: string | null
          setup_cost: number | null
          status: string | null
          telnyx_phone_number_id: string | null
          updated_at: string | null
          user_id: string | null
          webhook_url: string | null
        }
      }
      cleanup_all_user_data: {
        Args: { p_keep_system_users?: boolean; p_dry_run?: boolean }
        Returns: Json
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
      get_next_document_number: {
        Args: { p_entity_type: string }
        Returns: string
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
      process_pending_automations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_job_revenue: {
        Args: { job_id_param: string }
        Returns: number
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
      send_invoice_sms: {
        Args: { invoice_id: string; recipient_phone: string; message: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
