"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { InlineImageUpload } from "@/components/inline-image-upload"
import { BulkPricingTiers } from "@/components/bulk-pricing-tiers"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

const CATEGORIES = ["clothing", "shoes", "perfumes", "home", "electronics"]

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "clothing",
    subcategory: product?.subcategory || "",
    brand: product?.brand || "",
    material: product?.material || "",
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
  const [canonicalBrands, setCanonicalBrands] = useState<string[]>([])
  const [newBrandName, setNewBrandName] = useState("")
  const [isAddingBrand, setIsAddingBrand] = useState(false)
  
  // Variant management for new products
  const [enableVariants, setEnableVariants] = useState(false)
  const [variants, setVariants] = useState<Array<{
    size: string
    color: string
    stock_quantity: number
    price_adjustment: number
    id: string
  }>>([])
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock_quantity: 0,
    price_adjustment: 0
  })
  
  // Automated variant generation
  const [enableAutoGeneration, setEnableAutoGeneration] = useState(true)
  const [autoGenerationOptions, setAutoGenerationOptions] = useState({
    defaultQuantityPerVariant: 10,
    distributeStockEvenly: true,
    generateSKUs: false
  })
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)

  // Reinitialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "clothing",
        subcategory: product.subcategory || "",
        brand: product.brand || "",
        material: product.material || "",
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
        brand: "",
        material: "",
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
      setEnableVariants(false)
      setVariants([])
      setNewVariant({
        size: "",
        color: "",
        stock_quantity: 0,
        price_adjustment: 0
      })
    }
  }, [product])

  // Load canonical brands once
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.from("brands").select("name").order("name")
      if (error) {
        console.error("Fetch canonical brands error:", error)
        return
      }
      setCanonicalBrands((data || []).map((b: any) => b.name))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Optimize form field updates to prevent input interruptions
  const updateFormField = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const normalizeBrandName = (name: string) => {
    const cleaned = name.trim().replace(/\s+/g, " ")
    return cleaned
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map((seg) => (seg ? seg[0].toUpperCase() + seg.slice(1).toLowerCase() : ""))
          .join("-")
      )
      .join(" ")
  }

  const validateBrandName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return "Brand name is required"
    if (trimmed.length < 2) return "Brand name must be at least 2 characters"
    if (trimmed.length > 64) return "Brand name must be 64 characters or fewer"
    const allowed = /^[A-Za-z0-9 &\-'/\.]+$/
    if (!allowed.test(trimmed)) return "Only letters, numbers, spaces, - & ' . are allowed"
    return null
  }

  // Automated variant generation function
  const triggerAutomatedVariantGeneration = async (productId: string, productData: any) => {
    if (!enableAutoGeneration || enableVariants) {
      // Skip auto-generation if disabled or manual variants are being used
      return
    }

    try {
      setIsGeneratingVariants(true)
      
      const response = await fetch('/api/admin/products/variants/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          options: {
            defaultQuantityPerVariant: autoGenerationOptions.defaultQuantityPerVariant,
            distributeStockEvenly: autoGenerationOptions.distributeStockEvenly,
            generateSKUs: autoGenerationOptions.generateSKUs,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate variants')
      }

      const result = await response.json()
      
      toast({
        title: "Variants Generated Successfully",
        description: `Created ${result.variantsCreated} variants automatically. You can manage them in the product variants section.`,
      })
      
    } catch (error) {
      console.error('Automated variant generation failed:', error)
      toast({
        title: "Variant Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate variants automatically. You can create them manually.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingVariants(false)
    }
  }

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
        brand: formData.brand || null,
        material: formData.material || null,
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
        const { data: newProduct, error } = await supabase.from("products").insert(productData).select().single()
        if (error) throw error
        
        // If variants are enabled and we have variants to create, create them
        if (enableVariants && variants.length > 0 && newProduct) {
          const variantData = variants.map(variant => ({
            product_id: newProduct.id,
            size: variant.size,
            color: variant.color,
            stock_quantity: variant.stock_quantity,
            price_adjustment: variant.price_adjustment,
            is_active: true
          }))
          
          const { error: variantError } = await supabase.from("product_variants").insert(variantData)
          if (variantError) {
            console.error("Error creating variants:", variantError)
            toast({
              title: "Warning",
              description: "Product created but some variants failed to save. You can add them later.",
              variant: "destructive",
            })
          }
        } else if (newProduct) {
          // Trigger automated variant generation for new products (if enabled and no manual variants)
          await triggerAutomatedVariantGeneration(newProduct.id, productData)
        }
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
                    <Label>Brand (Optional)</Label>
                    <Select
                      value={formData.brand && formData.brand.length > 0 ? formData.brand : "__none__"}
                      onValueChange={(val) => updateFormField('brand', val === "__none__" ? "" : val)}
                      disabled={canonicalBrands.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={canonicalBrands.length ? "Select brand" : "No canonical brands"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">(No brand)</SelectItem>
                        {canonicalBrands.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="new-brand"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                        placeholder="Quick add brand"
                        className="w-56"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={isAddingBrand}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const message = validateBrandName(newBrandName)
                          if (message) {
                            toast({ title: "Invalid brand", description: message, variant: "destructive" })
                            return
                          }
                          const normalized = normalizeBrandName(newBrandName)
                          const exists = canonicalBrands.some((b) => b.trim().toLowerCase() === normalized.trim().toLowerCase())
                          if (exists) {
                            toast({ title: "Already exists", description: "Brand is already in canonical list." })
                            updateFormField('brand', normalized)
                            return
                          }
                          setIsAddingBrand(true)
                          try {
                            const res = await supabase.from("brands").insert({ name: normalized })
                            if (res.error) throw res.error
                            setCanonicalBrands((prev) => [...prev, normalized].sort((a, b) => a.localeCompare(b)))
                            updateFormField('brand', normalized)
                            setNewBrandName("")
                            toast({ title: "Brand added", description: `Added "${normalized}" to canonical brands.` })
                            router.refresh()
                          } catch (error: any) {
                            console.error("Quick add brand error:", error)
                            const desc = typeof error?.message === "string" ? error.message : "Failed to add brand."
                            toast({ title: "Error", description: desc, variant: "destructive" })
                          } finally {
                            setIsAddingBrand(false)
                          }
                        }}
                      >
                        {isAddingBrand ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material (Optional)</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => updateFormField('material', e.target.value)}
                      placeholder="e.g., Cotton, Leather"
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

                {/* Automated Variant Generation - Only for new products */}
                {!product && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-md font-semibold">Automated Variant Generation</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_auto_generation"
                        checked={enableAutoGeneration}
                        onCheckedChange={(checked) => setEnableAutoGeneration(checked as boolean)}
                      />
                      <Label htmlFor="enable_auto_generation" className="text-sm font-normal cursor-pointer">
                        Automatically generate variants based on sizes and colors
                      </Label>
                    </div>

                    {enableAutoGeneration && (
                      <div className="space-y-4 ml-6 border-l-2 border-blue-200 pl-4">
                        <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                          <p>🤖 <strong>Auto-Generation:</strong> The system will automatically create variants for all size-color combinations based on the sizes and colors you specify above. Each variant will use the main product price (no price adjustments) and get equal stock distribution.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="default_quantity">Default Quantity per Variant</Label>
                            <Input
                              id="default_quantity"
                              type="number"
                              min="1"
                              value={autoGenerationOptions.defaultQuantityPerVariant}
                              onChange={(e) => setAutoGenerationOptions(prev => ({
                                ...prev,
                                defaultQuantityPerVariant: parseInt(e.target.value) || 10
                              }))}
                            />
                            <p className="text-xs text-gray-500">
                              Stock quantity for each generated variant
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 mt-6">
                              <Checkbox
                                id="distribute_stock"
                                checked={autoGenerationOptions.distributeStockEvenly}
                                onCheckedChange={(checked) => setAutoGenerationOptions(prev => ({
                                  ...prev,
                                  distributeStockEvenly: checked as boolean
                                }))}
                              />
                              <Label htmlFor="distribute_stock" className="text-xs cursor-pointer">
                                Distribute total stock evenly
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="generate_skus"
                                checked={autoGenerationOptions.generateSKUs}
                                onCheckedChange={(checked) => setAutoGenerationOptions(prev => ({
                                  ...prev,
                                  generateSKUs: checked as boolean
                                }))}
                              />
                              <Label htmlFor="generate_skus" className="text-xs cursor-pointer">
                                Auto-generate SKUs
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Product Variants Configuration - Only for new products */}
                {!product && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-md font-semibold">Manual Variant Creation (Optional)</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_variants"
                        checked={enableVariants}
                        onCheckedChange={(checked) => {
                          setEnableVariants(checked as boolean)
                          if (checked) {
                            setEnableAutoGeneration(false) // Disable auto-generation when manual is enabled
                          }
                        }}
                      />
                      <Label htmlFor="enable_variants" className="text-sm font-normal cursor-pointer">
                        Create size and color variants with individual stock quantities
                      </Label>
                    </div>

                    {enableVariants && (
                      <div className="space-y-4 ml-6 border-l-2 border-gray-200 pl-4">
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          <p>💡 <strong>Tip:</strong> Create specific size-color combinations with individual stock quantities. This allows precise inventory management for each variant.</p>
                        </div>
                        
                        {/* Add Variant Form */}
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                          <div className="space-y-2">
                            <Label htmlFor="variant_size">Size</Label>
                            <Input
                              id="variant_size"
                              value={newVariant.size}
                              onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
                              placeholder="e.g., M, L, XL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="variant_color">Color</Label>
                            <Input
                              id="variant_color"
                              value={newVariant.color}
                              onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}
                              placeholder="e.g., Red, Blue, Black"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="variant_stock">Stock Quantity</Label>
                            <Input
                              id="variant_stock"
                              type="number"
                              min="0"
                              value={newVariant.stock_quantity}
                              onChange={(e) => setNewVariant({...newVariant, stock_quantity: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="variant_price_adj">Price Adjustment (R)</Label>
                            <Input
                              id="variant_price_adj"
                              type="number"
                              step="0.01"
                              value={newVariant.price_adjustment}
                              onChange={(e) => setNewVariant({...newVariant, price_adjustment: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="col-span-2">
                            <Button
                              type="button"
                              onClick={() => {
                                if (!newVariant.size || !newVariant.color) {
                                  toast({
                                    title: "Missing Information",
                                    description: "Please enter both size and color for the variant.",
                                    variant: "destructive",
                                  })
                                  return
                                }
                                
                                const variantId = `${newVariant.size}-${newVariant.color}`
                                const existingVariant = variants.find(v => v.id === variantId)
                                
                                if (existingVariant) {
                                  toast({
                                    title: "Duplicate Variant",
                                    description: "A variant with this size and color already exists.",
                                    variant: "destructive",
                                  })
                                  return
                                }
                                
                                setVariants([...variants, { ...newVariant, id: variantId }])
                                setNewVariant({
                                  size: "",
                                  color: "",
                                  stock_quantity: 0,
                                  price_adjustment: 0
                                })
                              }}
                              className="w-full"
                            >
                              Add Variant
                            </Button>
                          </div>
                        </div>

                        {/* Variants List */}
                        {variants.length > 0 && (
                          <div className="space-y-2">
                            <Label>Created Variants ({variants.length})</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {variants.map((variant) => (
                                <div key={variant.id} className="flex items-center justify-between p-2 border rounded bg-white">
                                  <div className="flex-1">
                                    <span className="font-medium">{variant.size} - {variant.color}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      Stock: {variant.stock_quantity}
                                      {variant.price_adjustment !== 0 && (
                                        <span className={variant.price_adjustment > 0 ? "text-green-600" : "text-red-600"}>
                                          {" "}({variant.price_adjustment > 0 ? '+' : ''}R{variant.price_adjustment.toFixed(2)})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVariants(variants.filter(v => v.id !== variant.id))}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Product Variants Preview */}
                {product?.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold">Product Variants</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the Package icon in product management to manage variants
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <p>💡 <strong>Tip:</strong> After saving this product, you can manage its size and color variants with individual stock quantities using the Package (📦) button in the product management interface.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isGeneratingVariants} className="flex-1 bg-primary hover:bg-accent">
                  {isLoading ? "Saving..." : isGeneratingVariants ? "Generating Variants..." : "Save Product"}
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
