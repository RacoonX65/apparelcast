import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("Simulating payment verification flow...")

    // Use service role client
    const supabaseServiceRole = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Simulate Paystack data structure
    const mockPaystackData = {
      data: {
        status: "success",
        customer: {
          email: "makhusipho9@gmail.com"
        },
        metadata: {
          order_id: "test-order-id" // We'll need to use a real order ID
        }
      }
    }

    // For testing, let's find the most recent order
    const { data: recentOrder } = await supabaseServiceRole
      .from("orders")
      .select("id, order_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!recentOrder) {
      return NextResponse.json({ error: "No orders found for testing" }, { status: 404 })
    }

    console.log("Using order for test:", recentOrder)

    // Simulate the exact flow from payment verification
    const orderId = recentOrder.id

    // Fetch order details (same as in payment verification)
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

    // Fetch order items (same as in payment verification)
    const { data: orderItems } = await supabaseServiceRole
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

    console.log("Simulation: Order details found:", {
      orderId: orderDetails?.id,
      orderNumber: orderDetails?.order_number,
      customerEmail: mockPaystackData.data.customer.email,
      orderItemsCount: orderItems?.length || 0
    })

    if (orderDetails) {
      const customerEmail = mockPaystackData.data.customer.email

      // Prepare order items for email (same as in payment verification)
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

      console.log("Simulation: Attempting to send order confirmation email to:", customerEmail)
      const emailResult = await sendOrderConfirmationEmail(customerEmail, orderDetails.order_number, orderDetails.total_amount, emailItems, totalBulkSavings)
      
      if (emailResult.success) {
        console.log("Simulation: Order confirmation email sent successfully")
        return NextResponse.json({ 
          success: true, 
          message: "Payment simulation completed - email sent",
          emailId: emailResult.data?.id,
          orderDetails: {
            id: orderDetails.id,
            orderNumber: orderDetails.order_number,
            totalAmount: orderDetails.total_amount
          }
        })
      } else {
        console.error("Simulation: Failed to send order confirmation email:", emailResult.error)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to send email in simulation", 
          details: emailResult.error 
        }, { status: 500 })
      }
    } else {
      console.error("Simulation: No order details found")
      return NextResponse.json({ error: "Order not found in simulation" }, { status: 404 })
    }

  } catch (error) {
    console.error("Simulation: Error in payment simulation:", error)
    return NextResponse.json({ error: "Internal server error in simulation", details: error }, { status: 500 })
  }
}