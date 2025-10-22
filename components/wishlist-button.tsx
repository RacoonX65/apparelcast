"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useCartWishlist } from "@/contexts/cart-wishlist-context"

interface WishlistButtonProps {
  productId: string
  variant?: "default" | "icon"
  size?: "default" | "sm" | "lg" | "icon"
}

export function WishlistButton({ productId, variant = "icon", size = "icon" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { addToWishlistOptimistic, removeFromWishlistOptimistic, wishlistItems } = useCartWishlist()

  useEffect(() => {
    checkWishlistStatus()
  }, [productId])

  useEffect(() => {
    // Update local state based on context
    const isInContext = wishlistItems.some(item => item.product_id === productId)
    setIsInWishlist(isInContext)
  }, [wishlistItems, productId])

  const checkWishlistStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      setIsInWishlist(!!data)
    }
  }

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
      })
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    if (isInWishlist) {
      // Find the wishlist item to remove
      const wishlistItem = wishlistItems.find(item => item.product_id === productId)
      if (wishlistItem) {
        await removeFromWishlistOptimistic(wishlistItem.id)
      }
    } else {
      // Add to wishlist using optimistic update
      await addToWishlistOptimistic(productId)
    }

    setIsLoading(false)
  }

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleWishlist}
        disabled={isLoading}
        className="bg-white/90 hover:bg-white text-black border-0 shadow-md h-8 w-8 p-0"
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-primary text-primary" : ""}`} />
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={toggleWishlist} disabled={isLoading} className="w-full bg-transparent">
      <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-primary text-primary" : ""}`} />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  )
}
