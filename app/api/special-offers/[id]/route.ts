import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Fetch specific active special offer with products and variants (public endpoint)
    const { data: offer, error } = await supabase
      .from("special_offers_with_products")
      .select("*")
      .eq("id", params.id)
      .eq("is_active", true)
      .gte("valid_until", new Date().toISOString())
      .single()

    if (error) {
      console.error("Error fetching special offer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!offer) {
      return NextResponse.json({ error: "Special offer not found or expired" }, { status: 404 })
    }

    // Fetch product variants for each product in the offer
    const productIds = offer.products.map((p: any) => p.id)
    
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select(`
        *,
        products!inner(id)
      `)
      .in("product_id", productIds)

    if (variantsError) {
      console.error("Error fetching product variants:", variantsError)
      // Continue without variants if there's an error
    }

    // Group variants by product_id
    const variantsByProduct = variants?.reduce((acc: any, variant: any) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = []
      }
      acc[variant.product_id].push(variant)
      return acc
    }, {}) || {}

    // Add variants to each product
    const productsWithVariants = offer.products.map((product: any) => ({
      ...product,
      variants: variantsByProduct[product.id] || []
    }))

    const offerWithVariants = {
      ...offer,
      products: productsWithVariants
    }

    return NextResponse.json({ offer: offerWithVariants })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}