import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Star, Tag } from "lucide-react"
import { AnalyticsCharts } from "@/components/analytics-charts"
import Link from "next/link"

export default async function AdminDashboardPage() {
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

  // Fetch statistics
  const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { data: orders } = await supabase.from("orders").select("total_amount, created_at").eq("payment_status", "paid")

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  const averageOrderValue = orderCount && orderCount > 0 ? totalRevenue / orderCount : 0

  const { data: topProducts } = await supabase
    .from("order_items")
    .select(
      `
      product_id,
      quantity,
      products (
        name,
        price,
        image_url
      )
    `,
    )
    .limit(100)

  const productSales = topProducts?.reduce(
    (acc, item) => {
      const productId = item.product_id
      if (!acc[productId]) {
        acc[productId] = {
          product: item.products as any,
          totalQuantity: 0,
          totalRevenue: 0,
        }
      }
      acc[productId].totalQuantity += item.quantity
      acc[productId].totalRevenue += item.quantity * (item.products as any).price
      return acc
    },
    {} as Record<string, any>,
  )

  const topSellingProducts = Object.values(productSales || {})
    .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock_quantity")
    .lte("stock_quantity", 10)
    .order("stock_quantity", { ascending: true })
    .limit(5)

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      products (
        name
      ),
      profiles (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: allReviews } = await supabase.from("reviews").select("rating")
  const averageRating =
    allReviews && allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0

  // Fetch recent orders
  const { data: recentOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch user details separately for recent orders
  const recentOrdersWithProfiles = await Promise.all(
    (recentOrders || []).map(async (order) => {
      const { data: user } = await supabase.auth.admin.getUserById(order.user_id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", order.user_id)
        .single()
      
      return {
        ...order,
        user_email: user?.user?.email,
        profile: profile
      }
    })
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-semibold">Admin Dashboard</h1>
            <Link href="/admin/discounts">
              <Card className="hover:shadow-md transition-shadow cursor-pointer px-4 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Manage Discounts</span>
                </div>
              </Card>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-3xl font-semibold mt-2">{productCount || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-semibold mt-2">{orderCount || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-semibold mt-2">{userCount || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-semibold mt-2">R {totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-3xl font-semibold mt-2">R {averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-3xl font-semibold mt-2">{averageRating.toFixed(1)} / 5</p>
                    <p className="text-xs text-muted-foreground mt-1">{allReviews?.length || 0} reviews</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts orders={orders || []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {topSellingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topSellingProducts.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                          <div>
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">{item.totalQuantity} sold</p>
                          </div>
                        </div>
                        <p className="font-semibold">R {item.totalRevenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts && lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <p className="font-medium text-sm">{product.name}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.stock_quantity === 0
                              ? "bg-red-100 text-red-800"
                              : product.stock_quantity <= 5
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.stock_quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">All products well stocked</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/products">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove products from your store</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and update order statuses</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reviews">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Moderate and manage customer reviews</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and manage customer accounts</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/discounts">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Discounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Create and manage discount codes</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrdersWithProfiles && recentOrdersWithProfiles.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrdersWithProfiles.map((order) => {
                      return (
                        <Link key={order.id} href={`/admin/orders/${order.id}`}>
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">Order #{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">{order.profile?.full_name || "Guest"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">R {order.total_amount.toFixed(2)}</p>
                              <span
                                className={`inline-block text-xs px-2 py-1 rounded ${
                                  order.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReviews && recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map((review) => {
                      const product = review.products as any
                      const profile = review.profiles as any
                      return (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{product?.name}</p>
                              <p className="text-xs text-muted-foreground">{profile?.full_name || "Anonymous"}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
