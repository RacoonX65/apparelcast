import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductFilters } from "@/components/product-filters"
import { Pagination } from "@/components/pagination"
import type { Metadata } from "next"
import { Sparkles } from "lucide-react"
import { ItemListStructuredData } from "@/components/structured-data"
import Image from "next/image"

// Static metadata removed because dynamic metadata is provided below

// Dynamic metadata to set OG/Twitter image based on current filter
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    subcategory?: string
    brand?: string
    material?: string
    sizes?: string
    colors?: string
    stockStatus?: string
    filter?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}): Promise<Metadata> {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("products").select("id, name, image_url, created_at, price")

  if (params.search) query = query.ilike("name", `%${params.search}%`)
  if (params.category) query = query.eq("category", params.category)
  if (params.subcategory) query = query.eq("subcategory", params.subcategory)
  if (params.brand) query = query.eq("brand", params.brand)
  if (params.material) query = query.eq("material", params.material)
  if (params.sizes) query = query.overlaps("sizes", params.sizes.split(","))
  if (params.colors) query = query.overlaps("colors", params.colors.split(","))
  if (params.stockStatus === "in-stock") query = query.gt("stock_quantity", 0)
  if (params.stockStatus === "out-of-stock") query = query.eq("stock_quantity", 0)
  if (params.minPrice) query = query.gte("price", Number.parseFloat(params.minPrice))
  if (params.maxPrice) query = query.lte("price", Number.parseFloat(params.maxPrice))

  const sortBy = params.sort || "newest"
  switch (sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: firstProducts } = await query.limit(1)
  const firstImage = firstProducts && firstProducts[0]?.image_url
  const imageUrl = firstImage || "/apparelcast.png"

  const titleBase = "ApparelCast – Products"
  const pageTitle = params.search
    ? `${titleBase} | Search: ${params.search}`
    : params.category
      ? `${titleBase} | ${params.category}`
      : titleBase

  return {
    title: pageTitle,
    alternates: { canonical: "https://apparelcast.shop/products" },
    openGraph: {
      type: "website",
      url: "https://apparelcast.shop/products",
      title: pageTitle,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@apparel_cast",
      creator: "@apparel_cast",
      title: pageTitle,
      images: [imageUrl],
    },
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    subcategory?: string
    brand?: string
    material?: string
    sizes?: string
    colors?: string
    stockStatus?: string
    filter?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query based on filters
  let query = supabase.from("products").select("*")

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.subcategory) {
    query = query.eq("subcategory", params.subcategory)
  }

  if (params.brand) {
    query = query.eq("brand", params.brand)
  }

  if (params.material) {
    query = query.eq("material", params.material)
  }

  if (params.sizes) {
    const sizesArray = params.sizes.split(',')
    query = query.overlaps("sizes", sizesArray)
  }

  if (params.colors) {
    const colorsArray = params.colors.split(',')
    query = query.overlaps("colors", colorsArray)
  }

  if (params.stockStatus) {
    if (params.stockStatus === 'in-stock') {
      query = query.gt("stock_quantity", 0)
    } else if (params.stockStatus === 'out-of-stock') {
      query = query.eq("stock_quantity", 0)
    }
  }

  if (params.minPrice) {
    query = query.gte("price", Number.parseFloat(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number.parseFloat(params.maxPrice))
  }

  const sortBy = params.sort || "newest"
  switch (sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  // Add pagination
  const page = Number.parseInt(params.page || '1')
  const limit = 24 // Show 24 products per page
  const offset = (page - 1) * limit

  const { data: products, error: productsError } = await query
    .range(offset, offset + limit - 1)
    .limit(limit)

  // Get total count for pagination
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq(params.category ? 'category' : '', params.category || '')
    .eq(params.subcategory ? 'subcategory' : '', params.subcategory || '')
    .eq(params.brand ? 'brand' : '', params.brand || '')
    .eq(params.material ? 'material' : '', params.material || '')
    .overlaps(params.sizes ? 'sizes' : '', params.sizes?.split(',') || [])
    .overlaps(params.colors ? 'colors' : '', params.colors?.split(',') || [])
    .gt(params.stockStatus === 'in-stock' ? 'stock_quantity' : '', params.stockStatus === 'in-stock' ? 0 : '')
    .eq(params.stockStatus === 'out-of-stock' ? 'stock_quantity' : '', params.stockStatus === 'out-of-stock' ? 0 : '')
    .gte(params.minPrice ? 'price' : '', params.minPrice ? Number.parseFloat(params.minPrice) : '')
    .lte(params.maxPrice ? 'price' : '', params.maxPrice ? Number.parseFloat(params.maxPrice) : '')
    .ilike(params.search ? 'name' : '', params.search ? `%${params.search}%` : '')

  // Get unique categories and subcategories for filters
  const { data: allProducts } = await supabase.from("products").select("category, subcategory, brand, material, sizes, colors, price")

  const categories = [...new Set(allProducts?.map((p) => p.category).filter(Boolean))]
  const subcategories = params.category
    ? [
        ...new Set(
          allProducts
            ?.filter((p) => p.category === params.category)
            .map((p) => p.subcategory)
            .filter(Boolean),
        ),
      ]
    : []

  // Get unique brands and materials
  const brands = [...new Set(allProducts?.map((p) => p.brand).filter(Boolean))]
  const materials = [...new Set(allProducts?.map((p) => p.material).filter(Boolean))]

  // Get unique sizes and colors from arrays
  const allSizes = allProducts?.flatMap((p) => p.sizes || []) || []
  const sizes = [...new Set(allSizes)].sort()

  const allColors = allProducts?.flatMap((p) => p.colors || []) || []
  const colors = [...new Set(allColors)].sort()

  const prices = allProducts?.map((p) => p.price) || []
  const minProductPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0
  const maxProductPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000

  const itemsForSchema = (products || []).slice(0, 8).map((p) => ({
    name: p.name,
    url: `https://apparelcast.shop/products/${p.slug || p.id}`,
    image: p.image_url || undefined,
  }))

  const bannerImage = products && products.length > 0
    ? (products[0].image_url || "/apparelcast.png")
    : "/apparelcast.png"

  const pageTitle = params.search
    ? `Search results for "${params.search}"`
    : params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : params.filter === "new"
        ? "New Arrivals"
        : "All Products"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Structured data to help Google show thumbnails from list pages */}
          <ItemListStructuredData items={itemsForSchema} />
          {/* Minimal banner using the current filter's first product image or a fallback */}
          <div className="mb-8 overflow-hidden rounded-lg border bg-muted">
            <div className="relative h-32 md:h-40">
              <Image src={bannerImage} alt="Category banner" fill className="object-cover" priority />
            </div>
          </div>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {products?.length || 0} {products?.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <ProductFilters
                categories={categories}
                subcategories={subcategories}
                brands={brands}
                materials={materials}
                sizes={sizes}
                colors={colors}
                currentCategory={params.category}
                currentSubcategory={params.subcategory}
                currentBrand={params.brand}
                currentMaterial={params.material}
                currentSizes={params.sizes ? params.sizes.split(',') : []}
                currentColors={params.colors ? params.colors.split(',') : []}
                currentStockStatus={params.stockStatus}
                minPrice={minProductPrice}
                maxPrice={maxProductPrice}
                currentMinPrice={params.minPrice ? Number.parseFloat(params.minPrice) : undefined}
                currentMaxPrice={params.maxPrice ? Number.parseFloat(params.maxPrice) : undefined}
                currentSort={params.sort}
              />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image_url={product.image_url}
                      category={product.category}
                      slug={product.slug}
                      enable_bulk_pricing={product.enable_bulk_pricing}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  {params.category ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-pink-600" />
                        <p className="font-medium">Coming soon — stay tuned!</p>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        We’re prepping {params.category} drops. Check back soon.
                      </p>
                      <Button asChild variant="outline">
                        <Link href="/products">Browse all products</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4">No products found.</p>
                      <Button asChild variant="outline">
                        <Link href="/products">Clear Filters</Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          {totalProducts && totalProducts > 24 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalProducts / 24)}
              baseUrl="/products"
              searchParams={Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
