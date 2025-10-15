import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BrandManagement } from "@/components/brand-management"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function AdminBrandsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin: Brands</h1>
          <p className="text-sm text-muted-foreground">Rename, merge, or remove brands across products.</p>
        </div>
        <BrandManagement />
      </main>
      <Footer />
    </div>
  )
}