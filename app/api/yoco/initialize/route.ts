import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, orderId, orderNumber } = body

    if (!email || !amount || !orderId || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const yocoSecretKey = process.env.YOCO_SECRET_KEY

    if (!yocoSecretKey) {
      return NextResponse.json({ error: "Yoco not configured" }, { status: 500 })
    }

    // Create Yoco checkout session
    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount), // Amount in cents (Yoco expects integer)
        currency: "ZAR",
        successUrl: `${process.env.YOCO_CALLBACK_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?orderId=${orderId}&clearGuestCart=true`,
        cancelUrl: `${process.env.YOCO_CALLBACK_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?cancelled=true`,
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          customer_email: email,
        },
      }),
    })

    if (!response.ok) {
      console.error("Yoco initialization failed with status:", response.status)
      const data = await response.json()
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      checkout_id: data.id,
      redirect_url: data.redirectUrl,
      status: data.status,
    })
  } catch (error) {
    console.error("Yoco API error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}