import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductFilters } from "@/components/product-filters"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    subcategory?: string
    filter?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
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

  const { data: products } = await query

  // Get unique categories and subcategories for filters
  const { data: allProducts } = await supabase.from("products").select("category, subcategory, price")

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

  const prices = allProducts?.map((p) => p.price) || []
  const minProductPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0
  const maxProductPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000

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
                currentCategory={params.category}
                currentSubcategory={params.subcategory}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
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
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found.</p>
                  <Button asChild variant="outline">
                    <Link href="/products">Clear Filters</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
