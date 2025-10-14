"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

const CATEGORIES = ["clothing", "sneakers", "perfumes"]

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "clothing",
    subcategory: product?.subcategory || "",
    stock_quantity: product?.stock_quantity || "",
    image_url: product?.image_url || "",
    sizes: product?.sizes?.join(", ") || "",
    colors: product?.colors?.join(", ") || "",
    is_featured: product?.is_featured || false,
  })
  const [productImages, setProductImages] = useState<string[]>(product?.image_url ? [product.image_url] : [])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()) : [],
        is_featured: formData.is_featured,
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
      console.error("[v0] Product save error:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (urls: string[]) => {
    setProductImages(urls)
    if (urls.length > 0) {
      setFormData({ ...formData, image_url: urls[0] })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (R)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Product Images</Label>
              <CloudinaryUploadWidget
                onUploadComplete={handleUploadComplete}
                existingImages={productImages}
                maxFiles={10}
              />
              <p className="text-xs text-muted-foreground">
                Upload high-quality product images. The first image will be used as the main product image.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes (comma-separated)</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="XS, S, M, L, XL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colors">Colors (comma-separated)</Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="Black, White, Blue"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured" className="text-sm font-normal cursor-pointer">
                Feature this product on homepage
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-accent">
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
