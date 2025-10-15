import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendNewArrivalsEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const productIds: string[] | undefined = body?.productIds
    const sinceDays: number = Number(body?.sinceDays ?? 7)
    const limit: number = Number(body?.limit ?? 8)

    const supabase = createServiceClient()

    // Fetch products to announce
    let productsQuery = supabase.from("products").select("id, name, price, image_url").order("created_at", { ascending: false })

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      productsQuery = productsQuery.in("id", productIds)
    } else {
      // New arrivals within the last N days
      const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString()
      productsQuery = productsQuery.gte("created_at", sinceIso).limit(limit)
    }

    const { data: products, error: productsError } = await productsQuery
    if (productsError) {
      console.error("New arrivals route: products fetch error", productsError)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products found to announce" }, { status: 404 })
    }

    // Fetch active newsletter subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true)

    if (subsError) {
      console.error("New arrivals route: subscribers fetch error", subsError)
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 404 })
    }

    const subject = "New Arrivals at Apparel Cast ✨"
    const productSummary = `Announced products: ${products.map((p) => p.id).join(", ")}`

    let sent = 0
    for (const sub of subscribers) {
      const res = await sendNewArrivalsEmail((sub as any).email, products as any)
      if (res.success) {
        sent += 1
        await supabase
          .from("email_notifications")
          .insert({
            email: (sub as any).email,
            subject,
            content: productSummary,
            status: "sent",
          })
      } else {
        await supabase
          .from("email_notifications")
          .insert({
            email: (sub as any).email,
            subject,
            content: productSummary,
            status: "failed",
            error_message: res.error || "Unknown error",
          })
      }
    }

    return NextResponse.json({ success: true, count: sent })
  } catch (error) {
    console.error("New arrivals broadcast error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}