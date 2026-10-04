-- migration_donations.sql

-- 1. Create temporary enum and alter existing donations table
ALTER TYPE donation_status RENAME TO donation_status_old;
CREATE TYPE donation_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SORTING', 'ALLOCATED', 'COMPLETED', 'REJECTED');

-- 2. Update donations table
ALTER TABLE donations
  ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  ADD COLUMN total_items INTEGER DEFAULT 0,
  ADD COLUMN approved_items INTEGER DEFAULT 0,
  ADD COLUMN rejected_items INTEGER DEFAULT 0,
  ADD COLUMN notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Alter status column to use new enum safely
ALTER TABLE donations ALTER COLUMN status DROP DEFAULT;
ALTER TABLE donations ALTER COLUMN status TYPE donation_status USING (
  CASE status::text
    WHEN 'pending' THEN 'SUBMITTED'::donation_status
    WHEN 'approved' THEN 'APPROVED'::donation_status
    WHEN 'rejected' THEN 'REJECTED'::donation_status
    ELSE 'SUBMITTED'::donation_status
  END
);
ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'SUBMITTED'::donation_status;

DROP TYPE donation_status_old;

-- 3. Safely drop old flat columns from donations
ALTER TABLE donations 
  DROP COLUMN clothing_type,
  DROP COLUMN condition,
  DROP COLUMN description,
  DROP COLUMN image_urls,
  DROP COLUMN rejection_reason;

-- 4. Create new enums
CREATE TYPE destination_type AS ENUM ('THRIFT_STORE', 'CHARITY', 'UPCYCLING', 'TEXTILE_RECOVERY', 'REJECTED');

-- 5. Create donation_items table
CREATE TABLE donation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE NOT NULL,
    clothing_type TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    size TEXT,
    condition condition_type NOT NULL,
    description TEXT,
    image_urls TEXT[],
    destination destination_type,
    destination_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create donation_allocations table
CREATE TABLE donation_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE NOT NULL,
    donation_item_id UUID REFERENCES donation_items(id) ON DELETE CASCADE NOT NULL,
    destination destination_type NOT NULL,
    quantity INTEGER DEFAULT 1,
    organization_name TEXT,
    intended_use TEXT,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. Add donation_item_id to products for traceability
ALTER TABLE products ADD COLUMN donation_item_id UUID REFERENCES donation_items(id) ON DELETE SET NULL;

-- 8. Row Level Security (RLS) Policies

ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_allocations ENABLE ROW LEVEL SECURITY;

-- Customers can view their own donation items
CREATE POLICY "Customers view own donation items" ON donation_items
  FOR SELECT USING (
    donation_id IN (SELECT id FROM donations WHERE customer_id = auth.uid())
  );

-- Customers can insert their own donation items
CREATE POLICY "Customers insert own donation items" ON donation_items
  FOR INSERT WITH CHECK (
    donation_id IN (SELECT id FROM donations WHERE customer_id = auth.uid())
  );

-- Business owners can view items for donations assigned to them or unassigned
CREATE POLICY "Business view donation items" ON donation_items
  FOR SELECT USING (
    donation_id IN (SELECT id FROM donations WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
    OR 
    donation_id IN (SELECT id FROM donations WHERE business_id IS NULL)
  );

-- Business owners can update assigned items
CREATE POLICY "Business update assigned donation items" ON donation_items
  FOR UPDATE USING (
    donation_id IN (SELECT id FROM donations WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  );

-- Allocations Policies
CREATE POLICY "Customers view own allocations" ON donation_allocations
  FOR SELECT USING (
    donation_id IN (SELECT id FROM donations WHERE customer_id = auth.uid())
  );

CREATE POLICY "Business manage allocations" ON donation_allocations
  FOR ALL USING (
    donation_id IN (SELECT id FROM donations WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  );
