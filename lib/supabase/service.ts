import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase service role client for admin operations
 * This client bypasses Row Level Security (RLS) policies
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}