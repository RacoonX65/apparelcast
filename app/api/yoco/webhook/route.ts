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

    // Only process successful payment events
    if (event.type !== "payment.succeeded") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 })
    }

    const payment = event.payload
    const orderId = payment.metadata?.order_id

    if (!orderId) {
      return NextResponse.json({ error: "No order ID in metadata" }, { status: 400 })
    }

    // Use service client for database operations
    const supabase = createServiceClient()

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        payment_reference: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Failed to update order status")
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

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

        const customerEmail = payment.metadata?.customer_email || orderDetails.guest_email

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

          if (!emailResult.success) {
            console.error("Failed to send order confirmation email")
          }
        }
      }
    } catch (emailError) {
      console.error("Error sending confirmation email")
      // Don't fail the webhook for email errors
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 })

  } catch (error) {
    console.error("Yoco webhook error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}