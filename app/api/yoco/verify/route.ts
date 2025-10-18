import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(request: NextRequest) {
  console.log("Yoco payment verification request received")
  
  try {
    const searchParams = request.nextUrl.searchParams
    const checkoutId = searchParams.get("checkout_id")
    const orderId = searchParams.get("order_id")

    if (!checkoutId && !orderId) {
      console.error("Payment verification failed: No checkout_id or order_id provided")
      return NextResponse.json({ error: "Checkout ID or Order ID is required" }, { status: 400 })
    }

    console.log("Verifying payment with checkout_id:", checkoutId, "order_id:", orderId)

    const yocoSecretKey = process.env.YOCO_SECRET_KEY

    if (!yocoSecretKey) {
      console.error("Payment verification failed: Yoco secret key not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    // If we have checkout_id, fetch the checkout details from Yoco
    let paymentData = null
    if (checkoutId) {
      console.log("Fetching checkout details from Yoco API")
      const response = await fetch(`https://payments.yoco.com/api/checkouts/${checkoutId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${yocoSecretKey}`,
        },
      })

      const data = await response.json()
      console.log("Yoco API response:", { status: response.status, paymentStatus: data.paymentStatus })

      if (!response.ok) {
        console.error("Yoco verification error:", data)
        return NextResponse.json({ error: data.message || "Payment verification failed" }, { status: response.status })
      }

      paymentData = data
    }

    // Use service client for database operations
    const supabase = createServiceClient()

    // If we have orderId, check the current order status
    if (orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("payment_status, status")
        .eq("id", orderId)
        .single()

      if (order) {
        console.log("Current order status:", order)
        
        // If payment is already confirmed, return success
        if (order.payment_status === "paid" && order.status === "confirmed") {
          return NextResponse.json({
            status: "succeeded",
            message: "Payment already confirmed",
            order_status: order.status,
            payment_status: order.payment_status,
          })
        }
      }
    }

    // If we have checkout data and it shows successful payment
    if (paymentData && paymentData.paymentStatus === "successful") {
      const orderIdFromMetadata = paymentData.metadata?.order_id || orderId

      if (orderIdFromMetadata) {
        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_reference: paymentData.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderIdFromMetadata)

        if (updateError) {
          console.error("Failed to update order:", updateError)
          return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
        }

        console.log("Order updated successfully via verification:", orderIdFromMetadata)

        // Send confirmation email (similar to webhook)
        try {
          const { data: orderDetails } = await supabase
            .from("orders")
            .select(`
              *,
              profiles (
                full_name,
                phone
              )
            `)
            .eq("id", orderIdFromMetadata)
            .single()

          if (orderDetails) {
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

            const customerEmail = paymentData.metadata?.customer_email || orderDetails.customer_email

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
        }
      }
    }

    console.log("Payment verification completed successfully")
    return NextResponse.json({
      status: paymentData?.paymentStatus || "unknown",
      checkout_id: checkoutId,
      order_id: orderId,
      message: "Verification completed",
    })

  } catch (error) {
    console.error("Yoco verify API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}