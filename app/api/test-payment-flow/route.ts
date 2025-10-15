import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTING PAYMENT FLOW ===")
    
    const supabase = createServiceClient()
    
    // Step 1: Find a recent order to test with
    const { data: testOrder, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (orderError || !testOrder) {
      console.error("No test order found:", orderError)
      return NextResponse.json({ error: "No orders available for testing" }, { status: 404 })
    }

    console.log("Using test order:", {
      id: testOrder.id,
      orderNumber: testOrder.order_number,
      status: testOrder.status,
      paymentStatus: testOrder.payment_status
    })

    // Step 2: Simulate the exact payment verification flow
    const mockPaystackData = {
      data: {
        status: "success",
        customer: {
          email: "makhusipho9@gmail.com" // Use your test email
        },
        metadata: {
          order_id: testOrder.id
        },
        reference: `TEST-${Date.now()}`,
        amount: testOrder.total_amount * 100 // Paystack uses kobo
      }
    }

    console.log("Simulating Paystack response:", mockPaystackData)

    // Step 3: Update order status (same as payment verification)
    const orderId = mockPaystackData.data.metadata.order_id
    const reference = mockPaystackData.data.reference

    console.log("Updating order status...")
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_reference: reference,
        payment_status: "paid",
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Order update failed:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    console.log("Order updated successfully")

    // Step 4: Clear user cart (same as payment verification)
    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single()

    if (updatedOrder?.user_id) {
      console.log("Clearing user cart for user:", updatedOrder.user_id)
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", updatedOrder.user_id)
    }

    // Step 5: Fetch order details for email (same as payment verification)
    console.log("Fetching order details for email...")
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

    // Step 6: Fetch order items (same as payment verification)
    console.log("Fetching order items...")
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        *,
        products (
          name,
          image_url
        )
      `)
      .eq("order_id", orderId)

    console.log("Order details retrieved:", {
      orderId: orderDetails?.id,
      orderNumber: orderDetails?.order_number,
      customerEmail: mockPaystackData.data.customer.email,
      orderItemsCount: orderItems?.length || 0
    })

    // Step 7: Send confirmation email (same as payment verification)
    if (orderDetails) {
      const customerEmail = mockPaystackData.data.customer.email

      // Prepare order items for email
      const emailItems = orderItems?.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        products: {
          name: (item.products as any).name,
          image_url: (item.products as any).image_url
        }
      })) || []

      console.log("Sending order confirmation email to:", customerEmail)
      const emailResult = await sendOrderConfirmationEmail(
        customerEmail, 
        orderDetails.order_number, 
        orderDetails.total_amount, 
        emailItems
      )
      
      if (emailResult.success) {
        console.log("✅ Order confirmation email sent successfully!")
        return NextResponse.json({ 
          success: true, 
          message: "Payment flow test completed successfully - email sent!",
          data: {
            orderId: orderDetails.id,
            orderNumber: orderDetails.order_number,
            emailId: emailResult.data?.id,
            customerEmail: customerEmail,
            orderItemsCount: emailItems.length
          }
        })
      } else {
        console.error("❌ Failed to send order confirmation email:", emailResult.error)
        return NextResponse.json({ 
          success: false, 
          error: "Email sending failed in payment flow test", 
          details: emailResult.error 
        }, { status: 500 })
      }
    } else {
      console.error("❌ No order details found")
      return NextResponse.json({ error: "Order details not found" }, { status: 404 })
    }

  } catch (error) {
    console.error("❌ Payment flow test error:", error)
    return NextResponse.json({ 
      error: "Payment flow test failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}