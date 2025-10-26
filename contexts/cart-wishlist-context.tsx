"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { authStateManager } from '@/lib/supabase/auth-state'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { 
  getGuestCart, 
  getGuestCartCount, 
  addToGuestCart, 
  removeFromGuestCart, 
  updateGuestCartQuantity,
  migrateGuestCartToUser 
} from '@/lib/guest-cart'

interface CartWishlistContextType {
  cartCount: number
  wishlistCount: number
  cartItems: any[]
  wishlistItems: any[]
  addToCartOptimistic: (
    productId: string, 
    quantity?: number, 
    size?: string, 
    color?: string,
    bulkOrderData?: {
      isBulkOrder?: boolean
      bulkTierId?: string
      originalPrice?: number
      bulkPrice?: number
      bulkSavings?: number
    }
  ) => Promise<void>
  addSpecialOfferToCart: (offerId: string, selectedVariants: any[]) => Promise<void>
  addToWishlistOptimistic: (productId: string) => Promise<void>
  removeFromCartOptimistic: (itemId: string) => Promise<void>
  removeFromWishlistOptimistic: (itemId: string) => Promise<void>
  updateCartQuantityOptimistic: (itemId: string, newQuantity: number) => Promise<void>
  refreshCounts: () => Promise<void>
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined)

export function CartWishlistProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  // Fetch initial data
  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // User is authenticated - fetch from database
      const [cartResult, wishlistResult] = await Promise.all([
        supabase
          .from("cart_items")
          .select(`
            *,
            products (
              id,
              name,
              price,
              image_url,
              stock_quantity
            ),
            special_offers (
              id,
              title,
              description,
              special_price,
              original_price,
              discount_percentage
            )
          `)
          .eq("user_id", user.id),
        supabase
          .from("wishlist")
          .select(`
            *,
            products (
              id,
              name,
              price,
              image_url,
              stock_quantity
            )
          `)
          .eq("user_id", user.id)
      ])

      const cartData = cartResult.data || []
      const wishlistData = wishlistResult.data || []

      setCartItems(cartData)
      setWishlistItems(wishlistData)
      
      const cartTotal = cartData.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
      setCartCount(cartTotal)
      setWishlistCount(wishlistData.length)
    } else {
      // User is guest - fetch from localStorage
      const guestCart = getGuestCart()
      if (guestCart && guestCart.items.length > 0) {
        // Fetch product details for guest cart items
        const productIds = guestCart.items.map(item => item.productId)
        const { data: products } = await supabase
          .from('products')
          .select('id, name, price, image_url, stock_quantity')
          .in('id', productIds)

        if (products) {
          const cartItemsWithProducts = guestCart.items.map(item => {
            const product = products.find((p: { id: any }) => p.id === item.productId)
            return {
              id: item.id,
              user_id: null,
              product_id: item.productId,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              is_bulk_order: item.isBulkOrder,
              bulk_tier_id: item.bulkTierId,
              original_price: item.originalPrice,
              bulk_price: item.bulkPrice,
              bulk_savings: item.bulkSavings,
              special_offer_id: item.specialOfferId,
              special_offer_price: item.specialOfferPrice,
              products: product,
              created_at: item.addedAt,
              updated_at: item.addedAt
            }
          })
          
          setCartItems(cartItemsWithProducts)
          const cartTotal = cartItemsWithProducts.reduce((sum, item) => sum + item.quantity, 0)
          setCartCount(cartTotal)
        }
      } else {
        setCartItems([])
        setCartCount(0)
      }
      
      // Guest users don't have wishlist
      setWishlistItems([])
      setWishlistCount(0)
    }
  }

  const refreshCounts = async () => {
    await fetchData()
  }

  // Handle user authentication state changes using shared auth state manager
  useEffect(() => {
    console.log('CartContext: Setting up auth state manager subscription...')
    
    const unsubscribe = authStateManager.subscribe(async (currentUser) => {
      console.log('CartContext: Auth state changed, user:', currentUser?.id)
      setUser(currentUser)
      
      if (currentUser) {
        console.log('CartContext: User signed in, migrating cart...')
        // User just signed in - migrate guest cart if exists
        try {
          await migrateGuestCartToUser(supabase, currentUser.id)
          // Refresh data after migration
          await fetchData()
        } catch (error) {
          console.error('Error migrating guest cart:', error)
        }
      } else {
        console.log('CartContext: User signed out, clearing state...')
        // User signed out - clear local state
        setCartItems([])
        setWishlistItems([])
        setCartCount(0)
        setWishlistCount(0)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Subscribe to real-time changes
    const cartChannel = supabase
      .channel("cart-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () => {
        fetchData()
      })
      .subscribe()

    const wishlistChannel = supabase
      .channel("wishlist-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishlist" }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(cartChannel)
      supabase.removeChannel(wishlistChannel)
    }
  }, [])

  const addToCartOptimistic = async (
    productId: string, 
    quantity = 1, 
    size?: string, 
    color?: string,
    bulkOrderData?: {
      isBulkOrder?: boolean
      bulkTierId?: string
      originalPrice?: number
      bulkPrice?: number
      bulkSavings?: number
    }
  ) => {
    if (user) {
      // Authenticated user - use database
      try {
        // First, check if item already exists
        const { data: existingItem, error: checkError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .eq("size", size || null)
          .eq("color", color || null)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw checkError
        }

        if (existingItem) {
          // Update existing item quantity
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: existingItem.quantity + quantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingItem.id)

          if (updateError) throw updateError
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity,
              size,
              color,
              is_bulk_order: bulkOrderData?.isBulkOrder || false,
              bulk_tier_id: bulkOrderData?.bulkTierId || null,
              original_price: bulkOrderData?.originalPrice || null,
              bulk_price: bulkOrderData?.bulkPrice || null,
              bulk_savings: bulkOrderData?.bulkSavings || null,
            })

          if (insertError) throw insertError
        }

        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        console.error("Error adding to cart:", error instanceof Error ? error.message : "Unknown error")
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        })
      }
    } else {
      // Guest user - use localStorage
      try {
        // Add to guest cart with bulk order data
        addToGuestCart(productId, quantity, size, color, {
          isBulkOrder: bulkOrderData?.isBulkOrder,
          bulkTierId: bulkOrderData?.bulkTierId,
          originalPrice: bulkOrderData?.originalPrice,
          bulkPrice: bulkOrderData?.bulkPrice,
          bulkSavings: bulkOrderData?.bulkSavings,
        })

        // Optimistic update
        setCartCount(prev => prev + quantity)

        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev - quantity)
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        })
      }
    }
  }

  const addSpecialOfferToCart = async (offerId: string, selectedVariants: any[]) => {
    if (!selectedVariants || selectedVariants.length === 0) {
      toast({
        title: "No variants selected",
        description: "Please select variants for all products in the bundle",
        variant: "destructive",
      })
      return
    }

    try {
      // Fetch the special offer details
      const { data: offer, error: offerError } = await supabase
        .from("special_offers")
        .select("*")
        .eq("id", offerId)
        .eq("is_active", true)
        .or("end_date.is.null,end_date.gt." + new Date().toISOString())
        .single()

      if (offerError || !offer) {
        throw new Error("Special offer not found or expired")
      }

      if (user) {
        // Authenticated user - use database
        // First, validate stock availability for all variants
        for (const variant of selectedVariants) {
          if (variant.variant_id) {
            const { data: variantData, error: stockError } = await supabase
              .from("product_variants")
              .select("stock_quantity")
              .eq("id", variant.variant_id)
              .single()

            if (stockError || !variantData) {
              throw new Error(`Unable to verify stock for variant ${variant.variant_id}`)
            }

            if (variantData.stock_quantity < (variant.quantity || 1)) {
              throw new Error(`Insufficient stock for ${variant.size} ${variant.color}. Only ${variantData.stock_quantity} available.`)
            }
          }
        }

        // Calculate total quantity for optimistic update
        const totalQuantity = selectedVariants.reduce((sum, variant) => sum + (variant.quantity || 1), 0)
        
        // Optimistic update
        setCartCount(prev => prev + totalQuantity)

        // Add each variant to cart with special offer reference and reserve stock
        for (const variant of selectedVariants) {
          // Reserve stock if variant has specific stock tracking
          if (variant.variant_id) {
            const { error: reserveError } = await supabase.rpc('reserve_variant_stock', {
              variant_id: variant.variant_id,
              quantity_to_reserve: variant.quantity || 1
            })

            if (reserveError) {
              throw new Error(`Failed to reserve stock for ${variant.size} ${variant.color}`)
            }
          }

          const { error } = await supabase
            .from("cart_items")
            .upsert({
              user_id: user.id,
              product_id: variant.product_id,
              variant_id: variant.variant_id || null,
              quantity: variant.quantity || 1,
              size: variant.size || null,
              color: variant.color || null,
              special_offer_id: offerId,
              special_offer_price: offer.special_price / selectedVariants.length // Distribute price across items
            })

          if (error) throw error
        }

        toast({
          title: "Bundle added to cart",
          description: `${offer.title} has been added to your cart`,
        })

        // Refresh to get accurate data
        await fetchData()
      } else {
        // Guest user - use localStorage
        // Calculate price per item
        const pricePerItem = offer.special_price / selectedVariants.length
        const totalQuantity = selectedVariants.reduce((sum, variant) => sum + (variant.quantity || 1), 0)
        
        // Optimistic update
        setCartCount(prev => prev + totalQuantity)

        // Add each variant to guest cart
        for (const variant of selectedVariants) {
          addToGuestCart(
            variant.product_id,
            variant.quantity || 1,
            variant.size || undefined,
            variant.color || undefined,
            {
              specialOfferId: offerId,
              specialOfferPrice: pricePerItem
            }
          )
        }

        toast({
          title: "Bundle added to cart",
          description: `${offer.title} has been added to your cart`,
        })

        // Refresh to get accurate data
        await fetchData()
      }
    } catch (error) {
      // Revert optimistic update on error
      if (!user) {
        const totalQuantity = selectedVariants.reduce((sum, variant) => sum + (variant.quantity || 1), 0)
        setCartCount(prev => prev - totalQuantity)
      }
      console.error("Error adding special offer to cart:", error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add bundle to cart",
        variant: "destructive",
      })
    }
  }

  const addToWishlistOptimistic = async (productId: string) => {
    if (!user) {
      // Show authentication prompt for guest users
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your wishlist",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Navigate to login page with return URL
              window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`
            }}
          >
            Sign In
          </Button>
        ),
        duration: 5000,
      })
      return
    }

    // Check if already in wishlist
    const existingItem = wishlistItems.find(item => item.product_id === productId)
    if (existingItem) {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist",
      })
      return
    }

    // Optimistic update
    setWishlistCount(prev => prev + 1)

    try {
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (error) throw error

      toast({
        title: "Added to wishlist",
        description: "Item has been saved to your wishlist",
      })

      // Refresh to get accurate data
      await fetchData()
    } catch (error) {
      // Revert optimistic update on error
      setWishlistCount(prev => prev - 1)
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      })
    }
  }

  const removeFromCartOptimistic = async (itemId: string) => {
    // Find the item to get quantity for optimistic update
    const item = cartItems.find(item => item.id === itemId)
    if (!item) return

    if (user) {
      // Authenticated user - use database
      // Optimistic update
      setCartCount(prev => prev - item.quantity)
      setCartItems(prev => prev.filter(item => item.id !== itemId))

      try {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

        if (error) throw error

        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev + item.quantity)
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        })
      }
    } else {
      // Guest user - use localStorage
      try {
        // Remove from guest cart
        const removed = removeFromGuestCart(itemId)
        if (!removed) {
          toast({
            title: "Error",
            description: "Item not found in cart",
            variant: "destructive",
          })
          return
        }

        // Optimistic update
        setCartCount(prev => prev - item.quantity)
        setCartItems(prev => prev.filter(item => item.id !== itemId))

        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev + item.quantity)
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        })
      }
    }
  }

  const removeFromWishlistOptimistic = async (itemId: string) => {
    // Optimistic update
    setWishlistCount(prev => prev - 1)
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))

    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", itemId)

      if (error) throw error

      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      })
    } catch (error) {
      // Revert optimistic update on error
      setWishlistCount(prev => prev + 1)
      await fetchData()
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      })
    }
  }

  const updateCartQuantityOptimistic = async (itemId: string, newQuantity: number) => {
    // Find the current item to calculate quantity difference
    const currentItem = cartItems.find(item => item.id === itemId)
    if (!currentItem) return

    const quantityDiff = newQuantity - currentItem.quantity

    if (user) {
      // Authenticated user - use database
      // Optimistic update
      setCartCount(prev => prev + quantityDiff)
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )

      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq("id", itemId)

        if (error) throw error

        toast({
          title: "Cart updated",
          description: "Cart quantity has been updated",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev - quantityDiff)
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: currentItem.quantity } : item
          )
        )
        toast({
          title: "Error",
          description: "Failed to update cart quantity",
          variant: "destructive",
        })
      }
    } else {
      // Guest user - use localStorage
      try {
        // Update guest cart
        const updated = updateGuestCartQuantity(itemId, newQuantity)
        if (!updated) {
          toast({
            title: "Error",
            description: "Item not found in cart",
            variant: "destructive",
          })
          return
        }

        // Optimistic update
        setCartCount(prev => prev + quantityDiff)
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        )

        toast({
          title: "Cart updated",
          description: "Cart quantity has been updated",
        })

        // Refresh to get accurate data
        await fetchData()
      } catch (error) {
        // Revert optimistic update on error
        setCartCount(prev => prev - quantityDiff)
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: currentItem.quantity } : item
          )
        )
        toast({
          title: "Error",
          description: "Failed to update cart quantity",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <CartWishlistContext.Provider
      value={{
        cartCount,
        wishlistCount,
        cartItems,
        wishlistItems,
        addToCartOptimistic,
        addSpecialOfferToCart,
        addToWishlistOptimistic,
        removeFromCartOptimistic,
        removeFromWishlistOptimistic,
        updateCartQuantityOptimistic,
        refreshCounts,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  )
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext)
  if (context === undefined) {
    return {
      cartCount: 0,
      wishlistCount: 0,
      cartItems: [],
      wishlistItems: [],
      addToCartOptimistic: async () => {},
      addSpecialOfferToCart: async () => {},
      addToWishlistOptimistic: async () => {},
      removeFromCartOptimistic: async () => {},
      removeFromWishlistOptimistic: async () => {},
      updateCartQuantityOptimistic: async () => {},
      refreshCounts: async () => {},
    }
  }
  return context
}