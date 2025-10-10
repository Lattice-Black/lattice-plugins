import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.')
}

// Create Supabase client with service role key
// Note: This client has elevated privileges and should only be used server-side
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          name: string | null
          last_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          name?: string | null
          last_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          name?: string | null
          last_used?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          plan: string
          current_period_end: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          plan?: string
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          plan?: string
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          version: string | null
          environment: string | null
          deployment_type: string | null
          language: string
          framework: string
          runtime: string | null
          description: string | null
          repository: string | null
          health_check_url: string | null
          status: string
          first_seen: string
          last_seen: string
          discovered_by: any
          metadata: any
          total_requests: number
          avg_response_time_ms: number
          error_rate: number
          last_metric_update: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          version?: string | null
          environment?: string | null
          deployment_type?: string | null
          language: string
          framework: string
          runtime?: string | null
          description?: string | null
          repository?: string | null
          health_check_url?: string | null
          status?: string
          first_seen?: string
          last_seen: string
          discovered_by: any
          metadata?: any
          total_requests?: number
          avg_response_time_ms?: number
          error_rate?: number
          last_metric_update?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          version?: string | null
          environment?: string | null
          deployment_type?: string | null
          language?: string
          framework?: string
          runtime?: string | null
          description?: string | null
          repository?: string | null
          health_check_url?: string | null
          status?: string
          first_seen?: string
          last_seen?: string
          discovered_by?: any
          metadata?: any
          total_requests?: number
          avg_response_time_ms?: number
          error_rate?: number
          last_metric_update?: string | null
        }
      }
      service_metrics: {
        Row: {
          id: string
          service_id: string
          method: string
          path: string
          status_code: number
          response_time_ms: number
          caller_service_name: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          service_id: string
          method: string
          path: string
          status_code: number
          response_time_ms: number
          caller_service_name?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          service_id?: string
          method?: string
          path?: string
          status_code?: number
          response_time_ms?: number
          caller_service_name?: string | null
          timestamp?: string
        }
      }
    }
    Views: {
      service_stats: {
        Row: {
          id: string
          name: string
          user_id: string
          total_requests: number
          avg_response_time_ms: number
          error_rate: number
          last_request_time: string | null
        }
      }
      service_connections_view: {
        Row: {
          user_id: string
          source_service: string
          target_service: string
          call_count: number
          avg_response_time: number
        }
      }
    }
  }
}
