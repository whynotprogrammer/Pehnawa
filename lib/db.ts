import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase URL or Publishable Key is missing. Check your .env variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabasePublishableKey || ''
);
