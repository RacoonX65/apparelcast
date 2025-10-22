import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ColorImageMapping {
  id: string
  color_name: string
  image_url: string
  display_order: number
}

interface UseColorImageMappingProps {
  productId: string
  productColors: string[]
  defaultImages: string[]
}

export function useColorImageMapping({ 
  productId, 
  productColors, 
  defaultImages 
}: UseColorImageMappingProps) {
  const [colorMappings, setColorMappings] = useState<ColorImageMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(defaultImages[0] || '')
  // supabase client already imported at top

  // Fetch color mappings from database
  useEffect(() => {
    const fetchColorMappings = async () => {
      if (!productId) return

      try {
        const { data, error } = await supabase
          .from('product_color_images')
          .select('*')
          .eq('product_id', productId)
          .order('color_name', { ascending: true })
          .order('display_order', { ascending: true })

        if (error) {
          console.error('Error fetching color mappings:', error)
          return
        }

        setColorMappings(data || [])
      } catch (error) {
        console.error('Error in fetchColorMappings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchColorMappings()
  }, [productId, supabase])

  // Update current image when color selection changes
  useEffect(() => {
    if (!selectedColor) {
      setCurrentImageUrl(defaultImages[0] || '')
      return
    }

    // Find the first image mapping for the selected color
    const colorMapping = colorMappings.find(
      mapping => mapping.color_name.toLowerCase() === selectedColor.toLowerCase()
    )

    if (colorMapping) {
      setCurrentImageUrl(colorMapping.image_url)
    } else {
      // Fallback to default image if no mapping found
      setCurrentImageUrl(defaultImages[0] || '')
    }
  }, [selectedColor, colorMappings, defaultImages])

  // Get all images for a specific color
  const getImagesForColor = (color: string): string[] => {
    const mappings = colorMappings
      .filter(mapping => mapping.color_name.toLowerCase() === color.toLowerCase())
      .sort((a, b) => a.display_order - b.display_order)
    
    return mappings.map(mapping => mapping.image_url)
  }

  // Check if a color has mapped images
  const hasColorMapping = (color: string): boolean => {
    return colorMappings.some(
      mapping => mapping.color_name.toLowerCase() === color.toLowerCase()
    )
  }

  // Get all available images (default + color-specific)
  const getAllAvailableImages = (): string[] => {
    const colorImages = colorMappings.map(mapping => mapping.image_url)
    const allImages = [...defaultImages, ...colorImages]
    
    // Remove duplicates
    return Array.from(new Set(allImages)).filter(Boolean)
  }

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
  }

  // Reset to default state
  const resetSelection = () => {
    setSelectedColor('')
    setCurrentImageUrl(defaultImages[0] || '')
  }

  return {
    // State
    colorMappings,
    loading,
    selectedColor,
    currentImageUrl,
    
    // Actions
    handleColorSelect,
    resetSelection,
    setCurrentImageUrl,
    
    // Utilities
    getImagesForColor,
    hasColorMapping,
    getAllAvailableImages,
    
    // Computed values
    hasAnyColorMappings: colorMappings.length > 0,
    availableColors: productColors.filter(color => hasColorMapping(color))
  }
}