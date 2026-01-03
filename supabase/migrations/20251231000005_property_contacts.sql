-- Migration: Property Contacts System
-- Description: Creates a junction table to support multiple contact types per property
-- (owner, tenant, property_manager, emergency_contact) for landlord/tenant scenarios

-- Create property_contacts junction table
-- Note: client_id is TEXT because clients.id is TEXT (not UUID)
CREATE TABLE IF NOT EXISTS property_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES client_properties(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Role/type of contact for this property
  role TEXT NOT NULL CHECK (role IN ('owner', 'tenant', 'property_manager', 'emergency_contact')),

  -- Contact preferences and permissions
  is_billing_contact BOOLEAN DEFAULT FALSE,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  receives_invoices BOOLEAN DEFAULT TRUE,
  receives_estimates BOOLEAN DEFAULT TRUE,
  can_approve_work BOOLEAN DEFAULT FALSE,

  -- Optional notes about this contact relationship
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),

  -- Prevent duplicate role assignments for same property-client combination
  UNIQUE(property_id, client_id, role)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_contacts_property_id ON property_contacts(property_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_client_id ON property_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_role ON property_contacts(role);
CREATE INDEX IF NOT EXISTS idx_property_contacts_user_id ON property_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_billing ON property_contacts(is_billing_contact) WHERE is_billing_contact = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_contacts_primary ON property_contacts(is_primary_contact) WHERE is_primary_contact = TRUE;

-- Enable RLS
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_contacts
CREATE POLICY "Users can view property contacts they own"
  ON property_contacts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert property contacts they own"
  ON property_contacts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update property contacts they own"
  ON property_contacts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete property contacts they own"
  ON property_contacts FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_contacts_updated_at
  BEFORE UPDATE ON property_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_property_contacts_updated_at();

-- Add contact_role column to invoices and estimates for tracking who received the document
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS contact_role TEXT CHECK (contact_role IN ('owner', 'tenant', 'property_manager', 'emergency_contact', NULL));

ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS contact_role TEXT CHECK (contact_role IN ('owner', 'tenant', 'property_manager', 'emergency_contact', NULL));

-- Comment on table and columns for documentation
COMMENT ON TABLE property_contacts IS 'Junction table linking clients to properties with specific roles (owner, tenant, property_manager, emergency_contact)';
COMMENT ON COLUMN property_contacts.role IS 'The role of this contact for the property: owner, tenant, property_manager, or emergency_contact';
COMMENT ON COLUMN property_contacts.is_billing_contact IS 'Whether this contact should receive billing/payment communications';
COMMENT ON COLUMN property_contacts.is_primary_contact IS 'Whether this is the primary contact for the property';
COMMENT ON COLUMN property_contacts.receives_invoices IS 'Whether this contact should receive invoice notifications';
COMMENT ON COLUMN property_contacts.receives_estimates IS 'Whether this contact should receive estimate notifications';
COMMENT ON COLUMN property_contacts.can_approve_work IS 'Whether this contact has authority to approve work on the property';
