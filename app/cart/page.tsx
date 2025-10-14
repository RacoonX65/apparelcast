import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CartItems } from "@/components/cart-items"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CartPage() {
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
        image_url,
        stock_quantity
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const subtotal =
    cartItems?.reduce((sum, item) => {
      const product = item.products as any
      return sum + product.price * item.quantity
    }, 0) || 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-semibold mb-8">Shopping Cart</h1>

          {cartItems && cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <CartItems items={cartItems} />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>R {subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full h-12 bg-primary hover:bg-accent" size="lg">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
              <Button asChild size="lg" className="bg-primary hover:bg-accent">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
