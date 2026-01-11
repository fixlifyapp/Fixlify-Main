-- Add organization_id to clients table for multi-tenant support
-- This allows all users in an organization to see the same clients

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN organization_id uuid;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON clients(organization_id);

-- Update existing clients to have organization_id from their creator's profile
-- This sets organization_id based on the user who created the client
UPDATE clients c
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM profiles p WHERE p.id = c.user_id),
  (SELECT p.organization_id FROM profiles p WHERE p.id = c.created_by),
  '00000000-0000-0000-0000-000000000001'  -- Default org if no profile found
)
WHERE c.organization_id IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN clients.organization_id IS 'Organization that owns this client. All users in the same organization can see this client.';
