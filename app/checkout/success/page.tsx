import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; reference?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify payment if reference is provided
  if (params.reference) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/paystack/verify?reference=${params.reference}`)
  }

  // Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (
        full_name,
        street_address,
        city,
        province,
        postal_code
      )
    `,
    )
    .eq("id", params.order_id)
    .single()

  if (!order) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-serif">Order Confirmed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Thank you for your order</p>
                  <p className="text-2xl font-semibold">Order #{order.order_number}</p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-semibold">R {order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-semibold capitalize">{order.payment_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Method</span>
                    <span className="font-semibold capitalize">{order.delivery_method.replace("-", " ")}</span>
                  </div>
                </div>

                {order.addresses && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.addresses.full_name}</p>
                      <p>{order.addresses.street_address}</p>
                      <p>
                        {order.addresses.city}, {order.addresses.province} {order.addresses.postal_code}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    We've sent a confirmation email with your order details. You can track your order from your account
                    page.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href="/account/orders">View Orders</Link>
                    </Button>
                    <Button asChild className="flex-1 bg-primary hover:bg-accent">
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
