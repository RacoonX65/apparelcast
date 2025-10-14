import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile-form"
import { Package, MapPin, User } from "lucide-react"
import Link from "next/link"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch order count
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch address count
  const { count: addressCount } = await supabase
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-semibold mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Links */}
            <Link href="/account/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{orderCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/addresses">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{addressCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Addresses</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold line-clamp-1">{profile?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} userEmail={user.email || ""} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
