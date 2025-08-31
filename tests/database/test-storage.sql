-- Test query to check user authentication and storage access
SELECT 
  auth.uid() as user_id,
  EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'company-logos'
  ) as bucket_exists,
  EXISTS (
    SELECT 1 FROM company_settings WHERE user_id = auth.uid()
  ) as has_company_settings;
