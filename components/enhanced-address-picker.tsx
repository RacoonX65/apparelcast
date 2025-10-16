"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Loader2, Building2, Store, Edit3 } from "lucide-react"
import { addressSearchService, AddressSearchResult, ParsedAddress } from "@/lib/address-search"
import { googlePlacesService, GooglePlaceResult } from "@/lib/google-places-service"
import { placesCacheService, CacheSearchResult } from "@/lib/places-cache-service"
import { ManualAddressInput } from "@/components/manual-address-input"
import { cn } from "@/lib/utils"

interface EnhancedAddressPickerProps {
  onAddressSelect: (address: ParsedAddress) => void
  placeholder?: string
  label?: string
  initialValue?: string
  className?: string
}

export function EnhancedAddressPicker({
  onAddressSelect,
  placeholder = "Search for mall, store, or address...",
  label = "Location",
  initialValue = "",
  className = ""
}: EnhancedAddressPickerProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [searchResults, setSearchResults] = useState<(AddressSearchResult | GooglePlaceResult | CacheSearchResult)[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<ParsedAddress | null>(null)
  const [searchType, setSearchType] = useState<'all' | 'malls' | 'stores'>('all')
  const [useGooglePlaces, setUseGooglePlaces] = useState(false) // Temporarily disabled - using OpenStreetMap fallback
  const [cacheHitCount, setCacheHitCount] = useState(0) // Track cache usage
  const [showManualInput, setShowManualInput] = useState(false) // Toggle for manual address input
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.length >= 3) {
        performSearch(inputValue)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue, searchType])

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (query: string) => {
    if (!query || query.length < 3) return

    setIsSearching(true)
    try {
      let results: (AddressSearchResult | GooglePlaceResult | CacheSearchResult)[] = []
      
      // First, check cache for existing results
      const cachedResults = await placesCacheService.search(query, searchType)
      
      if (cachedResults.length > 0) {
        // Use cached results and increment cache hit counter
        results = cachedResults
        setCacheHitCount(prev => prev + 1)
        console.log(`Cache hit! Found ${cachedResults.length} cached results for "${query}"`)
      } else {
        // No cache results, proceed with API calls
        console.log(`Cache miss for "${query}", calling APIs...`)
        
        // Check if Google Places is available and preferred
        const isGoogleAvailable = googlePlacesService.isAvailable()
        
        if (useGooglePlaces && isGoogleAvailable) {
          // Use Google Places API for better results
          const sessionToken = googlePlacesService.generateSessionToken()
          
          switch (searchType) {
            case 'malls':
              results = await googlePlacesService.searchMalls(query, sessionToken)
              break
            case 'stores':
              results = await googlePlacesService.searchStores(query, sessionToken)
              break
            default:
              // Search all types with Google Places
              results = await googlePlacesService.autocomplete(query, sessionToken)
              break
          }
          
          // Cache the Google Places results for future use
          if (results.length > 0) {
            const cachePromises = (results as GooglePlaceResult[]).map(result => 
              placesCacheService.cacheGooglePlace(result, query, searchType)
            )
            await Promise.all(cachePromises)
            console.log(`Cached ${results.length} Google Places results for "${query}"`)
          }
        } else {
          // Fallback to OpenStreetMap
          switch (searchType) {
            case 'malls':
              results = await addressSearchService.searchMalls(query)
              break
            case 'stores':
              results = await addressSearchService.searchStores(query)
              break
            default:
              // Search all types - combine regular search with mall and store searches
              const [regularResults, mallResults, storeResults] = await Promise.all([
                addressSearchService.searchAddresses(query),
                addressSearchService.searchMalls(query),
                addressSearchService.searchStores(query)
              ])
              
              // Combine and deduplicate results
              const allResults = [...regularResults, ...mallResults, ...storeResults]
              const uniqueResults = allResults.filter((result, index, self) => 
                index === self.findIndex(r => r.place_id === result.place_id)
              )
              
              results = uniqueResults.sort((a, b) => (b.importance || 0) - (a.importance || 0))
              break
          }
        }
      }
      
      setSearchResults(results)
      setShowResults(results.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultSelect = async (result: AddressSearchResult | GooglePlaceResult | CacheSearchResult) => {
    try {
      let parsedAddress: ParsedAddress
      
      // Check if it's a cached result
      if ('structured_formatting' in result && 'name' in result && 'formatted_address' in result) {
        // It's a cached result - check if we have detailed info or need to fetch
        const cachedPlace = await placesCacheService.getPlaceDetails(result.place_id)
        
        if (cachedPlace && cachedPlace.latitude && cachedPlace.longitude) {
          // Use cached detailed information
          parsedAddress = {
            street_address: cachedPlace.route || '',
            city: cachedPlace.locality || '',
            state: cachedPlace.administrative_area_level_1 || '',
            country: cachedPlace.country || '',
            postal_code: cachedPlace.postal_code || '',
            full_address: cachedPlace.formatted_address,
            latitude: cachedPlace.latitude,
            longitude: cachedPlace.longitude
          }
          setInputValue(cachedPlace.name)
          console.log('Used cached place details for:', cachedPlace.name)
        } else {
          // Fallback to Google Places API for detailed info
          const sessionToken = googlePlacesService.generateSessionToken()
          const placeDetails = await googlePlacesService.getPlaceDetails(result.place_id, sessionToken)
          if (placeDetails) {
            parsedAddress = googlePlacesService.parseGooglePlace(placeDetails)
            setInputValue(result.structured_formatting.main_text)
            
            // Cache the detailed result for future use
            await placesCacheService.cacheGooglePlaceDetails(
              placeDetails,
              inputValue,
              searchType
            )
            console.log('Cached detailed place info for:', result.structured_formatting.main_text)
          } else {
            throw new Error('Could not get place details')
          }
        }
      }
      // Check if it's a Google Places result
      else if ('place_id' in result && 'structured_formatting' in result) {
        // It's a Google Places result
        const googleResult = result as GooglePlaceResult
        const sessionToken = googlePlacesService.generateSessionToken()
        const placeDetails = await googlePlacesService.getPlaceDetails(googleResult.place_id, sessionToken)
        if (placeDetails) {
          parsedAddress = googlePlacesService.parseGooglePlace(placeDetails)
          setInputValue(googleResult.structured_formatting.main_text)
          
          // Cache this selection for future use
          await placesCacheService.cacheGooglePlaceDetails(
            placeDetails,
            inputValue,
            searchType
          )
          console.log('Cached selected place:', googleResult.structured_formatting.main_text)
        } else {
          throw new Error('Could not get place details')
        }
      } else {
        // It's an OpenStreetMap result
        const osmResult = result as AddressSearchResult
        parsedAddress = addressSearchService.parseAddressResult(osmResult)
        setInputValue(osmResult.display_name)
      }
      
      setSelectedAddress(parsedAddress)
      setShowResults(false)
      onAddressSelect(parsedAddress)
    } catch (error) {
      console.error('Error selecting result:', error)
    }
  }

  const getResultIcon = (result: AddressSearchResult | GooglePlaceResult | CacheSearchResult) => {
    let displayName = ''
    let types: string[] = []
    
    if ('structured_formatting' in result) {
      // Google Places or cached result
      displayName = result.structured_formatting.main_text.toLowerCase()
      types = result.types || []
    } else {
      // OpenStreetMap result
      displayName = result.display_name.toLowerCase()
    }
    
    // Check for malls
    if (displayName.includes('mall') || displayName.includes('shopping') || 
        types.includes('shopping_mall')) {
      return <Building2 className="h-4 w-4 text-blue-500" />
    }
    
    // Check for stores
    if (displayName.includes('store') || displayName.includes('shop') || 
        types.some(type => type.includes('store') || type === 'establishment')) {
      return <Store className="h-4 w-4 text-green-500" />
    }
    
    return <MapPin className="h-4 w-4 text-gray-500" />
  }

  const getResultType = (result: AddressSearchResult | GooglePlaceResult | CacheSearchResult) => {
    let displayName = ''
    let types: string[] = []
    
    if ('structured_formatting' in result) {
      // Google Places or cached result
      displayName = result.structured_formatting.main_text.toLowerCase()
      types = result.types || []
    } else {
      // OpenStreetMap result
      displayName = result.display_name.toLowerCase()
    }
    
    // Check for malls
    if (displayName.includes('mall') || displayName.includes('shopping') || 
        types.includes('shopping_mall')) {
      return 'Mall'
    }
    
    // Check for stores
    if (displayName.includes('store') || displayName.includes('shop') || 
        types.some(type => type.includes('store') || type === 'establishment')) {
      return 'Store'
    }
    
    return 'Address'
  }

  const getResultDisplayName = (result: AddressSearchResult | GooglePlaceResult | CacheSearchResult) => {
    if ('structured_formatting' in result) {
      // Google Places or cached result
      return {
        main: result.structured_formatting.main_text,
        secondary: result.structured_formatting.secondary_text
      }
    } else {
      // OpenStreetMap result
      const parts = result.display_name.split(',')
      return {
        main: parts[0],
        secondary: parts.slice(1).join(',').trim()
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor="enhanced-address-input" className="text-sm font-medium mb-2 block">
          {label}
        </Label>
      )}
      
      {/* Search Type Buttons */}
      <div className="flex gap-1 mb-2">
        <Button
          type="button"
          variant={searchType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('all')}
          className="text-xs"
          disabled={showManualInput}
        >
          All
        </Button>
        <Button
          type="button"
          variant={searchType === 'malls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('malls')}
          className="text-xs"
          disabled={showManualInput}
        >
          <Building2 className="h-3 w-3 mr-1" />
          Malls
        </Button>
        <Button
          type="button"
          variant={searchType === 'stores' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('stores')}
          className="text-xs"
          disabled={showManualInput}
        >
          <Store className="h-3 w-3 mr-1" />
          Stores
        </Button>
        <Button
          type="button"
          variant={showManualInput ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs ml-auto"
        >
          <Edit3 className="h-3 w-3 mr-1" />
          Manual
        </Button>
      </div>

      {/* Conditional Content: Search Input or Manual Input */}
      {showManualInput ? (
        <ManualAddressInput
          onAddressSelect={(address) => {
            setSelectedAddress(address)
            onAddressSelect(address)
            setShowManualInput(false) // Hide manual input after selection
          }}
          placeholder="Enter your address details"
          label=""
          className="mt-2"
        />
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Input
              ref={inputRef}
              id="enhanced-address-input"
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true)
                }
              }}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </>
      )}

      {/* Search Results */}
      {!showManualInput && showResults && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {searchResults.map((result, index) => {
              const displayInfo = getResultDisplayName(result)
              return (
                <div
                  key={result.place_id || index}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getResultIcon(result)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayInfo.main}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {getResultType(result)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {displayInfo.secondary}
                    </p>
                    {'address' in result && result.address && (
                      <p className="text-xs text-gray-400 mt-1">
                        {result.address.city || result.address.suburb}, {result.address.state}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-800">{selectedAddress.street_address}</p>
              <p className="text-green-600">
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cache Statistics (Development Mode) */}
      {process.env.NODE_ENV === 'development' && cacheHitCount > 0 && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <p className="text-xs text-blue-700">
              Cache hits: {cacheHitCount} (Saving Google Places API calls!)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}