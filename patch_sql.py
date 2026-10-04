import os

filepath = 'database/security_audit_fix.sql'
with open(filepath, 'a', encoding='utf-8') as f:
    f.write('''

-- 6. Allow Profile Insertion on Registration
-- Since we are manually creating profiles via server action after Supabase auth,
-- we must grant users the ability to insert their own profile row.
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
''')
