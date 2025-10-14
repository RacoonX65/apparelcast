import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createClient as createServiceClient } from '@supabase/supabase-js'

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
      
      // Use service role client to bypass RLS for payment verification
      const supabaseServiceRole = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const orderId = data.data.metadata.order_id

      // Log the order ID and what we're about to update
      console.log("[v0] About to update order:", {
        orderId,
        newPaymentStatus: "paid",
        newStatus: "processing", // Changed from "confirmed" to "processing" which is a valid status
        paymentReference: reference
      })

      // Update order with payment reference and status
      const { error: updateError, data: updateResult } = await supabaseServiceRole
        .from("orders")
        .update({
          payment_reference: reference,
          payment_status: "paid",
          status: "processing", // Changed from "confirmed" to "processing"
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("[v0] Order update error:", updateError)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
      }

      console.log("[v0] Order update result:", updateResult)
      console.log("[v0] Order status updated successfully")

      // Verify the update by fetching the order again
      const { data: updatedOrder, error: fetchError } = await supabaseServiceRole
        .from("orders")
        .select("id, payment_status, status, payment_reference, updated_at")
        .eq("id", orderId)
        .single()

      if (fetchError) {
        console.error("[v0] Error fetching updated order:", fetchError)
      } else {
        console.log("[v0] Updated order verification:", updatedOrder)
      }

      // Clear user's cart - we need to get the user from the order
      const { data: order } = await supabaseServiceRole
        .from("orders")
        .select("user_id")
        .eq("id", orderId)
        .single()

      if (order) {
        const { error: cartError } = await supabaseServiceRole
          .from("cart_items")
          .delete()
          .eq("user_id", order.user_id)

        if (cartError) {
          console.error("[v0] Error clearing cart:", cartError)
        }
      }

      // Fetch order details for notifications
      const { data: orderDetails } = await supabaseServiceRole
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
      const { data: orderItems } = await supabaseServiceRole
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

      if (orderDetails) {
        const profile = orderDetails.profiles as any
        const customerEmail = data.data.customer.email

        // Prepare order items for email
        const emailItems =
          orderItems?.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            products: {
              name: (item.products as any).name,
              image_url: (item.products as any).image_url
            }
          })) || []

        await sendOrderConfirmationEmail(customerEmail, orderDetails.order_number, orderDetails.total_amount, emailItems)
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
