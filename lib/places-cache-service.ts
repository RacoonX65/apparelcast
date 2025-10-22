import { supabase } from '@/lib/supabase/client'
import { GooglePlaceResult, GooglePlaceDetails } from './google-places-service'

export interface CachedPlace {
  id: string
  search_query: string
  search_type: 'all' | 'malls' | 'stores'
  place_id: string
  name: string
  formatted_address: string
  latitude?: number
  longitude?: number
  place_types?: string[]
  business_status?: string
  rating?: number
  user_ratings_total?: number
  phone_number?: string
  website?: string
  street_number?: string
  route?: string
  locality?: string
  administrative_area_level_1?: string
  administrative_area_level_2?: string
  country?: string
  postal_code?: string
  source: string
  search_count: number
  last_searched_at: string
  created_at: string
  updated_at: string
}

export interface CacheSearchResult {
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  types: string[]
  name: string
  formatted_address: string
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

class PlacesCacheService {
  private supabase = supabase
  private static instance: PlacesCacheService

  static getInstance(): PlacesCacheService {
    if (!PlacesCacheService.instance) {
      PlacesCacheService.instance = new PlacesCacheService()
    }
    return PlacesCacheService.instance
  }

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Search for cached places by query and type
   */
  async search(
    query: string, 
    searchType: 'all' | 'malls' | 'stores' = 'all',
    limit: number = 8
  ): Promise<CacheSearchResult[]> {
    try {
      let queryBuilder = this.supabase
        .from('places_cache')
        .select('*')
        .or(`search_query.ilike.%${query}%,name.ilike.%${query}%,formatted_address.ilike.%${query}%`)

      // Apply type filters
      if (searchType === 'malls') {
        queryBuilder = queryBuilder.or(`place_types.cs.["shopping_mall"],name.ilike.%mall%,name.ilike.%shopping%`)
      } else if (searchType === 'stores') {
        queryBuilder = queryBuilder.or(`place_types.cs.["store"],place_types.cs.["establishment"]`)
      }

      const { data, error } = await queryBuilder
        .order('search_count', { ascending: false })
        .order('last_searched_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Cache search error:', error)
        return []
      }

      // Update search counts for found results
      if (data && data.length > 0) {
        const updatePromises = data.map((place: CachedPlace) => this.incrementSearchCount(place.id))
        await Promise.all(updatePromises)
      }

      return (data || []).map((place: CachedPlace) => this.convertCachedPlaceToSearchResult(place))
    } catch (error) {
      console.error('Cache search error:', error)
      return []
    }
  }

  /**
   * Get cached place details by place_id
   */
  async getPlaceDetails(placeId: string): Promise<CachedPlace | null> {
    try {
      const { data, error } = await this.supabase
        .from('places_cache')
        .select('*')
        .eq('place_id', placeId)
        .single()

      if (error || !data) {
        return null
      }

      // Update search count
      await this.incrementSearchCount(data.id)

      return data
    } catch (error) {
      console.error('Error getting cached place details:', error)
      return null
    }
  }

  /**
   * Cache a Google Places search result
   */
  async cacheGooglePlaceResult(
    searchQuery: string,
    searchType: 'all' | 'malls' | 'stores',
    googleResult: GooglePlaceResult,
    placeDetails?: GooglePlaceDetails
  ): Promise<void> {
    try {
      const normalizedQuery = searchQuery.toLowerCase().trim()

      // Check if place already exists
      const existing = await this.getCachedPlaceByPlaceId(googleResult.place_id)
      
      if (existing) {
        // Update existing record
        await this.updateCachedPlace(existing.id, searchQuery, searchType)
        return
      }

      // Parse address components from place details
      const addressComponents = placeDetails?.address_components || []
      const geometry = placeDetails?.geometry

      const cacheData = {
        search_query: normalizedQuery,
        search_type: searchType,
        place_id: googleResult.place_id,
        name: googleResult.structured_formatting.main_text,
        formatted_address: placeDetails?.formatted_address || googleResult.description || '',
        latitude: geometry?.location?.lat,
        longitude: geometry?.location?.lng,
        place_types: googleResult.types || placeDetails?.types || [],
        business_status: placeDetails?.business_status,
        rating: placeDetails?.rating,
        user_ratings_total: undefined, // Not available in GooglePlaceDetails
        phone_number: placeDetails?.formatted_phone_number,
        website: undefined, // Not available in GooglePlaceDetails
        street_number: this.getAddressComponent(addressComponents, 'street_number'),
        route: this.getAddressComponent(addressComponents, 'route'),
        locality: this.getAddressComponent(addressComponents, 'locality'),
        administrative_area_level_1: this.getAddressComponent(addressComponents, 'administrative_area_level_1'),
        administrative_area_level_2: this.getAddressComponent(addressComponents, 'administrative_area_level_2'),
        country: this.getAddressComponent(addressComponents, 'country'),
        postal_code: this.getAddressComponent(addressComponents, 'postal_code'),
        source: 'google_places'
      }

      const { error } = await this.supabase
        .from('places_cache')
        .insert([cacheData])

      if (error) {
        console.error('Error caching place result:', error)
      }
    } catch (error) {
      console.error('Error in cacheGooglePlaceResult:', error)
    }
  }

  /**
   * Cache a single Google Place result
   */
  async cacheGooglePlace(
    place: GooglePlaceResult, 
    searchQuery: string, 
    searchType: 'all' | 'malls' | 'stores' = 'all'
  ): Promise<void> {
    try {
      const cacheData = {
        search_query: searchQuery.toLowerCase().trim(),
        search_type: searchType,
        place_id: place.place_id,
        name: place.structured_formatting?.main_text || place.description.split(',')[0],
        formatted_address: place.description,
        place_types: place.types || [],
        source: 'google_places',
        search_count: 1,
        last_searched_at: new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('places_cache')
        .upsert(cacheData, { 
          onConflict: 'place_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error caching Google Place:', error)
      }
    } catch (error) {
      console.error('Error in cacheGooglePlace:', error)
    }
  }

  /**
   * Cache detailed Google Place information
   */
  async cacheGooglePlaceDetails(
    details: GooglePlaceDetails, 
    searchQuery: string, 
    searchType: 'all' | 'malls' | 'stores' = 'all'
  ): Promise<void> {
    try {
      const addressComponents = details.address_components || []
      
      const cacheData = {
        search_query: searchQuery.toLowerCase().trim(),
        search_type: searchType,
        place_id: details.place_id,
        name: details.name,
        formatted_address: details.formatted_address,
        latitude: details.geometry?.location?.lat,
        longitude: details.geometry?.location?.lng,
        place_types: details.types || [],
        business_status: details.business_status,
        rating: details.rating,
        phone_number: details.formatted_phone_number,
        street_number: this.getAddressComponent(addressComponents, 'street_number'),
        route: this.getAddressComponent(addressComponents, 'route'),
        locality: this.getAddressComponent(addressComponents, 'locality'),
        administrative_area_level_1: this.getAddressComponent(addressComponents, 'administrative_area_level_1'),
        administrative_area_level_2: this.getAddressComponent(addressComponents, 'administrative_area_level_2'),
        country: this.getAddressComponent(addressComponents, 'country'),
        postal_code: this.getAddressComponent(addressComponents, 'postal_code'),
        source: 'google_places',
        search_count: 1,
        last_searched_at: new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('places_cache')
        .upsert(cacheData, { 
          onConflict: 'place_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error caching Google Place details:', error)
      }
    } catch (error) {
      console.error('Error in cacheGooglePlaceDetails:', error)
    }
  }

  /**
   * Cache multiple Google Places results from a search
   */
  async cacheGoogleSearchResults(
    searchQuery: string,
    searchType: 'all' | 'malls' | 'stores',
    results: GooglePlaceResult[]
  ): Promise<void> {
    try {
      // Cache each result (without detailed place info for now)
      const cachePromises = results.map(result => 
        this.cacheGooglePlaceResult(searchQuery, searchType, result)
      )
      
      await Promise.all(cachePromises)
    } catch (error) {
      console.error('Error caching search results:', error)
    }
  }

  /**
   * Get statistics about cache usage
   */
  async getCacheStats(): Promise<{
    totalPlaces: number
    totalSearches: number
    topSearches: Array<{ query: string; count: number }>
  }> {
    try {
      // Get total places
      const { count: totalPlaces } = await this.supabase
        .from('places_cache')
        .select('*', { count: 'exact', head: true })

      // Get total searches (sum of search_count)
      const { data: searchData } = await this.supabase
        .from('places_cache')
        .select('search_count')

      const totalSearches = searchData?.reduce((sum: number, item: { search_count: number }) => sum + item.search_count, 0) || 0

      // Get top searches
      const { data: topSearchData } = await this.supabase
        .from('places_cache')
        .select('search_query, search_count')
        .order('search_count', { ascending: false })
        .limit(10)

      const topSearches = topSearchData?.map((item: { search_query: string; search_count: number }) => ({
        query: item.search_query,
        count: item.search_count
      })) || []

      return {
        totalPlaces: totalPlaces || 0,
        totalSearches,
        topSearches
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return { totalPlaces: 0, totalSearches: 0, topSearches: [] }
    }
  }

  /**
   * Clean old cache entries (older than 30 days with low search count)
   */
  async cleanOldCache(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      await this.supabase
        .from('places_cache')
        .delete()
        .lt('last_searched_at', thirtyDaysAgo.toISOString())
        .lt('search_count', 3) // Only delete if searched less than 3 times
    } catch (error) {
      console.error('Error cleaning old cache:', error)
    }
  }

  // Private helper methods

  private async getCachedPlaceByPlaceId(placeId: string): Promise<CachedPlace | null> {
    try {
      const { data, error } = await this.supabase
        .from('places_cache')
        .select('*')
        .eq('place_id', placeId)
        .single()

      return error ? null : data
    } catch (error) {
      return null
    }
  }

  private async updateCachedPlace(
    id: string, 
    searchQuery: string, 
    searchType: 'all' | 'malls' | 'stores'
  ): Promise<void> {
    try {
      await this.supabase
        .from('places_cache')
        .update({
          search_query: searchQuery.toLowerCase().trim(),
          search_type: searchType,
          search_count: 1, // Use literal value instead of raw SQL
          last_searched_at: new Date().toISOString()
        })
        .eq('id', id)
    } catch (error) {
      console.error('Error updating cached place:', error)
    }
  }

  private async incrementSearchCount(id: string): Promise<void> {
    try {
      await this.supabase.rpc('increment_place_search_count', { place_cache_id: id })
    } catch (error) {
      console.error('Error incrementing search count:', error)
    }
  }

  private convertCachedPlaceToSearchResult(cached: CachedPlace): CacheSearchResult {
    return {
      place_id: cached.place_id,
      structured_formatting: {
        main_text: cached.name,
        secondary_text: cached.formatted_address
      },
      types: cached.place_types || [],
      name: cached.name,
      formatted_address: cached.formatted_address,
      geometry: cached.latitude && cached.longitude ? {
        location: {
          lat: cached.latitude,
          lng: cached.longitude
        }
      } : undefined
    }
  }

  private getAddressComponent(
    components: any[], 
    type: string
  ): string | undefined {
    const component = components.find(comp => comp.types.includes(type))
    return component?.long_name || component?.short_name
  }
}

export const placesCacheService = PlacesCacheService.getInstance()