import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Use the environment variables directly - Next.js will replace these at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Creating Supabase browser client with URL:', supabaseUrl)
  console.log('Anon key present:', !!supabaseAnonKey)
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
