import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { OrderStatusUpdate } from "@/components/order-status-update"
import { WhatsAppMessageButton } from "@/components/whatsapp-message-button"
import { formatOrderUpdateMessage } from "@/lib/whatsapp"
import { DeleteOrderButton } from "@/components/delete-order-button"

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Use service role client to bypass RLS policies for admin operations
  const supabaseService = createServiceClient()

  // Fetch order details first
  const { data: order, error } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Fetch related data separately
  const [profileResult, addressResult] = await Promise.all([
    order.user_id ? supabaseService
      .from("profiles")
      .select("full_name, phone")
      .eq("id", order.user_id)
      .single() : { data: null },
    order.address_id ? supabaseService
      .from("addresses")
      .select("full_name, phone, street_address, city, province, postal_code")
      .eq("id", order.address_id)
      .single() : { data: null }
  ])

  // Add the related data to the order object
  const orderWithDetails = {
    ...order,
    profiles: profileResult.data,
    addresses: addressResult.data
  }

  // Fetch order items with product details using service role client
  const { data: orderItems } = await supabaseService
    .from("order_items")
    .select(`
      *,
      products (
        name,
        image_url,
        price
      )
    `)
    .eq("order_id", id)

  const profile_data = order.profiles as any
  const whatsappMessage = formatOrderUpdateMessage(
    order.order_number,
    order.status,
    profile_data?.full_name || "Customer",
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-semibold">Order Details</h1>
              <p className="text-muted-foreground mt-2">Order #{orderWithDetails.order_number}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {orderWithDetails.profiles?.full_name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {orderWithDetails.profiles?.phone || "N/A"}
                    </p>
                  </div>
                  {orderWithDetails.profiles?.phone && (
                    <div className="mt-4">
                      <WhatsAppMessageButton
                        phoneNumber={orderWithDetails.profiles.phone}
                        message={whatsappMessage}
                        label="Message Customer"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
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
              {orderWithDetails.addresses && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{orderWithDetails.addresses.full_name}</p>
                      <p className="text-muted-foreground">{orderWithDetails.addresses.phone}</p>
                      <p className="text-muted-foreground">{orderWithDetails.addresses.street_address}</p>
                      <p className="text-muted-foreground">
                        {orderWithDetails.addresses.city}, {orderWithDetails.addresses.province} {orderWithDetails.addresses.postal_code}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary & Status */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Date</span>
                      <span>
                        {new Date(orderWithDetails.created_at).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="capitalize font-medium">{orderWithDetails.payment_status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="capitalize">{orderWithDetails.delivery_method.replace("-", " ")}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R {(orderWithDetails.total_amount - orderWithDetails.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>R {orderWithDetails.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>R {orderWithDetails.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {orderWithDetails.payment_reference && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Payment Ref: {orderWithDetails.payment_reference}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusUpdate orderId={orderWithDetails.id} currentStatus={orderWithDetails.status} />
                </CardContent>
              </Card>

              {/* Delete Order */}
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeleteOrderButton orderId={orderWithDetails.id} orderNumber={orderWithDetails.order_number} />
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
