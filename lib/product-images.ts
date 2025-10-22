import { supabase } from '@/lib/supabase/client'

/**
 * Get the appropriate image URL for a product based on color selection
 * @param productId - The product ID
 * @param selectedColor - The selected color (optional)
 * @param fallbackImageUrl - The main product image URL to fall back to
 * @returns Promise<string> - The appropriate image URL
 */
export async function getProductImageForColor(
  productId: string,
  selectedColor?: string,
  fallbackImageUrl?: string
): Promise<string> {
  // If no color is selected or no product ID, return fallback
  if (!productId || !selectedColor) {
    return fallbackImageUrl || '/placeholder.svg?height=400&width=300&text=No+Image'
  }

  try {
    // Query the product_color_images table for the specific color mapping
    const { data: colorMapping, error } = await supabase
      .from('product_color_images')
      .select('image_url')
      .eq('product_id', productId)
      .eq('color_name', selectedColor)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching color-specific image:', error)
      return fallbackImageUrl || '/placeholder.svg?height=400&width=300&text=No+Image'
    }

    // Return the color-specific image if found, otherwise fallback to main image
    return colorMapping?.image_url || fallbackImageUrl || '/placeholder.svg?height=400&width=300&text=No+Image'

  } catch (error) {
    console.error('Error in getProductImageForColor:', error)
    return fallbackImageUrl || '/placeholder.svg?height=400&width=300&text=No+Image'
  }
}
