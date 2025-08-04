// Enhanced Client type that extends Supabase database types
import type { Database } from '@/integrations/supabase/types';
import type { Client as BaseClient } from './client';

// Extract the base types from Supabase
type ClientRow = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

// Extend the database type with our enhancements
export interface ClientDatabase extends ClientRow {
  // Ensure arrays are properly typed
  tags: string[];
  
  // Ensure required fields
  created_at: string;
  updated_at: string;
}

// Client with computed fields from database views
export interface ClientWithDatabaseMetrics extends ClientDatabase {
  // From database aggregations
  job_count?: number;
  total_revenue?: number;
  last_job_date?: string;
  last_contact_date?: string;
  
  // Relations
  jobs?: Array<{
    id: string;
    title: string;
    status: string;
    revenue: number;
    created_at: string;
  }>;
}

// Create type for database operations
export type CreateClientDatabase = ClientInsert;
export type UpdateClientDatabase = ClientUpdate;

// Type guard to validate database client
export function isValidDatabaseClient(data: any): data is ClientDatabase {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string'
  );
}

// Convert database client to our Client type
export function databaseClientToClient(dbClient: ClientRow): BaseClient {
  return {
    ...dbClient,
    // Ensure required fields have defaults
    tags: Array.isArray(dbClient.tags) ? dbClient.tags : [],
    created_at: dbClient.created_at ?? new Date().toISOString(),
    updated_at: dbClient.updated_at ?? new Date().toISOString(),
    
    // Map all nullable fields
    address: dbClient.address,
    city: dbClient.city,
    company: dbClient.company,
    country: dbClient.country,
    created_by: dbClient.created_by,
    email: dbClient.email,
    notes: dbClient.notes,
    phone: dbClient.phone,
    state: dbClient.state,
    status: dbClient.status,
    type: dbClient.type,
    user_id: dbClient.user_id,
    zip: dbClient.zip,
  };
}

// Helper to prepare client for database insert
export function clientToDatabase(client: Partial<BaseClient>): ClientInsert {
  return {
    name: client.name ?? '',
    address: client.address,
    city: client.city,
    company: client.company,
    country: client.country,
    email: client.email,
    notes: client.notes,
    phone: client.phone,
    state: client.state,
    status: client.status,
    tags: client.tags,
    type: client.type,
    zip: client.zip,
    created_by: client.created_by,
    user_id: client.user_id,
  };
}
