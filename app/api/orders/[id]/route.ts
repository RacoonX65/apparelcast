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

    // Fetch order with server-side client (bypasses client-side RLS issues)
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        addresses (
          full_name,
          street_address,
          city,
          province,
          postal_code
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user can only access their own orders
      .single()

    if (error) {
    console.error("Order fetch error:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Add detailed logging to see what order data is being returned
  console.log("Order API returning order data:", {
      id: order.id,
      payment_status: order.payment_status,
      status: order.status,
      payment_reference: order.payment_reference,
      updated_at: order.updated_at
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Order API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}