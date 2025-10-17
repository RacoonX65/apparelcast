import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CartItems } from "@/components/cart-items"
import { Progress } from "@/components/ui/progress"
import { ProductCard } from "@/components/product-card"
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

  // Fetch cart items with product details and bulk pricing information
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      is_bulk_order,
      bulk_tier_id,
      original_price,
      bulk_price,
      bulk_savings,
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

  // Calculate subtotal using bulk pricing when applicable
  const subtotal =
    cartItems?.reduce((sum, item) => {
      const product = item.products as any
      const pricePerUnit = item.is_bulk_order && item.bulk_price ? item.bulk_price : product.price
      return sum + pricePerUnit * item.quantity
    }, 0) || 0

  // Calculate total savings from bulk orders
  const totalSavings = cartItems?.reduce((sum, item) => {
    return sum + (item.bulk_savings || 0)
  }, 0) || 0

  // Free shipping progress (configurable threshold)
  const FREE_SHIPPING_THRESHOLD = 750
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  // Cross-sell: recommend products from same categories not in cart
  let recommendedProducts: any[] = []
  if (cartItems && cartItems.length > 0) {
    const categories = Array.from(new Set(cartItems.map((ci) => (ci.products as any).category)))
    const inCartIds = cartItems.map((ci) => (ci.products as any).id)
    const { data: recs } = await supabase
      .from("products")
      .select("*")
      .in("category", categories)
      .not("id", "in", `(${inCartIds.map((id) => `'${id}'`).join(',') || "''"})`)
      .limit(6)
    recommendedProducts = recs || []
  }

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
                {/* Free Shipping Progress */}
                <div className="mb-6 bg-card border rounded-lg p-4">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <p className="text-sm font-medium text-green-700">🎉 You've unlocked free shipping!</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Spend <span className="font-semibold text-foreground">R {remaining.toFixed(2)}</span> more to unlock free shipping.
                    </p>
                  )}
                  <div className="mt-3">
                    <Progress value={progress} className="h-2" />
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                      <span>R {Math.min(subtotal, FREE_SHIPPING_THRESHOLD).toFixed(2)} / R {FREE_SHIPPING_THRESHOLD.toFixed(2)}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>

                <CartItems items={cartItems} />

                {/* Cross-Sell Recommendations */}
                {recommendedProducts.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">Complete your order</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} showBulkPricing={false} />
                      ))}
                    </div>
                  </div>
                )}
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
                    
                    {/* Show bulk savings if any */}
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="font-medium">Bulk Order Savings</span>
                        <span className="font-medium">-R {totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    {subtotal < FREE_SHIPPING_THRESHOLD && (
                      <div className="rounded bg-muted px-3 py-2 text-xs">
                        Spend <span className="font-semibold">R {remaining.toFixed(2)}</span> more to unlock free shipping.
                      </div>
                    )}
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
