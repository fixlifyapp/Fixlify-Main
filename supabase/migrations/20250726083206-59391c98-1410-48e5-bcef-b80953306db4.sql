-- Remove service column from jobs table
ALTER TABLE public.jobs DROP COLUMN IF EXISTS service;