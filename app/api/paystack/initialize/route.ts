import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, orderId, orderNumber } = body

    if (!email || !amount || !orderId || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 500 })
    }

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // Amount in kobo (cents)
        reference: orderNumber,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/checkout/success?order_id=${orderId}&reference=${orderNumber}`,
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
    console.error("Paystack initialization error:", data)
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: response.status })
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
  console.error("Paystack API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
