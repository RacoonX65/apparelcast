"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Image as ImageIcon, Palette, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { InlineImageUpload } from "@/components/inline-image-upload"

interface ColorImageMapping {
  id: string
  color_name: string
  image_url: string
  display_order: number
}

interface ProductColorImageManagerProps {
  productId: string
  productName: string
  productColors: string[]
  onClose: () => void
}

export function ProductColorImageManager({ 
  productId, 
  productName, 
  productColors, 
  onClose 
}: ProductColorImageManagerProps) {
  const [colorMappings, setColorMappings] = useState<ColorImageMapping[]>([])
  const [productImages, setProductImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newMapping, setNewMapping] = useState({
    color_name: "",
    image_url: "",
    display_order: 0
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchColorMappings()
    fetchProductImages()
  }, [productId])

  const fetchProductImages = async () => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('image_url, additional_images')
        .eq('id', productId)
        .single()

      if (error) throw error

      if (product) {
        const images = []
        if (product.image_url) images.push(product.image_url)
        if (product.additional_images && Array.isArray(product.additional_images)) {
          images.push(...product.additional_images)
        }
        setProductImages(images.filter(Boolean))
      }
    } catch (error) {
      console.error('Error fetching product images:', error)
      toast({
        title: "Error",
        description: "Failed to load product images",
        variant: "destructive"
      })
    }
  }

  const fetchColorMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('product_color_images')
        .select('*')
        .eq('product_id', productId)
        .order('color_name', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error
      setColorMappings(data || [])
    } catch (error) {
      console.error('Error fetching color mappings:', error)
      toast({
        title: "Error",
        description: "Failed to load color-image mappings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMapping = async () => {
    if (!newMapping.color_name || !newMapping.image_url) {
      toast({
        title: "Validation Error",
        description: "Please select a color and choose an image",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('product_color_images')
        .insert({
          product_id: productId,
          color_name: newMapping.color_name,
          image_url: newMapping.image_url,
          display_order: newMapping.display_order
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Color-image mapping added successfully"
      })

      setNewMapping({ color_name: "", image_url: "", display_order: 0 })
      setSelectedImageIndex(null)
      setShowAddForm(false)
      fetchColorMappings()
    } catch (error) {
      console.error('Error adding mapping:', error)
      toast({
        title: "Error",
        description: "Failed to add color-image mapping",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('product_color_images')
        .delete()
        .eq('id', mappingId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Color-image mapping deleted successfully"
      })

      fetchColorMappings()
    } catch (error) {
      console.error('Error deleting mapping:', error)
      toast({
        title: "Error",
        description: "Failed to delete color-image mapping",
        variant: "destructive"
      })
    }
  }

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setNewMapping(prev => ({ ...prev, image_url: urls[0] }))
      setSelectedImageIndex(null) // Clear selection when uploading new image
    }
  }

  const handleImageSelect = (imageUrl: string, index: number) => {
    setNewMapping(prev => ({ ...prev, image_url: imageUrl }))
    setSelectedImageIndex(index)
  }

  const getUnmappedColors = () => {
    const mappedColors = new Set(colorMappings.map(m => m.color_name))
    return productColors.filter(color => !mappedColors.has(color))
  }

  const getColorMappingsByColor = (color: string) => {
    return colorMappings.filter(m => m.color_name === color)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading color mappings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Color-Image Mappings
          </h2>
          <p className="text-muted-foreground">
            Link colors to specific images for <strong>{productName}</strong>
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          ← Back to Product Management
        </Button>
      </div>

      {/* Color Mapping Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Current Mappings ({colorMappings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productColors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>This product has no colors defined.</p>
              <p className="text-sm">Add colors to the product first to create color-image mappings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productColors.map(color => {
                const mappings = getColorMappingsByColor(color)
                return (
                  <div key={color} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                        <span className="font-medium">{color}</span>
                        <Badge variant={mappings.length > 0 ? "default" : "secondary"}>
                          {mappings.length} {mappings.length === 1 ? 'image' : 'images'}
                        </Badge>
                      </div>
                    </div>
                    
                    {mappings.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {mappings.map(mapping => (
                          <div key={mapping.id} className="relative group">
                            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted border">
                              <Image
                                src={mapping.image_url}
                                alt={`${color} variant`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMapping(mapping.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-center mt-1 text-muted-foreground">
                              Order: {mapping.display_order}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No images mapped to this color</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Mapping */}
      {productColors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Color-Image Mapping
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : 'Add Mapping'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAddForm && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={newMapping.color_name}
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, color_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {productColors.map(color => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newMapping.display_order}
                    onChange={(e) => setNewMapping(prev => ({ 
                      ...prev, 
                      display_order: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Choose Image</Label>
                  <Badge variant="outline">{productImages.length} available</Badge>
                </div>
                
                {productImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {productImages.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className={`aspect-square relative overflow-hidden rounded-lg bg-muted cursor-pointer border-2 transition-all hover:scale-105 ${
                          selectedImageIndex === index 
                            ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => handleImageSelect(imageUrl, index)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No product images available</p>
                    <p className="text-sm">Upload images to the product first</p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Or upload a new image</p>
                  <InlineImageUpload
                    onUploadComplete={handleImageUpload}
                    existingImages={[]}
                    maxFiles={1}
                  />
                </div>
              </div>

              {newMapping.image_url && (
                <div className="space-y-2">
                  <Label>Selected Image Preview</Label>
                  <div className="w-32 h-32 relative overflow-hidden rounded-lg bg-muted border">
                    <Image
                      src={newMapping.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleAddMapping} 
                disabled={saving || !newMapping.color_name || !newMapping.image_url}
                className="w-full"
              >
                {saving ? "Adding..." : "Add Mapping"}
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}