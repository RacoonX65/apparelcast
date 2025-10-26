"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, X, Plus, Minus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartWishlist } from '@/contexts/cart-wishlist-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getProductImageForColor } from '@/lib/product-images'

export function CartDropdown() {
  const { cartCount, cartItems, removeFromCartOptimistic, updateCartQuantityOptimistic } = useCartWishlist()
  const [itemImages, setItemImages] = useState<Record<string, string>>({})

  // Load color-specific images for cart items
  useEffect(() => {
    const loadImages = async () => {
      const newImages: Record<string, string> = {}

      for (const item of cartItems) {
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
            // Silently handle errors and use fallback image
            newImages[item.id] = product.image_url || '/placeholder.jpg'
          }
        } else {
          newImages[item.id] = product?.image_url || '/placeholder.jpg'
        }
      }

      setItemImages(newImages)
    }

    loadImages()
  }, [cartItems])

  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products as any
    // Use special offer price if it's a bundle deal, bulk price if bulk order, otherwise regular price
    let pricePerUnit = product?.price || 0
    if (item.special_offer_id && item.special_offer_price) {
      pricePerUnit = item.special_offer_price
    } else if (item.is_bulk_order && item.bulk_price) {
      pricePerUnit = item.bulk_price
    }
    return sum + pricePerUnit * item.quantity
  }, 0)

  const totalSavings = cartItems?.reduce((sum, item) => {
    const product = item.products as any
    if (!product) return sum
    
    let itemSavings = 0
    const originalPrice = item.original_price || product.price
    
    // Calculate savings based on the type of discount
    if (item.special_offer_id && item.special_offer_price) {
      // Special offer/bundle deal savings
      itemSavings = (originalPrice - item.special_offer_price) * item.quantity
    } else if (item.is_bulk_order && item.bulk_price) {
      // Bulk order savings
      itemSavings = (originalPrice - item.bulk_price) * item.quantity
    }
    
    return sum + itemSavings
  }, 0) || 0

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCartOptimistic(itemId)
    } else {
      await updateCartQuantityOptimistic(itemId, newQuantity)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Shopping Cart</h3>
          <p className="text-sm text-muted-foreground">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[320px] overflow-y-auto scroll-smooth scrollbar-thin">
              <div className="p-4 space-y-4">
                {cartItems.map((item) => {
                  const product = item.products as any
                  if (!product) return null

                  const isBulkOrder = item.is_bulk_order
                  const isBundleDeal = item.special_offer_id && item.special_offer_price
                  const originalPrice = item.original_price || product.price
                  const bulkPrice = item.bulk_price || product.price
                  const bundlePrice = item.special_offer_price || product.price
                  
                  // Calculate item savings properly
                  let itemSavings = 0
                  if (isBundleDeal) {
                    itemSavings = (originalPrice - bundlePrice) * item.quantity
                  } else if (isBulkOrder) {
                    itemSavings = (originalPrice - bulkPrice) * item.quantity
                  }
                  
                  let pricePerUnit = product.price
                  if (isBundleDeal) {
                    pricePerUnit = bundlePrice
                  } else if (isBulkOrder) {
                    pricePerUnit = bulkPrice
                  }
                  const itemTotal = pricePerUnit * item.quantity

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-20 relative flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={
                            itemImages[item.id] ||
                            product.image_url ||
                            '/placeholder.jpg'
                          }
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {(isBulkOrder || isBundleDeal) && (
                          <div className="absolute top-1 left-1">
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {isBundleDeal ? (
                                <>
                                  <Package className="h-2 w-2 mr-1" />
                                  Bundle
                                </>
                              ) : (
                                <>
                                  <Package className="h-2 w-2 mr-1" />
                                  Bulk
                                </>
                              )}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h4>
                        
                        <div className="text-xs text-muted-foreground space-y-1 mb-2">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>

                        {/* Pricing Display */}
                        <div className="text-xs mb-2">
                          {isBundleDeal ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground line-through">
                                  R {originalPrice.toFixed(2)} each
                                </span>
                                <span className="font-medium text-orange-600">
                                  R {bundlePrice.toFixed(2)} each
                                </span>
                              </div>
                              <p className="text-orange-600 font-medium">
                                Bundle deal price
                              </p>
                              {itemSavings > 0 && (
                                <p className="text-green-600 font-medium">
                                  Save R {itemSavings.toFixed(2)} total
                                </p>
                              )}
                            </div>
                          ) : isBulkOrder ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground line-through">
                                  R {originalPrice.toFixed(2)} each
                                </span>
                                <span className="font-medium text-green-600">
                                  R {bulkPrice.toFixed(2)} each
                                </span>
                              </div>
                              {itemSavings > 0 && (
                                <p className="text-green-600 font-medium">
                                  Save R {itemSavings.toFixed(2)} total
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              R {product.price.toFixed(2)} each
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
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
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              R {itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCartOptimistic(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-semibold text-lg">R {subtotal.toFixed(2)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm font-medium">Total Savings:</span>
                    <span className="font-semibold">R {totalSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full" size="sm">
                  <Link href="/checkout">Continue to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}