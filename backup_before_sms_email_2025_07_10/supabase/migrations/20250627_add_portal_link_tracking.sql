-- Add portal_link_included column to estimate_communications if it doesn't exist
ALTER TABLE estimate_communications 
ADD COLUMN IF NOT EXISTS portal_link_included BOOLEAN DEFAULT false;

-- Add portal_link_included column to invoice_communications if it doesn't exist
ALTER TABLE invoice_communications 
ADD COLUMN IF NOT EXISTS portal_link_included BOOLEAN DEFAULT false;

-- Update existing records to indicate portal links were included (assuming they were)
UPDATE estimate_communications 
SET portal_link_included = true 
WHERE content LIKE '%hub.fixlify.app%' OR content LIKE '%portal.fixlify.app%';

UPDATE invoice_communications 
SET portal_link_included = true 
WHERE content LIKE '%hub.fixlify.app%' OR content LIKE '%portal.fixlify.app%';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_estimate_communications_portal 
ON estimate_communications(portal_link_included, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_communications_portal 
ON invoice_communications(portal_link_included, created_at DESC);
