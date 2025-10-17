"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface CartWishlistContextType {
  cartCount: number
  wishlistCount: number
  cartItems: any[]
  wishlistItems: any[]
  addToCartOptimistic: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>
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
  const supabase = createClient()
  const { toast } = useToast()

  // Fetch initial data
  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const [cartResult, wishlistResult] = await Promise.all([
        supabase
          .from("cart_items")
          .select(`
            *,
            is_bulk_order,
            bulk_tier_id,
            original_price,
            bulk_price,
            bulk_savings,
            products (
              id,
              name,
              price,
              image_url,
              stock_quantity
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
      
      const cartTotal = cartData.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(cartTotal)
      setWishlistCount(wishlistData.length)
    }
  }

  const refreshCounts = async () => {
    await fetchData()
  }

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

  const addToCartOptimistic = async (productId: string, quantity = 1, size?: string, color?: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      })
      return
    }

    // Optimistic update
    setCartCount(prev => prev + quantity)

    try {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        size,
        color,
      })

      if (error) throw error

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

  const addSpecialOfferToCart = async (offerId: string, selectedVariants: any[]) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      })
      return
    }

    if (!selectedVariants || selectedVariants.length === 0) {
      toast({
        title: "No variants selected",
        description: "Please select variants for all products in the bundle",
        variant: "destructive",
      })
      return
    }

    // Calculate total quantity for optimistic update
    const totalQuantity = selectedVariants.reduce((sum, variant) => sum + (variant.quantity || 1), 0)
    
    // Optimistic update
    setCartCount(prev => prev + totalQuantity)

    try {
      // Fetch the special offer details
      const { data: offer, error: offerError } = await supabase
        .from("special_offers")
        .select("*")
        .eq("id", offerId)
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString())
        .single()

      if (offerError || !offer) {
        throw new Error("Special offer not found or expired")
      }

      // Add each variant to cart with special offer reference
      for (const variant of selectedVariants) {
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
    } catch (error) {
      // Revert optimistic update on error
      setCartCount(prev => prev - totalQuantity)
      console.error("Error adding special offer to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add bundle to cart",
        variant: "destructive",
      })
    }
  }

  const addToWishlistOptimistic = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist",
        variant: "destructive",
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
        description: "Item has been added to your wishlist",
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
    const item = cartItems.find(item => item.id === itemId)
    if (!item) return

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
    } catch (error) {
      // Revert optimistic update on error
      setCartCount(prev => prev + item.quantity)
      await fetchData()
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
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
    const item = cartItems.find(item => item.id === itemId)
    if (!item) return

    const quantityDiff = newQuantity - item.quantity

    // Optimistic update
    setCartCount(prev => prev + quantityDiff)
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId)

      if (error) throw error
    } catch (error) {
      // Revert optimistic update on error
      setCartCount(prev => prev - quantityDiff)
      await fetchData()
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
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
    throw new Error('useCartWishlist must be used within a CartWishlistProvider')
  }
  return context
}