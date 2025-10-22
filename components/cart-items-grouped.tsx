"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, Package, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { useCartWishlist } from "@/contexts/cart-wishlist-context"

interface CartItemsGroupedProps {
  items: any[]
}

export function CartItemsGrouped({ items }: CartItemsGroupedProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { updateCartQuantityOptimistic, removeFromCartOptimistic } = useCartWishlist()

  // Group items by bundle deal
  const bundleGroups = items.reduce((groups, item) => {
    if (item.special_offer_id) {
      if (!groups[item.special_offer_id]) {
        groups[item.special_offer_id] = {
          id: item.special_offer_id,
          name: item.special_offers?.title || 'Bundle Deal',
          items: [],
          totalSavings: 0,
          originalTotal: 0,
          bundleTotal: 0
        }
      }
      groups[item.special_offer_id].items.push(item)
      groups[item.special_offer_id].totalSavings += (item.bundle_savings || 0)
      groups[item.special_offer_id].originalTotal += (item.original_price || (item.products as any)?.price || 0) * item.quantity
      groups[item.special_offer_id].bundleTotal += (item.special_offer_price || 0) * item.quantity
    }
    return groups
  }, {} as Record<string, any>)

  // Get individual (non-bundle) items
  const individualItems = items.filter(item => !item.special_offer_id)



  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      await removeFromCartOptimistic(itemId)
      router.refresh()
    } catch (error) {
      console.error("Error removing item:", error)
      // The context function already handles error toasts
    } finally {
      setIsUpdating(null)
    }
  }

  const renderItem = (item: any, showBundleBadge: boolean = false) => {
    const product = item.products as any
    const isBulkOrder = item.is_bulk_order
    const originalPrice = item.original_price || product.price
    const bulkPrice = item.bulk_price || product.price
    const specialOfferPrice = item.special_offer_price || product.price
    
    let pricePerUnit = product.price
    if (item.special_offer_id && specialOfferPrice) {
      pricePerUnit = specialOfferPrice
    } else if (isBulkOrder && bulkPrice) {
      pricePerUnit = bulkPrice
    }
    
    const itemTotal = pricePerUnit * item.quantity

    return (
      <div key={item.id} className="flex gap-4 p-4 border-b last:border-b-0">
        <div className="w-20 h-28 relative flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={product.image_url || `/placeholder.svg?height=112&width=80&query=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover"
          />
          {showBundleBadge && (
            <div className="absolute top-1 left-1">
              <Badge variant="default" className="text-xs px-1 py-0 bg-gradient-to-r from-orange-500 to-red-500">
                <Gift className="h-2 w-2 mr-1" />
                Bundle
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-medium mb-1">{product.name}</h4>
          <div className="text-sm text-muted-foreground space-y-1 mb-2">
            {item.size && <p>Size: {item.size}</p>}
            {item.color && <p>Color: {item.color}</p>}
            
            {/* Pricing */}
            {item.special_offer_id ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-sm">
                    R {product.price.toFixed(2)} each
                  </span>
                  <span className="font-semibold text-orange-600 text-sm">
                    R {specialOfferPrice.toFixed(2)} each
                  </span>
                </div>
              </div>
            ) : isBulkOrder ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-sm">
                    R {originalPrice.toFixed(2)} each
                  </span>
                  <span className="font-semibold text-green-600 text-sm">
                    R {bulkPrice.toFixed(2)} each
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-semibold text-sm">R {product.price.toFixed(2)} each</p>
            )}
          </div>

          <div className="flex items-center justify-between">
  <div className="flex items-center border rounded">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => !item.special_offer_id && updateCartQuantityOptimistic(item.id, item.quantity - 1)}
                disabled={isUpdating === item.id || item.quantity <= 1 || item.special_offer_id}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-2 text-xs font-medium min-w-[24px] text-center">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => !item.special_offer_id && updateCartQuantityOptimistic(item.id, item.quantity + 1)}
                disabled={isUpdating === item.id || item.quantity >= product.stock_quantity || item.special_offer_id}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold text-sm">R {itemTotal.toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
                disabled={isUpdating === item.id}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bundle Deal Groups */}
      {Object.values(bundleGroups).map((bundle: any) => (
        <Card key={bundle.id} className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="p-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg text-orange-800">{bundle.name}</h3>
                <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500">
                  Bundle Deal
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R {bundle.originalTotal.toFixed(2)}</span>
                  <span className="ml-2 font-semibold text-orange-600">R {bundle.bundleTotal.toFixed(2)}</span>
                </div>
                {bundle.totalSavings > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    You saved R {bundle.totalSavings.toFixed(2)}!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="divide-y divide-orange-100">
            {bundle.items.map((item: any) => renderItem(item, true))}
          </div>
        </Card>
      ))}

      {/* Individual Items */}
      {individualItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Individual Items</h3>
          <div className="bg-card border rounded-lg divide-y">
            {individualItems.map((item) => renderItem(item, false))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {Object.keys(bundleGroups).length === 0 && individualItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your cart is empty</p>
        </div>
      )}
    </div>
  )
}