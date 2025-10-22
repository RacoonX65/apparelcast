'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Slider } from '@/components/ui/slider'
import { InlineImageUpload } from '@/components/inline-image-upload'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ImageIcon, Video, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface HeroBanner {
  id: string
  title: string
  subtitle?: string
  description?: string
  media_url: string
  media_type: 'image' | 'video'
  cta_text?: string
  cta_link?: string
  background_overlay_opacity: number
  text_color: 'white' | 'black'
  display_order: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

interface BannerFormData {
  title: string
  subtitle: string
  description: string
  media_url: string
  media_type: 'image' | 'video'
  cta_text: string
  cta_link: string
  background_overlay_opacity: number
  text_color: 'white' | 'black'
  is_active: boolean
  start_date: string
  end_date: string
}

const initialFormData: BannerFormData = {
  title: '',
  subtitle: '',
  description: '',
  media_url: '',
  media_type: 'image',
  cta_text: '',
  cta_link: '',
  background_overlay_opacity: 40,
  text_color: 'white',
  is_active: true,
  start_date: '',
  end_date: ''
}

export function HeroBannerManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null)
  const [formData, setFormData] = useState<BannerFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast({
        title: "Error",
        description: "Failed to fetch hero banners",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.media_url) {
      toast({
        title: "Validation Error",
        description: "Title and media URL are required",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const bannerData = {
        ...formData,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        cta_text: formData.cta_text || null,
        cta_link: formData.cta_link || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        display_order: editingBanner ? editingBanner.display_order : banners.length
      }

      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update(bannerData)
          .eq('id', editingBanner.id)

        if (error) throw error
        toast({ title: "Success", description: "Banner updated successfully" })
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert([bannerData])

        if (error) throw error
        toast({ title: "Success", description: "Banner created successfully" })
      }

      setIsDialogOpen(false)
      setEditingBanner(null)
      setFormData(initialFormData)
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast({
        title: "Error",
        description: "Failed to save banner",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      media_url: banner.media_url,
      media_type: banner.media_type,
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      background_overlay_opacity: banner.background_overlay_opacity,
      text_color: banner.text_color,
      is_active: banner.is_active,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: "Success", description: "Banner deleted successfully" })
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive"
      })
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner status:', error)
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive"
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
      display_order: index + 1,
    }))

    setBanners(items)

    try {
      for (const update of updates) {
        await supabase.from('hero_banners').update({ display_order: update.display_order }).eq('id', update.id)
      }
      toast({ title: "Success", description: "Banner order updated" })
    } catch (error) {
      console.error('Error updating banner order:', error)
      toast({
        title: "Error",
        description: "Failed to update banner order",
        variant: "destructive"
      })
      fetchBanners() // Revert on error
    }
  }

  const handleMediaUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({
        ...prev,
        media_url: urls[0]
      }))
    }
  }

  const handleMediaUploadDetailed = (files: { url: string; type: 'image' | 'video' }[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        media_url: files[0].url,
        media_type: files[0].type,
      }))
    }
  }

  const openDialog = () => {
    setEditingBanner(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading hero banners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Banner Management</h2>
          <p className="text-muted-foreground">Manage your homepage hero slider banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Hero Banner' : 'Create Hero Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter banner title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Enter subtitle (optional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Media Upload *</Label>
                <div className="mt-2 grid grid-cols-2 gap-4 items-start">
                  <InlineImageUpload
                    onUploadComplete={handleMediaUpload}
                    onUploadCompleteDetailed={handleMediaUploadDetailed}
                    existingImages={formData.media_url ? [formData.media_url] : []}
                    maxFiles={1}
                    showLabel={false}
                    enableVideo={true}
                    enableCrop={true}
                    cropAspect={16/9}
                    showPreviewGrid={false}
                  />
                  {formData.media_url && (
                    <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                      {formData.media_type === 'video' ? (
                        <video src={formData.media_url} className="w-full h-full object-cover" controls />
                      ) : (
                        <Image
                          src={formData.media_url}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      )}
                      <Badge className="absolute top-2 left-2">
                        {formData.media_type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                        {formData.media_type}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_text">CTA Button Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="e.g., Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_link">CTA Button Link</Label>
                  <Input
                    id="cta_link"
                    value={formData.cta_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                    placeholder="e.g., /products"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Text Color</Label>
                  <Select value={formData.text_color} onValueChange={(value: 'white' | 'black') => setFormData(prev => ({ ...prev, text_color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Background Overlay Opacity: {formData.background_overlay_opacity}%</Label>
                  <Slider
                    value={[formData.background_overlay_opacity]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, background_overlay_opacity: value }))}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hero banners found. Create your first banner to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="banners">
            {(provided: any) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {banners.map((banner, index) => (
                  <Draggable key={banner.id} draggableId={banner.id} index={index}>
                    {(provided: any) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${!banner.is_active ? 'opacity-60' : ''}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div {...provided.dragHandleProps} className="mt-2">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                            
                            <div className="flex-shrink-0">
                              {banner.media_type === 'video' ? (
                                <video src={banner.media_url} className="w-24 h-16 object-cover rounded-md" />
                              ) : (
                                <Image
                                  src={banner.media_url}
                                  alt={banner.title}
                                  width={96}
                                  height={64}
                                  className="w-24 h-16 object-cover rounded-md"
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{banner.title}</h3>
                                  {banner.subtitle && (
                                    <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                                  )}
                                  {banner.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {banner.description}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                                    {banner.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge variant="outline">{banner.media_type}</Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Order: {banner.display_order}</span>
                                  {banner.start_date && (
                                    <span className="flex items-center">
                                      {new Date(banner.start_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  {banner.cta_text && banner.cta_link && (
                                    <span className="flex items-center">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      {banner.cta_text}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleActive(banner.id, !banner.is_active)}
                                  >
                                    {banner.is_active ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(banner)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(banner.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
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
      )}
    </div>
  )
}