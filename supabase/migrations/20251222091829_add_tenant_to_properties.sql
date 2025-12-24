-- Add tenant contact fields to client_properties table
-- This allows storing tenant information (name, phone, email) for rental properties
-- Tenant is the person who lives at the property and may need to be contacted for access
-- while the client (landlord) is the one who gets invoiced

ALTER TABLE client_properties
  ADD COLUMN IF NOT EXISTS tenant_name TEXT,
  ADD COLUMN IF NOT EXISTS tenant_phone TEXT,
  ADD COLUMN IF NOT EXISTS tenant_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN client_properties.tenant_name IS 'Name of the tenant/occupant for contact purposes';
COMMENT ON COLUMN client_properties.tenant_phone IS 'Phone number of the tenant for scheduling access';
COMMENT ON COLUMN client_properties.tenant_email IS 'Email of the tenant (optional)';
