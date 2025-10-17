'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Clock, Package, Tag, ArrowLeft, MessageCircle } from 'lucide-react'
import { useCartWishlist } from '@/contexts/cart-wishlist-context'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  stock_quantity: number
  price_adjustment: number
}

interface BundleProduct {
  product_id: string
  quantity: number
  product_name: string
  product_price: number
  product_image: string
  product_slug: string
  product_description: string
  variants: ProductVariant[]
  selected_variant?: string
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
  is_active: boolean
  start_date: string
  end_date: string | null
  max_uses: number | null
  current_uses: number
  products: BundleProduct[]
}

interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  size: string
  color: string
}

export default function SpecialOfferPage() {
  const params = useParams()
  const offerId = params.id as string
  const [offer, setOffer] = useState<SpecialOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [addingToCart, setAddingToCart] = useState(false)
  const { addSpecialOfferToCart } = useCartWishlist()
  const { toast } = useToast()

  useEffect(() => {
    if (offerId) {
      fetchOffer()
    }
  }, [offerId])

  const fetchOffer = async () => {
    try {
      const supabase = createClient()
      
      // Fetch the special offer
      const { data: offerData, error: offerError } = await supabase
        .from('special_offers')
        .select('*')
        .eq('id', offerId)
        .eq('is_active', true)
        .single()

      if (offerError) throw offerError

      // Fetch offer products with product details
      const { data: offerProducts, error: productsError } = await supabase
        .from('special_offer_products')
        .select(`
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            slug,
            description
          )
        `)
        .eq('special_offer_id', offerId)

      if (productsError) throw productsError

      // Fetch variants for each product
      const productsWithVariants = await Promise.all(
        offerProducts.map(async (item) => {
          const { data: variants } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', item.product_id)
            .gt('stock_quantity', 0)

          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: (item.products as any)?.name || '',
            product_price: (item.products as any)?.price || 0,
            product_image: (item.products as any)?.image_url || '',
            product_slug: (item.products as any)?.slug || '',
            product_description: (item.products as any)?.description || '',
            variants: variants || []
          }
        })
      )

      setOffer({
        ...offerData,
        products: productsWithVariants
      })

    } catch (error) {
      console.error('Error fetching offer:', error)
      toast({
        title: 'Error',
        description: 'Failed to load special offer',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }))
  }

  const getSelectedVariant = (productId: string) => {
    const variantId = selectedVariants[productId]
    if (!variantId) return null
    
    const product = offer?.products.find(p => p.product_id === productId)
    return product?.variants.find(v => v.id === variantId) || null
  }

  const canAddToCart = () => {
    if (!offer) return false
    
    // Check if all products have selected variants
    return offer.products.every(product => {
      if (product.variants.length === 0) return true // No variants needed
      return selectedVariants[product.product_id] // Variant selected
    })
  }

  const calculateTotalOriginalPrice = () => {
    if (!offer) return 0
    
    return offer.products.reduce((total, product) => {
      const variant = getSelectedVariant(product.product_id)
      const basePrice = product.product_price
      const adjustment = variant?.price_adjustment || 0
      return total + ((basePrice + adjustment) * product.quantity)
    }, 0)
  }

  const handleAddToCart = async () => {
    if (!offer || !canAddToCart()) return

    setAddingToCart(true)
    try {
      // Prepare selected variants for cart
      const cartVariants = offer.products.map(product => {
        const selectedVariant = getSelectedVariant(product.product_id)
        return {
          product_id: product.product_id,
          variant_id: selectedVariant?.id || null,
          quantity: product.quantity,
          size: selectedVariant?.size || '',
          color: selectedVariant?.color || ''
        }
      })

      await addSpecialOfferToCart(offer.id, cartVariants)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const isOfferExpired = () => {
    if (!offer?.end_date) return false
    return new Date(offer.end_date) < new Date()
  }

  const isOfferMaxedOut = () => {
    if (!offer?.max_uses) return false
    return offer.current_uses >= offer.max_uses
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Special Offer Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The special offer you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const originalPrice = calculateTotalOriginalPrice()
  const savings = originalPrice - offer.special_price

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/#special-offers" className="hover:text-foreground">Special Offers</Link>
          <span>/</span>
          <span className="text-foreground">{offer.title}</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Offer Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              <Tag className="w-3 h-3 mr-1" />
              {offer.offer_type.toUpperCase()}
            </Badge>
            {offer.discount_percentage > 0 && (
              <Badge variant="destructive">
                {offer.discount_percentage}% OFF
              </Badge>
            )}
            {isOfferExpired() && (
              <Badge variant="outline" className="text-red-600">
                <Clock className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            )}
            {isOfferMaxedOut() && (
              <Badge variant="outline" className="text-orange-600">
                Sold Out
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
          <p className="text-muted-foreground text-lg mb-6">{offer.description}</p>

          {/* Banner Image */}
          {offer.banner_image_url && (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <Image
                src={offer.banner_image_url}
                alt={offer.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bundle Products */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Bundle Includes:</h2>
            
            {offer.products.map((product, index) => (
              <Card key={product.product_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {product.product_name}
                    <Badge variant="outline">
                      {product.quantity}x
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={product.product_image || '/placeholder.jpg'}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details & Variants */}
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {product.product_description}
                      </p>
                      
                      <div className="text-lg font-semibold">
                        R{product.product_price.toFixed(2)} each
                      </div>

                      {/* Variant Selection */}
                      {product.variants.length > 0 && (
                        <div className="space-y-4">
                          <Separator />
                          <div>
                            <Label className="text-base font-medium mb-3 block">
                              Select Options:
                            </Label>
                            <Select
                              value={selectedVariants[product.product_id] || ''}
                              onValueChange={(value) => handleVariantChange(product.product_id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose size and color" />
                              </SelectTrigger>
                              <SelectContent>
                                {product.variants.map((variant) => (
                                  <SelectItem key={variant.id} value={variant.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{variant.size}</span>
                                      <span className="text-muted-foreground">•</span>
                                      <span>{variant.color}</span>
                                      {variant.price_adjustment !== 0 && (
                                        <span className="text-sm text-muted-foreground">
                                          ({variant.price_adjustment > 0 ? '+' : ''}R{variant.price_adjustment.toFixed(2)})
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        ({variant.stock_quantity} in stock)
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Special Review Section */}
          <div className="lg:col-span-2 mt-8">
            <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                  <MessageCircle className="w-5 h-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-6xl">🤫</div>
                  <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">
                    Oops! No reviews here.
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                    This product is too special—what you experience is meant for you alone!
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300 px-4 py-2">
                      ✨ Exclusive Experience ✨
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Bundle Deal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Original Price:</span>
                    <span className="line-through">R{originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You Save:</span>
                    <span>-R{savings.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Bundle Price:</span>
                    <span className="text-green-600">R{offer.special_price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Valid until: {offer.end_date 
                        ? new Date(offer.end_date).toLocaleDateString()
                        : 'No expiry'
                      }
                    </span>
                  </div>
                  {offer.max_uses && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>
                        {offer.max_uses - offer.current_uses} bundles left
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart() || addingToCart || isOfferExpired() || isOfferMaxedOut()}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? 'Adding to Cart...' : 'Add Bundle to Cart'}
                </Button>

                {!canAddToCart() && offer.products.some(p => p.variants.length > 0) && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please select options for all products
                  </p>
                )}

                {(isOfferExpired() || isOfferMaxedOut()) && (
                  <p className="text-sm text-red-600 text-center">
                    This offer is no longer available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}