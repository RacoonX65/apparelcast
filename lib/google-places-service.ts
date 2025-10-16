// Google Places API service for enhanced location search
export interface GooglePlaceResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  types: string[]
  terms: Array<{
    offset: number
    value: string
  }>
}

export interface GooglePlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  formatted_phone_number?: string
  business_status?: string
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  rating?: number
  types: string[]
}

export interface ParsedGoogleAddress {
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  full_address: string
  latitude: number
  longitude: number
  place_name?: string
  phone?: string
  business_status?: string
  place_id: string
}

class GooglePlacesService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/place'
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Places API key not found. Service will not work.')
    }
  }

  // Generate a unique session token for autocomplete sessions
  generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Autocomplete search with session token (FREE when used correctly)
  async autocomplete(
    input: string, 
    sessionToken: string,
    types: string[] = ['establishment', 'geocode'],
    countryCode: string = 'za'
  ): Promise<GooglePlaceResult[]> {
    if (!this.apiKey || !input || input.length < 3) {
      return []
    }

    try {
      const params = new URLSearchParams({
        input,
        key: this.apiKey,
        sessiontoken: sessionToken,
        types: types.join('|'),
        components: `country:${countryCode}`,
        language: 'en'
      })

      const response = await fetch(`${this.baseUrl}/autocomplete/json?${params}`)
      
      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }

      return data.predictions || []
    } catch (error) {
      console.error('Google Places autocomplete error:', error)
      return []
    }
  }

  // Search specifically for shopping malls
  async searchMalls(input: string, sessionToken: string, countryCode: string = 'za'): Promise<GooglePlaceResult[]> {
    const mallQuery = `${input} shopping mall center centre`
    return this.autocomplete(mallQuery, sessionToken, ['establishment'], countryCode)
  }

  // Search specifically for stores
  async searchStores(input: string, sessionToken: string, countryCode: string = 'za'): Promise<GooglePlaceResult[]> {
    const storeQuery = `${input} store shop retail`
    return this.autocomplete(storeQuery, sessionToken, ['establishment'], countryCode)
  }

  // Get detailed information about a place (uses session token to make it FREE)
  async getPlaceDetails(
    placeId: string, 
    sessionToken: string,
    fields: string[] = [
      'place_id', 'name', 'formatted_address', 'geometry', 
      'address_components', 'formatted_phone_number', 'business_status',
      'opening_hours', 'rating', 'types'
    ]
  ): Promise<GooglePlaceDetails | null> {
    if (!this.apiKey || !placeId) {
      return null
    }

    try {
      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        sessiontoken: sessionToken,
        fields: fields.join(','),
        language: 'en'
      })

      const response = await fetch(`${this.baseUrl}/details/json?${params}`)
      
      if (!response.ok) {
        throw new Error(`Place details failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }

      return data.result
    } catch (error) {
      console.error('Google Places details error:', error)
      return null
    }
  }

  // Parse Google Place details into standardized format
  parseGooglePlace(details: GooglePlaceDetails): ParsedGoogleAddress {
    const components = details.address_components || []
    
    // Extract address components
    const getComponent = (types: string[]) => {
      const component = components.find(comp => 
        comp.types.some(type => types.includes(type))
      )
      return component?.long_name || ''
    }

    const getShortComponent = (types: string[]) => {
      const component = components.find(comp => 
        comp.types.some(type => types.includes(type))
      )
      return component?.short_name || ''
    }

    // Build street address
    const streetNumber = getComponent(['street_number'])
    const route = getComponent(['route'])
    const street_address = [streetNumber, route].filter(Boolean).join(' ') || 
                          details.formatted_address.split(',')[0]

    // Get location components
    const city = getComponent(['locality', 'sublocality', 'administrative_area_level_2'])
    const state = getComponent(['administrative_area_level_1'])
    const postal_code = getComponent(['postal_code'])
    const country = getComponent(['country'])

    return {
      street_address,
      city: city || 'Unknown',
      state: getShortComponent(['administrative_area_level_1']) || state || 'Unknown',
      postal_code,
      country: country || 'South Africa',
      full_address: details.formatted_address,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      place_name: details.name,
      phone: details.formatted_phone_number,
      business_status: details.business_status,
      place_id: details.place_id
    }
  }

  // Check if the service is available
  isAvailable(): boolean {
    return !!this.apiKey
  }

  // Get usage tips for cost optimization
  getUsageTips(): string[] {
    return [
      'Always use session tokens for autocomplete + place details to get FREE usage',
      'Limit the fields requested in place details to reduce costs',
      'Implement debouncing (300ms+) to reduce unnecessary API calls',
      'Cache results locally to avoid repeated requests',
      'Use country restrictions to improve relevance and reduce costs'
    ]
  }
}

export const googlePlacesService = new GooglePlacesService()