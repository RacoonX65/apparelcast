import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, newStatus } = body

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch order with user details
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles (
          full_name,
          phone
        )
      `,
      )
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)

    if (!userData.user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 })
    }

    const customerEmail = userData.user.email

    await sendOrderStatusUpdateEmail(customerEmail, order.order_number, newStatus)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
