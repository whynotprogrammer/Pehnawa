-- security_audit_fix.sql

-- 1. Fix Orders and Order Items Insert Permissions (Missing in original schema)
CREATE POLICY "Customers can insert own orders" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own order items" ON order_items 
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

-- 2. Fix Business Data Isolation for Donations
-- Drop the overly permissive business policies
DROP POLICY IF EXISTS "Businesses can manage all donations" ON donations;

-- Create secure, isolated policies
-- Businesses can view donations in the unassigned pool or assigned to them
CREATE POLICY "Businesses can view isolated donations" ON donations 
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()) OR business_id IS NULL
  );

-- Businesses can only update donations in the pool (to claim them) or already assigned to them
CREATE POLICY "Businesses can update isolated donations" ON donations 
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()) OR business_id IS NULL
  );

-- 3. Fix Reward Transactions Business Isolation
DROP POLICY IF EXISTS "Businesses can manage rewards" ON reward_transactions;

-- Businesses can only view/insert rewards linked to donations they processed
CREATE POLICY "Businesses manage isolated rewards" ON reward_transactions 
  FOR ALL USING (
    donation_id IN (
      SELECT id FROM donations WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

-- 4. Secure Stock Reduction via SECURITY DEFINER Function
-- Since customers cannot be granted UPDATE privileges on the products table (as that would allow them to alter prices),
-- we create a secure RPC function that safely decrements stock if there is enough available.
CREATE OR REPLACE FUNCTION decrement_stock(p_id UUID, q INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as database admin
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Lock the row to prevent race conditions during checkout
  SELECT stock_quantity INTO current_stock FROM products WHERE id = p_id FOR UPDATE;
  
  IF current_stock >= q THEN
    UPDATE products SET stock_quantity = stock_quantity - q WHERE id = p_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


-- 5. Secure Storage Policies (Product and Donation Images)
-- We assume buckets 'product_images' and 'donation_images' exist.
-- To allow public read but restrict uploads to authenticated users:
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Public Read Donation Images" ON storage.objects FOR SELECT USING (bucket_id = 'donation_images');

-- Businesses can upload product images
CREATE POLICY "Businesses can upload product images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product_images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'business_owner')
);

-- Customers can upload donation images
CREATE POLICY "Customers can upload donation images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'donation_images' AND auth.uid() = owner
);


-- 6. Allow Profile Insertion on Registration
-- Since we are manually creating profiles via server action after Supabase auth,
-- we must grant users the ability to insert their own profile row.
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
