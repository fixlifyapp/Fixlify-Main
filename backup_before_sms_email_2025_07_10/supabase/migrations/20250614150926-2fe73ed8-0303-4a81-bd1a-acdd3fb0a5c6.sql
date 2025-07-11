
-- Check current invoice status constraint and update it to include 'unpaid' status
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Add updated status check constraint that includes 'unpaid'
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'unpaid', 'paid', 'overdue', 'cancelled'));
