"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, Package, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getProductImageForColor } from "@/lib/product-images"

interface CartItemsProps {
  items: any[]
}

export function CartItems({ items }: CartItemsProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [itemImages, setItemImages] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Load color-specific images for cart items
  useEffect(() => {
    const loadImages = async () => {
      const newImages: Record<string, string> = {}

      for (const item of items) {
        const product = item.products as any
        if (product && item.color) {
          try {
            const colorImageUrl = await getProductImageForColor(
              product.id,
              item.color,
              product.image_url
            )
            newImages[item.id] = colorImageUrl
          } catch (error) {
            console.error('Error loading color image for item:', item.id, error)
            // Fallback to main product image if color mapping fails
            newImages[item.id] = product.image_url || '/placeholder.svg?height=128&width=96&text=No+Image'
          }
        } else {
          // No color selected, use main product image
          newImages[item.id] = product?.image_url || '/placeholder.svg?height=128&width=96&text=No+Image'
        }
      }

      setItemImages(newImages)
    }

    loadImages()
  }, [items])

  const updateQuantity = async (itemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return

    setIsUpdating(itemId)
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", itemId)

      if (error) throw error

      router.refresh()
    } catch (error) {
    console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) throw error

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })

      router.refresh()
    } catch (error) {
    console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const product = item.products as any
        const isBulkOrder = item.is_bulk_order
        const isSpecialOffer = item.special_offer_id
        const originalPrice = item.original_price || product.price
        const bulkPrice = item.bulk_price || product.price
        const specialOfferPrice = item.special_offer_price || product.price
        const itemSavings = item.bulk_savings || 0
        
        // Determine the price per unit based on order type
        let pricePerUnit = product.price
        if (isSpecialOffer) {
          pricePerUnit = specialOfferPrice
        } else if (isBulkOrder) {
          pricePerUnit = bulkPrice
        }
        
        const itemTotal = pricePerUnit * item.quantity

        return (
          <div key={item.id} className="bg-card border rounded-lg p-4 flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-32 relative flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={
                  itemImages[item.id] ||
                  product.image_url ||
                  `/placeholder.svg?height=128&width=96&query=${encodeURIComponent(product.name)}`
                }
                alt={product.name}
                fill
                className="object-cover"
              />
              {isBulkOrder && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Package className="h-3 w-3 mr-1" />
                    Bulk Order
                  </Badge>
                </div>
              )}
              {isSpecialOffer && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="text-xs px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500">
                    <Gift className="h-3 w-3 mr-1" />
                    Bundle Deal
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium mb-1">{product.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {item.size && <p>Size: {item.size}</p>}
                  {item.color && <p>Color: {item.color}</p>}
                  
                  {/* Pricing Display */}
                  {isSpecialOffer ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          R {product.price.toFixed(2)} each
                        </span>
                        <span className="font-semibold text-orange-600">
                          R {specialOfferPrice.toFixed(2)} each
                        </span>
                      </div>
                      <p className="text-orange-600 font-medium text-sm">
                        Bundle deal price
                      </p>
                    </div>
                  ) : isBulkOrder ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          R {originalPrice.toFixed(2)} each
                        </span>
                        <span className="font-semibold text-green-600">
                          R {bulkPrice.toFixed(2)} each
                        </span>
                      </div>
                      {itemSavings > 0 && (
                        <p className="text-green-600 font-medium text-sm">
                          You save R {itemSavings.toFixed(2)} total
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold text-foreground">R {product.price.toFixed(2)} each</p>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1, product.stock_quantity)}
                    disabled={isUpdating === item.id || item.quantity <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1, product.stock_quantity)}
                    disabled={isUpdating === item.id || item.quantity >= product.stock_quantity}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-lg">R {itemTotal.toFixed(2)}</span>
                    {isBulkOrder && itemSavings > 0 && (
                      <p className="text-xs text-green-600">
                        (saved R {itemSavings.toFixed(2)})
                      </p>
                    )}
                    {isSpecialOffer && (
                      <p className="text-xs text-orange-600">
                        (bundle deal)
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={isUpdating === item.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
