import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all special offers with products
    const { data: offers, error } = await supabase
      .from("special_offers_with_products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching special offers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ offers })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, special_price, original_price, valid_until, banner_image_url, product_ids } = body

    // Validate required fields
    if (!title || !description || !special_price || !original_price || !valid_until || !product_ids?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate discount percentage
    const discount_percentage = Math.round(((original_price - special_price) / original_price) * 100)

    // Create the special offer
    const { data: offer, error: offerError } = await supabase
      .from("special_offers")
      .insert({
        title,
        description,
        special_price,
        original_price,
        discount_percentage,
        valid_until,
        banner_image_url,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single()

    if (offerError) {
      console.error("Error creating special offer:", offerError)
      return NextResponse.json({ error: offerError.message }, { status: 500 })
    }

    // Add products to the offer
    const productOffers = product_ids.map((product_id: string) => ({
      special_offer_id: offer.id,
      product_id
    }))

    const { error: productsError } = await supabase
      .from("special_offer_products")
      .insert(productOffers)

    if (productsError) {
      console.error("Error adding products to offer:", productsError)
      // Clean up the offer if products couldn't be added
      await supabase.from("special_offers").delete().eq("id", offer.id)
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}