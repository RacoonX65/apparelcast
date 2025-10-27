'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

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

// Define the primary categories to display (excluding electronics)
const PRIMARY_CATEGORIES = ['clothing', 'shoes', 'perfumes', 'home']

// Category display mapping
const CATEGORY_DISPLAY_MAP = {
  clothing: 'Fashion',
  shoes: 'Sneakers', 
  perfumes: 'Luxury Fragrance',
  home: 'Home Essentials'
}

export function MobileCircularCategoryBadges() {
  const [banners, setBanners] = useState<CategoryBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('category_banners')
        .select('*')
        .eq('is_active', true)
        .in('category', PRIMARY_CATEGORIES)
        .order('display_order', { ascending: true })

      if (error) throw error
      
      // Filter and sort to ensure we get the first 4 primary categories
      const filteredBanners = PRIMARY_CATEGORIES
        .map(category => data?.find((banner: CategoryBanner) => banner.category === category))
        .filter(Boolean)
        .slice(0, 4) as CategoryBanner[]
      
      setBanners(filteredBanners)
    } catch (error) {
      console.error('Error fetching category banners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-serif font-semibold mb-2">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          </div>
          <div className="flex justify-between items-center max-w-sm mx-auto px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 animate-pulse mb-2 shadow-md ring-2 ring-white" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          ))}
          </div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="py-8 px-4 bg-gray-50/50">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-serif font-semibold mb-2">Shop by Category</h2>
          <p className="text-sm text-muted-foreground">Discover our curated collections</p>
        </div>

        {/* Mobile Circular Categories - Single Row */}
        <div className="flex justify-between items-center max-w-sm mx-auto px-4">
          {banners.map((banner) => {
            const displayName = CATEGORY_DISPLAY_MAP[banner.category as keyof typeof CATEGORY_DISPLAY_MAP] || banner.category
            
            return (
              <Link
                key={banner.id}
                href={`/products?category=${banner.category.toLowerCase()}`}
                className="group flex flex-col items-center transition-all duration-300 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl p-3 active:scale-95"
                aria-label={`Shop ${displayName} collection`}
                role="button"
                tabIndex={0}
              >
                {/* Circular Badge */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 ring-2 ring-white group-hover:ring-primary/30 group-focus:ring-primary/50">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-125"
                    style={{ backgroundImage: `url(${banner.background_image_url})` }}
                    role="img"
                    aria-label={`${displayName} category background`}
                  />
                  
                  {/* Gradient Overlay for better contrast and brand colors */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300" />
                  
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 rounded-full shadow-inner" />
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                </div>

                {/* Category Label */}
                <span className="text-xs font-semibold text-center mt-2 text-gray-800 group-hover:text-primary transition-colors duration-300 max-w-[4.5rem] leading-tight tracking-wide">
                  {displayName}
                </span>
              </Link>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300"
          >
            View All Products
            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading component for better UX
export function MobileCircularCategoryBadgesSkeleton() {
  return (
    <div className="py-8 px-4 bg-gray-50/50">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        </div>

        <div className="flex justify-between items-center max-w-sm mx-auto px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 animate-pulse mb-2 shadow-md ring-2 ring-white" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default MobileCircularCategoryBadges