-- =====================================================
-- Organization Document Settings Table
-- =====================================================
-- Stores organization-level defaults for estimate/invoice
-- documents including footer templates, terms, and branding.
-- =====================================================

-- Create organization_document_settings table
CREATE TABLE IF NOT EXISTS organization_document_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Footer Settings
  footer_thank_you_message TEXT DEFAULT 'Thank you for choosing {{company_name}}!',
  footer_confidentiality_text TEXT DEFAULT 'This {{document_type}} contains confidential information.',
  footer_contact_text TEXT DEFAULT 'For questions, contact us at {{phone}} or {{email}}.',
  footer_show_website BOOLEAN DEFAULT true,

  -- Estimate Settings
  estimate_validity_days INTEGER DEFAULT 30,
  estimate_terms_text TEXT DEFAULT 'This estimate is valid for {{validity_days}} days from the issue date.',

  -- Invoice Settings
  invoice_payment_terms TEXT DEFAULT 'Payment is due within 30 days of the invoice date.',
  invoice_late_fee_text TEXT,

  -- General Settings
  default_tax_rate DECIMAL(5,2) DEFAULT 13.00,
  show_company_logo BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one settings row per organization
  UNIQUE(organization_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_doc_settings_org_id
ON organization_document_settings(organization_id);

-- Enable RLS
ALTER TABLE organization_document_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using profiles.organization_id instead of organization_members)
CREATE POLICY "Users can view document settings in their organization"
ON organization_document_settings FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
    AND organization_id IS NOT NULL
  )
);

CREATE POLICY "Admins can insert document settings"
ON organization_document_settings FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND organization_id IS NOT NULL
  )
);

CREATE POLICY "Admins can update document settings"
ON organization_document_settings FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND organization_id IS NOT NULL
  )
);

CREATE POLICY "Admins can delete document settings"
ON organization_document_settings FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND organization_id IS NOT NULL
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_organization_document_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_document_settings_timestamp
  BEFORE UPDATE ON organization_document_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_document_settings_updated_at();

-- Add comment
COMMENT ON TABLE organization_document_settings IS
'Stores organization-level default settings for estimates and invoices including footer templates and terms.';
