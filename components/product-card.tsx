"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { WishlistButton } from "@/components/wishlist-button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { QuickViewButton } from "@/components/quick-view-modal"

interface BulkTier {
  quantity: number
  pricePerUnit: number
  totalPrice: number
  savings: number
  savingsPercentage: number
  discount_type?: string
  discount_value?: number
}

interface DatabaseBulkTier {
  id: string
  min_quantity: number
  max_quantity: number | null
  discount_type: 'percentage' | 'fixed_amount' | 'fixed_price'
  discount_value: number
  price_per_unit: number
  is_active: boolean
}

interface ProductCardProps {
  id?: string
  name?: string
  price?: number
  image_url?: string
  category?: string
  product?: {
    id: string
    name: string
    price: number
    image_url: string
    category: string
    enable_bulk_pricing?: boolean
  }
  showBulkPricing?: boolean
  enable_bulk_pricing?: boolean
}

export function ProductCard({ id, name, price, image_url, category, product, showBulkPricing = true, enable_bulk_pricing }: ProductCardProps) {
  // Use product object if provided, otherwise use individual props
  const productData = product || { id, name, price, image_url, category, enable_bulk_pricing }
  
  // Ensure price is a valid number
  const displayPrice = typeof productData.price === 'number' ? productData.price : 0

  const [customBulkTiers, setCustomBulkTiers] = useState<DatabaseBulkTier[]>([])
  const [isLoadingTiers, setIsLoadingTiers] = useState(false)
  const supabase = createClient()

  // Load custom bulk pricing tiers from database
  useEffect(() => {
    if (productData.id && showBulkPricing) {
      loadCustomBulkTiers()
    }
  }, [productData.id, showBulkPricing])

  const loadCustomBulkTiers = async () => {
    if (!productData.id) {
      console.log('No product ID available for bulk pricing')
      return
    }
    
    console.log('Loading bulk tiers for product:', productData.id)
    setIsLoadingTiers(true)
    try {
      const { data, error } = await supabase
        .from('bulk_pricing_tiers')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_active', true)
        .order('min_quantity')

      if (error) {
        console.error('Error loading bulk tiers:', error)
        return
      }

      console.log('Loaded bulk tiers:', data)
      setCustomBulkTiers(data || [])
    } catch (error) {
      console.error('Error loading bulk tiers:', error)
    } finally {
      setIsLoadingTiers(false)
    }
  }

  // Convert database tiers to display format
  const convertDatabaseTiers = (dbTiers: DatabaseBulkTier[]): BulkTier[] => {
    return dbTiers.map(tier => {
      const quantity = tier.min_quantity
      const pricePerUnit = tier.price_per_unit
      const totalPrice = pricePerUnit * quantity
      const originalTotal = displayPrice * quantity
      const savings = originalTotal - totalPrice
      const savingsPercentage = ((displayPrice - pricePerUnit) / displayPrice) * 100

      return {
        quantity,
        pricePerUnit,
        totalPrice,
        savings,
        savingsPercentage,
        discount_type: tier.discount_type,
        discount_value: tier.discount_value
      }
    })
  }

  // Calculate bulk pricing tiers (fallback to default if no custom tiers)
  const calculateBulkTiers = (basePrice: number): BulkTier[] => {
    const tiers = [
      { quantity: 10, discount: 0.10 }, // 10% off for 10+ items
      { quantity: 25, discount: 0.15 }, // 15% off for 25+ items
      { quantity: 50, discount: 0.20 }, // 20% off for 50+ items
    ]

    return tiers.map(tier => {
      const pricePerUnit = basePrice * (1 - tier.discount)
      const totalPrice = pricePerUnit * tier.quantity
      const originalTotal = basePrice * tier.quantity
      const savings = originalTotal - totalPrice
      const savingsPercentage = tier.discount * 100

      return {
        quantity: tier.quantity,
        pricePerUnit,
        totalPrice,
        savings,
        savingsPercentage
      }
    })
  }

  // Determine if bulk should be shown: either enabled on product or tiers exist
  const bulkEnabled = !!productData.enable_bulk_pricing || customBulkTiers.length > 0

  // Use custom tiers if available, otherwise use default calculation only when bulk is enabled
  const bulkTiers = bulkEnabled
    ? (customBulkTiers.length > 0 ? convertDatabaseTiers(customBulkTiers) : calculateBulkTiers(displayPrice))
    : []

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-shadow duration-300 relative">
      <CardContent className="p-0">
        <Link href={`/products/${productData.id}`}>
          <div className="aspect-[3/4] relative overflow-hidden bg-muted">
            <Image
              src={productData.image_url || `/placeholder.svg?height=600&width=450&query=${encodeURIComponent(productData.name || 'Product')}`}
              alt={productData.name || 'Product'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {showBulkPricing && bulkEnabled && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Bulk Available
                </Badge>
              </div>
            )}
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{productData.category}</p>
            <h3 className="font-medium text-sm line-clamp-2">{productData.name}</h3>
            
            {/* Individual Pricing */}
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">R {displayPrice.toFixed(2)}</p>
              <span className="text-xs text-muted-foreground">per unit</span>
            </div>

            {/* Bulk Pricing Section - Compact version */}
            {showBulkPricing && bulkEnabled && bulkTiers.length > 0 && !isLoadingTiers && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-green-700">
                    Bulk: {bulkTiers[0].quantity}+ @ R{bulkTiers[0].pricePerUnit.toFixed(2)}
                  </span>
                  <span className="font-semibold text-green-600">
                    -{bulkTiers[0].savingsPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>
        <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex flex-col gap-1">
          <WishlistButton productId={productData.id || ''} />
          <QuickViewButton 
            product={{
              id: productData.id || '',
              name: productData.name || '',
              description: '',
              price: displayPrice,
              images: [productData.image_url || ''],
              category: productData.category || '',
              subcategory: '',
              stock: 10, // Default stock for quick view
              sizes: [],
              colors: [],
              image_url: productData.image_url || '',
            }}
            className="bg-white/90 hover:bg-white text-black border-0 shadow-md h-8 w-8 p-0"
          />
        </div>
      </CardContent>
    </Card>
  )
}
