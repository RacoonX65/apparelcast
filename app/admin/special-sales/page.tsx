'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Package, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CloudinaryUploadWidget } from '@/components/cloudinary-upload-widget'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  slug: string
}

interface SpecialOfferProduct {
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
  is_active: boolean
  start_date: string
  end_date: string | null
  max_uses: number | null
  current_uses: number
  products: SpecialOfferProduct[]
}

interface OfferFormData {
  title: string
  description: string
  banner_image_url: string
  special_price: number
  original_price: number
  offer_type: 'bundle' | 'bogo' | 'discount'
  is_active: boolean
  start_date: string
  end_date: string
  max_uses: number | null
  selected_products: { product_id: string; quantity: number }[]
}

export default function SpecialSalesPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    banner_image_url: '',
    special_price: 0,
    original_price: 0,
    offer_type: 'bundle',
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    max_uses: null,
    selected_products: []
  })

  useEffect(() => {
    fetchOffers()
    fetchProducts()
  }, [])

  const fetchOffers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('special_offers_with_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOffers(data || [])
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch special offers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, slug')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.selected_products.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one product for the offer',
        variant: 'destructive'
      })
      return
    }

    try {
      const supabase = createClient()

      // Calculate original price if not provided
      let originalPrice = formData.original_price
      if (!originalPrice && formData.selected_products.length > 0) {
        originalPrice = formData.selected_products.reduce((total, item) => {
          const product = products.find(p => p.id === item.product_id)
          return total + (product ? product.price * item.quantity : 0)
        }, 0)
      }

      // Calculate discount percentage
      const discountPercentage = originalPrice > 0 
        ? Math.round(((originalPrice - formData.special_price) / originalPrice) * 100)
        : 0

      const offerData = {
        title: formData.title,
        description: formData.description,
        banner_image_url: formData.banner_image_url || null,
        special_price: formData.special_price,
        original_price: originalPrice,
        discount_percentage: discountPercentage,
        offer_type: formData.offer_type,
        is_active: formData.is_active,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        max_uses: formData.max_uses
      }

      let offerId: string

      if (editingOffer) {
        // Update existing offer
        const { error } = await supabase
          .from('special_offers')
          .update(offerData)
          .eq('id', editingOffer.id)

        if (error) throw error
        offerId = editingOffer.id

        // Delete existing product associations
        await supabase
          .from('special_offer_products')
          .delete()
          .eq('special_offer_id', editingOffer.id)
      } else {
        // Create new offer
        const { data, error } = await supabase
          .from('special_offers')
          .insert(offerData)
          .select('id')
          .single()

        if (error) throw error
        offerId = data.id
      }

      // Add product associations (only if there are products selected)
      if (formData.selected_products.length > 0) {
        const productAssociations = formData.selected_products.map(item => ({
          special_offer_id: offerId,
          product_id: item.product_id,
          quantity: item.quantity
        }))

        const { error: productsError } = await supabase
          .from('special_offer_products')
          .insert(productAssociations)

        if (productsError) throw productsError
      }

      toast({
        title: 'Success',
        description: `Special offer ${editingOffer ? 'updated' : 'created'} successfully`
      })

      setDialogOpen(false)
      resetForm()
      fetchOffers()
    } catch (error) {
      console.error('Error saving offer:', error)
      toast({
        title: 'Error',
        description: 'Failed to save special offer',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this special offer?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', offerId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Special offer deleted successfully'
      })

      fetchOffers()
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete special offer',
        variant: 'destructive'
      })
    }
  }

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('special_offers')
        .update({ is_active: !currentStatus })
        .eq('id', offerId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Special offer ${!currentStatus ? 'activated' : 'deactivated'}`
      })

      fetchOffers()
    } catch (error) {
      console.error('Error updating offer status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update offer status',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      banner_image_url: '',
      special_price: 0,
      original_price: 0,
      offer_type: 'bundle',
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      max_uses: null,
      selected_products: []
    })
    setEditingOffer(null)
  }

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description,
      banner_image_url: offer.banner_image_url || '',
      special_price: offer.special_price,
      original_price: offer.original_price || 0,
      offer_type: offer.offer_type,
      is_active: offer.is_active,
      start_date: offer.start_date.split('T')[0],
      end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
      max_uses: offer.max_uses,
      selected_products: offer.products.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity
      }))
    })
    setDialogOpen(true)
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      selected_products: [...prev.selected_products, { product_id: '', quantity: 1 }]
    }))
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selected_products: prev.selected_products.filter((_, i) => i !== index)
    }))
  }

  const updateProduct = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      selected_products: prev.selected_products.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Special Sales</h1>
          <p className="text-muted-foreground">Create and manage bundle deals, BOGO offers, and special promotions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Special Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Edit Special Offer' : 'Create Special Offer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="offer_type">Offer Type</Label>
                  <Select
                    value={formData.offer_type}
                    onValueChange={(value: 'bundle' | 'bogo' | 'discount') => 
                      setFormData(prev => ({ ...prev, offer_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bundle">Bundle Deal</SelectItem>
                      <SelectItem value="bogo">Buy One Get One</SelectItem>
                      <SelectItem value="discount">Special Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="banner_image_url">Banner Image</Label>
                <CloudinaryUploadWidget
                  onUploadComplete={(urls) => {
                    if (urls.length > 0) {
                      setFormData(prev => ({ ...prev, banner_image_url: urls[0] }))
                    }
                  }}
                  existingImages={formData.banner_image_url ? [formData.banner_image_url] : []}
                  maxFiles={1}
                />
                {formData.banner_image_url && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Current image: {formData.banner_image_url}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="special_price">Special Price (R)</Label>
                  <Input
                    id="special_price"
                    type="number"
                    step="0.01"
                    value={formData.special_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Original Price (R) - Optional</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                    placeholder="Auto-calculated from products"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Bundle Products</Label>
                  <Button type="button" onClick={addProduct} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.selected_products.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateProduct(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - R{product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {offer.offer_type}
                    </Badge>
                    {offer.discount_percentage > 0 && (
                      <Badge variant="destructive">
                        {offer.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                  >
                    {offer.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {offer.description}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-green-600">
                  R{offer.special_price.toFixed(2)}
                </span>
                {offer.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    R{offer.original_price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(offer.start_date).toLocaleDateString()}
                    {offer.end_date && ` - ${new Date(offer.end_date).toLocaleDateString()}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{offer.products.length} product(s)</span>
                </div>
                {offer.max_uses && (
                  <div className="text-xs">
                    Uses: {offer.current_uses}/{offer.max_uses}
                  </div>
                )}
              </div>

              {offer.products.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Bundle includes:</p>
                  <div className="space-y-1">
                    {offer.products.slice(0, 2).map((product) => (
                      <div key={product.product_id} className="text-xs flex justify-between">
                        <span className="truncate">{product.product_name}</span>
                        <span>{product.quantity}x</span>
                      </div>
                    ))}
                    {offer.products.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{offer.products.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Special Offers Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first special offer to start selling bundle deals and promotions.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Offer
          </Button>
        </div>
      )}
    </div>
  )
}