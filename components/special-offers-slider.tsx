'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Product {
  product_id: string
  quantity: number
  product_name: string
  product_price: number
  product_image: string
  product_slug: string
}

interface SpecialOffer {
  id: string
  title: string
  description: string
  banner_image_url: string
  special_price: number
  original_price: number
  discount_percentage: number
  offer_type: 'bundle' | 'bogo' | 'discount'
  end_date: string | null
  products: Product[]
}

export default function SpecialOffersSlider() {
  const [offers, setOffers] = useState<SpecialOffer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpecialOffers()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (offers.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
    }, 5000) // Auto-scroll every 5 seconds

    return () => clearInterval(interval)
  }, [offers.length])

  const fetchSpecialOffers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('special_offers_with_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOffers(data || [])
    } catch (error) {
      console.error('Error fetching special offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d left`
    if (hours > 0) return `${hours}h left`
    return 'Ending soon'
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length)
  }

  if (loading) {
    return (
      <div className="w-full h-80 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading special offers...</div>
      </div>
    )
  }

  if (offers.length === 0) {
    return null // Don't show anything if no offers
  }

  return (
    <div className="relative w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Special Offers</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={offers.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={offers.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div key={offer.id} className="w-full flex-shrink-0">
              <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-lg bg-muted">
                {/* Background Image */}
                {offer.banner_image_url ? (
                  <img
                    src={offer.banner_image_url}
                    alt={offer.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 md:p-8">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    <Badge variant="secondary" className="bg-white/90 text-black border-0">
                      <Tag className="w-3 h-3 mr-1" />
                      {offer.offer_type.toUpperCase()}
                    </Badge>
                    {offer.discount_percentage && (
                      <Badge variant="destructive" className="bg-red-600 text-white">
                        {offer.discount_percentage}% OFF
                      </Badge>
                    )}
                    {offer.end_date && (
                      <Badge variant="secondary" className="bg-orange-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(offer.end_date)}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    {offer.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base md:text-lg text-white/90 mb-4 drop-shadow line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                      R{offer.special_price.toFixed(2)}
                    </div>
                    {offer.original_price && (
                      <div className="text-lg md:text-xl text-white/70 line-through drop-shadow">
                        R{offer.original_price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Bundle Products Preview */}
                  {offer.products.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-white/80 mb-2 drop-shadow">
                        This bundle includes:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {offer.products.slice(0, 3).map((product, index) => (
                          <div key={product.product_id} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white">
                            {product.quantity}x {product.product_name}
                          </div>
                        ))}
                        {offer.products.length > 3 && (
                          <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white">
                            +{offer.products.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      className="bg-white text-black hover:bg-white/90 font-semibold"
                      asChild
                    >
                      <Link href={`/special-offers/${offer.id}`}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Deal
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {offers.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}