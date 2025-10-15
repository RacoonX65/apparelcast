"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { InlineImageUpload } from "@/components/inline-image-upload"
import { BulkPricingTiers } from "@/components/bulk-pricing-tiers"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

const CATEGORIES = ["clothing", "sneakers", "perfumes", "home", "electronics"]

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "clothing",
    subcategory: product?.subcategory || "",
    stock_quantity: product?.stock_quantity?.toString() || "",
    image_url: product?.image_url || "",
    sizes: product?.sizes?.join(", ") || "",
    colors: product?.colors?.join(", ") || "",
    is_featured: product?.is_featured || false,
    enable_bulk_pricing: product?.enable_bulk_pricing || false,
    min_bulk_quantity: product?.min_bulk_quantity?.toString() || "10",
    bulk_discount_note: product?.bulk_discount_note || "",
  })
  
  // Initialize product images with main image and additional images
  const initializeImages = () => {
    if (!product) return []
    const images = []
    if (product.image_url) images.push(product.image_url)
    if (product.additional_images && Array.isArray(product.additional_images)) {
      images.push(...product.additional_images)
    }
    return images
  }
  
  const [productImages, setProductImages] = useState<string[]>(initializeImages())
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Reinitialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "clothing",
        subcategory: product.subcategory || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        image_url: product.image_url || "",
        sizes: product.sizes?.join(", ") || "",
        colors: product.colors?.join(", ") || "",
        is_featured: product.is_featured || false,
        enable_bulk_pricing: product.enable_bulk_pricing || false,
        min_bulk_quantity: product.min_bulk_quantity?.toString() || "10",
        bulk_discount_note: product.bulk_discount_note || "",
      })
      
      // Reinitialize images
      const images = []
      if (product.image_url) images.push(product.image_url)
      if (product.additional_images && Array.isArray(product.additional_images)) {
        images.push(...product.additional_images)
      }
      setProductImages(images)
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "clothing",
        subcategory: "",
        stock_quantity: "",
        image_url: "",
        sizes: "",
        colors: "",
        is_featured: false,
        enable_bulk_pricing: false,
        min_bulk_quantity: "10",
        bulk_discount_note: "",
      })
      setProductImages([])
    }
  }, [product])

  // Optimize form field updates to prevent input interruptions
  const updateFormField = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const mainImageUrl = productImages[0] || formData.image_url

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || null,
        stock_quantity: Number.parseInt(formData.stock_quantity),
        image_url: mainImageUrl,
        additional_images: productImages.length > 1 ? productImages.slice(1) : [],
        sizes: formData.sizes ? formData.sizes.split(",").map((s: string) => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(",").map((c: string) => c.trim()) : [],
        is_featured: formData.is_featured,
        enable_bulk_pricing: formData.enable_bulk_pricing,
        min_bulk_quantity: formData.enable_bulk_pricing ? Number.parseInt(formData.min_bulk_quantity) : null,
        bulk_discount_note: formData.enable_bulk_pricing ? formData.bulk_discount_note : null,
      }

      if (product) {
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert(productData)
        if (error) throw error
      }

      toast({
        title: "Success",
        description: product ? "Product updated successfully" : "Product added successfully",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Product save error:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = useCallback((urls: string[]) => {
    setProductImages(urls)
    if (urls.length > 0) {
      updateFormField('image_url', urls[0])
    }
  }, [updateFormField])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90vw] max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Product Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (R)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => updateFormField('price', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => updateFormField('stock_quantity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => updateFormField('category', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => updateFormField('subcategory', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) => updateFormField('sizes', e.target.value)}
                      placeholder="XS, S, M, L, XL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colors">Colors (comma-separated)</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) => updateFormField('colors', e.target.value)}
                      placeholder="Black, White, Blue"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => updateFormField('is_featured', checked as boolean)}
                  />
                  <Label htmlFor="is_featured" className="text-sm font-normal cursor-pointer">
                    Feature this product on homepage
                  </Label>
                </div>

                {/* Bulk Pricing Configuration */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-md font-semibold">Bulk Pricing Configuration</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable_bulk_pricing"
                      checked={formData.enable_bulk_pricing}
                      onCheckedChange={(checked) => updateFormField('enable_bulk_pricing', checked as boolean)}
                    />
                    <Label htmlFor="enable_bulk_pricing" className="text-sm font-normal cursor-pointer">
                      Enable bulk pricing for this product
                    </Label>
                  </div>

                  {formData.enable_bulk_pricing && (
                    <div className="space-y-4 ml-6 border-l-2 border-gray-200 pl-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_bulk_quantity">Minimum Bulk Quantity</Label>
                        <Input
                          id="min_bulk_quantity"
                          type="number"
                          min="2"
                          value={formData.min_bulk_quantity}
                          onChange={(e) => updateFormField('min_bulk_quantity', e.target.value)}
                          placeholder="10"
                        />
                        <p className="text-xs text-gray-500">
                          Minimum quantity required for bulk pricing to apply
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bulk_discount_note">Bulk Discount Note (Optional)</Label>
                        <Textarea
                          id="bulk_discount_note"
                          value={formData.bulk_discount_note}
                          onChange={(e) => updateFormField('bulk_discount_note', e.target.value)}
                          placeholder="e.g., Perfect for events, teams, or resellers"
                          rows={2}
                        />
                        <p className="text-xs text-gray-500">
                          Additional information about bulk pricing for customers
                        </p>
                      </div>

                      {/* Custom Bulk Pricing Tiers */}
                      <BulkPricingTiers 
                        productId={product?.id}
                        basePrice={parseFloat(formData.price) || 0}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-accent">
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Product Images</h3>
            <InlineImageUpload
              onUploadComplete={handleUploadComplete}
              existingImages={productImages}
              maxFiles={10}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
