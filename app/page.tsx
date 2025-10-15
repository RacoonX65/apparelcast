import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import type { Metadata } from "next"

// Lazy load below-the-fold components
import dynamic from "next/dynamic"

const HomepagePromotions = dynamic(() => import("@/components/homepage-promotions").then(module => ({ default: module.HomepagePromotions })), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />
})

const DiscountPopup = dynamic(() => import("@/components/discount-popup").then(module => ({ default: module.DiscountPopup })), {
  loading: () => <div className="h-16 bg-muted rounded-lg animate-pulse" />
})

const NewsletterSignup = dynamic(() => import("@/components/newsletter-signup").then(module => ({ default: module.NewsletterSignup })), {
  loading: () => <div className="h-48 bg-muted rounded-lg animate-pulse" />
})

export const metadata: Metadata = {
  title: "CAARL Fashion Store - Shop Premium Women's Fashion Online",
  description: "Welcome to CAARL Fashion Store - South Africa's premier destination for women's fashion, designer sneakers, and luxury perfumes. Discover the latest trends and timeless pieces with free nationwide delivery.",
  keywords: "CAARL fashion store, women's fashion South Africa, online fashion shopping, designer sneakers, luxury perfumes, South African fashion brands, trendy clothing, fashion accessories",
  openGraph: {
    title: "CAARL Fashion Store - Shop Premium Women's Fashion Online",
    description: "Welcome to CAARL Fashion Store - South Africa's premier destination for women's fashion, designer sneakers, and luxury perfumes.",
    url: "https://caarl.co.za",
    type: "website",
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .limit(8)
    .order("created_at", { ascending: false })

  // Fetch new arrivals
  const { data: newArrivals } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance">Effortless Elegance</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Discover curated fashion that celebrates your unique style
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/products?filter=new">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Promotional Offers */}
        <HomepagePromotions />

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Featured Collection</h2>
                <p className="text-muted-foreground">Handpicked pieces just for you</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image_url={product.image_url}
                    category={product.category}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg">
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Shop by Category</h2>
              <p className="text-muted-foreground">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/products?category=clothing"
                className="group relative h-80 overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-end justify-center p-8 z-20">
                  <h3 className="text-3xl font-serif font-semibold text-white">Clothing</h3>
                </div>
                <div className="absolute inset-0 bg-secondary group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <Link
                href="/products?category=sneakers"
                className="group relative h-80 overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-end justify-center p-8 z-20">
                  <h3 className="text-3xl font-serif font-semibold text-white">Sneakers</h3>
                </div>
                <div className="absolute inset-0 bg-accent group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <Link
                href="/products?category=perfumes"
                className="group relative h-80 overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-end justify-center p-8 z-20">
                  <h3 className="text-3xl font-serif font-semibold text-white">Perfumes</h3>
                </div>
                <div className="absolute inset-0 bg-primary group-hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        {newArrivals && newArrivals.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">New Arrivals</h2>
                <p className="text-muted-foreground">Fresh styles, just landed</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image_url={product.image_url}
                    category={product.category}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Never Miss a Deal</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our newsletter and be the first to know about exclusive discount codes and special offers.
              </p>
            </div>
            <div className="flex justify-center">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <DiscountPopup />
    </div>
  )
}
