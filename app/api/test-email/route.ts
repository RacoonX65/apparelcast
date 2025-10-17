import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Testing email sending to:", email)

    // Test email with sample data
    const testOrderItems = [
      {
        id: "test-1",
        product_id: "test-product-1",
        quantity: 2,
        price: 299.99,
        is_bulk_order: true,
        bulk_tier_id: "tier-1",
        original_price: 349.99,
        bulk_price: 299.99,
        bulk_savings: 50.00,
        products: {
          name: "Test Bulk Product",
          image_url: "https://example.com/test-image.jpg"
        }
      },
      {
        id: "test-2",
        product_id: "test-product-2",
        quantity: 1,
        price: 199.99,
        is_bulk_order: false,
        products: {
          name: "Regular Test Product",
          image_url: "https://example.com/test-image-2.jpg"
        }
      }
    ]

    const totalBulkSavings = 100.00 // 2 * 50.00

    const result = await sendOrderConfirmationEmail(
      email,
      "TEST-ORDER-123",
      699.97,
      testOrderItems,
      totalBulkSavings
    )

    console.log("Email test result:", result)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Test email sent successfully",
        data: result.data 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Test email API error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}