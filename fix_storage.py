import os

filepath = 'database/security_audit_fix.sql'
with open(filepath, 'a', encoding='utf-8') as f:
    f.write('''

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
''')
