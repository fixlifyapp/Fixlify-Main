
-- Enable RLS on telnyx_phone_numbers if not already enabled
ALTER TABLE public.telnyx_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all telnyx phone numbers (for edge functions)
CREATE POLICY "Service role can access all telnyx phone numbers"
ON public.telnyx_phone_numbers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own telnyx phone numbers
CREATE POLICY "Users can view their own telnyx phone numbers"
ON public.telnyx_phone_numbers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to manage their own telnyx phone numbers
CREATE POLICY "Users can manage their own telnyx phone numbers"
ON public.telnyx_phone_numbers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
