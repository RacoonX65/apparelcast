"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Eye, Heart, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  additional_images: string[]
  images: string[]
  category: string
  subcategory: string
  stock_quantity: number
  sizes: string[]
  colors: string[]
}

interface RecentlyViewedProductsProps {
  currentProductId?: string
  maxItems?: number
  showTitle?: boolean
}

export function RecentlyViewedProducts({ 
  currentProductId, 
  maxItems = 6, 
  showTitle = true 
}: RecentlyViewedProductsProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadRecentlyViewed()
  }, [currentProductId])

  const loadRecentlyViewed = async () => {
    try {
      // Get recently viewed product IDs from localStorage
      const recentIds = getRecentlyViewedIds()
      
      if (recentIds.length === 0) {
        setIsLoading(false)
        return
      }

      // Fetch product details from database
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .in("id", recentIds)
        .limit(maxItems)

      if (error) throw error

      // Sort products by the order they were viewed (most recent first)
      const sortedProducts = recentIds
        .map(id => products?.find(p => p.id === id))
        .filter(Boolean)
        .map(product => ({
          ...product,
          images: [product.image_url, ...(product.additional_images || [])].filter(Boolean)
        })) as Product[]

      setRecentProducts(sortedProducts)
    } catch (error) {
      console.error("Error loading recently viewed products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecentlyViewedIds = (): string[] => {
    if (typeof window === "undefined") return []
    
    const stored = localStorage.getItem("recentlyViewed")
    const ids = stored ? JSON.parse(stored) : []
    
    // Filter out current product if provided
    return currentProductId 
      ? ids.filter((id: string) => id !== currentProductId)
      : ids
  }

  const addToWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your wishlist.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId })

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist.",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist.",
        })
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-serif font-semibold">Recently Viewed</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-pink-600" />
          <h2 className="text-2xl font-serif font-semibold">Recently Viewed</h2>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/20 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => addToWishlist(product.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-muted-foreground">
                  {product.category} • {product.subcategory}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-pink-600">
                    R{product.price.toFixed(2)}
                  </span>
                  
                  {product.stock_quantity === 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Utility functions for managing recently viewed products
export const addToRecentlyViewed = (productId: string) => {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem("recentlyViewed")
  const recentIds: string[] = stored ? JSON.parse(stored) : []
  
  // Remove if already exists to avoid duplicates
  const filteredIds = recentIds.filter(id => id !== productId)
  
  // Add to beginning of array (most recent first)
  const updatedIds = [productId, ...filteredIds].slice(0, 12) // Keep max 12 items
  
  localStorage.setItem("recentlyViewed", JSON.stringify(updatedIds))
}

export const clearRecentlyViewed = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("recentlyViewed")
}