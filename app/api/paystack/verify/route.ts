import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(request: NextRequest) {
  console.log("Payment verification request received")
  
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      console.error("Payment verification failed: No reference provided")
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

  console.log("Verifying payment with reference:", reference)

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
    console.error("Payment verification failed: Paystack secret key not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    // Verify transaction with Paystack
  console.log("Making Paystack API call to verify transaction")
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    })

    const data = await response.json()
  console.log("Paystack API response:", { status: response.status, success: data.status, transactionStatus: data.data?.status })

    if (!response.ok) {
    console.error("Paystack verification error:", data)
      return NextResponse.json({ error: data.message || "Payment verification failed" }, { status: response.status })
    }

    // Update order status in database
    if (data.data.status === "success") {
    console.log("Payment successful, updating order status for order ID:", data.data.metadata.order_id)
      
      // Use service role client to bypass RLS for payment verification
      const supabaseServiceRole = createServiceClient()
      
      const orderId = data.data.metadata.order_id

      // Log the order ID and what we're about to update
    console.log("About to update order:", {
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
    console.error("Order update error:", updateError)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
      }

    console.log("Order update result:", updateResult)
    console.log("Order status updated successfully")

      // Verify the update by fetching the order again
      const { data: updatedOrder, error: fetchError } = await supabaseServiceRole
        .from("orders")
        .select("id, payment_status, status, payment_reference, updated_at")
        .eq("id", orderId)
        .single()

      if (fetchError) {
    console.error("Error fetching updated order:", fetchError)
      } else {
    console.log("Updated order verification:", updatedOrder)
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
    console.error("Error clearing cart:", cartError)
        }
      }

      // Fetch order details for notifications
      console.log("Fetching order details for email...")
      const { data: orderDetails, error: orderError } = await supabaseServiceRole
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      console.log("Fetching order items...")
      // Fetch order items for email
      const { data: orderItems, error: itemsError } = await supabaseServiceRole
        .from("order_items")
        .select(
          `
          *,
          products (
            name,
            image_url
          )
        `,
        )
        .eq("order_id", orderId)

      if (orderError) {
        console.error("Error fetching order details:", orderError)
      }

      if (itemsError) {
        console.error("Error fetching order items:", itemsError)
      }

      if (orderDetails) {
        const customerEmail = data.data.customer.email

        console.log("Order details retrieved:", {
          orderId: orderDetails.id,
          orderNumber: orderDetails.order_number,
          customerEmail: customerEmail,
          orderItemsCount: orderItems?.length || 0
        })

        // Prepare order items for email
        const emailItems =
          orderItems?.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            is_bulk_order: item.is_bulk_order,
            bulk_tier_id: item.bulk_tier_id,
            original_price: item.original_price,
            bulk_price: item.bulk_price,
            bulk_savings: item.bulk_savings,
            products: {
              name: (item.products as any).name,
              image_url: (item.products as any).image_url
            }
          })) || []

        // Calculate total bulk savings
        const totalBulkSavings = emailItems.reduce((total, item) => {
          if (item.is_bulk_order && item.original_price && item.bulk_price) {
            return total + ((item.original_price - item.bulk_price) * item.quantity)
          }
          return total
        }, 0)

        console.log("Attempting to send order confirmation email to:", customerEmail)
        const emailResult = await sendOrderConfirmationEmail(customerEmail, orderDetails.order_number, orderDetails.total_amount, emailItems, totalBulkSavings)
        
        if (emailResult.success) {
          console.log("Order confirmation email sent successfully")
        } else {
          console.error("Failed to send order confirmation email:", emailResult.error)
        }
      } else {
        console.error("No order details found for order ID:", orderId)
      }
    } else {
    console.log("Payment not successful, status:", data.data.status)
    }

  console.log("Payment verification completed successfully")
    return NextResponse.json({
      status: data.data.status,
      amount: data.data.amount,
      reference: data.data.reference,
    })
  } catch (error) {
  console.error("Paystack verify API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
