"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, ShoppingBag, X, Package } from "lucide-react"

interface BulkVariant {
  size: string
  color: string
  quantity: number
  id: string
}

interface BulkAddToCartFormProps {
  productId: string
  productName: string
  productPrice: number
  sizes: string[]
  colors: string[]
  stockQuantity: number
  bulkTiers: Array<{
    min_quantity: number
    max_quantity: number | null
    discount_type: 'percentage' | 'fixed'
    discount_value: number
  }>
}

export function BulkAddToCartForm({ 
  productId, 
  productName,
  productPrice,
  sizes, 
  colors, 
  stockQuantity,
  bulkTiers 
}: BulkAddToCartFormProps) {
  const [selectedVariants, setSelectedVariants] = useState<BulkVariant[]>([])
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "")
  const [selectedColor, setSelectedColor] = useState(colors[0] || "")
  const [variantQuantity, setVariantQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Calculate total quantity and pricing
  const totalQuantity = selectedVariants.reduce((sum, variant) => sum + variant.quantity, 0)
  const baseTotal = totalQuantity * productPrice
  
  // Find applicable bulk tier
  const applicableTier = bulkTiers
    .filter(tier => totalQuantity >= tier.min_quantity && (tier.max_quantity === null || totalQuantity <= tier.max_quantity))
    .sort((a, b) => b.min_quantity - a.min_quantity)[0]

  // Calculate discounted total
  let finalTotal = baseTotal
  let savings = 0
  if (applicableTier) {
    if (applicableTier.discount_type === 'percentage') {
      savings = baseTotal * (applicableTier.discount_value / 100)
    } else {
      savings = applicableTier.discount_value * totalQuantity
    }
    finalTotal = baseTotal - savings
  }

  const addVariant = () => {
    if (!selectedSize || !selectedColor || variantQuantity <= 0) return

    const variantId = `${selectedSize}-${selectedColor}`
    const existingVariantIndex = selectedVariants.findIndex(v => v.id === variantId)

    if (existingVariantIndex >= 0) {
      // Update existing variant
      const updatedVariants = [...selectedVariants]
      updatedVariants[existingVariantIndex].quantity += variantQuantity
      setSelectedVariants(updatedVariants)
    } else {
      // Add new variant
      const newVariant: BulkVariant = {
        size: selectedSize,
        color: selectedColor,
        quantity: variantQuantity,
        id: variantId
      }
      setSelectedVariants([...selectedVariants, newVariant])
    }

    // Reset form
    setVariantQuantity(1)
  }

  const removeVariant = (variantId: string) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId))
  }

  const updateVariantQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeVariant(variantId)
      return
    }

    setSelectedVariants(selectedVariants.map(v => 
      v.id === variantId ? { ...v, quantity: newQuantity } : v
    ))
  }

  const handleBulkAddToCart = async () => {
    if (selectedVariants.length === 0) {
      toast({
        title: "No variants selected",
        description: "Please add at least one size/color combination.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your cart.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Add each variant to cart
      for (const variant of selectedVariants) {
        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .eq("size", variant.size)
          .eq("color", variant.color)
          .single()

        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from("cart_items")
            .update({ 
              quantity: existingItem.quantity + variant.quantity, 
              updated_at: new Date().toISOString() 
            })
            .eq("id", existingItem.id)

          if (error) throw error
        } else {
          // Insert new item
          const { error } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: productId,
            quantity: variant.quantity,
            size: variant.size,
            color: variant.color,
          })

          if (error) throw error
        }
      }

      toast({
        title: "Bulk order added to cart",
        description: `${selectedVariants.length} variants with ${totalQuantity} total items added to your cart.`,
      })

      // Clear selections
      setSelectedVariants([])
      router.refresh()
    } catch (error) {
      console.error("Error adding bulk order to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add bulk order to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Bulk Order Builder</h3>
      </div>

      {/* Bulk Pricing Tiers Display */}
      {bulkTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Bulk Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {bulkTiers.map((tier, index) => {
                const pricePerUnit = tier.discount_type === 'percentage' 
                  ? productPrice * (1 - tier.discount_value / 100)
                  : tier.discount_type === 'fixed'
                  ? productPrice - tier.discount_value
                  : productPrice
                
                const savings = productPrice - pricePerUnit
                const savingsPercentage = (savings / productPrice) * 100

                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-medium">
                        {tier.min_quantity}+ units
                      </Badge>
                      <span className="text-sm">
                        R {pricePerUnit.toFixed(2)} each
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({tier.discount_type === 'percentage' ? `${tier.discount_value}%` : `R${tier.discount_value}`} off)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        Save {savingsPercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        R {savings.toFixed(2)} per unit
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Size/Color Combination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <Label>Size</Label>
                <select 
                  value={selectedSize} 
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <Label>Color</Label>
                <select 
                  value={selectedColor} 
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={variantQuantity}
                  onChange={(e) => setVariantQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border-0 text-center"
                  min="1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariantQuantity(variantQuantity + 1)}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={addVariant} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add to Bulk Order
          </Button>
        </CardContent>
      </Card>

      {/* Selected Variants */}
      {selectedVariants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Variants ({totalQuantity} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedVariants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <Badge variant="outline">{variant.size}</Badge>
                    <Badge variant="outline">{variant.color}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    R {productPrice.toFixed(2)} each
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateVariantQuantity(variant.id, variant.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{variant.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateVariantQuantity(variant.id, variant.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(variant.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pricing Summary */}
      {selectedVariants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({totalQuantity} items):</span>
              <span>R {baseTotal.toFixed(2)}</span>
            </div>
            
            {applicableTier && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bulk Discount ({applicableTier.discount_type === 'percentage' ? `${applicableTier.discount_value}%` : `R${applicableTier.discount_value}`}):</span>
                  <span>-R {savings.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>R {finalTotal.toFixed(2)}</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  You save R {savings.toFixed(2)} with bulk pricing!
                </div>
              </>
            )}
            
            {!applicableTier && bulkTiers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Add {bulkTiers[0].min_quantity - totalQuantity} more items to unlock bulk pricing
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleBulkAddToCart}
        disabled={isLoading || selectedVariants.length === 0}
        className="w-full h-12 text-base bg-primary hover:bg-accent"
        size="lg"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isLoading ? "Adding..." : `Add Bulk Order to Cart (${totalQuantity} items)`}
      </Button>
    </div>
  )
}