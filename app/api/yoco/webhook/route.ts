import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createServiceClient } from "@/lib/supabase/service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  console.log("Yoco webhook received")
  
  try {
    const body = await request.text()
    const signature = request.headers.get("x-yoco-signature")
    
    if (!signature) {
      console.error("Webhook verification failed: No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("Webhook verification failed: Webhook secret not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.error("Webhook verification failed: Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("Yoco webhook event:", { type: event.type, id: event.id })

    // Only process successful payment events
    if (event.type !== "payment.succeeded") {
      console.log("Ignoring non-payment event:", event.type)
      return NextResponse.json({ message: "Event ignored" }, { status: 200 })
    }

    const payment = event.payload
    const checkoutId = payment.metadata?.checkoutId
    const orderId = payment.metadata?.order_id

    if (!orderId) {
      console.error("No order ID found in payment metadata")
      return NextResponse.json({ error: "No order ID in metadata" }, { status: 400 })
    }

    console.log("Processing payment for order:", orderId)

    // Use service client for database operations
    const supabase = createServiceClient()

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        payment_reference: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Failed to update order:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    console.log("Order updated successfully:", orderId)

    // Send confirmation email
    try {
      // Fetch order details for email
      const { data: orderDetails } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            phone
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderDetails) {
        // Fetch order items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select(`
            *,
            products (
              name,
              image_url
            )
          `)
          .eq("order_id", orderDetails.id)

        const customerEmail = payment.metadata?.customer_email || orderDetails.customer_email

        if (customerEmail && orderItems) {
          const emailItems = orderItems.map((item) => ({
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
          }))

          const totalBulkSavings = emailItems.reduce((total, item) => {
            if (item.is_bulk_order && item.original_price && item.bulk_price) {
              return total + ((item.original_price - item.bulk_price) * item.quantity)
            }
            return total
          }, 0)

          const emailResult = await sendOrderConfirmationEmail(
            customerEmail,
            orderDetails.order_number,
            orderDetails.total_amount,
            emailItems,
            totalBulkSavings
          )

          if (emailResult.success) {
            console.log("Order confirmation email sent successfully")
          } else {
            console.error("Failed to send order confirmation email:", emailResult.error)
          }
        }
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't fail the webhook for email errors
    }

    console.log("Yoco webhook processed successfully")
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 })

  } catch (error) {
    console.error("Yoco webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}