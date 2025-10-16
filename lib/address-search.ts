// Address search service using OpenStreetMap Nominatim API
export interface AddressSearchResult {
  display_name: string
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  place_id: string
  type: string
  importance: number
}

export interface ParsedAddress {
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  full_address: string
  latitude: number
  longitude: number
}

class AddressSearchService {
  private baseUrl = 'https://nominatim.openstreetmap.org'
  
  // Search for addresses with autocomplete
  async searchAddresses(query: string, countryCode: string = 'za'): Promise<AddressSearchResult[]> {
    if (!query || query.length < 3) {
      return []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        countrycodes: countryCode,
        'accept-language': 'en'
      })

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'User-Agent': 'ApparelCast-PEP-Locations/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const results: AddressSearchResult[] = await response.json()
      
      // Filter and sort results by relevance
      return results
        .filter(result => result.address && (result.address.city || result.address.suburb))
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 8) // Limit to top 8 results
    } catch (error) {
      console.error('Address search error:', error)
      return []
    }
  }

  // Parse search result into standardized address format
  parseAddressResult(result: AddressSearchResult): ParsedAddress {
    const addr = result.address
    
    // Build street address from components
    const streetParts = []
    if (addr.house_number) streetParts.push(addr.house_number)
    if (addr.road) streetParts.push(addr.road)
    
    const street_address = streetParts.length > 0 
      ? streetParts.join(' ')
      : result.display_name.split(',')[0].trim()

    // Get city (prefer city over suburb)
    const city = addr.city || addr.suburb || 'Unknown'
    
    // Get state/province
    const state = addr.state || 'Unknown'
    
    // Get postal code
    const postal_code = addr.postcode || ''
    
    // Get country
    const country = addr.country || 'South Africa'

    return {
      street_address,
      city,
      state,
      postal_code,
      country,
      full_address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }
  }

  // Search specifically for malls and shopping centers
  async searchMalls(query: string, countryCode: string = 'za'): Promise<AddressSearchResult[]> {
    const mallQuery = `${query} mall shopping center centre`
    return this.searchAddresses(mallQuery, countryCode)
  }

  // Search for stores by name
  async searchStores(query: string, countryCode: string = 'za'): Promise<AddressSearchResult[]> {
    const storeQuery = `${query} store shop`
    return this.searchAddresses(storeQuery, countryCode)
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(lat: number, lon: number): Promise<ParsedAddress | null> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'en'
      })

      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        headers: {
          'User-Agent': 'ApparelCast-PEP-Locations/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`)
      }

      const result: AddressSearchResult = await response.json()
      return this.parseAddressResult(result)
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }
}

export const addressSearchService = new AddressSearchService()