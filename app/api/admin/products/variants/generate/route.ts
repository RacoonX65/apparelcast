import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  automatedVariantGeneration, 
  validateProductForVariantGeneration,
  type VariantGenerationOptions 
} from '@/lib/variant-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      productId, 
      enableAutoGeneration = true,
      defaultQuantityPerVariant = 10,
      distributeStockEvenly = true,
      generateSKUs = false,
      priceAdjustments = {}
    } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, sizes, colors, stock_quantity')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validate product data for variant generation
    const validation = validateProductForVariantGeneration({
      sizes: product.sizes,
      colors: product.colors,
      stock_quantity: product.stock_quantity
    })

    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Product validation failed', 
        details: validation.errors 
      }, { status: 400 })
    }

    // Check if variants already exist
    const { data: existingVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
      .eq('is_active', true)

    if (existingVariants && existingVariants.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Product already has variants. Use update endpoint to modify existing variants.',
        existingVariantsCount: existingVariants.length
      }, { status: 409 })
    }

    // Configure generation options
    const options: VariantGenerationOptions = {
      enableAutoGeneration,
      defaultQuantityPerVariant,
      distributeStockEvenly,
      generateSKUs,
      priceAdjustments
    }

    // Generate variants
    const result = await automatedVariantGeneration(
      productId,
      {
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_quantity: product.stock_quantity || 0,
        name: product.name
      },
      options
    )

    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully generated ${result.variantsCreated} variants`,
        variantsCreated: result.variantsCreated,
        variants: result.variants,
        warnings: result.warnings
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Variant generation failed',
        errors: result.errors,
        warnings: result.warnings
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Variant generation API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get product ID from query params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch product and existing variants
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, sizes, colors, stock_quantity')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('size, color')

    if (variantsError) {
      throw variantsError
    }

    // Calculate potential variants that could be generated
    const potentialCombinations = (product.sizes?.length || 0) * (product.colors?.length || 0)
    const existingCombinations = variants?.length || 0

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_quantity: product.stock_quantity
      },
      existingVariants: variants || [],
      stats: {
        potentialCombinations,
        existingCombinations,
        canGenerate: potentialCombinations > existingCombinations,
        missingCombinations: potentialCombinations - existingCombinations
      }
    })

  } catch (error) {
    console.error('Variant generation status API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}