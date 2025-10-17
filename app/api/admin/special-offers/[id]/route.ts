import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Fetch specific special offer with products
    const { data: offer, error } = await supabase
      .from("special_offers_with_products")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching special offer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!offer) {
      return NextResponse.json({ error: "Special offer not found" }, { status: 404 })
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const { title, description, special_price, original_price, valid_until, banner_image_url, product_ids, is_active } = body

    // Validate required fields
    if (!title || !description || special_price === undefined || original_price === undefined || !valid_until) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate discount percentage
    const discount_percentage = Math.round(((original_price - special_price) / original_price) * 100)

    // Update the special offer
    const { data: offer, error: offerError } = await supabase
      .from("special_offers")
      .update({
        title,
        description,
        special_price,
        original_price,
        discount_percentage,
        valid_until,
        banner_image_url,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single()

    if (offerError) {
      console.error("Error updating special offer:", offerError)
      return NextResponse.json({ error: offerError.message }, { status: 500 })
    }

    // Update products if provided
    if (product_ids && Array.isArray(product_ids)) {
      // Remove existing products
      await supabase
        .from("special_offer_products")
        .delete()
        .eq("special_offer_id", params.id)

      // Add new products
      if (product_ids.length > 0) {
        const productOffers = product_ids.map((product_id: string) => ({
          special_offer_id: params.id,
          product_id
        }))

        const { error: productsError } = await supabase
          .from("special_offer_products")
          .insert(productOffers)

        if (productsError) {
          console.error("Error updating products for offer:", productsError)
          return NextResponse.json({ error: productsError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    // Delete the special offer (cascade will handle related products)
    const { error } = await supabase
      .from("special_offers")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting special offer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Special offer deleted successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}