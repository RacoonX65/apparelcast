// PEP API Integration Layer
// This file provides an abstraction layer for PEP location data
// Currently uses mock data, but can be easily switched to real API calls

import { PepLocation } from './pep-locations'

// API Configuration
const PEP_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_PEP_API_URL || 'https://api.pep.co.za',
  apiKey: process.env.PEP_API_KEY,
  timeout: 10000,
  retries: 3
}

// API Response Types
interface PepApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface PepLocationSearchParams {
  query?: string
  province?: string
  latitude?: number
  longitude?: number
  maxDistance?: number
  page?: number
  limit?: number
}

// API Service Class
export class PepApiService {
  private static instance: PepApiService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): PepApiService {
    if (!PepApiService.instance) {
      PepApiService.instance = new PepApiService()
    }
    return PepApiService.instance
  }

  private async makeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<PepApiResponse<T>> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // In production, this would make actual API calls
      // For now, we'll simulate API responses using our mock data
      const response = await this.simulateApiCall<T>(endpoint, params)
      
      // Cache the response
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() })
      
      return response
    } catch (error) {
      console.error('PEP API Error:', error)
      throw new Error('Failed to fetch PEP location data')
    }
  }

  private async simulateApiCall<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<PepApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))

    // Import mock functions dynamically to avoid circular dependencies
    const { 
      advancedSearchPepLocations, 
      getPepLocationById,
      getAllProvinces,
      PEP_LOCATIONS 
    } = await import('./pep-locations')

    switch (endpoint) {
      case '/locations/search':
        const searchResults = advancedSearchPepLocations(
          params?.query || '',
          params?.province || 'all',
          params?.latitude,
          params?.longitude,
          params?.maxDistance
        )
        
        // Simulate pagination
        const page = params?.page || 1
        const limit = params?.limit || 10
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedResults = searchResults.slice(startIndex, endIndex)
        
        return {
          success: true,
          data: paginatedResults as T,
          pagination: {
            page,
            limit,
            total: searchResults.length,
            totalPages: Math.ceil(searchResults.length / limit)
          }
        }

      case '/locations':
        return {
          success: true,
          data: PEP_LOCATIONS as T
        }

      case '/locations/provinces':
        return {
          success: true,
          data: getAllProvinces() as T
        }

      default:
        if (endpoint.startsWith('/locations/')) {
          const locationId = endpoint.split('/').pop()
          const location = getPepLocationById(locationId!)
          return {
            success: !!location,
            data: location as T,
            message: location ? undefined : 'Location not found'
          }
        }
        
        throw new Error(`Unknown endpoint: ${endpoint}`)
    }
  }

  // Public API methods
  async searchLocations(params: PepLocationSearchParams): Promise<PepApiResponse<PepLocation[]>> {
    return this.makeRequest<PepLocation[]>('/locations/search', params)
  }

  async getAllLocations(): Promise<PepApiResponse<PepLocation[]>> {
    return this.makeRequest<PepLocation[]>('/locations')
  }

  async getLocationById(id: string): Promise<PepApiResponse<PepLocation | null>> {
    return this.makeRequest<PepLocation | null>(`/locations/${id}`)
  }

  async getProvinces(): Promise<PepApiResponse<string[]>> {
    return this.makeRequest<string[]>('/locations/provinces')
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// Export singleton instance
export const pepApi = PepApiService.getInstance()

// Hook for React components (future enhancement)
export function usePepLocations(params?: PepLocationSearchParams) {
  // This would be implemented as a React hook in the future
  // For now, components can use the pepApi directly
  return {
    searchLocations: (searchParams: PepLocationSearchParams) => 
      pepApi.searchLocations(searchParams),
    getAllLocations: () => pepApi.getAllLocations(),
    getLocationById: (id: string) => pepApi.getLocationById(id),
    getProvinces: () => pepApi.getProvinces()
  }
}