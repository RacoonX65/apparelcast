'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

declare global {
  interface Window {
    cloudinary: any
  }
}

interface CategoryBanner {
  id: string
  category: string
  title: string
  description: string | null
  background_image_url: string
  text_color: 'white' | 'black' | 'gray'
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

const CATEGORIES = ['clothing', 'shoes', 'perfumes', 'home', 'electronics']
const TEXT_COLORS = ['white', 'black', 'gray']

export function CategoryBannerManagement() {
  const [banners, setBanners] = useState<CategoryBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<CategoryBanner | null>(null)
  const widgetRef = useRef<any>(null)
  const [formData, setFormData] = useState<{
    category: string
    title: string
    description: string
    background_image_url: string
    text_color: 'white' | 'black' | 'gray'
    is_active: boolean
    display_order: number
  }>({
    category: 'clothing',
    title: '',
    description: '',
    background_image_url: '',
    text_color: 'white',
    is_active: true,
    display_order: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
    
    // Initialize Cloudinary widget
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    script.onload = () => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        console.error("Cloudinary credentials missing")
        return
      }

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder: "category-banners",
          multiple: false,
          maxFiles: 1,
          sources: ["local", "camera", "url"],
          showAdvancedOptions: false,
          cropping: true,
          croppingAspectRatio: 16/9,
          showCompletedButton: true,
          clientAllowedFormats: ["jpg", "png", "jpeg", "webp"],
          maxFileSize: 8000000, // 8 MB
          resourceType: "image",
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            handleImageUpload(result.info.secure_url)
          }
        }
      )
    }
    
    if (!document.querySelector('script[src="https://widget.cloudinary.com/v2.0/global/all.js"]')) {
      document.head.appendChild(script)
    }
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('category_banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching category banners:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch category banners',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.background_image_url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('category_banners')
          .update(formData)
          .eq('id', editingBanner.id)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Category banner updated successfully'
        })
      } else {
        const { error } = await supabase
          .from('category_banners')
          .insert([formData])

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Category banner created successfully'
        })
      }

      setIsDialogOpen(false)
      setEditingBanner(null)
      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving category banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to save category banner',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (banner: CategoryBanner) => {
    setEditingBanner(banner)
    setFormData({
      category: banner.category,
      title: banner.title,
      description: banner.description || '',
      background_image_url: banner.background_image_url,
      text_color: banner.text_color,
      is_active: banner.is_active,
      display_order: banner.display_order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('category_banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Category banner deleted successfully'
      })
      fetchBanners()
    } catch (error) {
      console.error('Error deleting category banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete category banner',
        variant: 'destructive'
      })
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('category_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchBanners()
    } catch (error) {
      console.error('Error updating banner status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update banner status',
        variant: 'destructive'
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(banners)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index
    }))

    setBanners(items)

    try {
      for (const update of updates) {
        await supabase
          .from('category_banners')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Error updating banner order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update banner order',
        variant: 'destructive'
      })
      fetchBanners() // Revert on error
    }
  }

  const resetForm = () => {
    setFormData({
      category: 'clothing',
      title: '',
      description: '',
      background_image_url: '',
      text_color: 'white',
      is_active: true,
      display_order: banners.length
    })
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, background_image_url: url }))
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading category banners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Banner Management</h2>
          <p className="text-muted-foreground">Manage category badges with background images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Category Banner' : 'Add Category Banner'}
              </DialogTitle>
              <DialogDescription>
                Create or edit a category banner with background image
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text_color">Text Color</Label>
                  <Select
                    value={formData.text_color}
                    onValueChange={(value: 'white' | 'black' | 'gray') => 
                      setFormData(prev => ({ ...prev, text_color: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map(color => (
                        <SelectItem key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.background_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_image_url: e.target.value }))}
                    placeholder="Image URL"
                    required
                  />
                  <Button type="button" variant="outline" onClick={() => widgetRef.current?.open()}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.background_image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.background_image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingBanner(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update' : 'Create'} Banner
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-banners">
          {(provided: any) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {banners.map((banner, index) => (
                <Draggable key={banner.id} draggableId={banner.id} index={index}>
                  {(provided: any) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${banner.background_image_url})` }}
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-white" />
                            </div>
                            <div className={`text-${banner.text_color}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary" className="capitalize">
                                  {banner.category}
                                </Badge>
                                {banner.is_active ? (
                                  <Badge variant="default">Active</Badge>
                                ) : (
                                  <Badge variant="destructive">Inactive</Badge>
                                )}
                              </div>
                              <h3 className="text-xl font-bold">{banner.title}</h3>
                              {banner.description && (
                                <p className="text-sm opacity-90 mt-1">{banner.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(banner.id, banner.is_active)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              {banner.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(banner)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Category Banner</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this category banner? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(banner.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {banners.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Category Banners</h3>
            <p className="text-muted-foreground mb-4">
              Create your first category banner to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category Banner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}