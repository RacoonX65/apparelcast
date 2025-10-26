/**
 * Automated Product Variant Generation System
 * 
 * This module provides functionality to automatically generate product variants
 * based on product specifications (sizes, colors, etc.) with proper inventory tracking.
 */

import { createClient } from '@/lib/supabase/server'

export interface ProductVariantData {
  product_id: string
  size: string
  color: string
  stock_quantity: number
  price_adjustment: number
  sku?: string
  is_active: boolean
}

export interface VariantGenerationOptions {
  enableAutoGeneration?: boolean
  defaultQuantityPerVariant?: number
  distributeStockEvenly?: boolean
  generateSKUs?: boolean
  priceAdjustments?: Record<string, number> // size/color specific adjustments
}

export interface VariantGenerationResult {
  success: boolean
  variantsCreated: number
  variants: ProductVariantData[]
  errors: string[]
  warnings: string[]
}

/**
 * Analyzes product specifications and generates variants automatically
 */
export async function generateProductVariants(
  productId: string,
  sizes: string[],
  colors: string[],
  totalStock: number,
  options: VariantGenerationOptions = {}
): Promise<VariantGenerationResult> {
  const {
    enableAutoGeneration = true,
    defaultQuantityPerVariant = 10,
    distributeStockEvenly = true,
    generateSKUs = false,
    priceAdjustments = {}
  } = options

  const result: VariantGenerationResult = {
    success: false,
    variantsCreated: 0,
    variants: [],
    errors: [],
    warnings: []
  }

  try {
    // Validate inputs
    if (!enableAutoGeneration) {
      result.warnings.push('Auto-generation is disabled')
      return result
    }

    if (!productId) {
      result.errors.push('Product ID is required')
      return result
    }

    if (!sizes?.length || !colors?.length) {
      result.warnings.push('No sizes or colors specified - skipping variant generation')
      result.success = true
      return result
    }

    // Calculate total combinations
    const totalCombinations = sizes.length * colors.length
    
    if (totalCombinations === 0) {
      result.warnings.push('No valid size-color combinations found')
      result.success = true
      return result
    }

    // Calculate stock distribution
    let stockPerVariant: number
    let remainderStock = 0

    if (distributeStockEvenly && totalStock > 0) {
      stockPerVariant = Math.floor(totalStock / totalCombinations)
      remainderStock = totalStock % totalCombinations
    } else {
      stockPerVariant = defaultQuantityPerVariant
    }

    // Generate variants for each size-color combination
    const variants: ProductVariantData[] = []
    let variantIndex = 0

    for (const size of sizes) {
      for (const color of colors) {
        // Calculate stock for this variant (add remainder to first variants)
        const variantStock = stockPerVariant + (variantIndex < remainderStock ? 1 : 0)
        
        // Calculate price adjustment if specified
        const sizeAdjustment = priceAdjustments[`size_${size}`] || 0
        const colorAdjustment = priceAdjustments[`color_${color}`] || 0
        const totalPriceAdjustment = sizeAdjustment + colorAdjustment

        // Generate SKU if enabled
        const sku = generateSKUs ? generateVariantSKU(productId, size, color) : undefined

        const variant: ProductVariantData = {
          product_id: productId,
          size: size.trim(),
          color: color.trim(),
          stock_quantity: variantStock,
          price_adjustment: totalPriceAdjustment,
          sku,
          is_active: true
        }

        variants.push(variant)
        variantIndex++
      }
    }

    result.variants = variants
    result.variantsCreated = variants.length
    result.success = true

    // Log generation event
    console.log(`Generated ${variants.length} variants for product ${productId}`, {
      sizes,
      colors,
      totalStock,
      stockPerVariant,
      remainderStock
    })

  } catch (error) {
    console.error('Error generating product variants:', error)
    result.errors.push(`Variant generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Saves generated variants to the database with proper error handling
 */
export async function saveProductVariants(
  variants: ProductVariantData[]
): Promise<VariantGenerationResult> {
  const result: VariantGenerationResult = {
    success: false,
    variantsCreated: 0,
    variants: [],
    errors: [],
    warnings: []
  }

  if (!variants.length) {
    result.warnings.push('No variants to save')
    result.success = true
    return result
  }

  try {
    const supabase = await createClient()

    // Insert variants with conflict resolution
    const { data, error } = await supabase
      .from('product_variants')
      .upsert(variants, {
        onConflict: 'product_id,size,color',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      throw error
    }

    result.success = true
    result.variantsCreated = data?.length || 0
    result.variants = data || []

    // Log successful save
    console.log(`Successfully saved ${result.variantsCreated} variants to database`)

  } catch (error) {
    console.error('Error saving product variants:', error)
    result.errors.push(`Failed to save variants: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Complete automated variant generation workflow
 */
export async function automatedVariantGeneration(
  productId: string,
  productData: {
    sizes: string[]
    colors: string[]
    stock_quantity: number
    name?: string
  },
  options: VariantGenerationOptions = {}
): Promise<VariantGenerationResult> {
  const result: VariantGenerationResult = {
    success: false,
    variantsCreated: 0,
    variants: [],
    errors: [],
    warnings: []
  }

  try {
    // Step 1: Generate variants
    const generationResult = await generateProductVariants(
      productId,
      productData.sizes,
      productData.colors,
      productData.stock_quantity,
      options
    )

    // Merge results
    result.errors.push(...generationResult.errors)
    result.warnings.push(...generationResult.warnings)

    if (!generationResult.success || generationResult.variants.length === 0) {
      result.success = generationResult.success
      return result
    }

    // Step 2: Save variants to database
    const saveResult = await saveProductVariants(generationResult.variants)

    // Merge save results
    result.errors.push(...saveResult.errors)
    result.warnings.push(...saveResult.warnings)
    result.success = saveResult.success
    result.variantsCreated = saveResult.variantsCreated
    result.variants = saveResult.variants

    // Step 3: Log audit event
    if (result.success) {
      await logVariantGenerationEvent(productId, {
        productName: productData.name || 'Unknown',
        variantsCreated: result.variantsCreated,
        sizes: productData.sizes,
        colors: productData.colors,
        totalStock: productData.stock_quantity
      })
    }

  } catch (error) {
    console.error('Automated variant generation failed:', error)
    result.errors.push(`Automated generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Generates a unique SKU for a variant
 */
function generateVariantSKU(productId: string, size: string, color: string): string {
  const productCode = productId.slice(-8).toUpperCase()
  const sizeCode = size.slice(0, 2).toUpperCase()
  const colorCode = color.slice(0, 3).toUpperCase()
  const timestamp = Date.now().toString().slice(-4)
  
  return `${productCode}-${sizeCode}${colorCode}-${timestamp}`
}

/**
 * Logs variant generation events for auditing
 */
async function logVariantGenerationEvent(
  productId: string,
  details: {
    productName: string
    variantsCreated: number
    sizes: string[]
    colors: string[]
    totalStock: number
  }
): Promise<void> {
  try {
    console.log('Variant Generation Audit Log:', {
      timestamp: new Date().toISOString(),
      productId,
      productName: details.productName,
      variantsCreated: details.variantsCreated,
      combinations: {
        sizes: details.sizes,
        colors: details.colors,
        totalCombinations: details.sizes.length * details.colors.length
      },
      stockDistribution: {
        totalStock: details.totalStock,
        stockPerVariant: Math.floor(details.totalStock / (details.sizes.length * details.colors.length))
      }
    })

    // Could also save to a dedicated audit table if needed
    // const supabase = await createClient()
    // await supabase.from('variant_generation_logs').insert({...})

  } catch (error) {
    console.error('Failed to log variant generation event:', error)
  }
}

/**
 * Validates product data before variant generation
 */
export function validateProductForVariantGeneration(productData: {
  sizes?: string[]
  colors?: string[]
  stock_quantity?: number
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!productData.sizes?.length) {
    errors.push('Product must have at least one size specified')
  }

  if (!productData.colors?.length) {
    errors.push('Product must have at least one color specified')
  }

  if (typeof productData.stock_quantity !== 'number' || productData.stock_quantity < 0) {
    errors.push('Product must have a valid stock quantity (0 or greater)')
  }

  // Check for valid size/color values
  if (productData.sizes?.some(size => !size.trim())) {
    errors.push('All sizes must be non-empty strings')
  }

  if (productData.colors?.some(color => !color.trim())) {
    errors.push('All colors must be non-empty strings')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}