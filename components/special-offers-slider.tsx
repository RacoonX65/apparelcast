'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length)
  }

  const formatTimeRemaining = (endDate: string | null) => {
    if (!endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading special offers...</div>
      </div>
    )
  }

  if (offers.length === 0) {
    return null // Don't show anything if no offers
  }

  return (
    <div className="relative w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
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
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left side - Offer details */}
                    <div className="flex-1 p-8 lg:p-12">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          <Tag className="w-3 h-3 mr-1" />
                          {offer.offer_type.toUpperCase()}
                        </Badge>
                        {offer.discount_percentage && (
                          <Badge variant="secondary" className="bg-red-500 text-white">
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

                      <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                        {offer.title}
                      </h3>
                      
                      <p className="text-lg lg:text-xl mb-6 text-white/90">
                        {offer.description}
                      </p>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-3xl font-bold">
                          R{offer.special_price.toFixed(2)}
                        </div>
                        {offer.original_price && (
                          <div className="text-xl text-white/70 line-through">
                            R{offer.original_price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Bundle products preview */}
                      {offer.products.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm text-white/80 mb-2">
                            This bundle includes:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {offer.products.slice(0, 3).map((product, index) => (
                              <div key={product.product_id} className="text-sm bg-white/20 px-2 py-1 rounded">
                                {product.quantity}x {product.product_name}
                              </div>
                            ))}
                            {offer.products.length > 3 && (
                              <div className="text-sm bg-white/20 px-2 py-1 rounded">
                                +{offer.products.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        asChild
                      >
                        <Link href={`/special-offers/${offer.id}`}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View Bundle Deal
                        </Link>
                      </Button>
                    </div>

                    {/* Right side - Banner image */}
                    <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
                      {offer.banner_image_url ? (
                        <img
                          src={offer.banner_image_url}
                          alt={offer.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                          <div className="text-6xl font-bold text-white/30">
                            {offer.discount_percentage}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators */}
      {offers.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}