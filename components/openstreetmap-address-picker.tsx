"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  address: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}

interface FormattedAddress {
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  full_address: string
  latitude?: number
  longitude?: number
}

interface OpenStreetMapAddressPickerProps {
  onAddressSelect: (address: FormattedAddress) => void
  initialValue?: string
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

export function OpenStreetMapAddressPicker({
  onAddressSelect,
  initialValue = "",
  placeholder = "Start typing your address...",
  label = "Address",
  required = false,
  className = ""
}: OpenStreetMapAddressPickerProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Debounce search
  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchAddresses(inputValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [inputValue])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchAddresses = async (query: string) => {
    if (query.length < 3) return

    setIsSearching(true)
    
    try {
      // Using Nominatim API with South Africa bias
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'za', // Restrict to South Africa
          bounded: '1',
          viewbox: '16.3449768409,-34.8191663551,32.830120477,-22.0913127581' // South Africa bounding box
        })
      )

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const results: NominatimResult[] = await response.json()
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      console.error('Error searching addresses:', error)
      toast({
        title: "Search Error",
        description: "Failed to search for addresses. Please try again or enter manually.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionSelect = (result: NominatimResult) => {
    const address = result.address || {}
    
    const formattedAddress: FormattedAddress = {
      street_address: [
        address.house_number,
        address.road
      ].filter(Boolean).join(" "),
      city: address.city || address.town || address.village || address.suburb || "",
      state: address.state || "",
      postal_code: address.postcode || "",
      country: address.country || "South Africa",
      full_address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }

    setInputValue(result.display_name)
    setShowSuggestions(false)
    onAddressSelect(formattedAddress)
    
    toast({
      title: "Address Selected",
      description: "Address has been automatically filled in.",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // For manual input without suggestions
    if (value.length > 0) {
      const manualAddress: FormattedAddress = {
        street_address: value,
        city: "",
        state: "",
        postal_code: "",
        country: "South Africa",
        full_address: value
      }
      onAddressSelect(manualAddress)
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding with Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
              lat: latitude.toString(),
              lon: longitude.toString(),
              format: 'json',
              addressdetails: '1'
            })
          )

          if (!response.ok) {
            throw new Error('Failed to reverse geocode location')
          }

          const result: NominatimResult = await response.json()
          
          if (result && result.display_name) {
            const address = result.address || {}
            
            const formattedAddress: FormattedAddress = {
              street_address: [
                address.house_number,
                address.road
              ].filter(Boolean).join(" "),
              city: address.city || address.town || address.village || address.suburb || "",
              state: address.state || "",
              postal_code: address.postcode || "",
              country: address.country || "South Africa",
              full_address: result.display_name,
              latitude,
              longitude
            }

            setInputValue(result.display_name)
            onAddressSelect(formattedAddress)
            
            toast({
              title: "Location Found",
              description: "Your current location has been detected and filled in.",
            })
          } else {
            throw new Error('No address found for location')
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error)
          toast({
            title: "Location Error",
            description: "Could not determine your address from your location.",
            variant: "destructive"
          })
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        toast({
          title: "Location Access Denied",
          description: "Please allow location access or enter your address manually.",
          variant: "destructive"
        })
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="address-input" className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="address-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={isLoading}
          className="pr-12"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isSearching ? (
            <Search className="h-4 w-4 animate-pulse text-muted-foreground" />
          ) : null}
        </div>

        {/* Address Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.display_name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCurrentLocation}
        disabled={isLoading}
        className="w-full"
      >
        <MapPin className="h-4 w-4 mr-2" />
        {isLoading ? "Getting Location..." : "Use Current Location"}
      </Button>

      {/* Info Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <p className="text-sm text-green-800">
            <MapPin className="h-4 w-4 inline mr-2" />
            Powered by OpenStreetMap
          </p>
        </CardContent>
      </Card>
    </div>
  )
}