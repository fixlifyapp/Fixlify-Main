-- Delete all jobs for the specific user account: petrusenkorp@gmail.com
-- First, get the user ID for the email
DO $$
DECLARE
    v_user_id uuid;
    v_job_count integer;
BEGIN
    -- Get the user ID from auth.users table (we'll use a function since we can't query auth.users directly)
    SELECT id INTO v_user_id 
    FROM public.profiles 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'petrusenkorp@gmail.com'
    )
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        -- Try to find user by any profile data or search in the database differently
        -- Look for user in profiles table first
        SELECT user_id INTO v_user_id 
        FROM public.profiles 
        WHERE id = (
            SELECT au.id 
            FROM auth.users au 
            WHERE au.email = 'petrusenkorp@gmail.com'
        )
        LIMIT 1;
    END IF;
    
    IF v_user_id IS NOT NULL THEN
        -- Count jobs before deletion
        SELECT COUNT(*) INTO v_job_count
        FROM public.jobs 
        WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id;
        
        RAISE NOTICE 'Found % jobs for user %', v_job_count, v_user_id;
        
        -- Delete job-related data in correct order
        -- Delete job attachments first
        DELETE FROM public.job_attachments WHERE job_id IN (
            SELECT id FROM public.jobs 
            WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id
        );
        
        -- Delete job history
        DELETE FROM public.job_history WHERE job_id IN (
            SELECT id FROM public.jobs 
            WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id
        );
        
        -- Delete estimates related to jobs
        DELETE FROM public.estimates WHERE job_id IN (
            SELECT id FROM public.jobs 
            WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id
        );
        
        -- Delete invoices related to jobs
        DELETE FROM public.invoices WHERE job_id IN (
            SELECT id FROM public.jobs 
            WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id
        );
        
        -- Finally delete the jobs themselves
        DELETE FROM public.jobs 
        WHERE user_id = v_user_id OR created_by = v_user_id OR technician_id = v_user_id;
        
        RAISE NOTICE 'Successfully deleted % jobs and related data for user: petrusenkorp@gmail.com', v_job_count;
    ELSE
        RAISE NOTICE 'User with email petrusenkorp@gmail.com not found';
    END IF;
END $$;