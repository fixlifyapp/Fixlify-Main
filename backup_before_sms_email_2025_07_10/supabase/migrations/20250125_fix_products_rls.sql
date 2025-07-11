-- Fix products RLS policies and ensure proper user_id handling

-- First ensure the products table has the user_id column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Update existing products to have user_id from created_by if not set
UPDATE products 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- For products without created_by, try to set from the first user (for testing)
-- In production, you'd want to handle this differently
UPDATE products 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Create new policies that handle user_id properly
CREATE POLICY "Users can view their products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Fix the niche data loading to properly set user_id
CREATE OR REPLACE FUNCTION ensure_niche_products_have_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set, use the current user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  
  -- If created_by is not set, use user_id
  IF NEW.created_by IS NULL THEN
    NEW.created_by = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_products_user_id_trigger ON products;

-- Create trigger to ensure user_id is always set
CREATE TRIGGER ensure_products_user_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION ensure_niche_products_have_user_id();

-- Grant necessary permissions
GRANT ALL ON products TO authenticated; 