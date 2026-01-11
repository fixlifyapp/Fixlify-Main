-- Fix job_attachments RLS policies and storage bucket configuration
-- This migration adds proper RLS policies for the job_attachments table
-- and ensures the job-attachments storage bucket is properly configured

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-attachments',
  'job-attachments',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv']::text[];

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "job_attachments_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "job_attachments_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "job_attachments_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "job_attachments_storage_delete" ON storage.objects;

-- Policy: Authenticated users can upload files to job-attachments bucket
CREATE POLICY "job_attachments_storage_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-attachments'
);

-- Policy: Authenticated users can view files in job-attachments bucket
CREATE POLICY "job_attachments_storage_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-attachments'
);

-- Policy: Authenticated users can update files in job-attachments bucket
CREATE POLICY "job_attachments_storage_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'job-attachments'
)
WITH CHECK (
  bucket_id = 'job-attachments'
);

-- Policy: Authenticated users can delete files in job-attachments bucket
CREATE POLICY "job_attachments_storage_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-attachments'
);

-- ============================================
-- JOB_ATTACHMENTS TABLE RLS
-- ============================================

-- Enable RLS on job_attachments if not already enabled
ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "job_attachments_select" ON public.job_attachments;
DROP POLICY IF EXISTS "job_attachments_insert" ON public.job_attachments;
DROP POLICY IF EXISTS "job_attachments_update" ON public.job_attachments;
DROP POLICY IF EXISTS "job_attachments_delete" ON public.job_attachments;
DROP POLICY IF EXISTS "Users can view own job attachments" ON public.job_attachments;
DROP POLICY IF EXISTS "Users can create job attachments" ON public.job_attachments;
DROP POLICY IF EXISTS "Users can delete own job attachments" ON public.job_attachments;

-- Simple policy: Authenticated users can view all attachments for jobs they can access
-- Note: Jobs table RLS already handles organization-level access
CREATE POLICY "job_attachments_select"
ON public.job_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_attachments.job_id
  )
);

-- Simple policy: Authenticated users can create attachments for existing jobs
CREATE POLICY "job_attachments_insert"
ON public.job_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_attachments.job_id
  )
);

-- Simple policy: Authenticated users can update attachments
CREATE POLICY "job_attachments_update"
ON public.job_attachments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_attachments.job_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_attachments.job_id
  )
);

-- Simple policy: Authenticated users can delete attachments
CREATE POLICY "job_attachments_delete"
ON public.job_attachments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = job_attachments.job_id
  )
);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Ensure authenticated users have access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_attachments TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
