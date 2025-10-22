'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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
  sizes: string[]
  colors: string[]
  stock_quantity: number
  variants: ProductVariant[]
  selected_variant?: string
  additional_images?: string[]
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
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<Record<string, number>>({})
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
      // Fetch the special offer
      const { data: offerData, error: offerError } = await supabase
        .from('special_offers')
        .select('*')
        .eq('id', offerId)
        .eq('is_active', true)
        .single()

      if (offerError) throw offerError

      // Fetch products in the special offer with their variants
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
            description,
            sizes,
            colors,
            stock_quantity,
            additional_images
          )
        `)
        .eq('special_offer_id', offerId)

      if (productsError) throw productsError

      // Fetch product variants for accurate stock tracking
      const productIds = offerProducts.map((item: { product_id: any }) => item.product_id)
      const { data: productVariants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .eq('is_active', true)

      if (variantsError) throw variantsError

      // Create variants with real stock quantities
      const productsWithVariants = offerProducts.map((item: any) => {
        const product = item.products as any
        const sizes = product?.sizes || []
        const colors = product?.colors || []
        
        // Get variants for this specific product
        const productVariantData = productVariants?.filter((v: { product_id: any }) => v.product_id === item.product_id) || []
        
        // Create variants with real stock data
        const variants: ProductVariant[] = []
        
        if (sizes.length > 0 && colors.length > 0) {
          sizes.forEach((size: string) => {
            colors.forEach((color: string) => {
              // Find the corresponding variant in the database
              const dbVariant = productVariantData.find((v: { size: string; color: string }) => v.size === size && v.color === color)
              
              variants.push({
                id: dbVariant?.id || `${item.product_id}-${size}-${color}`,
                product_id: item.product_id,
                size,
                color,
                stock_quantity: dbVariant?.stock_quantity || 0,
                price_adjustment: dbVariant?.price_adjustment || 0
              })
            })
          })
        } else {
          // For products without size/color variants (like perfumes)
          const dbVariant = productVariantData[0]
          if (dbVariant) {
            variants.push({
              id: dbVariant.id,
              product_id: item.product_id,
              size: dbVariant.size,
              color: dbVariant.color,
              stock_quantity: dbVariant.stock_quantity,
              price_adjustment: dbVariant.price_adjustment
            })
          }
        }

        return {
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: product?.name || '',
          product_price: product?.price || 0,
          product_image: product?.image_url || '',
          product_slug: product?.slug || '',
          product_description: product?.description || '',
          sizes: sizes,
          colors: colors,
          stock_quantity: product?.stock_quantity || 0,
          variants: variants,
          additional_images: product?.additional_images || []
        }
      })

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

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }))
  }

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }))
  }

  const getSelectedVariant = (productId: string) => {
    const selectedSize = selectedSizes[productId]
    const selectedColor = selectedColors[productId]
    
    if (!selectedSize || !selectedColor) return null
    
    const product = offer?.products.find((p: { product_id: string }) => p.product_id === productId)
    return product?.variants.find((v: { size: string; color: string }) => v.size === selectedSize && v.color === selectedColor) || null
  }

  const canAddToCart = () => {
    if (!offer) return false
    
    // Check if all products have selected sizes and colors AND sufficient stock
    return offer.products.every(product => {
      if (product.variants.length === 0) return true // No variants needed
      
      const selectedVariant = getSelectedVariant(product.product_id)
      if (!selectedVariant) return false // No variant selected
      
      // Check if selected variant has sufficient stock
      return selectedVariant.stock_quantity > 0
    })
  }

  const getStockStatus = (productId: string) => {
    const selectedVariant = getSelectedVariant(productId)
    if (!selectedVariant) return { status: 'select', message: 'Select size and color' }
    
    if (selectedVariant.stock_quantity === 0) {
      return { status: 'out_of_stock', message: 'Out of stock' }
    } else if (selectedVariant.stock_quantity < 5) {
      return { status: 'low_stock', message: `Only ${selectedVariant.stock_quantity} left` }
    } else {
      return { status: 'in_stock', message: `${selectedVariant.stock_quantity} available` }
    }
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Image - Made larger and more prominent */}
                    <div className="lg:col-span-1">
                      <div className="space-y-4">
                        {/* Image Gallery - Similar to single product page */}
                        <div className="space-y-3">
                          {/* Main display image */}
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                            <Image
                              src={(() => {
                                const selectedIndex = selectedImageIndexes[product.product_id] || 0
                                if (selectedIndex === 0) {
                                  return product.product_image || '/placeholder.jpg'
                                }
                                return product.additional_images?.[selectedIndex - 1] || product.product_image || '/placeholder.jpg'
                              })()}
                              alt={product.product_name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {/* Variant indicator badge */}
                            {(product.sizes.length > 0 || product.colors.length > 0) && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                {product.sizes.length} sizes • {product.colors.length} colors
                              </div>
                            )}
                          </div>
                          
                          {/* Thumbnail gallery */}
                          {(product.additional_images && product.additional_images.length > 0) && (
                            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                              {/* Main product image as first thumbnail */}
                              <div 
                                className={`aspect-square relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer border-2 transition-colors ${
                                  (selectedImageIndexes[product.product_id] || 0) === 0 
                                    ? 'border-primary ring-2 ring-primary/20' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                                onClick={() => setSelectedImageIndexes(prev => ({ ...prev, [product.product_id]: 0 }))}
                              >
                                <Image
                                  src={product.product_image || '/placeholder.jpg'}
                                  alt={`${product.product_name} main`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              
                              {/* All additional images */}
                              {product.additional_images.map((img: string, idx: number) => (
                                <div 
                                  key={idx} 
                                  className={`aspect-square relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer border-2 transition-colors ${
                                    (selectedImageIndexes[product.product_id] || 0) === idx + 1
                                      ? 'border-primary ring-2 ring-primary/20'
                                      : 'border-gray-200 hover:border-gray-400'
                                  }`}
                                  onClick={() => setSelectedImageIndexes(prev => ({ ...prev, [product.product_id]: idx + 1 }))}
                                >
                                  <Image
                                    src={img}
                                    alt={`${product.product_name} ${idx + 2}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Details & Variants */}
                    <div className="lg:col-span-2 space-y-4">
                      <p className="text-muted-foreground">
                        {product.product_description}
                      </p>
                      
                      <div className="text-lg font-semibold">
                        R{product.product_price.toFixed(2)} each
                      </div>

                      {/* Variant Selection */}
                      {(product.sizes.length > 0 || product.colors.length > 0) && (
                        <div className="space-y-4">
                          <Separator />
                          <div className="space-y-4">
                            <Label className="text-base font-medium flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Select Options:
                            </Label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full">
                              {/* Size Selection */}
                              {product.sizes.length > 0 && (
                                <div className="space-y-2 min-w-0">
                                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    Size
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={selectedSizes[product.product_id] || ''}
                                    onValueChange={(value) => handleSizeChange(product.product_id, value)}
                                  >
                                    <SelectTrigger className={`transition-colors w-full ${
                                      selectedSizes[product.product_id] 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                      <SelectValue placeholder="Choose size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {product.sizes.map((size) => {
                                        // Check if this size has any available colors
                                        const hasAvailableColors = product.colors.some(color => {
                                          const variant = product.variants.find(v => v.size === size && v.color === color)
                                          return variant && variant.stock_quantity > 0
                                        })
                                        
                                        return (
                                          <SelectItem 
                                            key={size} 
                                            value={size} 
                                            className="hover:bg-gray-50"
                                            disabled={!hasAvailableColors}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span className={`font-medium truncate ${!hasAvailableColors ? 'text-gray-400' : ''}`}>
                                                {size}
                                              </span>
                                              <Badge 
                                                variant={hasAvailableColors ? "outline" : "secondary"} 
                                                className={`ml-2 text-xs ${
                                                  !hasAvailableColors ? 'bg-gray-200 text-gray-500' : ''
                                                }`}
                                              >
                                                {hasAvailableColors ? 'Available' : 'Out of Stock'}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Color Selection */}
                              {product.colors.length > 0 && (
                                <div className="space-y-2 min-w-0">
                                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    Color
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={selectedColors[product.product_id] || ''}
                                    onValueChange={(value) => handleColorChange(product.product_id, value)}
                                  >
                                    <SelectTrigger className={`transition-colors w-full ${
                                      selectedColors[product.product_id] 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                      <SelectValue placeholder="Choose color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {product.colors.map((color) => {
                                        // Check if this color is available for the selected size
                                        const selectedSize = selectedSizes[product.product_id]
                                        const variant = selectedSize 
                                          ? product.variants.find(v => v.size === selectedSize && v.color === color)
                                          : product.variants.find(v => v.color === color)
                                        
                                        const isAvailable = variant && variant.stock_quantity > 0
                                        const stockQuantity = variant?.stock_quantity || 0
                                        
                                        return (
                                          <SelectItem 
                                            key={color} 
                                            value={color} 
                                            className="hover:bg-gray-50"
                                            disabled={!isAvailable}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div 
                                                className={`w-5 h-5 rounded-full border-2 shadow-sm ${
                                                  isAvailable ? 'border-gray-300' : 'border-gray-200 opacity-50'
                                                }`}
                                                style={{ backgroundColor: isAvailable ? color.toLowerCase() : '#f3f4f6' }}
                                              />
                                              <span className={`font-medium truncate ${!isAvailable ? 'text-gray-400' : ''}`}>
                                                {color}
                                              </span>
                                              <Badge 
                                                variant={isAvailable ? "outline" : "secondary"} 
                                                className={`ml-auto text-xs ${
                                                  !isAvailable ? 'bg-gray-200 text-gray-500' : 
                                                  stockQuantity < 5 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : ''
                                                }`}
                                              >
                                                {!isAvailable ? 'Out of Stock' : 
                                                 stockQuantity < 5 ? `${stockQuantity} left` : 'Available'}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            {/* Selection Status & Stock Information */}
                            <div className="space-y-2">
                              {/* Selection Progress */}
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${
                                  selectedSizes[product.product_id] ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <span className={selectedSizes[product.product_id] ? 'text-green-700' : 'text-gray-500'}>
                                  Size {selectedSizes[product.product_id] ? 'selected' : 'required'}
                                </span>
                                
                                <div className={`w-2 h-2 rounded-full ml-4 ${
                                  selectedColors[product.product_id] ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <span className={selectedColors[product.product_id] ? 'text-green-700' : 'text-gray-500'}>
                                  Color {selectedColors[product.product_id] ? 'selected' : 'required'}
                                </span>
                              </div>

                              {/* Stock Information */}
                              {selectedSizes[product.product_id] && selectedColors[product.product_id] && (
                                <div className={`flex items-center gap-2 p-3 border rounded-lg ${
                                  getStockStatus(product.product_id).status === 'out_of_stock' 
                                    ? 'bg-red-50 border-red-200' 
                                    : getStockStatus(product.product_id).status === 'low_stock'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-green-50 border-green-200'
                                }`}>
                                  <Package className={`w-4 h-4 ${
                                    getStockStatus(product.product_id).status === 'out_of_stock' 
                                      ? 'text-red-600' 
                                      : getStockStatus(product.product_id).status === 'low_stock'
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    getStockStatus(product.product_id).status === 'out_of_stock' 
                                      ? 'text-red-800' 
                                      : getStockStatus(product.product_id).status === 'low_stock'
                                      ? 'text-yellow-800'
                                      : 'text-green-800'
                                  }`}>
                                    {getStockStatus(product.product_id).message}
                                  </span>
                                </div>
                              )}
                            </div>
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