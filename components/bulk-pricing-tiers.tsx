"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface BulkTier {
  id?: string
  min_quantity: number
  max_quantity: number | null
  discount_type: 'percentage' | 'fixed_amount' | 'fixed_price'
  discount_value: number
  price_per_unit: number
  is_active: boolean
}

interface BulkPricingTiersProps {
  productId?: string
  basePrice: number
  onTiersChange?: (tiers: BulkTier[]) => void
}

export function BulkPricingTiers({ productId, basePrice, onTiersChange }: BulkPricingTiersProps) {
  const [tiers, setTiers] = useState<BulkTier[]>([])
  const [editingTier, setEditingTier] = useState<string | null>(null)
  const [newTier, setNewTier] = useState<Partial<BulkTier>>({
    min_quantity: 10,
    max_quantity: null,
    discount_type: 'percentage',
    discount_value: 10,
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()


  // Load existing tiers for the product
  useEffect(() => {
    if (productId) {
      loadTiers()
    } else {
      // For new products, show default tiers
      setTiers([
        {
          min_quantity: 10,
          max_quantity: 24,
          discount_type: 'percentage',
          discount_value: 10,
          price_per_unit: basePrice * 0.9,
          is_active: true
        },
        {
          min_quantity: 25,
          max_quantity: 49,
          discount_type: 'percentage',
          discount_value: 15,
          price_per_unit: basePrice * 0.85,
          is_active: true
        },
        {
          min_quantity: 50,
          max_quantity: null,
          discount_type: 'percentage',
          discount_value: 20,
          price_per_unit: basePrice * 0.8,
          is_active: true
        }
      ])
    }
  }, [productId, basePrice])

  const loadTiers = async () => {
    if (!productId) return
    
    try {
      const { data, error } = await supabase
        .from('bulk_pricing_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('min_quantity')

      if (error) throw error
      setTiers(data || [])
    } catch (error) {
      console.error('Error loading tiers:', error)
      toast({
        title: "Error",
        description: "Failed to load bulk pricing tiers",
        variant: "destructive"
      })
    }
  }

  const calculatePricePerUnit = (tier: Partial<BulkTier>) => {
    if (!tier.discount_type || tier.discount_value === undefined) return basePrice

    switch (tier.discount_type) {
      case 'percentage':
        return basePrice * (1 - tier.discount_value / 100)
      case 'fixed_amount':
        return Math.max(0, basePrice - tier.discount_value)
      case 'fixed_price':
        return tier.discount_value
      default:
        return basePrice
    }
  }

  const addTier = () => {
    if (!newTier.min_quantity || newTier.discount_value === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const pricePerUnit = calculatePricePerUnit(newTier)
    const tier: BulkTier = {
      min_quantity: newTier.min_quantity!,
      max_quantity: newTier.max_quantity ?? null,
      discount_type: newTier.discount_type!,
      discount_value: newTier.discount_value!,
      price_per_unit: pricePerUnit,
      is_active: true
    }

    const updatedTiers = [...tiers, tier].sort((a, b) => a.min_quantity - b.min_quantity)
    setTiers(updatedTiers)
    onTiersChange?.(updatedTiers)

    // Reset new tier form
    setNewTier({
      min_quantity: Math.max(10, (tier.max_quantity || tier.min_quantity) + 1),
      max_quantity: null,
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true
    })

    toast({
      title: "Success",
      description: "Bulk pricing tier added"
    })
  }

  const updateTier = (index: number, updatedTier: Partial<BulkTier>) => {
    const newTiers = [...tiers]
    const tier = { ...newTiers[index], ...updatedTier }
    tier.price_per_unit = calculatePricePerUnit(tier)
    newTiers[index] = tier
    setTiers(newTiers)
    onTiersChange?.(newTiers)
  }

  const deleteTier = (index: number) => {
    const newTiers = tiers.filter((_, i) => i !== index)
    setTiers(newTiers)
    onTiersChange?.(newTiers)
    toast({
      title: "Success",
      description: "Bulk pricing tier removed"
    })
  }

  const saveTiers = async () => {
    if (!productId) return

    setIsLoading(true)
    try {
      // Delete existing tiers
      await supabase
        .from('bulk_pricing_tiers')
        .delete()
        .eq('product_id', productId)

      // Insert new tiers
      if (tiers.length > 0) {
        const tiersToInsert = tiers.map(tier => ({
          product_id: productId,
          ...tier
        }))

        const { error } = await supabase
          .from('bulk_pricing_tiers')
          .insert(tiersToInsert)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Bulk pricing tiers saved successfully"
      })
    } catch (error) {
      console.error('Error saving tiers:', error)
      toast({
        title: "Error",
        description: "Failed to save bulk pricing tiers",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold">Custom Bulk Pricing Tiers</h4>
        {productId && (
          <Button type="button" onClick={saveTiers} disabled={isLoading} size="sm">
            {isLoading ? "Saving..." : "Save Tiers"}
          </Button>
        )}
      </div>

      {/* Existing Tiers */}
      <div className="space-y-2">
        {tiers.map((tier, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                <div>
                  <Label className="text-xs">Min Qty</Label>
                  <Input
                    type="number"
                    value={tier.min_quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      updateTier(index, { min_quantity: isNaN(value) ? 0 : value })
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Qty</Label>
                  <Input
                    type="number"
                    value={tier.max_quantity || ""}
                    onChange={(e) => updateTier(index, { 
                      max_quantity: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="∞"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    value={tier.discount_type}
                    onChange={(e) => updateTier(index, { 
                      discount_type: e.target.value as 'percentage' | 'fixed_amount' | 'fixed_price' 
                    })}
                    className="h-8 w-full rounded border border-input bg-background px-2 text-sm"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed_amount">R off</option>
                    <option value="fixed_price">Fixed R</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.discount_value}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      updateTier(index, { discount_value: isNaN(value) ? 0 : value })
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Final Price</Label>
                  <Badge variant="secondary" className="w-full justify-center">
                    R{tier.price_per_unit.toFixed(2)}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteTier(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Tier */}
      <Card className="p-3 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-5 gap-2 items-center">
            <div>
              <Label className="text-xs">Min Qty</Label>
              <Input
                type="number"
                value={newTier.min_quantity || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  setNewTier({ ...newTier, min_quantity: isNaN(value) ? undefined : value })
                }}
                className="h-8"
                placeholder="10"
              />
            </div>
            <div>
              <Label className="text-xs">Max Qty</Label>
              <Input
                type="number"
                value={newTier.max_quantity || ""}
                onChange={(e) => setNewTier({ 
                  ...newTier, 
                  max_quantity: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="∞"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={newTier.discount_type}
                onChange={(e) => setNewTier({ 
                  ...newTier, 
                  discount_type: e.target.value as 'percentage' | 'fixed_amount' | 'fixed_price' 
                })}
                className="h-8 w-full rounded border border-input bg-background px-2 text-sm"
              >
                <option value="percentage">%</option>
                <option value="fixed_amount">R off</option>
                <option value="fixed_price">Fixed R</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Value</Label>
              <Input
                type="number"
                step="0.01"
                value={newTier.discount_value || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setNewTier({ ...newTier, discount_value: isNaN(value) ? undefined : value })
                }}
                className="h-8"
                placeholder="10"
              />
            </div>
            <div>
              <Label className="text-xs">Final Price</Label>
              <Badge variant="outline" className="w-full justify-center">
                R{calculatePricePerUnit(newTier).toFixed(2)}
              </Badge>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addTier}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Discount Types:</strong></p>
        <p>• <strong>%:</strong> Percentage discount from base price</p>
        <p>• <strong>R off:</strong> Fixed amount discount from base price</p>
        <p>• <strong>Fixed R:</strong> Set exact price per unit</p>
      </div>
    </div>
  )
}