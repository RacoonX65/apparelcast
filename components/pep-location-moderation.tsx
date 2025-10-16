"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Phone, Check, X, Eye, Loader2 } from "lucide-react"
import { pepLocationService, UserSubmittedPepLocation } from "@/lib/pep-location-service"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function PepLocationModeration() {
  const [locations, setLocations] = useState<UserSubmittedPepLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [moderatingId, setModeratingId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<UserSubmittedPepLocation | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationAction, setModerationAction] = useState<'approved' | 'rejected'>('approved')
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setIsLoading(true)
      const data = await pepLocationService.getAllLocationsForModeration()
      setLocations(data)
    } catch (error) {
      console.error('Error loading locations:', error)
      toast({
        title: "Error",
        description: "Failed to load locations for moderation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleModerate = async (action: 'approved' | 'rejected') => {
    if (!selectedLocation) return

    try {
      setModeratingId(selectedLocation.id!)
      
      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to moderate locations",
          variant: "destructive"
        })
        return
      }

      const result = await pepLocationService.moderateLocation(
        selectedLocation.id!,
        action,
        user.id,
        moderationNotes
      )

      if (result.success) {
        toast({
          title: "Location Moderated",
          description: `Location has been ${action}`,
        })
        
        // Refresh the list
        await loadLocations()
        
        // Close modals and reset state
        setShowModerationModal(false)
        setShowDetailsModal(false)
        setSelectedLocation(null)
        setModerationNotes("")
      } else {
        toast({
          title: "Moderation Failed",
          description: result.error || "Failed to moderate location",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error moderating location:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setModeratingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading locations...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">PEP Location Moderation</h2>
        <Badge variant="outline">
          {locations.filter(l => l.status === 'pending').length} pending review
        </Badge>
      </div>

      {locations.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-sm mb-2">No locations to moderate</h3>
          <p className="text-xs text-muted-foreground">
            All user-submitted locations have been reviewed.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {locations.map((location) => (
            <Card key={location.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {location.full_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(location.status!)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{location.city}, {location.province}</span>
                    </div>
                    {location.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{location.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Submitted: {formatDate(location.submitted_at!)}</p>
                    {location.moderated_at && (
                      <p>Moderated: {formatDate(location.moderated_at)}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={showDetailsModal && selectedLocation?.id === location.id} onOpenChange={(open) => {
                    setShowDetailsModal(open)
                    if (!open) setSelectedLocation(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLocation(location)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Location Details</DialogTitle>
                      </DialogHeader>
                      {selectedLocation && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">{selectedLocation.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedLocation.full_address}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>City:</strong> {selectedLocation.city}
                            </div>
                            <div>
                              <strong>Province:</strong> {selectedLocation.province}
                            </div>
                            {selectedLocation.postal_code && (
                              <div>
                                <strong>Postal Code:</strong> {selectedLocation.postal_code}
                              </div>
                            )}
                            {selectedLocation.phone && (
                              <div>
                                <strong>Phone:</strong> {selectedLocation.phone}
                              </div>
                            )}
                          </div>

                          {selectedLocation.latitude && selectedLocation.longitude && (
                            <div className="text-sm">
                              <strong>Coordinates:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}
                            </div>
                          )}

                          {selectedLocation.moderation_notes && (
                            <div>
                              <strong>Moderation Notes:</strong>
                              <p className="text-sm text-muted-foreground mt-1">{selectedLocation.moderation_notes}</p>
                            </div>
                          )}

                          {selectedLocation.status === 'pending' && (
                            <div className="flex gap-2 pt-4 border-t">
                              <Dialog open={showModerationModal} onOpenChange={setShowModerationModal}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => setModerationAction('approved')}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {moderationAction === 'approved' ? 'Approve' : 'Reject'} Location
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                      {moderationAction === 'approved' 
                                        ? 'This location will be approved and made available to users.'
                                        : 'This location will be rejected and not made available to users.'
                                      }
                                    </p>
                                    <div>
                                      <Label htmlFor="notes">Notes (Optional)</Label>
                                      <Textarea
                                        id="notes"
                                        placeholder="Add any notes about this decision..."
                                        value={moderationNotes}
                                        onChange={(e) => setModerationNotes(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => setShowModerationModal(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleModerate(moderationAction)}
                                        disabled={moderatingId === selectedLocation.id}
                                      >
                                        {moderatingId === selectedLocation.id ? (
                                          <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Processing...
                                          </>
                                        ) : (
                                          moderationAction === 'approved' ? 'Approve' : 'Reject'
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  setModerationAction('rejected')
                                  setShowModerationModal(true)
                                }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}