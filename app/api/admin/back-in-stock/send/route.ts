import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendBackInStockEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: product } = await supabase.from("products").select("*").eq("id", productId).maybeSingle()
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if ((product as any).stock_quantity <= 0) {
      return NextResponse.json({ error: "Product is still out of stock" }, { status: 400 })
    }

    // Fetch subscribers who have not yet been notified
    const { data: subscribers } = await supabase
      .from("back_in_stock_subscriptions")
      .select("id, email")
      .eq("product_id", productId)
      .is("notified_at", null)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const productUrl = `${appUrl}/products/${productId}`

    let sent = 0
    for (const sub of subscribers || []) {
      const res = await sendBackInStockEmail(sub.email, (product as any).name, productUrl)
      if (res.success) {
        sent += 1
        // mark notified
        await supabase
          .from("back_in_stock_subscriptions")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", sub.id)
      }
    }

    return NextResponse.json({ success: true, count: sent })
  } catch (error) {
    console.error("Back-in-stock notify API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}