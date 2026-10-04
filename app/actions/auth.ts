// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function registerWithRole(email, password, role) {
  // If we have a service role key, we can use it to securely create profiles bypassing RLS.
  // Otherwise, we rely on standard client which requires an INSERT policy on profiles.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl.includes('your-project-id.supabase.co')) {
    throw new Error('Invalid Supabase configuration. Please replace the placeholder in your .env.local file with your real Supabase project URL.')
  }

  const supabase = await createClient()

  // 1. Sign up the user via Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role
      }
    }
  })

  if (signUpError) {
    throw new Error(signUpError.message)
  }

  if (!data.user) {
    throw new Error('Failed to create user account.')
  }

  // 2. Insert Profile
  let profileError = null;
  
  if (serviceRoleKey) {
    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { error } = await adminSupabase.from('profiles').insert({
      id: data.user.id,
      role: role
    })
    profileError = error
  } else {
    // Attempt standard insert (requires INSERT policy on profiles where auth.uid() = id)
    const { error } = await supabase.from('profiles').insert({
      id: data.user.id,
      role: role
    })
    profileError = error
  }

  if (profileError) {
    // If it's an RLS violation, the error code is 42501
    if (profileError.code === '42501') {
      throw new Error('Profile creation failed due to database permissions. Please add an INSERT policy for the profiles table or provide a SUPABASE_SERVICE_ROLE_KEY.')
    }
    throw new Error('Profile creation failed: ' + profileError.message)
  }

  return { success: true }
}
