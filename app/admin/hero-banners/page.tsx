import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HeroBannerManagement } from "@/components/hero-banner-management"

export default async function HeroBannersPage() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">Hero Banner Management</h1>
            <p className="text-muted-foreground">Manage your homepage hero banners and promotional content.</p>
          </div>

          <HeroBannerManagement />
        </div>
      </main>

      <Footer />
    </div>
  )
}