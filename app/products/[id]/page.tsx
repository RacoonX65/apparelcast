import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AddToCartForm } from "@/components/add-to-cart-form"
import { ProductReviews } from "@/components/product-reviews"
import { WishlistButton } from "@/components/wishlist-button"
import Image from "next/image"
import { ProductCard } from "@/components/product-card"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products (same category, different product)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", id)
    .limit(4)

  const images = [product.image_url, ...(product.additional_images || [])].filter(Boolean)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={images[0] || `/placeholder.svg?height=800&width=600&query=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={img || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`}
                        alt={`${product.name} ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
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

              <div className="flex gap-3">
                <div className="flex-1">
                  <AddToCartForm
                    productId={product.id}
                    sizes={product.sizes || []}
                    colors={product.colors || []}
                    stockQuantity={product.stock_quantity}
                  />
                </div>
                <WishlistButton productId={product.id} variant="default" size="lg" />
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
              </div>
            </div>
          </div>

          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-3xl font-serif font-semibold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    id={relatedProduct.id}
                    name={relatedProduct.name}
                    price={relatedProduct.price}
                    image_url={relatedProduct.image_url}
                    category={relatedProduct.category}
                  />
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
