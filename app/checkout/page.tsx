import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch cart items with product details
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      products (
        id,
        name,
        price,
        image_url
      )
    `,
    )
    .eq("user_id", user.id)

  if (!cartItems || cartItems.length === 0) {
    redirect("/cart")
  }

  // Fetch user addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products as any
    return sum + product.price * item.quantity
  }, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-semibold mb-8">Checkout</h1>

          <CheckoutForm
            cartItems={cartItems}
            addresses={addresses || []}
            subtotal={subtotal}
            userEmail={user.email || ""}
            userPhone={profile?.phone || ""}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
