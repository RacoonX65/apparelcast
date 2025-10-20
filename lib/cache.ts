// Client-side caching utilities for API calls

interface CacheEntry<T> {
  data: T
  timestamp: number
  expires: number
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes default

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiCache = new ApiCache()

// Cache keys for common API calls
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  PRODUCTS: (page: number, filters: string) => `products_${page}_${filters}`,
  PRODUCT_DETAIL: (id: string) => `product_${id}`,
  CART: 'cart',
  WISHLIST: 'wishlist',
  USER_PROFILE: 'user_profile',
  ORDERS: 'orders',
  BULK_PRICING: (productId: string) => `bulk_pricing_${productId}`,
  INVENTORY: (productId: string) => `inventory_${productId}`,
  REVIEWS: (productId: string) => `reviews_${productId}`,
  RELATED_PRODUCTS: (productId: string) => `related_${productId}`
} as const

// Helper function to create cache key from search params
export function createProductsCacheKey(page: number, searchParams: Record<string, string>): string {
  const filters = Object.entries(searchParams)
    .filter(([key]) => key !== 'page')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('_')
  
  return CACHE_KEYS.PRODUCTS(page, filters)
}

// TTL values for different types of data
export const CACHE_TTL = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000,  // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const