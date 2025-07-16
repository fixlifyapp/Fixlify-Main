-- Performance indexes for multi-tenancy
-- This migration adds composite indexes to improve query performance with user_id filters

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_status 
ON public.jobs(user_id, status);

CREATE INDEX IF NOT EXISTS idx_jobs_user_created 
ON public.jobs(user_id, created_at DESC);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_active 
ON public.clients(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_clients_user_created 
ON public.clients(user_id, created_at DESC);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_date 
ON public.invoices(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_status 
ON public.invoices(user_id, status);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_user_active 
ON public.products(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_products_user_category 
ON public.products(user_id, category);

-- Estimates table indexes
CREATE INDEX IF NOT EXISTS idx_estimates_user_created 
ON public.estimates(user_id, created_at DESC);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
ON public.messages(user_id, created_at DESC);

-- Profiles table index for niche searches
CREATE INDEX IF NOT EXISTS idx_profiles_business_niche 
ON public.profiles(business_niche);

-- Company settings index
CREATE INDEX IF NOT EXISTS idx_company_settings_user 
ON public.company_settings(user_id);

-- Tags table index
CREATE INDEX IF NOT EXISTS idx_tags_user 
ON public.tags(user_id);

-- Automations table index
CREATE INDEX IF NOT EXISTS idx_automations_user_active 
ON public.automations(user_id, is_active);

-- Custom fields table index
CREATE INDEX IF NOT EXISTS idx_custom_fields_user_entity 
ON public.custom_fields(user_id, entity_type);

-- ANALYZE tables to update statistics for query planner
ANALYZE public.jobs;
ANALYZE public.clients;
ANALYZE public.invoices;
ANALYZE public.products;
ANALYZE public.estimates;
ANALYZE public.messages;
ANALYZE public.profiles;
ANALYZE public.company_settings;