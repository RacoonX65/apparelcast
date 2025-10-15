import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderNumber } = await request.json()
    
    if (!orderId && !orderNumber) {
      return NextResponse.json({ error: "Order ID or Order Number is required" }, { status: 400 })
    }

    console.log("Debug: Testing payment flow for:", { orderId, orderNumber })

    // Use service role client
    const supabaseServiceRole = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch order details
    let orderQuery = supabaseServiceRole
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

    if (orderId) {
      orderQuery = orderQuery.eq("id", orderId)
    } else {
      orderQuery = orderQuery.eq("order_number", orderNumber)
    }

    const { data: orderDetails, error: orderError } = await orderQuery.single()

    console.log("Debug: Order details query result:", { orderDetails, orderError })

    if (orderError) {
      return NextResponse.json({ error: "Failed to fetch order details", details: orderError }, { status: 500 })
    }

    // Fetch order items
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
      .eq("order_id", orderDetails.id)

    console.log("Debug: Order items query result:", { orderItems, itemsError })

    if (itemsError) {
      return NextResponse.json({ error: "Failed to fetch order items", details: itemsError }, { status: 500 })
    }

    if (orderDetails) {
      // Simulate getting customer email from Paystack data
      const customerEmail = "makhusipho9@gmail.com" // Use your test email

      console.log("Debug: Order details found:", {
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
          products: {
            name: (item.products as any).name,
            image_url: (item.products as any).image_url
          }
        })) || []

      console.log("Debug: Prepared email items:", emailItems)

      console.log("Debug: Attempting to send order confirmation email to:", customerEmail)
      const emailResult = await sendOrderConfirmationEmail(customerEmail, orderDetails.order_number, orderDetails.total_amount, emailItems)
      
      if (emailResult.success) {
        console.log("Debug: Order confirmation email sent successfully")
        return NextResponse.json({ 
          success: true, 
          message: "Email sent successfully",
          emailId: emailResult.data?.id,
          orderDetails: {
            id: orderDetails.id,
            orderNumber: orderDetails.order_number,
            totalAmount: orderDetails.total_amount
          }
        })
      } else {
        console.error("Debug: Failed to send order confirmation email:", emailResult.error)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to send email", 
          details: emailResult.error 
        }, { status: 500 })
      }
    } else {
        console.error("Debug: No order details found for:", { orderId, orderNumber })
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

  } catch (error) {
    console.error("Debug: Error in debug payment route:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}