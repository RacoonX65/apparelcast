import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DiscountManagement } from "@/components/discount-management"

export default async function AdminDiscountsPage() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">Discount Codes</h1>
            <p className="text-muted-foreground">Create and manage promotional discount codes</p>
          </div>

          <DiscountManagement />
        </div>
      </main>

      <Footer />
    </div>
  )
}
