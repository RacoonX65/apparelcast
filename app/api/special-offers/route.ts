import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch active special offers with products (public endpoint)
    const { data: offers, error } = await supabase
      .from("special_offers_with_products")
      .select("*")
      .eq("is_active", true)
      .or("valid_until.is.null,valid_until.gt." + new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching special offers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ offers })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}