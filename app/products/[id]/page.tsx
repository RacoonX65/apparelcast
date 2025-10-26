"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { AddToCartForm } from "@/components/add-to-cart-form"
import { BulkAddToCartForm } from "@/components/bulk-add-to-cart-form"
import { WishlistButton } from "@/components/wishlist-button"
import { PageStoreLoading } from "@/components/store-loading"
import { RecentlyViewedProducts, addToRecentlyViewed } from "@/components/recently-viewed-products"
import { supabase } from "@/lib/supabase/client"
import { createClient } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import Image from "next/image"
import { useState, useEffect, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ZoomIn, X } from "lucide-react"
import { BackInStockSubscribe } from "@/components/back-in-stock-subscribe"
import { ProductShare } from "@/components/product-share"
import { ProductStructuredData } from "@/components/structured-data"
import { SizeGuide } from "@/components/size-guide"
import { useColorImageMapping } from "@/hooks/use-color-image-mapping"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  additional_images?: string[]
  category: string
  brand?: string
  colors?: string[]
  sizes?: string[]
  enable_bulk_pricing?: boolean
  subcategory?: string
  stock_quantity: number
  slug?: string
}

interface BulkPricingTier {
  id: string
  product_id: string
  min_quantity: number
  max_quantity: number | null
  discount_type: "percentage" | "fixed_amount" | "fixed_price"
  discount_value: number
  price?: number
}

interface User {
  id: string
  email?: string
}

// Lazy load heavy components
const ProductReviewsComponent = lazy(() => import("@/components/product-reviews").then(module => ({ default: module.ProductReviews })))

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [orderType, setOrderType] = useState<'single' | 'bulk'>('single')
  const [bulkTiers, setBulkTiers] = useState<BulkPricingTier[]>([])
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)

  // Initialize color-image mapping hook
  const {
    colorMappings,
    loading: mappingsLoading,
    selectedColor,
    currentImageUrl,
    handleColorSelect,
    resetSelection,
    hasAnyColorMappings
  } = useColorImageMapping({
    productId: product?.id || '',
    productColors: product?.colors || [],
    defaultImages: product ? [product.image_url, ...(product.additional_images || [])] : []
  })

  // Handle color selection and reset thumbnail selection
  const handleColorSelectWithReset = (color: string) => {
    handleColorSelect(color)
    setSelectedImageIndex(0) // Reset to first image when color changes
  }
  useEffect(() => {
    async function fetchProduct() {
      const { id } = await params
      const supabase = createClient()
      
      // First try to find by slug, then fallback to UUID
      let { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", id)
        .single()

      // If not found by slug, try by UUID (for backward compatibility)
      if (error || !product) {
        const { data: productById, error: errorById } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single()
        
        product = productById
        error = errorById
      }

      if (error || !product) {
        notFound()
      }

      // Fetch bulk pricing tiers if available
      if (product.enable_bulk_pricing) {
        const { data: tiers } = await supabase
          .from("bulk_pricing_tiers")
          .select("*")
          .eq("product_id", product.id)
          .order("min_quantity", { ascending: true })
        
        setBulkTiers(tiers || [])
      }

      // Fetch related products
      const { data: relatedProducts } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(4)

      setProduct(product)
      setRelatedProducts(relatedProducts || [])
      
      // Add to recently viewed products
      addToRecentlyViewed(product.id)
      
      setLoading(false)
    }

    fetchProduct()
  }, [params])

  if (loading) {
    return <PageStoreLoading message="Loading product details..." />
  }

  if (!product) {
    notFound()
  }

  const images = [product.image_url, ...(product.additional_images || [])].filter(Boolean)
  
  // Determine which image to display - prioritize user selection over color mapping
  const displayImage = selectedImageIndex > 0 ? images[selectedImageIndex] :
    (hasAnyColorMappings && currentImageUrl ? currentImageUrl : images[0])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product structured data for rich results and thumbnails */}
          <ProductStructuredData
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              image_url: images[0],
              category: product.category,
              brand: product.brand,
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg bg-white border shadow-sm w-full max-w-full aspect-square group cursor-pointer"
                   onClick={() => setIsZoomModalOpen(true)}>
                <Image
                  src={displayImage || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                {/* Zoom Icon Overlay */}
                <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ZoomIn className="h-4 w-4" />
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square relative overflow-hidden rounded-lg bg-white cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/50 ${
                        selectedImageIndex === idx
                          ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-lg'
                          : 'hover:scale-[1.02] opacity-80'
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <Image
                        src={img || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
                      />
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className="relative overflow-hidden rounded-lg bg-white border shadow-sm w-full max-w-full aspect-square group cursor-pointer"
                     onClick={() => setIsZoomModalOpen(true)}>
                  <Image
                    src={`/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                  {/* Zoom Icon Overlay */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{product.category}</p>
                <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-3 leading-tight">{product.name}</h1>
                <p className="text-xl md:text-2xl font-semibold text-primary">R {product.price.toFixed(2)}</p>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{product.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-3">
                {/* Order Type Tabs */}
                {product.enable_bulk_pricing && bulkTiers.length > 0 && (
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                    <Button
                      variant={orderType === 'single' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setOrderType('single')}
                      className="flex-1"
                    >
                      Single Order
                    </Button>
                    <Button
                      variant={orderType === 'bulk' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setOrderType('bulk')}
                      className="flex-1"
                    >
                      Bulk Order
                    </Button>
                  </div>
                )}

                {/* Conditional Form Rendering */}
                {product.stock_quantity > 0 ? (
                  orderType === 'single' ? (
                    <AddToCartForm
                      productId={product.id}
                      sizes={product.sizes || []}
                      colors={product.colors || []}
                      stockQuantity={product.stock_quantity}
                      onColorChange={handleColorSelectWithReset}
                    />
                  ) : (
                    <BulkAddToCartForm
                      productId={product.id}
                      productName={product.name}
                      sizes={product.sizes || []}
                      colors={product.colors || []}
                      stockQuantity={product.stock_quantity}
                      bulkTiers={bulkTiers}
                      productPrice={product.price}
                      onColorChange={handleColorSelectWithReset}
                    />
                  )
                ) : (
                  <BackInStockSubscribe productId={product.id} productName={product.name} />
                )}
                
                {/* Add to Wishlist Section */}
                <WishlistButton productId={product.id} variant="default" size="lg" />
                
                {/* Social Sharing Section */}
                <div className="mt-3">
                  <ProductShare 
                    productName={product.name}
                    productPrice={product.price}
                    productDescription={product.description}
                    productImage={images[selectedImageIndex] || `/placeholder.svg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
                    productId={product.id}
                    productSlug={product.slug}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-4 space-y-2">
                <div>
                  <h3 className="font-medium mb-2 text-sm">Product Details</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>Category: {product.category}</li>
                    {product.subcategory && <li>Type: {product.subcategory}</li>}
                    <li>Stock: {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</li>
                  </ul>
                </div>

                {/* Size Guide (Inline) */}
                <div id="size-guide" className="mt-4">
                  <h3 className="font-medium mb-2 text-sm">Size Guide (South Africa)</h3>
                  <SizeGuide />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
              <ProductReviewsComponent productId={product.id} />
            </Suspense>
          </div>

          {/* Recently Viewed Products */}
          <div className="mt-8">
            <RecentlyViewedProducts currentProductId={product.id} maxItems={6} />
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-6">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zoom Modal */}
        <Dialog open={isZoomModalOpen} onOpenChange={setIsZoomModalOpen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Zoomed Image */}
              <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
                <Image
                  src={displayImage || `/placeholder.svg?height=1200&width=1200&query=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-2 bg-black/50 p-2 rounded-lg">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 relative rounded overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(product.name)}`}
                          alt={`${product.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}
