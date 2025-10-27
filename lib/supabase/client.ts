import { createBrowserClient } from "@supabase/ssr"
import { apiCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

// Use the environment variables directly - Next.js will replace these at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Initialize the client only once
function initializeClient() {
  // In development, check if client exists on window (survives HMR)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (window as any).__supabaseClient) {
    return (window as any).__supabaseClient
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Add caching interceptor - simplified approach to avoid TypeScript issues
  const originalFrom = client.from.bind(client)

  client.from = (table: string) => {
    const query = originalFrom(table)
    const originalSelect = query.select.bind(query)

    query.select = (columns: any = '*', options: any = {}) => {
      const selectQuery = originalSelect(columns, options)

      // Add caching for non-head queries
      if (!options.head && !options.count) {
        const cacheKey = `${table}_${columns}_${Date.now()}`
        const cached = apiCache.get(cacheKey)

        if (cached) {
          return Promise.resolve(cached) as any
        }

        // Wrap the original then method
        const originalThen = selectQuery.then.bind(selectQuery)
        selectQuery.then = function(onfulfilled: any, onrejected: any) {
          return originalThen((result: any) => {
            if (result && !result.error) {
              // Cache successful results for 5 minutes
              apiCache.set(cacheKey, result, CACHE_TTL.MEDIUM)
            }
            return onfulfilled ? onfulfilled(result) : result
          }, onrejected)
        } as any
      }

      return selectQuery as any
    }

    return query
  }

  // In development, also store on window to survive HMR
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__supabaseClient = client
  }

  return client
}

// Initialize and export the client directly
export const supabase = initializeClient()

// Keep the createClient function for backward compatibility during migration
// This should be removed once all components are updated
export function createClient() {
  return supabase
}
