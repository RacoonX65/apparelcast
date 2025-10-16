"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ParsedAddress } from "@/lib/address-search"

interface ManualAddressInputProps {
  onAddressSelect: (address: ParsedAddress) => void
  placeholder?: string
  label?: string
  initialValue?: string
  className?: string
}

export function ManualAddressInput({
  onAddressSelect,
  placeholder = "Enter your address manually",
  label = "Address",
  initialValue = "",
  className = ""
}: ManualAddressInputProps) {
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("South Africa")
  const [isValid, setIsValid] = useState(false)

  // Validate form completeness
  const validateForm = () => {
    const valid = streetAddress.trim() !== "" && city.trim() !== "" && state.trim() !== ""
    setIsValid(valid)
    return valid
  }

  // Handle input changes and validate
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'street':
        setStreetAddress(value)
        break
      case 'city':
        setCity(value)
        break
      case 'state':
        setState(value)
        break
      case 'postal':
        setPostalCode(value)
        break
      case 'country':
        setCountry(value)
        break
    }
    
    // Validate after state update
    setTimeout(validateForm, 0)
  }

  // Submit the manual address
  const handleSubmit = () => {
    if (!validateForm()) return

    const fullAddress = [streetAddress, city, state, postalCode, country]
      .filter(Boolean)
      .join(", ")

    const parsedAddress: ParsedAddress = {
      street_address: streetAddress,
      city,
      state,
      postal_code: postalCode,
      country,
      full_address: fullAddress,
      latitude: 0, // Default coordinates for manual input
      longitude: 0
    }

    onAddressSelect(parsedAddress)
  }

  return (
    <div className={cn("w-full", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <Card className="mt-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Manual Address Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street-address" className="text-xs">Street Address *</Label>
            <Input
              id="street-address"
              placeholder="e.g., 123 Main Street, Apartment 4B"
              value={streetAddress}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-xs">City *</Label>
              <Input
                id="city"
                placeholder="e.g., Cape Town"
                value={city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-xs">Province *</Label>
              <Input
                id="state"
                placeholder="e.g., Western Cape"
                value={state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="postal-code" className="text-xs">Postal Code</Label>
              <Input
                id="postal-code"
                placeholder="e.g., 8001"
                value={postalCode}
                onChange={(e) => handleInputChange('postal', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-xs">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full mt-4"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Use This Address
          </Button>

          {!isValid && (streetAddress || city || state) && (
            <p className="text-xs text-amber-600 mt-2">
              Please fill in all required fields (Street Address, City, Province)
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-2 text-xs text-gray-500">
        💡 Fill in your address manually. Required fields are marked with *
      </div>
    </div>
  )
}