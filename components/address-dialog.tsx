"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { OpenStreetMapAddressPicker } from "@/components/openstreetmap-address-picker"

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: any
}

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

export function AddressDialog({ open, onOpenChange, address }: AddressDialogProps) {
  const [formData, setFormData] = useState({
    full_name: address?.full_name || "",
    phone: address?.phone || "",
    street_address: address?.street_address || "",
    city: address?.city || "",
    province: address?.province || "Gauteng",
    postal_code: address?.postal_code || "",
    is_default: address?.is_default || false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAddressSelect = (selectedAddress: any) => {
    setFormData(prev => ({
      ...prev,
      street_address: selectedAddress.street_address || selectedAddress.full_address,
      city: selectedAddress.city,
      province: selectedAddress.state || prev.province,
      postal_code: selectedAddress.postal_code,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
      }

      if (address) {
        // Update existing address
        const { error } = await supabase.from("addresses").update(formData).eq("id", address.id)
        if (error) throw error
      } else {
        // Create new address
        const { error } = await supabase.from("addresses").insert({
          ...formData,
          user_id: user.id,
        })
        if (error) throw error
      }

      toast({
        title: "Success",
        description: address ? "Address updated successfully" : "Address added successfully",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Address save error:", error)
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {/* Google Maps Address Picker */}
          {!useManualEntry ? (
            <div className="space-y-4">
              <OpenStreetMapAddressPicker
                onAddressSelect={handleAddressSelect}
                initialValue={formData.street_address}
                label="Address"
                placeholder="Start typing your address..."
                required
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseManualEntry(true)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Enter address manually instead
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  required
                />
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseManualEntry(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Use address search instead
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <select
              id="province"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              {SA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked as boolean })}
            />
            <Label htmlFor="is_default" className="text-sm font-normal cursor-pointer">
              Set as default address
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-accent">
              {isLoading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
