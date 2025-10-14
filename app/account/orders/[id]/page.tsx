import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch order with items and address
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (
        full_name,
        phone,
        street_address,
        city,
        province,
        postal_code
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Fetch order items with product details
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(
      `
      *,
      products (
        id,
        name,
        image_url
      )
    `,
    )
    .eq("order_id", id)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-semibold">Order Details</h1>
              <p className="text-muted-foreground mt-2">Order #{order.order_number}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/account/orders">Back to Orders</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems?.map((item) => {
                    const product = item.products as any
                    return (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="w-20 h-24 relative flex-shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={
                              product.image_url ||
                              `/placeholder.svg?height=96&width=80&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{product.name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {item.size && <p>Size: {item.size}</p>}
                            {item.color && <p>Color: {item.color}</p>}
                            <p>Quantity: {item.quantity}</p>
                            <p className="font-semibold text-foreground">R {item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Delivery Address */}
              {order.addresses && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{order.addresses.full_name}</p>
                      <p className="text-muted-foreground">{order.addresses.phone}</p>
                      <p className="text-muted-foreground">{order.addresses.street_address}</p>
                      <p className="text-muted-foreground">
                        {order.addresses.city}, {order.addresses.province} {order.addresses.postal_code}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Date</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize font-medium">{order.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="capitalize font-medium">{order.payment_status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="capitalize">{order.delivery_method.replace("-", " ")}</span>
                    </div>
                    {order.tracking_code && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tracking Code</span>
                        <span className="font-mono font-medium">{order.tracking_code}</span>
                      </div>
                    )}
                  </div>

                  {order.tracking_code && order.status === "shipped" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">Package Shipped</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Your order is on its way! Use the tracking code above to monitor your package.
                      </p>
                      {order.tracking_url && (
                        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                            Track Package
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R {(order.total_amount - order.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>R {order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>R {order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {order.payment_reference && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Payment Reference: {order.payment_reference}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
