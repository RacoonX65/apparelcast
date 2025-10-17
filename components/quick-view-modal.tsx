"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Eye, Star, X, Plus, Minus } from "lucide-react"
import { addToRecentlyViewed } from "@/components/recently-viewed-products"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  subcategory: string
  stock: number
  sizes: string[]
  colors: string[]
  image_url: string
  additional_images?: string[]
  slug?: string
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [fullProduct, setFullProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (product && isOpen) {
      // Reset form when product changes
      setSelectedSize("")
      setSelectedColor("")
      setQuantity(1)
      setSelectedImageIndex(0)
      
      // Add to recently viewed
      addToRecentlyViewed(product.id)
      
      // Fetch complete product data
      fetchFullProductData()
      
      // Fetch reviews data
      fetchReviewsData()
    }
  }, [product, isOpen])

  const fetchFullProductData = async () => {
    if (!product) return

    setIsLoadingProduct(true)
    try {
      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single()

      if (error) throw error

      if (productData) {
        setFullProduct({
          ...productData,
          images: [productData.image_url, ...(productData.additional_images || [])].filter(Boolean),
          sizes: productData.sizes || [],
          colors: productData.colors || [],
        })
      }
    } catch (error) {
      console.error("Error fetching product data:", error)
      // Fallback to the basic product data
      setFullProduct(product)
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const fetchReviewsData = async () => {
    if (!product) return

    try {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id)

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        setAverageRating(avgRating)
        setReviewCount(reviews.length)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your cart.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      if (displayProduct.sizes.length > 0 && !selectedSize) {
        toast({
          title: "Please select a size",
          description: "Size selection is required for this product.",
          variant: "destructive",
        })
        return
      }

      if (displayProduct.colors.length > 0 && !selectedColor) {
        toast({
          title: "Please select a color",
          description: "Color selection is required for this product.",
          variant: "destructive",
        })
        return
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .eq("size", selectedSize || "")
        .eq("color", selectedColor || "")
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ 
            quantity: existingItem.quantity + quantity, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null,
        })

        if (error) throw error
      }

      toast({
        title: "Added to cart",
        description: `${displayProduct.name} has been added to your cart.`,
      })

      onClose()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!product) return

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
        .insert({ user_id: user.id, product_id: product.id })

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

  if (!product) return null

  // Use full product data if available, otherwise fallback to basic product data
  const displayProduct = fullProduct || product
  const images = displayProduct.images || [displayProduct.image_url].filter(Boolean)

  if (isLoadingProduct) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Product...</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View - {product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Product Images */}
          <div className="space-y-4 min-w-0">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={images[selectedImageIndex] || "/placeholder.jpg"}
                alt={displayProduct.name}
                fill
                className="object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`aspect-square relative overflow-hidden rounded-lg bg-muted cursor-pointer transition-all ${
                      selectedImageIndex === idx 
                        ? 'ring-2 ring-pink-500 ring-offset-2' 
                        : 'hover:opacity-75'
                    }`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <Image
                      src={img}
                      alt={`${displayProduct.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 min-w-0">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{displayProduct.category}</span>
                <span>•</span>
                <span>{displayProduct.subcategory}</span>
              </div>
              
              <h1 className="text-2xl font-serif font-semibold mb-2">{displayProduct.name}</h1>
              
              {reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-pink-600">
                  R{displayProduct.price.toFixed(2)}
                </span>
                
                {displayProduct.stock === 0 ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : displayProduct.stock < 10 ? (
                  <Badge variant="secondary">Only {displayProduct.stock} left</Badge>
                ) : (
                  <Badge variant="secondary">In Stock</Badge>
                )}
              </div>

              <p className="text-muted-foreground line-clamp-3 break-words">
                {displayProduct.description}
              </p>
            </div>

            {/* Size Selection */}
            {displayProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayProduct.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {displayProduct.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(displayProduct.colors)].map((color, index) => (
                      <SelectItem key={`${color}-${index}`} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= displayProduct.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || displayProduct.stock === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                  title="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Button>

                <Button variant="outline" size="icon" asChild aria-label="View details" title="View details">
                  <Link href={`/products/${displayProduct.slug || displayProduct.id}`}>
                    <Eye className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick View Button Component
interface QuickViewButtonProps {
  product: Product
  className?: string
}

export function QuickViewButton({ product, className = "" }: QuickViewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <QuickViewModal
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}