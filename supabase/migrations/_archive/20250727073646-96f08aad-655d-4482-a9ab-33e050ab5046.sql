-- Ensure job_statuses table has proper constraints and structure for job status management

-- Add unique constraint for user_id + sequence to prevent duplicate sequences per user
DO $$ 
BEGIN
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'job_statuses_user_sequence_unique'
    ) THEN
        ALTER TABLE public.job_statuses 
        ADD CONSTRAINT job_statuses_user_sequence_unique 
        UNIQUE (user_id, sequence);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        NULL; -- Ignore if constraint already exists
END $$;

-- Add unique constraint for user_id + name to prevent duplicate names per user
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'job_statuses_user_name_unique'
    ) THEN
        ALTER TABLE public.job_statuses 
        ADD CONSTRAINT job_statuses_user_name_unique 
        UNIQUE (user_id, name);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        NULL; -- Ignore if constraint already exists
END $$;

-- Create function to auto-assign next sequence number
CREATE OR REPLACE FUNCTION public.get_next_job_status_sequence(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(sequence), 0) + 1 
    INTO next_seq
    FROM public.job_statuses 
    WHERE user_id = p_user_id;
    
    RETURN next_seq;
END;
$$;

-- Create trigger function to auto-assign sequence if not provided
CREATE OR REPLACE FUNCTION public.auto_assign_job_status_sequence()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If sequence is not provided or is 0, auto-assign next sequence
    IF NEW.sequence IS NULL OR NEW.sequence = 0 THEN
        NEW.sequence := public.get_next_job_status_sequence(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-assigning sequence
DROP TRIGGER IF EXISTS auto_assign_job_status_sequence_trigger ON public.job_statuses;
CREATE TRIGGER auto_assign_job_status_sequence_trigger
    BEFORE INSERT ON public.job_statuses
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_job_status_sequence();

-- Create function to validate job status operations
CREATE OR REPLACE FUNCTION public.validate_job_status_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prevent modification of default statuses
    IF TG_OP = 'UPDATE' AND OLD.is_default = true AND NEW.is_default = false THEN
        RAISE EXCEPTION 'Cannot remove default flag from default job status';
    END IF;
    
    -- Prevent deletion of default statuses
    IF TG_OP = 'DELETE' AND OLD.is_default = true THEN
        RAISE EXCEPTION 'Cannot delete default job status';
    END IF;
    
    -- Ensure at least one status exists per user
    IF TG_OP = 'DELETE' THEN
        IF (SELECT COUNT(*) FROM public.job_statuses WHERE user_id = OLD.user_id) <= 1 THEN
            RAISE EXCEPTION 'Cannot delete the last job status - at least one status must exist';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_job_status_trigger ON public.job_statuses;
CREATE TRIGGER validate_job_status_trigger
    BEFORE UPDATE OR DELETE ON public.job_statuses
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_job_status_operation();