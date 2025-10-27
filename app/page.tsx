import { AutoHideHeader } from "@/components/auto-hide-header"
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

const CategoryBadges = dynamic(() => import("@/components/category-badges").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />
})

const HomepagePromotions = dynamic(() => import("@/components/homepage-promotions").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-32 bg-muted rounded-lg animate-pulse" />
})

const DiscountPopup = dynamic(() => import("@/components/discount-popup").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-16 bg-muted rounded-lg animate-pulse" />
})

const NewsletterSignup = dynamic(() => import("@/components/newsletter-signup").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-48 bg-muted rounded-lg animate-pulse" />
})

const RecentlyViewedProducts = dynamic(() => import("@/components/recently-viewed-products").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />
})

const FeaturedAds = dynamic(() => import("@/components/featured-ads").then(mod => ({ default: mod.default })), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="aspect-video bg-muted rounded-lg animate-pulse" />
    <div className="aspect-video bg-muted rounded-lg animate-pulse hidden md:block" />
  </div>
})

const SpecialOffersSlider = dynamic(() => import("@/components/special-offers-slider").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 bg-muted rounded-lg animate-pulse" />
})

export const metadata: Metadata = {
  title: "ApparelCast – Trend-Led Fashion & Lifestyle Store",
  description: "Discover curated fashion: statement dresses, streetwear sneakers, and luxury fragrances. Shop new arrivals and seasonal edits with fast delivery across South Africa.",
  keywords: "fashion, women's fashion, men's fashion, streetwear, sneakers, fragrances, South Africa, online clothing, new arrivals, curated edits",
  openGraph: {
    title: "ApparelCast – Fashion & Lifestyle | New Drops",
    description: "Curated fashion and lifestyle — explore new arrivals, designer sneakers, and fragrances.",
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

  // Fetch products by category (4 latest per category)
  const categories = ['clothing', 'shoes', 'perfumes', 'home', 'electronics']
  
  const categoryProducts = await Promise.all(
    categories.map(async (category) => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(4)
      
      return {
        category,
        products: data || []
      }
    })
  )
  
  // Filter out categories with no products
  const categoriesWithProducts = categoryProducts.filter(cat => cat.products.length > 0)

  // Fetch active hero banners
  const { data: heroBanners } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  // Fetch featured ad banners (slots 1 and 2)
  const { data: featuredAds } = await supabase
    .from("ad_banners")
    .select("*")
    .eq("is_active", true)
    .not('featured_rank', 'is', null)
    .order("featured_rank", { ascending: true })

  return (
    <div className="flex flex-col min-h-screen">
      <AutoHideHeader />

      <main className="flex-1">
        {/* Hero Section */}
        {heroBanners && heroBanners.length > 0 ? (
          <HeroSlider banners={heroBanners} />
        ) : (
          <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
            <div className="container mx-auto px-4 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance">Elevate Your Style</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Curated fashion and lifestyle — from streetwear to scent. New drops weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-primary hover:bg-accent text-primary-foreground">
                  <Link href="/products">Shop New Arrivals</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/products">Explore Collections</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Category Badges */}
        <CategoryBadges />

        {/* Special Offers Slider */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SpecialOffersSlider />
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Featured Picks</h2>
              <p className="text-muted-foreground">Hand-picked from our latest collections</p>
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
                    slug={product.slug}
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

        {/* Featured Ads (swapped into Special Offers position) */}
        {featuredAds && featuredAds.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <FeaturedAds ads={featuredAds} />
            </div>
          </section>
        )}

        {/* Categorized Product Showcase */}
        {categoriesWithProducts.map((categoryData, index) => {
          const categoryDisplayNames = {
            'clothing': 'Fashion & Apparel',
            'shoes': 'Footwear Collection',
            'perfumes': 'Fragrances',
            'home': 'Home & Living',
            'electronics': 'Tech & Electronics'
          }
          
          const categoryDescriptions = {
            'clothing': 'Discover the latest trends in fashion',
            'shoes': 'Step into style with our curated footwear',
            'perfumes': 'Signature scents for every occasion',
            'home': 'Transform your space with our home collection',
            'electronics': 'Cutting-edge tech for modern living'
          }
          
          return (
            <section key={categoryData.category} className={`py-16 ${index % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                    {categoryDisplayNames[categoryData.category as keyof typeof categoryDisplayNames]}
                  </h2>
                  <p className="text-muted-foreground">
                    {categoryDescriptions[categoryData.category as keyof typeof categoryDescriptions]}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categoryData.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image_url={product.image_url}
                      category={product.category}
                      slug={product.slug}
                    />
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Button asChild variant="outline" size="lg">
                    <Link href={`/products?category=${categoryData.category}`}>
                      View All {categoryDisplayNames[categoryData.category as keyof typeof categoryDisplayNames]}
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          )
        })}

        {/* Promotional Offers */}
        <HomepagePromotions />

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
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Join the Style List</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get early access to drops, exclusive offers, and seasonal edits — straight to your inbox.
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
