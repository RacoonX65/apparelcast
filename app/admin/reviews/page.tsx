import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReviewsManagement } from "@/components/reviews-management"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminReviewsPage() {
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

  // Fetch all reviews with product and user info
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      products (name, image_url),
      profiles (full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reviews Management</h1>
          <p className="text-muted-foreground">Moderate and manage customer reviews</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <ReviewsManagement reviews={reviews || []} />
    </div>
  )
}
