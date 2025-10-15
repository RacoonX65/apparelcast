"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddressComponents {
  street_number?: string
  route?: string
  locality?: string
  administrative_area_level_1?: string
  postal_code?: string
  country?: string
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

interface GoogleMapsAddressPickerProps {
  onAddressSelect: (address: FormattedAddress) => void
  initialValue?: string
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

export function GoogleMapsAddressPicker({
  onAddressSelect,
  initialValue = "",
  placeholder = "Start typing your address...",
  label = "Address",
  required = false,
  className = ""
}: GoogleMapsAddressPickerProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const { toast } = useToast()

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.warn("Google Maps API key not found. Address picker will work as regular input.")
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true)
      initializeAutocomplete()
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for the script to load
      window.initGoogleMaps = () => {
        setIsScriptLoaded(true)
        initializeAutocomplete()
      }
      return
    }

    // Load the script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    window.initGoogleMaps = () => {
      setIsScriptLoaded(true)
      initializeAutocomplete()
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps
      }
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "za" }, // Restrict to South Africa
          fields: [
            "address_components",
            "formatted_address",
            "geometry.location",
            "name"
          ]
        }
      )

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect)
    } catch (error) {
      console.error("Error initializing Google Maps Autocomplete:", error)
      toast({
        title: "Maps Error",
        description: "Failed to initialize address picker. You can still enter your address manually.",
        variant: "destructive"
      })
    }
  }

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return

    setIsLoading(true)
    
    try {
      const place = autocompleteRef.current.getPlace()
      
      if (!place.address_components) {
        toast({
          title: "Invalid Address",
          description: "Please select a valid address from the suggestions.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      const addressComponents: AddressComponents = {}
      
      // Parse address components
      place.address_components.forEach((component: any) => {
        const types = component.types
        
        if (types.includes("street_number")) {
          addressComponents.street_number = component.long_name
        } else if (types.includes("route")) {
          addressComponents.route = component.long_name
        } else if (types.includes("locality")) {
          addressComponents.locality = component.long_name
        } else if (types.includes("administrative_area_level_1")) {
          addressComponents.administrative_area_level_1 = component.long_name
        } else if (types.includes("postal_code")) {
          addressComponents.postal_code = component.long_name
        } else if (types.includes("country")) {
          addressComponents.country = component.long_name
        }
      })

      // Format the address
      const formattedAddress: FormattedAddress = {
        street_address: [
          addressComponents.street_number,
          addressComponents.route
        ].filter(Boolean).join(" "),
        city: addressComponents.locality || "",
        state: addressComponents.administrative_area_level_1 || "",
        postal_code: addressComponents.postal_code || "",
        country: addressComponents.country || "South Africa",
        full_address: place.formatted_address || inputValue,
        latitude: place.geometry?.location?.lat(),
        longitude: place.geometry?.location?.lng()
      }

      setInputValue(place.formatted_address || inputValue)
      onAddressSelect(formattedAddress)
      
      toast({
        title: "Address Selected",
        description: "Address has been automatically filled in.",
      })
    } catch (error) {
      console.error("Error processing selected place:", error)
      toast({
        title: "Error",
        description: "Failed to process the selected address. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    
    // If Google Maps is not available, still allow manual input
    if (!isScriptLoaded) {
      // Create a basic address object for manual input
      const manualAddress: FormattedAddress = {
        street_address: e.target.value,
        city: "",
        state: "",
        postal_code: "",
        country: "South Africa",
        full_address: e.target.value
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
          
          if (!window.google || !isScriptLoaded) {
            toast({
              title: "Maps Not Available",
              description: "Google Maps is not loaded. Please enter your address manually.",
              variant: "destructive"
            })
            setIsLoading(false)
            return
          }

          const geocoder = new window.google.maps.Geocoder()
          const latlng = new window.google.maps.LatLng(latitude, longitude)
          
          geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
            if (status === "OK" && results[0]) {
              const place = results[0]
              setInputValue(place.formatted_address)
              
              // Process the geocoded result similar to place selection
              const addressComponents: AddressComponents = {}
              
              place.address_components.forEach((component: any) => {
                const types = component.types
                
                if (types.includes("street_number")) {
                  addressComponents.street_number = component.long_name
                } else if (types.includes("route")) {
                  addressComponents.route = component.long_name
                } else if (types.includes("locality")) {
                  addressComponents.locality = component.long_name
                } else if (types.includes("administrative_area_level_1")) {
                  addressComponents.administrative_area_level_1 = component.long_name
                } else if (types.includes("postal_code")) {
                  addressComponents.postal_code = component.long_name
                } else if (types.includes("country")) {
                  addressComponents.country = component.long_name
                }
              })

              const formattedAddress: FormattedAddress = {
                street_address: [
                  addressComponents.street_number,
                  addressComponents.route
                ].filter(Boolean).join(" "),
                city: addressComponents.locality || "",
                state: addressComponents.administrative_area_level_1 || "",
                postal_code: addressComponents.postal_code || "",
                country: addressComponents.country || "South Africa",
                full_address: place.formatted_address,
                latitude,
                longitude
              }

              onAddressSelect(formattedAddress)
              
              toast({
                title: "Location Found",
                description: "Your current location has been detected and filled in.",
              })
            } else {
              toast({
                title: "Location Error",
                description: "Could not determine your address from your location.",
                variant: "destructive"
              })
            }
            setIsLoading(false)
          })
        } catch (error) {
          console.error("Geocoding error:", error)
          toast({
            title: "Error",
            description: "Failed to get your address from location.",
            variant: "destructive"
          })
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
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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

      {/* Status Card */}
      {!isScriptLoaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <p className="text-sm text-yellow-800">
              <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
              Loading address suggestions...
            </p>
          </CardContent>
        </Card>
      )}

      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <p className="text-sm text-blue-800">
              <MapPin className="h-4 w-4 inline mr-2" />
              Address suggestions are not available. Please enter your address manually.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}