"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
  const supabase = createClient()

  useEffect(() => {
    checkWishlistStatus()
  }, [productId])

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
      // Remove from wishlist
      const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from wishlist.",
          variant: "destructive",
        })
      } else {
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        })
      }
    } else {
      // Add to wishlist
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to wishlist.",
          variant: "destructive",
        })
      } else {
        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist.",
        })
      }
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
        className="relative bg-transparent"
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
