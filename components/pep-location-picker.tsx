"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Clock, Phone, Search, Loader2, Filter, Plus } from "lucide-react"
import { 
  PepLocation, 
  PEP_LOCATIONS,
  findNearestPepLocations, 
  advancedSearchPepLocations,
  getAllProvinces,
  getPepLocationById 
} from "@/lib/pep-locations"
import { pepApi } from "@/lib/pep-api"
import { OpenStreetMapAddressPicker } from "@/components/openstreetmap-address-picker"
import { EnhancedAddressPicker } from "@/components/enhanced-address-picker"
import { pepLocationService } from "@/lib/pep-location-service"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface PepLocationPickerProps {
  selectedLocationId?: string
  onLocationSelect: (location: PepLocation) => void
  className?: string
}

export function PepLocationPicker({ 
  selectedLocationId, 
  onLocationSelect, 
  className = "" 
}: PepLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [maxDistance, setMaxDistance] = useState<number>(50)
  const [locations, setLocations] = useState<(PepLocation & { distance?: number })[]>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<PepLocation | null>(
    selectedLocationId ? getPepLocationById(selectedLocationId) || null : null
  )
  const [showFilters, setShowFilters] = useState(false)
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    phone: "",
    address: null as any
  })
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false)
  
  const { toast } = useToast()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [locationsPerPage] = useState(10)

  const provinces = getAllProvinces()

  // Calculate pagination
  const totalPages = Math.ceil(locations.length / locationsPerPage)
  const startIndex = (currentPage - 1) * locationsPerPage
  const endIndex = startIndex + locationsPerPage
  const paginatedLocations = locations.slice(startIndex, endIndex)

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          
          // Find nearest locations using advanced search
          const nearestLocations = advancedSearchPepLocations(
            searchQuery,
            selectedProvince,
            latitude,
            longitude,
            maxDistance
          )
          setLocations(nearestLocations)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to showing filtered locations without distance
          const filteredLocations = advancedSearchPepLocations(
            searchQuery,
            selectedProvince
          )
          setLocations(filteredLocations)
          setIsLoadingLocation(false)
        }
      )
    } else {
      // Geolocation not supported, show filtered locations
      const filteredLocations = advancedSearchPepLocations(
        searchQuery,
        selectedProvince
      )
      setLocations(filteredLocations)
      setIsLoadingLocation(false)
    }
  }

  // Enhanced search with filters
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on new search
    updateLocationsList(query, selectedProvince, maxDistance)
  }

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province)
    setCurrentPage(1) // Reset to first page on filter change
    updateLocationsList(searchQuery, province, maxDistance)
  }

  const handleDistanceChange = (distance: number) => {
    setMaxDistance(distance)
    setCurrentPage(1) // Reset to first page on filter change
    updateLocationsList(searchQuery, selectedProvince, distance)
  }

  const updateLocationsList = async (query: string, province: string, distance: number) => {
    setIsSearching(true)
    
    try {
      // Option 1: Use API service (ready for production)
      // const response = await pepApi.searchLocations({
      //   query: query || undefined,
      //   province: province === "all" ? undefined : province,
      //   latitude: userLocation?.lat,
      //   longitude: userLocation?.lng,
      //   maxDistance: userLocation ? distance : undefined,
      //   page: 1,
      //   limit: 100 // Get more results for client-side pagination
      // })
      // 
      // if (response.success) {
      //   setLocations(response.data)
      // } else {
      //   console.error('Failed to fetch locations:', response.message)
      //   setLocations([])
      // }

      // Option 2: Use direct mock functions (current implementation)
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      
      const filteredLocations = advancedSearchPepLocations(
        query,
        province,
        userLocation?.lat,
        userLocation?.lng,
        userLocation ? distance : undefined
      )
      setLocations(filteredLocations)
      
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId)
    if (location) {
      setSelectedLocation(location)
      onLocationSelect(location)
    }
  }

  // Submit new location function
  const handleSubmitLocation = async () => {
    if (!newLocationData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a store name",
        variant: "destructive"
      })
      return
    }

    if (!newLocationData.address) {
      toast({
        title: "Error", 
        description: "Please select a store address",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmittingLocation(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a location",
          variant: "destructive"
        })
        return
      }

      // Submit location
      const result = await pepLocationService.submitLocation(newLocationData, user.id)
      
      if (result.success) {
        toast({
          title: "Location Submitted!",
          description: "Thank you! We'll review your submission and add it to our database.",
        })
        
        // Reset form and close modal
        setNewLocationData({ name: "", phone: "", address: null })
        setShowAddLocationModal(false)
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit location. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting location:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingLocation(false)
    }
  }

  // Initialize with filtered locations
  useEffect(() => {
    updateLocationsList(searchQuery, selectedProvince, maxDistance)
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Label htmlFor="location-search" className="sr-only">
              Search for PEP location
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location-search"
                placeholder="Search by city, province, or store name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
          className="whitespace-nowrap"
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Find Nearest
            </>
          )}
        </Button>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="province-filter" className="text-sm font-medium">
                Province
              </Label>
              <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger id="province-filter">
                  <SelectValue placeholder="All provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userLocation && (
              <div>
                <Label htmlFor="distance-filter" className="text-sm font-medium">
                  Max Distance (km)
                </Label>
                <Select 
                  value={maxDistance.toString()} 
                  onValueChange={(value) => handleDistanceChange(parseInt(value))}
                >
                  <SelectTrigger id="distance-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                    <SelectItem value="999">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>

      {selectedLocation && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary">
              Selected PEP Collection Point
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{selectedLocation.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.address}, {selectedLocation.city}
                </p>
                {(selectedLocation as any).distance && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {(selectedLocation as any).distance.toFixed(1)} km away
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary and Locations List */}
      <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching...
                </span>
              ) : locations.length === 0 ? (
                "No locations found"
              ) : (
                <>
                  Showing {startIndex + 1}-{Math.min(endIndex, locations.length)} of {locations.length} location{locations.length === 1 ? '' : 's'}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedProvince !== "all" && ` in ${selectedProvince}`}
                </>
              )}
            </p>
            {locations.length > 0 && userLocation && !isSearching && (
              <Badge variant="secondary" className="text-xs">
                Sorted by distance
              </Badge>
            )}
          </div>

        {locations.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-sm mb-2">No locations found</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Try adjusting your search criteria or expanding your search area.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                   setSearchQuery("")
                   setSelectedProvince("all")
                   setMaxDistance(50)
                   setCurrentPage(1)
                   updateLocationsList("", "all", 50)
                 }}
              >
                Clear filters
              </Button>
              <Dialog open={showAddLocationModal} onOpenChange={setShowAddLocationModal}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add New Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Can't find your PEP store?</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Help us improve our database by adding a missing PEP location. We'll verify and add it for other customers too.
                    </p>
                    <div className="space-y-3">
                       <div>
                         <Label htmlFor="store-name">Store Name</Label>
                         <Input 
                           id="store-name" 
                           placeholder="e.g., PEP Sandton City"
                           value={newLocationData.name}
                           onChange={(e) => setNewLocationData(prev => ({ ...prev, name: e.target.value }))}
                         />
                       </div>
                       <div>
                         <Label>Store Address</Label>
                         <EnhancedAddressPicker
                           onAddressSelect={(address) => setNewLocationData(prev => ({ ...prev, address }))}
                           placeholder="Search for mall, store name, or address..."
                           label=""
                         />
                       </div>
                       <div>
                         <Label htmlFor="store-phone">Phone Number (Optional)</Label>
                         <Input 
                           id="store-phone" 
                           placeholder="e.g., 011 123 4567"
                           value={newLocationData.phone}
                           onChange={(e) => setNewLocationData(prev => ({ ...prev, phone: e.target.value }))}
                         />
                       </div>
                     </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setShowAddLocationModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                         size="sm" 
                         className="flex-1"
                         onClick={handleSubmitLocation}
                         disabled={isSubmittingLocation}
                       >
                         {isSubmittingLocation ? (
                           <>
                             <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                             Submitting...
                           </>
                         ) : (
                           "Submit Location"
                         )}
                       </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ) : (
           <div className="space-y-3">
             <div className="max-h-96 overflow-y-auto space-y-2">
               <RadioGroup
                 value={selectedLocation?.id || ""}
                 onValueChange={handleLocationSelect}
               >
                 {paginatedLocations.map((location) => (
            <div key={location.id} className="relative">
              <RadioGroupItem
                value={location.id}
                id={`location-${location.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`location-${location.id}`}
                className="flex cursor-pointer"
              >
                <Card className="w-full transition-all hover:shadow-md peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm leading-tight">
                            {location.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">
                              {location.address}, {location.city}
                            </p>
                          </div>
                        </div>
                        {location.distance && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {location.distance.toFixed(1)} km
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{location.operatingHours.weekdays}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{location.phone}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {location.services.map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
                </RadioGroup>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }