'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  slug: string
  enable_bulk_pricing: boolean
}

interface ProductsListProps {
  initialProducts: Product[]
  searchParams: {
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
  }
  totalCount: number
}

export function ProductsListWithLoadMore({ 
  initialProducts, 
  searchParams, 
  totalCount 
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(totalCount > initialProducts.length)
  const [offset, setOffset] = useState(initialProducts.length)
  
  const ITEMS_PER_LOAD = 8

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    
    try {
      const supabase = createClient()
      let query = supabase.from('products').select('id, name, price, image_url, category, slug, enable_bulk_pricing')

      // Apply all the same filters as the server-side query
      if (searchParams.search) query = query.ilike('name', `%${searchParams.search}%`)
      if (searchParams.category) query = query.eq('category', searchParams.category)
      if (searchParams.subcategory) query = query.eq('subcategory', searchParams.subcategory)
      if (searchParams.brand) query = query.eq('brand', searchParams.brand)
      if (searchParams.material) query = query.eq('material', searchParams.material)
      if (searchParams.sizes) query = query.overlaps('sizes', searchParams.sizes.split(','))
      if (searchParams.colors) query = query.overlaps('colors', searchParams.colors.split(','))
      if (searchParams.stockStatus === 'in-stock') query = query.gt('stock_quantity', 0)
      if (searchParams.stockStatus === 'out-of-stock') query = query.eq('stock_quantity', 0)
      if (searchParams.minPrice) query = query.gte('price', Number.parseFloat(searchParams.minPrice))
      if (searchParams.maxPrice) query = query.lte('price', Number.parseFloat(searchParams.maxPrice))

      // Apply sorting
      const sortBy = searchParams.sort || 'newest'
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data: newProducts, error } = await query
        .range(offset, offset + ITEMS_PER_LOAD - 1)
        .limit(ITEMS_PER_LOAD)

      if (error) {
        console.error('Error loading more products:', error)
        return
      }

      if (newProducts && newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts])
        setOffset(prev => prev + newProducts.length)
        setHasMore(offset + newProducts.length < totalCount)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset products when search params change
  useEffect(() => {
    setProducts(initialProducts)
    setOffset(initialProducts.length)
    setHasMore(totalCount > initialProducts.length)
  }, [initialProducts, totalCount])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={loadMoreProducts}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center pt-6">
          <p className="text-muted-foreground text-sm">
            You've seen all {products.length} products
          </p>
        </div>
      )}
    </div>
  )
}