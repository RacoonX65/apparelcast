import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch order with admin privileges (no user_id restriction)
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (
          full_name,
          phone
        ),
        addresses (
          full_name,
          phone,
          street_address,
          city,
          province,
          postal_code
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Admin order fetch error:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        *,
        products (
          id,
          name,
          image_url
        )
      `)
      .eq("order_id", id)

    return NextResponse.json({ order, orderItems })
  } catch (error) {
    console.error("Admin order API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}