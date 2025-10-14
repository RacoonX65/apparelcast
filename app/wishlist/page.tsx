import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WishlistItems } from "@/components/wishlist-items"

export default async function WishlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch wishlist items
  const { data: wishlistItems } = await supabase
    .from("wishlist")
    .select(
      `
      id,
      created_at,
      products (
        id,
        name,
        price,
        image_url,
        category,
        stock_quantity
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems?.length || 0} {wishlistItems?.length === 1 ? "item" : "items"}
            </p>
          </div>

          <WishlistItems items={wishlistItems || []} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
