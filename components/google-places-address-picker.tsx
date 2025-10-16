"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Search, Loader2, Building2, Store, AlertCircle } from "lucide-react"
import { 
  googlePlacesService, 
  GooglePlaceResult, 
  ParsedGoogleAddress 
} from "@/lib/google-places-service"
import { cn } from "@/lib/utils"

interface GooglePlacesAddressPickerProps {
  onAddressSelect: (address: ParsedGoogleAddress) => void
  placeholder?: string
  label?: string
  initialValue?: string
  className?: string
}

export function GooglePlacesAddressPicker({
  onAddressSelect,
  placeholder = "Search for mall, store, or address...",
  label = "Location",
  initialValue = "",
  className = ""
}: GooglePlacesAddressPickerProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<ParsedGoogleAddress | null>(null)
  const [searchType, setSearchType] = useState<'all' | 'malls' | 'stores'>('all')
  const [sessionToken, setSessionToken] = useState<string>('')
  const [error, setError] = useState<string>('')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Initialize session token
  useEffect(() => {
    setSessionToken(googlePlacesService.generateSessionToken())
  }, [])

  // Check if Google Places is available
  const isGooglePlacesAvailable = googlePlacesService.isAvailable()

  // Debounced search
  useEffect(() => {
    if (!isGooglePlacesAvailable) return

    const timeoutId = setTimeout(() => {
      if (inputValue.length >= 3) {
        performSearch(inputValue)
      } else {
        setSearchResults([])
        setShowResults(false)
        setError('')
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue, searchType, isGooglePlacesAvailable])

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
    if (!query || query.length < 3 || !isGooglePlacesAvailable) return

    setIsSearching(true)
    setError('')
    
    try {
      let results: GooglePlaceResult[] = []
      
      switch (searchType) {
        case 'malls':
          results = await googlePlacesService.searchMalls(query, sessionToken)
          break
        case 'stores':
          results = await googlePlacesService.searchStores(query, sessionToken)
          break
        default:
          // Search all types
          const [regularResults, mallResults, storeResults] = await Promise.all([
            googlePlacesService.autocomplete(query, sessionToken),
            googlePlacesService.searchMalls(query, sessionToken),
            googlePlacesService.searchStores(query, sessionToken)
          ])
          
          // Combine and deduplicate results
          const allResults = [...regularResults, ...mallResults, ...storeResults]
          const uniqueResults = allResults.filter((result, index, self) => 
            index === self.findIndex(r => r.place_id === result.place_id)
          )
          
          results = uniqueResults.slice(0, 8) // Limit results
          break
      }
      
      setSearchResults(results)
      setShowResults(results.length > 0)
    } catch (error) {
      console.error('Google Places search error:', error)
      setError('Search failed. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultSelect = async (result: GooglePlaceResult) => {
    setIsLoadingDetails(true)
    setShowResults(false)
    setError('')
    
    try {
      // Get detailed place information using the same session token (FREE!)
      const details = await googlePlacesService.getPlaceDetails(result.place_id, sessionToken)
      
      if (details) {
        const parsedAddress = googlePlacesService.parseGooglePlace(details)
        setSelectedAddress(parsedAddress)
        setInputValue(result.description)
        onAddressSelect(parsedAddress)
        
        // Generate new session token for next search
        setSessionToken(googlePlacesService.generateSessionToken())
      } else {
        setError('Could not get place details. Please try another location.')
      }
    } catch (error) {
      console.error('Error getting place details:', error)
      setError('Failed to get location details. Please try again.')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const getResultIcon = (result: GooglePlaceResult) => {
    const types = result.types || []
    const description = result.description.toLowerCase()
    
    if (types.includes('shopping_mall') || description.includes('mall') || description.includes('shopping')) {
      return <Building2 className="h-4 w-4 text-blue-500" />
    }
    if (types.includes('store') || types.includes('establishment') || description.includes('store')) {
      return <Store className="h-4 w-4 text-green-500" />
    }
    return <MapPin className="h-4 w-4 text-gray-500" />
  }

  const getResultType = (result: GooglePlaceResult) => {
    const types = result.types || []
    const description = result.description.toLowerCase()
    
    if (types.includes('shopping_mall') || description.includes('mall')) {
      return 'Mall'
    }
    if (types.includes('store') || types.includes('establishment')) {
      return 'Store'
    }
    return 'Place'
  }

  // Show setup instructions if API key is missing
  if (!isGooglePlacesAvailable) {
    return (
      <div className={cn("space-y-3", className)}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Google Places API key not configured. Please add <code>NEXT_PUBLIC_GOOGLE_PLACES_API_KEY</code> to your environment variables.
          </AlertDescription>
        </Alert>
        <Input
          placeholder="Google Places not available - using basic input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled
        />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor="google-places-input" className="text-sm font-medium mb-2 block">
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
        >
          All
        </Button>
        <Button
          type="button"
          variant={searchType === 'malls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('malls')}
          className="text-xs"
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
        >
          <Store className="h-3 w-3 mr-1" />
          Stores
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          id="google-places-input"
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
          disabled={isLoadingDetails}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isSearching || isLoadingDetails ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {searchResults.map((result, index) => (
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
                      {result.structured_formatting?.main_text || result.description.split(',')[0]}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {getResultType(result)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {result.structured_formatting?.secondary_text || result.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-800">
                {selectedAddress.place_name || selectedAddress.street_address}
              </p>
              <p className="text-green-600">
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
              </p>
              {selectedAddress.phone && (
                <p className="text-green-500 text-xs">{selectedAddress.phone}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Using session tokens for cost-effective searches
      </div>
    </div>
  )
}