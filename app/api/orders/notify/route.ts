import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendOrderStatusUpdateEmail, sendShippingNotificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, newStatus, trackingCode, trackingUrl } = body

    console.log("Notification API called with:", { orderId, newStatus, trackingCode, trackingUrl })

    if (!orderId || !newStatus) {
      console.error("Missing required fields:", { orderId, newStatus })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use service role client to bypass RLS policies
    const supabase = createServiceClient()

    // Fetch order details
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      console.error("Order not found:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("Order found:", order.order_number, "User ID:", order.user_id)

    // Get user email using service role client
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)

    if (!userData.user?.email) {
      console.error("User email not found for user ID:", order.user_id)
      return NextResponse.json({ error: "User email not found" }, { status: 404 })
    }

    const customerEmail = userData.user.email
    console.log("Sending email to:", customerEmail)

    // Send different emails based on status
    if (newStatus === "shipped" && trackingCode) {
      console.log("Sending shipping notification with tracking code:", trackingCode)
      await sendShippingNotificationEmail(
        customerEmail, 
        order.order_number, 
        trackingCode, 
        trackingUrl
      )
    } else {
      console.log("Sending status update email for status:", newStatus)
      await sendOrderStatusUpdateEmail(customerEmail, order.order_number, newStatus)
    }

    console.log("Email sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Notification error:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
