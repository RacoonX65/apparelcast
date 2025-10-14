import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  console.log("[v0] Payment verification request received")
  
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      console.error("Payment verification failed: No reference provided")
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    console.log("[v0] Verifying payment with reference:", reference)

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("[v0] Payment verification failed: Paystack secret key not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    // Verify transaction with Paystack
    console.log("[v0] Making Paystack API call to verify transaction")
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })

    const data = await response.json()
    console.log("[v0] Paystack API response:", { status: response.status, success: data.status, transactionStatus: data.data?.status })

    if (!response.ok) {
      console.error("[v0] Paystack verification error:", data)
      return NextResponse.json({ error: data.message || "Payment verification failed" }, { status: response.status })
    }

    // Update order status in database
    if (data.data.status === "success") {
      console.log("[v0] Payment successful, updating order status for order ID:", data.data.metadata.order_id)
      const supabase = await createClient()
      const orderId = data.data.metadata.order_id

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_reference: reference,
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("[v0] Order update error:", updateError)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
      }

      console.log("[v0] Order status updated successfully")

      // Fetch order details for notifications
      const { data: order } = await supabase
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

      // Fetch order items for email
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products (
            name
          )
        `,
        )
        .eq("order_id", orderId)

      if (order) {
        const profile = order.profiles as any
        const customerEmail = data.data.customer.email

        // Prepare order items for email
        const emailItems =
          orderItems?.map((item) => ({
            name: (item.products as any).name,
            quantity: item.quantity,
            price: item.price,
          })) || []

        await sendOrderConfirmationEmail(customerEmail, order.order_number, order.total_amount, emailItems)
      }

      // Clear user's cart
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        console.log("[v0] Clearing cart for user:", user.id)
        await supabase.from("cart_items").delete().eq("user_id", user.id)
      }
    } else {
      console.log("[v0] Payment not successful, status:", data.data.status)
    }

    console.log("[v0] Payment verification completed successfully")
    return NextResponse.json({
      status: data.data.status,
      amount: data.data.amount,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("[v0] Paystack verify API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
