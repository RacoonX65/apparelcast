import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, ShoppingBag } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Fetch user profile
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!userProfile) {
    notFound()
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })

  // Fetch user's addresses
  const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", params.id)

  // Calculate total spent
  const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/users">← Back to Users</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium">{userProfile.full_name || "Not set"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{userProfile.phone || "Not set"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <div>
                  {userProfile.is_admin ? (
                    <Badge variant="default">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Customer</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">{format(new Date(userProfile.created_at), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">R</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">R {totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{addresses?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Saved Addresses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R {order.total_amount.toFixed(2)}</p>
                      <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
