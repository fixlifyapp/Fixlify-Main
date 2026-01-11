-- Add organization_id to products table for multi-tenant support
-- This allows all users in an organization to share the same products catalog

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE products ADD COLUMN organization_id uuid;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);

-- Update existing products to have organization_id from their creator's profile
UPDATE products p
SET organization_id = COALESCE(
  (SELECT pr.organization_id FROM profiles pr WHERE pr.id = p.user_id),
  '00000000-0000-0000-0000-000000000001'  -- Default org if no profile found
)
WHERE p.organization_id IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN products.organization_id IS 'Organization that owns this product. All users in the same organization can see this product.';
