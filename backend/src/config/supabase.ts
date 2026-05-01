import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

export const hasSupabaseConfig = (): boolean => {
  return Boolean(supabaseUrl && supabaseSecretKey);
};

export const supabaseAdmin = hasSupabaseConfig()
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
