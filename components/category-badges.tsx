'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface CategoryBanner {
  id: string
  category: string
  title: string
  description: string | null
  background_image_url: string
  text_color: 'white' | 'black' | 'gray'
  is_active: boolean
  display_order: number
}

export function CategoryBadges() {
  const [banners, setBanners] = useState<CategoryBanner[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('category_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching category banners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-semibold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground">Discover our curated collections</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={`/products?category=${banner.category.toLowerCase()}`}
              className="group"
            >
              <Card className="overflow-hidden h-48 relative transition-all duration-300 hover:shadow-lg hover:scale-105">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${banner.background_image_url})` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                
                {/* Content */}
                <CardContent className="relative h-full flex flex-col justify-end p-6">
                  <div className={`text-${banner.text_color}`}>
                    <Badge 
                      variant="secondary" 
                      className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                      {banner.category.charAt(0).toUpperCase() + banner.category.slice(1)}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-sm opacity-90 mb-3 line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                      <span>Shop Now</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            View All Products
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading component for better UX
export function CategoryBadgesSkeleton() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="overflow-hidden h-48 relative">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <CardContent className="relative h-full flex flex-col justify-end p-6">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-20 animate-pulse" />
                  <div className="h-5 bg-gray-300 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="h-12 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}