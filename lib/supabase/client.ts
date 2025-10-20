import { createBrowserClient } from "@supabase/ssr"
import { apiCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

export function createClient() {
  // Use the environment variables directly - Next.js will replace these at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Creating Supabase browser client with URL:', supabaseUrl)
  console.log('Anon key present:', !!supabaseAnonKey)
  
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
          console.log(`Cache hit for ${cacheKey}`)
          return Promise.resolve(cached) as any
        }
        
        // Wrap the original then method
        const originalThen = selectQuery.then.bind(selectQuery)
        selectQuery.then = function(onfulfilled: any, onrejected: any) {
          return originalThen((result: any) => {
            if (result && !result.error) {
              // Cache successful results for 5 minutes
              apiCache.set(cacheKey, result, CACHE_TTL.MEDIUM)
              console.log(`Cached result for ${cacheKey}`)
            }
            return onfulfilled ? onfulfilled(result) : result
          }, onrejected)
        } as any
      }
      
      return selectQuery as any
    }
    
    return query
  }
  
  return client
}
