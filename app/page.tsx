import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { HeroSlider } from "@/components/hero-slider"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import type { Metadata } from "next"

// Lazy load below-the-fold components
import dynamic from "next/dynamic"

const CategoryBadges = dynamic(() => import("@/components/category-badges").then(module => ({ default: module.CategoryBadges })), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />
})

const HomepagePromotions = dynamic(() => import("@/components/homepage-promotions").then(module => ({ default: module.HomepagePromotions })), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />
})

const DiscountPopup = dynamic(() => import("@/components/discount-popup").then(module => ({ default: module.DiscountPopup })), {
  loading: () => <div className="h-16 bg-muted rounded-lg animate-pulse" />
})

const NewsletterSignup = dynamic(() => import("@/components/newsletter-signup").then(module => ({ default: module.NewsletterSignup })), {
  loading: () => <div className="h-48 bg-muted rounded-lg animate-pulse" />
})

const RecentlyViewedProducts = dynamic(() => import("@/components/recently-viewed-products").then(module => ({ default: module.RecentlyViewedProducts })), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />
})

export const metadata: Metadata = {
  title: "ApparelCast - Secure Online Fashion Store | CIPC Registered",
  description: "ApparelCast - South Africa's trusted CIPC registered clothing company. Secure bulk and retail fashion purchases. No more WhatsApp scams - shop with confidence!",
  keywords: "ApparelCast fashion store, CIPC registered clothing, secure online shopping, bulk clothing orders, South Africa fashion, trusted apparel store, no scam shopping",
  openGraph: {
    title: "ApparelCast - Secure Online Fashion Store | CIPC Registered",
    description: "South Africa's trusted CIPC registered clothing company. Secure bulk and retail fashion purchases with full legal protection.",
    url: "https://apparelcast.shop",
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

  // Fetch active hero banners
  const { data: heroBanners } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        {heroBanners && heroBanners.length > 0 ? (
          <HeroSlider banners={heroBanners} />
        ) : (
          <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
            <div className="container mx-auto px-4 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance">Secure Fashion Shopping</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                CIPC registered company eliminating online fashion scams. Shop single items or bulk orders with complete confidence and legal protection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground">
                  <Link href="/products">Shop Securely</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Request Bulk Quote</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Category Badges */}
        <CategoryBadges />

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Validated Quality Collection</h2>
              <p className="text-muted-foreground">Every item quality-checked and verified before sale</p>
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

        {/* Promotional Offers */}
        <HomepagePromotions />

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

        {/* Recently Viewed Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <RecentlyViewedProducts maxItems={6} />
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Stay Updated on Secure Deals</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive offers, bulk pricing updates, and security tips for safe online shopping.
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
