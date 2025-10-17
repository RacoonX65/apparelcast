'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Tag, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  brand: string
  rating?: number
}

interface SpecialOffer {
  id: string
  title: string
  description: string
  special_price: number
  original_price: number
  discount_percentage: number
  valid_until: string
  is_active: boolean
  banner_image_url?: string
  products: Product[]
}

interface SpecialOfferCardProps {
  offer: SpecialOffer
  className?: string
}

export default function SpecialOfferCard({ offer, className = "" }: SpecialOfferCardProps) {
  const formatTimeLeft = (validUntil: string) => {
    const now = new Date()
    const end = new Date(validUntil)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const savings = offer.original_price - offer.special_price

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardContent className="p-0">
        {/* Banner Image */}
        {offer.banner_image_url && (
          <div className="relative h-48 w-full">
            <Image
              src={offer.banner_image_url}
              alt={offer.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="bg-red-600 text-white">
                {offer.discount_percentage}% OFF
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeLeft(offer.valid_until)}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Offer Title & Description */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
            <p className="text-gray-600 text-sm">{offer.description}</p>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-green-600">
                R{offer.special_price.toFixed(2)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                R{offer.original_price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Tag className="w-3 h-3 mr-1" />
                Save R{savings.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Products in Bundle */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Bundle includes ({offer.products.length} items):
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {offer.products.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {offer.products.length > 4 && (
                <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg text-xs text-gray-600">
                  +{offer.products.length - 4} more
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
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
      </CardContent>
    </Card>
  )
}