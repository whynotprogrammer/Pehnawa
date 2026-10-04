import os

filepath = 'components/auth/RegisterForm.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { createClient } from '@/lib/supabase/client';",
    "import { createClient } from '@/lib/supabase/client';\nimport { registerWithRole } from '@/app/actions/auth';"
)

target = '''    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // In a real app, you might want to use a trigger to create the profile, 
        // or do it securely here since RLS allows own profile creation or it's handled via trigger.
        // For demonstration we'll just show success. 
        setSuccess('Account created successfully! You can now log in.');
        router.refresh(); // Triggers middleware if automatically logged in
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }'''

replacement = '''    try {
      await registerWithRole(email, password, role);
      setSuccess('Account created successfully! You can now log in.');
      router.refresh();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Invalid Supabase configuration. Please check your .env.local file. (Failed to connect)');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }'''

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
