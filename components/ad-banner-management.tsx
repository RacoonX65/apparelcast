'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { InlineImageUpload } from '@/components/inline-image-upload'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Eye, EyeOff, ImageIcon, Video, Star, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface AdBanner {
  id: string
  title?: string
  subtitle?: string
  media_url: string
  media_type: 'image' | 'video'
  cta_text?: string
  cta_link?: string
  display_order: number
  is_active: boolean
  featured_rank: 1 | 2 | null
  created_at: string
  updated_at: string
}

interface BannerFormData {
  title: string
  subtitle: string
  media_url: string
  media_type: 'image' | 'video'
  cta_text: string
  cta_link: string
  is_active: boolean
}

const initialFormData: BannerFormData = {
  title: '',
  subtitle: '',
  media_url: '',
  media_type: 'image',
  cta_text: '',
  cta_link: '',
  is_active: true,
}

export function AdBannerManagement() {
  const { toast } = useToast()

  const [banners, setBanners] = useState<AdBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null)
  const [formData, setFormData] = useState<BannerFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isFeaturedDialogOpen, setIsFeaturedDialogOpen] = useState(false)
  const [featuredSelection, setFeaturedSelection] = useState<string[]>([])

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching ad banners:', error)
      toast({ title: 'Error', description: 'Failed to fetch ad banners', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingBanner(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const handleEdit = (banner: AdBanner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      media_url: banner.media_url,
      media_type: banner.media_type,
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      is_active: banner.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleMediaUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, media_url: urls[0] }))
    }
  }

  const handleMediaUploadDetailed = (files: { url: string; type: 'image' | 'video' }[]) => {
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, media_url: files[0].url, media_type: files[0].type }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.media_url) {
      toast({ title: 'Missing media', description: 'Upload an image or video first.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('ad_banners')
          .update({
            title: formData.title || null,
            subtitle: formData.subtitle || null,
            media_url: formData.media_url,
            media_type: formData.media_type,
            cta_text: formData.cta_text || null,
            cta_link: formData.cta_link || null,
            is_active: formData.is_active,
          })
          .eq('id', editingBanner.id)
        if (error) throw error
        toast({ title: 'Updated', description: 'Ad banner updated successfully.' })
      } else {
        const { error } = await supabase
          .from('ad_banners')
          .insert({
            title: formData.title || null,
            subtitle: formData.subtitle || null,
            media_url: formData.media_url,
            media_type: formData.media_type,
            cta_text: formData.cta_text || null,
            cta_link: formData.cta_link || null,
            is_active: formData.is_active,
          })
        if (error) throw error
        toast({ title: 'Created', description: 'Ad banner created successfully.' })
      }
      setIsDialogOpen(false)
      setEditingBanner(null)
      setFormData(initialFormData)
      fetchBanners()
    } catch (error) {
      console.error('Error saving ad banner:', error)
      toast({ title: 'Error', description: 'Failed to save ad banner', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('ad_banners').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Deleted', description: 'Ad banner removed.' })
      fetchBanners()
    } catch (error) {
      console.error('Error deleting ad banner:', error)
      toast({ title: 'Error', description: 'Failed to delete ad banner', variant: 'destructive' })
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('ad_banners').update({ is_active: !isActive }).eq('id', id)
      if (error) throw error
      fetchBanners()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({ title: 'Error', description: 'Failed to update banner status', variant: 'destructive' })
    }
  }

  const openFeaturedDialog = () => {
    const currentFeatured = banners.filter(b => b.featured_rank === 1 || b.featured_rank === 2)
    setFeaturedSelection(currentFeatured.map(b => b.id))
    setIsFeaturedDialogOpen(true)
  }

  const toggleFeaturedSelection = (id: string) => {
    setFeaturedSelection(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= 2) {
        // Replace the second selection with the new one
        return [prev[0], id]
      }
      return [...prev, id]
    })
  }

  const saveFeaturedSelection = async () => {
    if (featuredSelection.length !== 2) {
      toast({ title: 'Select two', description: 'Please select exactly two banners for featured slots.', variant: 'destructive' })
      return
    }
    const [first, second] = featuredSelection
    try {
      // Clear featured_rank for all
      const ids = banners.map(b => b.id)
      if (ids.length > 0) {
        await supabase.from('ad_banners').update({ featured_rank: null }).in('id', ids)
      }
      // Assign slot 1 and 2 to selected
      await supabase.from('ad_banners').update({ featured_rank: 1 }).eq('id', first)
      await supabase.from('ad_banners').update({ featured_rank: 2 }).eq('id', second)
      toast({ title: 'Saved', description: 'Featured slots updated.' })
      setIsFeaturedDialogOpen(false)
      fetchBanners()
    } catch (error) {
      console.error('Error saving featured selection:', error)
      toast({ title: 'Error', description: 'Failed to update featured slots', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading ad banners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ad Banner Management</h2>
          <p className="text-muted-foreground">Manage homepage ad banners and featured slots</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ad Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Ad Banner' : 'Create Ad Banner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Optional title" />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Optional subtitle" />
                  </div>
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
                        {formData.media_type === 'image' ? (
                          <Image src={formData.media_url || '/placeholder.svg'} alt="Preview" fill className="object-cover" />
                        ) : (
                          <video src={formData.media_url} className="w-full h-full object-cover" controls />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_text">CTA Text</Label>
                    <Input id="cta_text" value={formData.cta_text} onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))} placeholder="e.g., Shop Now" />
                  </div>
                  <div>
                    <Label htmlFor="cta_link">CTA Link</Label>
                    <Input id="cta_link" value={formData.cta_link} onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))} placeholder="https:// or /route" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))} />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : editingBanner ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFeaturedDialogOpen} onOpenChange={setIsFeaturedDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openFeaturedDialog}>
                <Star className="w-4 h-4 mr-2" />
                Manage Featured Slots
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select exactly two banners to feature</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className={`border ${featuredSelection.includes(banner.id) ? 'border-primary' : ''}`}>
                    <CardContent className="p-3">
                      <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                        {banner.media_type === 'image' ? (
                          <Image src={banner.media_url || '/placeholder.svg'} alt={banner.title || 'Ad banner'} fill className="object-cover" />
                        ) : (
                          <video src={banner.media_url} className="w-full h-full object-cover" controls />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-medium line-clamp-1">{banner.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                        </div>
                        <Button size="sm" variant={featuredSelection.includes(banner.id) ? 'default' : 'secondary'} onClick={() => toggleFeaturedSelection(banner.id)}>
                          {featuredSelection.includes(banner.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsFeaturedDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveFeaturedSelection}>Save Featured</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No ad banners found. Create your first banner to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">{banner.title || 'Untitled Ad'}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={banner.is_active ? 'default' : 'secondary'}>{banner.is_active ? 'Active' : 'Inactive'}</Badge>
                  {banner.featured_rank && <Badge variant="outline">Featured {banner.featured_rank}</Badge>}
                  <Badge variant="outline">{banner.media_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                  {banner.media_type === 'image' ? (
                    <Image src={banner.media_url || '/placeholder.svg'} alt={banner.title || 'Ad banner'} fill className="object-cover" />
                  ) : (
                    <video src={banner.media_url} className="w-full h-full object-cover" controls />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="secondary" onClick={() => handleEdit(banner)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this ad banner?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(banner.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Order: {banner.display_order}</span>
                    {banner.cta_link && (
                      <a href={banner.cta_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        <ExternalLink className="w-3 h-3" /> CTA Link
                      </a>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(banner.id, banner.is_active)}>
                    {banner.is_active ? (<><EyeOff className="w-4 h-4 mr-1" /> Hide</>) : (<><Eye className="w-4 h-4 mr-1" /> Show</>)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}