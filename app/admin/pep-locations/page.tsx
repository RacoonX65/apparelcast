import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PepLocationModeration } from "@/components/pep-location-moderation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPepLocationsPage() {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-semibold mb-2">PEP Location Moderation</h1>
              <p className="text-muted-foreground">Review and moderate user-submitted PEP store locations</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>

          <PepLocationModeration />
        </div>
      </main>

      <Footer />
    </div>
  )
}