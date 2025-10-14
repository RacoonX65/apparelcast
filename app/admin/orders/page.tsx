import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default async function AdminOrdersPage() {
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

  // Fetch all orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles (
        full_name,
        phone
      )
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-semibold">Manage Orders</h1>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const profile = order.profiles as any
                return (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">{profile?.full_name || "Guest"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-ZA", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <div className="flex gap-4 mt-2">
                              <span
                                className={`inline-block text-xs px-2 py-1 rounded ${
                                  order.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "delivered"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span
                                className={`inline-block text-xs px-2 py-1 rounded ${
                                  order.payment_status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.payment_status === "paid" ? "Paid" : "Pending"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-semibold">R {order.total_amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {order.delivery_method.replace("-", " ")}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No orders yet</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
