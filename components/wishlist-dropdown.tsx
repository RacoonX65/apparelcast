"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartWishlist } from '@/contexts/cart-wishlist-context'
import { ScrollArea } from '@/components/ui/scroll-area'

export function WishlistDropdown() {
  const { wishlistCount, wishlistItems, removeFromWishlistOptimistic, addToCartOptimistic } = useCartWishlist()

  const handleAddToCart = async (productId: string) => {
    await addToCartOptimistic(productId, 1)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Wishlist</h3>
          <p className="text-sm text-muted-foreground">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="p-6 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Discover Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[320px] overflow-y-auto scroll-smooth scrollbar-thin">
              <div className="p-4 space-y-4">
                {wishlistItems.map((item) => {
                  const product = item.products as any
                  if (!product) return null

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-20 relative flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={product.image_url || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.slug || product.id}`}>
                          <h4 className="font-medium text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        
                        <p className="font-semibold text-sm text-primary mb-2">
                          R {product.price.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2">
                          {product.stock_quantity > 0 ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAddToCart(product.id)}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button size="sm" className="h-7 text-xs" disabled>
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromWishlistOptimistic(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <Button asChild className="w-full" size="sm">
                <Link href="/wishlist">View Full Wishlist</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}