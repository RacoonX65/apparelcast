"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { AddToCartForm } from "@/components/add-to-cart-form"
import { BulkAddToCartForm } from "@/components/bulk-add-to-cart-form"
import { WishlistButton } from "@/components/wishlist-button"
import { PageStoreLoading } from "@/components/store-loading"
import { RecentlyViewedProducts, addToRecentlyViewed } from "@/components/recently-viewed-products"
import { createClient } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import Image from "next/image"
import { useState, useEffect, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { BackInStockSubscribe } from "@/components/back-in-stock-subscribe"
import { ProductShare } from "@/components/product-share"
import { ProductStructuredData } from "@/components/structured-data"
import { SizeGuide } from "@/components/size-guide"

// Lazy load heavy components
const ProductReviewsComponent = lazy(() => import("@/components/product-reviews").then(module => ({ default: module.ProductReviews })))

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [orderType, setOrderType] = useState<'single' | 'bulk'>('single')
  const [bulkTiers, setBulkTiers] = useState<any[]>([])

  useEffect(() => {
    async function fetchProduct() {
      const { id } = await params
      const supabase = createClient()
      
      const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error || !product) {
        notFound()
      }

      // Fetch bulk pricing tiers if available
      if (product.enable_bulk_pricing) {
        const { data: tiers } = await supabase
          .from("bulk_pricing_tiers")
          .select("*")
          .eq("product_id", id)
          .order("min_quantity", { ascending: true })
        
        setBulkTiers(tiers || [])
      }

      // Fetch related products
      const { data: relatedProducts } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", id)
        .limit(4)

      setProduct(product)
      setRelatedProducts(relatedProducts || [])
      
      // Add to recently viewed products
      addToRecentlyViewed(id)
      
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={images[selectedImageIndex] || `/placeholder.svg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`aspect-square relative overflow-hidden rounded-lg bg-muted cursor-pointer transition-all ${
                        selectedImageIndex === idx 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : 'hover:opacity-80'
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <Image
                        src={img || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={`/placeholder.svg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.category}</p>
                <h1 className="text-4xl font-serif font-semibold mb-4">{product.name}</h1>
                <p className="text-3xl font-semibold text-primary">R {product.price.toFixed(2)}</p>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4">
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
                    />
                  )
                ) : (
                  <BackInStockSubscribe productId={product.id} productName={product.name} />
                )}
                
                {/* Add to Wishlist Section */}
                <WishlistButton productId={product.id} variant="default" size="lg" />
                
                {/* Social Sharing Section */}
                <div className="mt-4">
                  <ProductShare 
                    productName={product.name}
                    productPrice={product.price}
                    productDescription={product.description}
                    productImage={images[selectedImageIndex] || `/placeholder.svg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
                    productId={product.id}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Category: {product.category}</li>
                    {product.subcategory && <li>Type: {product.subcategory}</li>}
                    <li>Stock: {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</li>
                  </ul>
                </div>

                {/* Size Guide (Inline) */}
                <div id="size-guide" className="mt-6">
                  <h3 className="font-medium mb-2">Size Guide (South Africa)</h3>
                  <SizeGuide />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
              <ProductReviewsComponent productId={product.id} />
            </Suspense>
          </div>

          {/* Recently Viewed Products */}
          <div className="mt-16">
            <RecentlyViewedProducts currentProductId={product.id} maxItems={6} />
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
